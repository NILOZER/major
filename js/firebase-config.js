// ===== FIREBASE CONFIGURATION =====
// Replace with your own Firebase project config
// Get this from: Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyDdjln2SOCzAveMI8UykdxSqwk8OBKrrJU",
  authDomain: "major-28949.firebaseapp.com",
  projectId: "major-28949",
  storageBucket: "major-28949.firebasestorage.app",
  messagingSenderId: "990191251963",
  appId: "1:990191251963:web:2a486b4b35adb247a31b5e",
  measurementId: "G-9K039F2517"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true }).catch(err => {
  console.warn('Firestore persistence:', err.code);
});
