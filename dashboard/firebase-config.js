// Firebase configuration for segnalazioni-guala
const firebaseConfig = {
    apiKey: "AIzaSyAneaPGbeUWMNurMzGghrOoYpw4dsuIwr4",
    authDomain: "segnalazioni-guala.firebaseapp.com",
    projectId: "segnalazioni-guala",
    storageBucket: "segnalazioni-guala.firebasestorage.app",
    messagingSenderId: "118462666966",
    appId: "1:118462666966:web:9ca2cdb6985581fe79d177"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
