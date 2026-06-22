// =============================================
// SHESHIELD – SOS Center JS
// =============================================

// ---- SOS COUNTDOWN ----
const sosTriggerBtn = document.getElementById('sosTriggerBtn');
const sosRing = document.getElementById('sosRing');
const countdownDisplay = document.getElementById('countdownDisplay');
const countdownNum = document.getElementById('countdownNum');
const cancelBtn = document.getElementById('cancelBtn');
const alertSent = document.getElementById('alertSent');
const resetBtn = document.getElementById('resetBtn');
const statusText = document.getElementById('statusText');
const statusDot = document.querySelector('.status-dot');
const sosCircleWrap = document.querySelector('.sos-circle-wrap');
const sosHint = document.querySelector('.sos-hint');

let countdownInterval = null;
let secondsLeft = 10;

// Single-click trigger — starts the countdown immediately on click
sosTriggerBtn?.addEventListener('click', () => {
  beginCountdown();
});

function beginCountdown() {
  sosCircleWrap.style.display = 'none';
  sosHint.style.display = 'none';
  countdownDisplay.style.display = 'block';
  alertSent.style.display = 'none';

  secondsLeft = 10;
  countdownNum.textContent = secondsLeft;

  statusDot.className = 'status-dot counting';
  statusText.textContent = 'Alerting in 10s...';
  sosRing.classList.add('active');

  countdownInterval = setInterval(() => {
    secondsLeft--;
    countdownNum.textContent = secondsLeft;
    statusText.textContent = `Alerting in ${secondsLeft}s...`;

    if (secondsLeft <= 0) {
      clearInterval(countdownInterval);
      triggerAlert();
    }
  }, 1000);
}

function triggerAlert() {
  countdownDisplay.style.display = 'none';
  alertSent.style.display = 'block';
  statusDot.className = 'status-dot sent';
  statusText.textContent = 'Alert Sent';
  sosRing.classList.remove('active');
}

cancelBtn?.addEventListener('click', () => {
  clearInterval(countdownInterval);
  countdownDisplay.style.display = 'none';
  sosCircleWrap.style.display = 'block';
  sosHint.style.display = 'block';
  statusDot.className = 'status-dot idle';
  statusText.textContent = 'Ready';
  sosRing.classList.remove('active');
});

resetBtn?.addEventListener('click', () => {
  alertSent.style.display = 'none';
  sosCircleWrap.style.display = 'block';
  sosHint.style.display = 'block';
  statusDot.className = 'status-dot idle';
  statusText.textContent = 'Ready';
});

// ---- EMERGENCY CONTACTS (Firestore if logged in, localStorage fallback) ----
const addContactBtn = document.getElementById('addContactBtn');
const addContactForm = document.getElementById('addContactForm');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const saveContactBtn = document.getElementById('saveContactBtn');
const contactsList = document.getElementById('contactsList');
const noContacts = document.getElementById('noContacts');

let contacts = [];
let contactsUnsub = null;

addContactBtn?.addEventListener('click', () => {
  addContactForm.style.display = addContactForm.style.display === 'none' ? 'flex' : 'none';
});
cancelFormBtn?.addEventListener('click', () => {
  addContactForm.style.display = 'none';
  clearForm();
});

saveContactBtn?.addEventListener('click', async () => {
  const name = document.getElementById('contactName').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const relation = document.getElementById('contactRelation').value.trim();

  if (!name || !phone) {
    alert('Please enter name and phone number.');
    return;
  }

  const newContact = { id: Date.now().toString(), name, phone, relation: relation || 'Contact' };
  const uid = getCurrentUid();

  if (uid) {
    try {
      await db.collection('users').doc(uid).collection('contacts').doc(newContact.id).set(newContact);
    } catch (err) {
      console.error('Firestore save failed:', err);
      alert('Could not sync to cloud. Saved locally instead.');
      contacts.push(newContact);
      saveLocalContacts();
      renderContacts();
    }
  } else {
    contacts.push(newContact);
    saveLocalContacts();
    renderContacts();
  }

  addContactForm.style.display = 'none';
  clearForm();
});

function clearForm() {
  document.getElementById('contactName').value = '';
  document.getElementById('contactPhone').value = '';
  document.getElementById('contactRelation').value = '';
}

function saveLocalContacts() {
  localStorage.setItem('sheshield_contacts', JSON.stringify(contacts));
}

function loadLocalContacts() {
  contacts = JSON.parse(localStorage.getItem('sheshield_contacts') || '[]');
  if (contacts.length === 0) {
    contacts = [
      { id: '1', name: 'Amma', phone: '9876543210', relation: 'Mother' },
      { id: '2', name: 'Best Friend', phone: '9123456789', relation: 'Friend' }
    ];
    saveLocalContacts();
  }
  renderContacts();
}

function startContactsSync(uid) {
  if (contactsUnsub) contactsUnsub();
  contactsUnsub = db.collection('users').doc(uid).collection('contacts')
    .onSnapshot((snapshot) => {
      contacts = snapshot.docs.map(doc => doc.data());
      renderContacts();
    }, (err) => {
      console.error('Firestore sync error:', err);
      loadLocalContacts();
    });
}

function renderContacts() {
  if (!contactsList) return;
  contactsList.innerHTML = '';

  if (contacts.length === 0) {
    noContacts.style.display = 'block';
    return;
  }
  noContacts.style.display = 'none';

  contacts.forEach(c => {
    const initial = c.name.charAt(0).toUpperCase();
    const div = document.createElement('div');
    div.className = 'contact-item';
    div.innerHTML = `
      <div class="contact-avatar">${initial}</div>
      <div class="contact-details">
        <div class="contact-name">${c.name}</div>
        <div class="contact-phone">📞 ${c.phone}</div>
        <span class="contact-relation">${c.relation}</span>
      </div>
      <div class="contact-actions">
        <a href="tel:${c.phone}" class="contact-call-btn">Call</a>
        <button class="contact-delete-btn" data-id="${c.id}">Delete</button>
      </div>
    `;
    contactsList.appendChild(div);
  });

  contactsList.querySelectorAll('.contact-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const uid = getCurrentUid();
      if (uid) {
        try {
          await db.collection('users').doc(uid).collection('contacts').doc(id).delete();
        } catch (err) {
          console.error('Firestore delete failed:', err);
        }
      } else {
        contacts = contacts.filter(c => c.id !== id);
        saveLocalContacts();
        renderContacts();
      }
    });
  });
}

auth.onAuthStateChanged((user) => {
  const syncBanner = document.getElementById('syncBanner');
  if (user) {
    startContactsSync(user.uid);
    if (syncBanner) {
      syncBanner.className = 'sync-banner synced';
      syncBanner.innerHTML = `☁️ Synced to your account — contacts available on any device.`;
      syncBanner.style.display = 'flex';
    }
  } else {
    if (contactsUnsub) { contactsUnsub(); contactsUnsub = null; }
    loadLocalContacts();
    if (syncBanner) {
      syncBanner.className = 'sync-banner offline';
      syncBanner.innerHTML = `📱 Saved on this device only. <a href="login.html">Login</a> to sync across devices.`;
      syncBanner.style.display = 'flex';
    }
  }
});

// ---- LOCATION ----
const getLocationBtn = document.getElementById('getLocationBtn');
const locationStatus = document.getElementById('locationStatus');

getLocationBtn?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    locationStatus.textContent = '❌ Geolocation not supported by this browser.';
    return;
  }
  locationStatus.textContent = '🔄 Fetching location...';
  getLocationBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      locationStatus.innerHTML = `✅ Location: <a href="${mapsLink}" target="_blank" style="color:var(--rose-gold);font-weight:600;">Open in Maps</a> (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      getLocationBtn.textContent = '📍 Refresh Location';
      getLocationBtn.disabled = false;
    },
    (err) => {
      locationStatus.textContent = '❌ Could not get location. Please allow location access.';
      getLocationBtn.disabled = false;
    }
  );
});

console.log('🆘 SOS Center loaded');