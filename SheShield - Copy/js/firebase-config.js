// =============================================
// SHESHIELD – Firebase Configuration
// =============================================

const firebaseConfig = {
  apiKey: "AIzaSyBD_AFK0XkPyYX87DxgjFLS4EoEqgsYnI0",
  authDomain: "sheshield-8c023.firebaseapp.com",
  projectId: "sheshield-8c023",
  storageBucket: "sheshield-8c023.firebasestorage.app",
  messagingSenderId: "1046112575725",
  appId: "1:1046112575725:web:0ee717968d0f2717d66ce4"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

console.log('🔥 Firebase initialized');