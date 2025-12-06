/* ==========================================================
   INIZIALIZZAZIONE PANNELLO
===========================================================*/
function initAdminPanel() {
    checkAdminAccess();
    switchTab(1);
    loadUsers();
    loadLogs();
}

/* ==========================================================
   CONTROLLO ACCESSO ADMIN
===========================================================*/
function checkAdminAccess() {
    if (localStorage.getItem("ADMIN_UTENTI_OK") !== "YES") {
        window.location.href = "admin-utenti-login.html";
        return;
    }
}

function logoutAdmin() {
    localStorage.removeItem("ADMIN_UTENTI_OK");
    window.location.href = "admin-utenti-login.html";
}

/* ==========================================================
   FIRESTORE COLLECTIONS
===========================================================*/
const USERS = "utenti_PPFG";
const LOGS = "utenti_logs";

/* ==========================================================
   SWITCH TABS
===========================================================*/
function switchTab(n) {
    document.getElementById("tab1").classList.remove("tab-active");
    document.getElementById("tab2").classList.remove("tab-active");

    document.getElementById("section1").classList.remove("section-active");
    document.getElementById("section2").classList.remove("section-active");

    if (n === 1) {
        tab1.classList.add("tab-active");
        section1.classList.add("section-active");
    } else {
        tab2.classList.add("tab-active");
        section2.classList.add("section-active");
    }
}

/* ==========================================================
   UTILITY → FORMATTATORE TEMPO
===========================================================*/
function timeAgo(date) {
    if (!date) return "—";

    let sec = (Date.now() - date.getTime()) / 1000;

    if (sec < 60) return Math.floor(sec) + " sec fa";
    if (sec < 3600) return Math.floor(sec / 60) + " min fa";
    if (sec < 86400) return Math.floor(sec / 3600) + " h fa";
    return Math.floor(sec / 86400) + " gg fa";
}

/* ==========================================================
   CREA UTENTE
===========================================================*/
async function createUser() {
    const username = newUser.value.trim().toLowerCase();
    const pin = newPin.value.trim();
    const role = newRole.value;

    if (!username || pin.length !== 6) {
        alert("Inserisci correttamente username e PIN.");
        return;
    }

    await db.collection(USERS).doc(username).set({
        username,
        pin,
        ruolo: role,
        active: true,
        online: false,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    await addLog(username, "creato");

    alert("Utente creato!");
    loadUsers();
}

/* ==========================================================
   GENERA PIN
===========================================================*/
function generatePin() {
    newPin.value = Math.floor(100000 + Math.random() * 900000);
}

/* ==========================================================
   FILTRI UTENTI
===========================================================*/
let userFilter = "all";

function setUserFilter(f) {
    userFilter = f;

    document.querySelectorAll(".filters .filter-btn")
        .forEach(btn => btn.classList.remove("filter-active"));

    event.target.classList.add("filter-active");

    loadUsers();
}

/* ==========================================================
   CARICA UTENTI
===========================================================*/
async function loadUsers() {
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "";

    const snap = await db.collection(USERS).orderBy("username").get();

    snap.forEach(doc => {
        const u = doc.data();
        let stato = "";
        let last = u.lastSeen ? timeAgo(u.lastSeen.toDate()) : "—";

        /* Stato online */
        if (u.online === true) {
            stato = `<span class="badge online">ONLINE</span>`;
        } else {
            // offline → calcolo inattivo o offline
            const diffMin = (Date.now() - (u.lastSeen?.toDate()?.getTime() || 0)) / 60000;
            if (diffMin < 30) stato = `<span class="badge inactive">INATTIVO</span>`;
            else stato = `<span class="badge offline">OFFLINE</span>`;
        }

        /* FILTRI */
        if (userFilter === "active" && !u.active) return;
        if (userFilter === "blocked" && u.active) return;
        if (userFilter === "online" && u.online !== true) return;
        if (userFilter === "offline" && u.online === true) return;

        const row = `
        <tr>
            <td>${u.username}</td>
            <td>${u.pin}</td>
            <td>${u.ruolo}</td>
            <td>${stato}</td>
            <td>${last}</td>
            <td>
                <button onclick="toggleUser('${u.username}', ${u.active})">
                    ${u.active ? "Blocca" : "Attiva"}
                </button>
                <button onclick="deleteUser('${u.username}')">Elimina</button>
            </td>
        </tr>
        `;
        tbody.innerHTML += row;
    });
}

/* ==========================================================
   ATTIVA / BLOCCA UTENTE
===========================================================*/
async function toggleUser(username, isActive) {
    await db.collection(USERS).doc(username).update({
        active: !isActive
    });

    await addLog(username, isActive ? "bloccato" : "riattivato");

    loadUsers();
}

/* ==========================================================
   ELIMINA UTENTE
===========================================================*/
async function deleteUser(username) {
    if (!confirm("Eliminare definitivamente?")) return;

    await db.collection(USERS).doc(username).delete();

    await addLog(username, "eliminato");

    loadUsers();
}

/* ==========================================================
   LOG FIRESTORE
===========================================================*/
async function addLog(username, action) {
    await db.collection(LOGS).add({
        username,
        azione: action,
        admin: localStorage.getItem("ADMIN_UTENTI_OK") || "admin",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

/* ==========================================================
   FILTRI LOG
===========================================================*/
let logFilter = "all";

function setLogFilter(f) {
    logFilter = f;

    document.querySelectorAll("#section2 .filter-btn")
        .forEach(btn => btn.classList.remove("filter-active"));

    event.target.classList.add("filter-active");

    loadLogs();
}

/* ==========================================================
   CARICA LOG
===========================================================*/
async function loadLogs() {
    const tbody = document.querySelector("#logTable tbody");
    tbody.innerHTML = "";

    const snap = await db.collection(LOGS)
        .orderBy("timestamp", "desc")
        .limit(200)
        .get();

    snap.forEach(doc => {
        const l = doc.data();
        const time = l.timestamp ? l.timestamp.toDate().toLocaleString() : "";

        if (logFilter !== "all" && logFilter !== l.azione) return;

        const row = `
        <tr>
            <td>${l.username}</td>
            <td>${l.azione}</td>
            <td>${time}</td>
            <td>${l.admin}</td>
        </tr>
        `;
        tbody.innerHTML += row;
    });
}
