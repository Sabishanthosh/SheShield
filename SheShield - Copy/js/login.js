// =============================================
// SHESHIELD – Login / Signup JS
// =============================================

let isSignupMode = false;

const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authMsg = document.getElementById('authMsg');
const switchBtn = document.getElementById('switchBtn');
const switchText = document.getElementById('switchText');
const authTitle = document.getElementById('authTitle');
const authSub = document.getElementById('authSub');
const googleBtn = document.getElementById('googleBtn');

// Toggle between Login / Sign up
switchBtn?.addEventListener('click', () => {
  isSignupMode = !isSignupMode;
  if (isSignupMode) {
    authTitle.textContent = 'Create your account';
    authSub.textContent = 'Sign up to save your contacts & records safely.';
    authSubmitBtn.textContent = 'Sign Up';
    switchText.textContent = 'Already have an account?';
    switchBtn.textContent = 'Login';
  } else {
    authTitle.textContent = 'Welcome back';
    authSub.textContent = 'Login to sync your contacts & records across devices.';
    authSubmitBtn.textContent = 'Login';
    switchText.textContent = "Don't have an account?";
    switchBtn.textContent = 'Sign up';
  }
  hideMsg();
});

// Email/Password submit
authForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  authSubmitBtn.disabled = true;
  hideMsg();

  const action = isSignupMode
    ? auth.createUserWithEmailAndPassword(email, password)
    : auth.signInWithEmailAndPassword(email, password);

  action
    .then(() => {
      showMsg('Success! Redirecting...', 'success');
      setTimeout(() => { window.location.href = '../index.html'; }, 800);
    })
    .catch((err) => {
      showMsg(friendlyError(err.code), 'error');
      authSubmitBtn.disabled = false;
    });
});

// Google Sign-in
googleBtn?.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => {
      showMsg('Success! Redirecting...', 'success');
      setTimeout(() => { window.location.href = '../index.html'; }, 800);
    })
    .catch((err) => {
      showMsg(friendlyError(err.code), 'error');
    });
});

function showMsg(text, type) {
  authMsg.textContent = text;
  authMsg.className = `auth-msg ${type}`;
  authMsg.style.display = 'block';
}
function hideMsg() {
  authMsg.style.display = 'none';
}

function friendlyError(code) {
  const map = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email. Try signing up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'This email is already registered. Try logging in instead.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your internet connection.'
  };
  return map[code] || 'Something went wrong. Please try again.';
}

// If already logged in, redirect straight to dashboard
auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = '../index.html';
  }
});