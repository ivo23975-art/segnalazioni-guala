// ============================
// FIREBASE CONFIG
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
firebase.initializeApp(firebaseConfig);

// ============================
// APP CHECK — PRODUZIONE (reCAPTCHA v3)
// ============================
const appCheck = firebase.appCheck();

appCheck.activate(
  "6LdopTMsAAAAAF0bcwo1BDRtDkl4xplujrZZhGi4", // SITE KEY reCAPTCHA
  false // ⚠️ PRODUZIONE: NO DEBUG
);

// ============================
// FIRESTORE
// ============================
const db = firebase.firestore();
