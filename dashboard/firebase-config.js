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
// APP CHECK — DEBUG MODE
// ============================
const appCheck = firebase.appCheck();

appCheck.activate(
  '4EFDFFA2-96CC-4A48-80A7-22F494C2D110',
  true
);

// ============================
// FIRESTORE
// ============================
const db = firebase.firestore();
