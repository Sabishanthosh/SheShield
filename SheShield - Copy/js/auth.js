// =============================================
// SHESHIELD – Auth Helper (shared on every page)
// =============================================

auth.onAuthStateChanged((user) => {
  const userBadge = document.getElementById('userBadge');
  const loginNavBtn = document.getElementById('loginNavBtn');

  if (user) {
    if (userBadge) {
      userBadge.style.display = 'flex';
      const nameEl = userBadge.querySelector('.user-name');
      const avatarEl = userBadge.querySelector('.user-avatar');
      const displayName = user.displayName || user.email.split('@')[0];
      if (nameEl) nameEl.textContent = displayName;
      if (avatarEl) avatarEl.textContent = displayName.charAt(0).toUpperCase();
    }
    if (loginNavBtn) loginNavBtn.style.display = 'none';
  } else {
    if (userBadge) userBadge.style.display = 'none';
    if (loginNavBtn) loginNavBtn.style.display = 'flex';
  }
});

document.addEventListener('click', (e) => {
  if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
    auth.signOut().then(() => {
      window.location.href = isInPagesFolder() ? '../index.html' : 'index.html';
    });
  }
});

function isInPagesFolder() {
  return window.location.pathname.includes('/pages/');
}

function getCurrentUid() {
  return auth.currentUser ? auth.currentUser.uid : null;
}