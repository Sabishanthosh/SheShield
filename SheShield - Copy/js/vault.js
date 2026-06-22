// =============================================
// SHESHIELD – Evidence Vault JS
// =============================================

// ---- AUTH GATE ----
// Evidence Vault requires login. No localStorage fallback for records —
// this prevents one user's cached data from leaking to the next person
// on the same device/browser.
const authGateSection = document.getElementById('authGateSection');

function showAuthGate() {
  if (lockSection) lockSection.style.display = 'none';
  if (vaultContent) vaultContent.style.display = 'none';
  if (authGateSection) authGateSection.style.display = 'block';
}

function showLockScreen() {
  if (authGateSection) authGateSection.style.display = 'none';
  if (vaultContent) vaultContent.style.display = 'none';
  if (lockSection) lockSection.style.display = 'block';
}

// ---- PIN LOCK ----
// PIN is scoped per-user, stored at users/{uid}/settings/vaultPin in Firestore
// (covered by the same security rule as everything else under users/{uid}).
// This means User A's PIN and User B's PIN are completely independent, and
// the PIN follows the user across devices since it's not just in localStorage.
const lockSection = document.getElementById('lockSection');
const vaultContent = document.getElementById('vaultContent');
const pinInput = document.getElementById('pinInput');
const unlockBtn = document.getElementById('unlockBtn');
const pinHint = document.getElementById('pinHint');

let cachedPinForCurrentUser = undefined; // undefined = not loaded yet, null = no PIN set yet, string = PIN set

unlockBtn?.addEventListener('click', tryUnlock);
pinInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') tryUnlock();
});
pinInput?.addEventListener('input', () => {
  pinInput.value = pinInput.value.replace(/\D/g, '');
});

// Loads (or re-loads) this user's PIN doc from Firestore and updates the hint text.
async function loadVaultPin(uid) {
  pinHint.textContent = 'Loading...';
  unlockBtn.disabled = true;
  try {
    const docSnap = await db.collection('users').doc(uid).collection('settings').doc('vaultPin').get();
    if (docSnap.exists && docSnap.data().pin) {
      cachedPinForCurrentUser = docSnap.data().pin;
      pinHint.textContent = 'Enter your 4-digit PIN to unlock.';
    } else {
      cachedPinForCurrentUser = null;
      pinHint.textContent = "First time? Set any 4-digit PIN — you'll use the same PIN next time.";
    }
  } catch (err) {
    console.error('Failed to load vault PIN:', err);
    cachedPinForCurrentUser = undefined;
    pinHint.textContent = 'Could not load vault settings. Check your connection and try again.';
  } finally {
    unlockBtn.disabled = false;
  }
}

async function tryUnlock() {
  const entered = pinInput.value.trim();
  if (entered.length !== 4) {
    showPinError('Please enter a 4-digit PIN.');
    return;
  }

  const uid = getCurrentUid();
  if (!uid) {
    showAuthGate();
    return;
  }

  // PIN hasn't finished loading from Firestore yet — don't let a stale/undefined
  // state accidentally let someone through or block a legitimate first-time setup.
  if (cachedPinForCurrentUser === undefined) {
    showPinError('Still loading vault settings — please wait a moment and try again.');
    return;
  }

  if (cachedPinForCurrentUser === null) {
    // First time for this user — set their PIN.
    unlockBtn.disabled = true;
    try {
      await db.collection('users').doc(uid).collection('settings').doc('vaultPin').set({ pin: entered });
      cachedPinForCurrentUser = entered;
      unlockVault();
    } catch (err) {
      console.error('Failed to save vault PIN:', err);
      showPinError('Could not save PIN. Please try again.');
    } finally {
      unlockBtn.disabled = false;
    }
  } else if (cachedPinForCurrentUser === entered) {
    unlockVault();
  } else {
    showPinError('Incorrect PIN. Try again.');
  }
}

function showPinError(msg) {
  pinInput.classList.add('error');
  pinHint.textContent = msg;
  pinHint.style.color = 'var(--danger)';
  setTimeout(() => pinInput.classList.remove('error'), 300);
  pinInput.value = '';
}

function unlockVault() {
  // Defense in depth: even if somehow triggered, never show vault content
  // to a logged-out session.
  if (!getCurrentUid()) {
    showAuthGate();
    return;
  }
  lockSection.style.display = 'none';
  vaultContent.style.display = 'block';
  renderRecords();
}

// Resets the PIN screen back to a clean, locked state for a fresh user session.
function resetPinScreen() {
  cachedPinForCurrentUser = undefined;
  pinInput.value = '';
  pinHint.textContent = '';
  pinInput.classList.remove('error');
}

// ---- FILE UPLOAD ----
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const previewRow = document.getElementById('previewRow');

let pendingImages = []; // base64 strings waiting to be attached to a record

uploadBox?.addEventListener('click', () => fileInput.click());

uploadBox?.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadBox.classList.add('drag-over');
});
uploadBox?.addEventListener('dragleave', () => uploadBox.classList.remove('drag-over'));
uploadBox?.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadBox.classList.remove('drag-over');
  handleFiles(e.dataTransfer.files);
});

fileInput?.addEventListener('change', () => handleFiles(fileInput.files));

function handleFiles(files) {
  [...files].forEach(file => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large. Max 5MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      pendingImages.push(e.target.result);
      renderPreviews();
    };
    reader.readAsDataURL(file);
  });
}

function renderPreviews() {
  previewRow.innerHTML = '';
  pendingImages.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'preview-thumb';
    div.innerHTML = `<img src="${src}" alt="Preview"/><button class="preview-remove" data-i="${i}">✕</button>`;
    previewRow.appendChild(div);
  });
  previewRow.querySelectorAll('.preview-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      pendingImages.splice(parseInt(btn.dataset.i), 1);
      renderPreviews();
    });
  });
}

// ---- INCIDENT RECORDS ----
// Strategy: images stay in localStorage on this device (per decision).
// Text fields (type/date/platform/desc) live ONLY in Firestore under
// users/{uid}/records — there is NO localStorage fallback for records,
// so logging out fully clears what's on screen and blocks new saves.
const saveRecordBtn = document.getElementById('saveRecordBtn');
const recordsList = document.getElementById('recordsList');
const noRecords = document.getElementById('noRecords');
const exportBtn = document.getElementById('exportBtn');

let records = [];          // in-memory only, repopulated from Firestore per logged-in user
let recordsUnsub = null;
let currentUid = null;     // tracks whose data is currently loaded, to scope local image cache

saveRecordBtn?.addEventListener('click', async () => {
  const uid = getCurrentUid();

  // Hard block: no save without a logged-in user. No silent localStorage fallback.
  if (!uid) {
    alert('Please login first to save evidence records.');
    return;
  }

  const type = document.getElementById('incidentType').value;
  const date = document.getElementById('incidentDate').value;
  const platform = document.getElementById('incidentPlatform').value.trim();
  const desc = document.getElementById('incidentDesc').value.trim();

  if (!desc) {
    alert('Please add a description of the incident.');
    return;
  }

  const id = Date.now().toString();
  const hasImages = pendingImages.length > 0;

  // 1. Save images locally, namespaced by uid so different accounts on the
  //    same browser never see each other's screenshots.
  if (hasImages) {
    saveLocalImages(uid, id, pendingImages);
  }

  // 2. Save text fields to Firestore under this user's own UID path only.
  //    Firestore security rules also enforce this server-side.
  try {
    await db.collection('users').doc(uid).collection('records').doc(id).set({
      id,
      type,
      date: date || new Date().toISOString().split('T')[0],
      platform: platform || 'Not specified',
      desc,
      hasImages
    });
  } catch (err) {
    console.error('Firestore save failed:', err);
    alert('Could not save record. Please check your connection and try again.');
    return;
  }

  // Reset form
  document.getElementById('incidentPlatform').value = '';
  document.getElementById('incidentDesc').value = '';
  pendingImages = [];
  renderPreviews();
  // renderRecords() runs automatically via the onSnapshot listener
});

// ---- Local image cache, namespaced per UID ----
// Key pattern: sheshield_images_{uid} -> { [recordId]: [base64, ...] }
function getLocalImageStore(uid) {
  return JSON.parse(localStorage.getItem(`sheshield_images_${uid}`) || '{}');
}
function saveLocalImages(uid, recordId, images) {
  const store = getLocalImageStore(uid);
  store[recordId] = images;
  localStorage.setItem(`sheshield_images_${uid}`, JSON.stringify(store));
}
function deleteLocalImages(uid, recordId) {
  const store = getLocalImageStore(uid);
  delete store[recordId];
  localStorage.setItem(`sheshield_images_${uid}`, JSON.stringify(store));
}

function renderRecords() {
  if (!recordsList) return;
  recordsList.innerHTML = '';

  if (records.length === 0) {
    if (noRecords) noRecords.style.display = 'block';
    return;
  }
  if (noRecords) noRecords.style.display = 'none';

  const imageStore = currentUid ? getLocalImageStore(currentUid) : {};

  records.forEach(r => {
    const images = imageStore[r.id] || [];
    const div = document.createElement('div');
    div.className = 'record-card';
    const thumb = images.length > 0
      ? `<img src="${images[0]}" class="record-thumb" alt="Evidence"/>`
      : `<div class="record-thumb-placeholder">📝</div>`;

    div.innerHTML = `
      ${thumb}
      <div class="record-body">
        <div class="record-top-row">
          <span class="record-type">${r.type}</span>
          <span class="record-date">${formatDate(r.date)}</span>
        </div>
        <div class="record-platform">📍 ${r.platform}</div>
        <p class="record-desc">${escapeHtml(r.desc)}</p>
      </div>
      <button class="record-delete" data-id="${r.id}">Delete</button>
    `;
    recordsList.appendChild(div);
  });

  recordsList.querySelectorAll('.record-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this record permanently?')) return;
      const id = btn.dataset.id;
      const uid = getCurrentUid();

      if (!uid) {
        alert('Please login first.');
        return;
      }

      try {
        await db.collection('users').doc(uid).collection('records').doc(id).delete();
        deleteLocalImages(uid, id);
        // renderRecords() runs automatically via the onSnapshot listener
      } catch (err) {
        console.error('Firestore delete failed:', err);
        alert('Could not delete record. Please try again.');
      }
    });
  });
}

// Firestore listener — scoped strictly to the given uid's own subcollection.
// Security rules (users/{userId}/{document=**}, uid match) enforce this
// server-side too, so even a tampered client can't read another user's data.
function startRecordsSync(uid) {
  if (recordsUnsub) recordsUnsub();
  currentUid = uid;
  recordsUnsub = db.collection('users').doc(uid).collection('records')
    .orderBy('id', 'desc')
    .onSnapshot((snapshot) => {
      records = snapshot.docs.map(doc => doc.data());
      renderRecords();
    }, (err) => {
      console.error('Firestore records sync error:', err);
      records = [];
      renderRecords();
    });
}

// Wipes all in-memory + on-screen record state. Called on logout so the
// next person using this browser never sees the previous user's records.
function clearRecordsState() {
  if (recordsUnsub) { recordsUnsub(); recordsUnsub = null; }
  records = [];
  currentUid = null;
  if (recordsList) recordsList.innerHTML = '';
  if (noRecords) noRecords.style.display = 'none';
  pendingImages = [];
  if (previewRow) previewRow.innerHTML = '';
}

auth.onAuthStateChanged((user) => {
  const syncBanner = document.getElementById('syncBanner');

  if (user) {
    resetPinScreen();       // clear any previous user's PIN state out of memory
    showLockScreen();       // PIN screen only shown to authenticated users
    loadVaultPin(user.uid); // fetch THIS user's own PIN doc from Firestore
    startRecordsSync(user.uid);
    if (syncBanner) {
      syncBanner.className = 'sync-banner synced';
      syncBanner.innerHTML = `☁️ Notes synced to your account. Screenshots stay only on this device for privacy.`;
      syncBanner.style.display = 'flex';
    }
  } else {
    resetPinScreen();
    clearRecordsState();
    showAuthGate();         // logged-out users see "please login" instead of the vault
    if (syncBanner) {
      syncBanner.style.display = 'none';
    }
  }
});

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- EXPORT ----
exportBtn?.addEventListener('click', () => {
  if (records.length === 0) {
    alert('No records to export yet.');
    return;
  }
  const imageStore = currentUid ? getLocalImageStore(currentUid) : {};

  let text = 'SHESHIELD — EVIDENCE VAULT EXPORT\n';
  text += '=====================================\n\n';
  records.forEach((r, i) => {
    const imgCount = (imageStore[r.id] || []).length;
    text += `Record ${i + 1}\n`;
    text += `Type: ${r.type}\n`;
    text += `Date: ${formatDate(r.date)}\n`;
    text += `Platform: ${r.platform}\n`;
    text += `Description: ${r.desc}\n`;
    text += `Attached Images: ${imgCount}\n`;
    text += '-------------------------------------\n\n';
  });

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sheshield-evidence-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

console.log('📁 Evidence Vault loaded');