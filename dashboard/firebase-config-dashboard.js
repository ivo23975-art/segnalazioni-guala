// ============================
// FIREBASE CONFIG (DASHBOARD)
// ============================
const firebaseConfig = {
  apiKey: "AIzaSyAneaPGbeUWMNurMzGghrOoYpw4dsuIwr4",
  authDomain: "segnalazioni-guala.firebaseapp.com",
  projectId: "segnalazioni-guala",
  storageBucket: "segnalazioni-guala.appspot.com",
  messagingSenderId: "118462666966",
  appId: "1:118462666966:web:9ca2cdb6985581fe79d177"
};

// ============================
// INIT FIREBASE
// ============================
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ============================
// FIRESTORE
// ============================
const db = firebase.firestore();
