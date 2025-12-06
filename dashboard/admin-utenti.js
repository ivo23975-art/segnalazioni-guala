/* ==========================================================
   CONTROLLO ACCESSO ADMIN
===========================================================*/
function checkAdminAccess(){
    if(localStorage.getItem("ADMIN_UTENTI_OK") !== "YES"){
        window.location.href = "admin-utenti-login.html";
        return;
    }
    loadUsers();
}

function logoutAdmin(){
    localStorage.removeItem("ADMIN_UTENTI_OK");
    window.location.href = "admin-utenti-login.html";
}

/* ==========================================================
   FIRESTORE
===========================================================*/
const db = firebase.firestore();
const USERS = "utenti_PPFG";

/* ==========================================================
   CREA UTENTE
===========================================================*/
async function createUser(){
    const username = document.getElementById("newUser").value.trim().toLowerCase();
    const pin = document.getElementById("newPin").value.trim();
    const role = document.getElementById("newRole").value;

    if(username === "" || pin.length !== 6){
        alert("Compila correttamente tutti i campi!");
        return;
    }

    await db.collection(USERS).doc(username).set({
        username: username,
        pin: pin,
        ruolo: role,
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Utente creato!");

    loadUsers();
}

/* ==========================================================
   GENERA PIN
===========================================================*/
function generatePin(){
    const p = Math.floor(100000 + Math.random() * 900000);
    document.getElementById("newPin").value = p;
}

/* ==========================================================
   CARICA UTENTI
===========================================================*/
async function loadUsers(){
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "";

    const snap = await db.collection(USERS).orderBy("username").get();

    snap.forEach(doc => {
        const u = doc.data();

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${u.username}</td>
            <td>${u.pin}</td>
            <td>${u.ruolo}</td>
            <td>${u.active ? "✔️" : "❌"}</td>
            <td>
                <button onclick="toggleUser('${u.username}', ${u.active})">
                    ${u.active ? "Blocca" : "Attiva"}
                </button>
                <button onclick="deleteUser('${u.username}')">Elimina</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/* ==========================================================
   ATTIVA / BLOCCA
===========================================================*/
async function toggleUser(username, isActive){
    await db.collection(USERS).doc(username).update({
        active: !isActive
    });

    loadUsers();
}

/* ==========================================================
   ELIMINA UTENTE
===========================================================*/
async function deleteUser(username){
    if(!confirm("Eliminare utente?")) return;

    await db.collection(USERS).doc(username).delete();

    loadUsers();
}
