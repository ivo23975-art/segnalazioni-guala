/******************************************************
 * ACCESSO MASTER
 ******************************************************/
const MASTER_USER = "master";
const MASTER_PIN = "280113";

/* LOGIN */
function loginMaster() {
    const u = document.getElementById("user").value.trim().toLowerCase();
    const p = document.getElementById("pin").value.trim();
    const err = document.getElementById("err");

    if (u === MASTER_USER && p === MASTER_PIN) {
        localStorage.setItem("MASTER_LOGGED", "YES");
        window.location.href = "master.html";
    } else {
        err.textContent = "Credenziali errate.";
    }
}

/* CHECK LOGIN */
function checkMasterLogin() {
    if (localStorage.getItem("MASTER_LOGGED") !== "YES") {
        window.location.href = "master-login.html";
        return;
    }

    loadUsers();
    loadLinks();
    loadLog();
}

/* LOGOUT */
function logoutMaster() {
    localStorage.removeItem("MASTER_LOGGED");
    window.location.href = "master-login.html";
}

/******************************************************
 * GESTIONE UTENTI
 ******************************************************/
function getUsers() {
    return JSON.parse(localStorage.getItem("APP_PIN_USERS")) || {};
}

function saveUsers(u) {
    localStorage.setItem("APP_PIN_USERS", JSON.stringify(u));
}

/* CREA NUOVO UTENTE */
function createUser() {
    const user = document.getElementById("newUser").value.trim().toLowerCase();
    const pin = document.getElementById("newPin").value.trim();

    if (user === "" || pin.length !== 6) {
        alert("Compila correttamente i campi.");
        return;
    }

    let users = getUsers();
    users[user] = { pin: pin, active: true };
    saveUsers(users);

    log(`Creato utente: ${user}`);
    loadUsers();
}

/* GENERA PIN */
function generatePin() {
    const p = Math.floor(100000 + Math.random() * 900000);
    document.getElementById("newPin").value = p;
}

/* ATTIVA / BLOCCA UTENTE */
function toggleUser(username) {
    let users = getUsers();
    users[username].active = !users[username].active;
    saveUsers(users);

    log(`Modificato stato utente: ${username}`);
    loadUsers();
}

/* ELIMINA UTENTE */
function deleteUser(username) {
    if (!confirm("Eliminare utente?")) return;

    let users = getUsers();
    delete users[username];
    saveUsers(users);

    log(`Rimosso utente: ${username}`);
    loadUsers();
}

/* CARICA LISTA UTENTI */
function loadUsers() {
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "";

    const users = getUsers();

    for (let u in users) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${u}</td>
            <td>${users[u].pin}</td>
            <td>${users[u].active ? "ATTIVO" : "BLOCCATO"}</td>
            <td>
                <button onclick="toggleUser('${u}')">Attiva/Blocca</button>
                <button onclick="deleteUser('${u}')">Elimina</button>
            </td>
        `;

        tbody.appendChild(row);
    }
}

/******************************************************
 * LINK AUTOAGGIORNANTI
 ******************************************************/
function loadLinks() {
    const base = "https://ivo23975-art.github.io/segnalazioni-guala/";

    const links = [
        { name: "APP Principale", url: base + "index.html" },
        { name: "Login PIN Utenti", url: base + "login-pin.html" },
        { name: "Pannello SuperAdmin", url: base + "dashboard/superadmin.html" },
        { name: "Pannello MASTER", url: base + "dashboard/master.html" }
    ];

    const ul = document.getElementById("linkList");
    ul.innerHTML = "";

    links.forEach(link => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${link.url}" target="_blank">${link.name}</a>`;
        ul.appendChild(li);
    });
}

/******************************************************
 * LOG SISTEMA MASTER
 ******************************************************/
function log(msg) {
    const logs = JSON.parse(localStorage.getItem("MASTER_LOG")) || [];

    logs.push({
        time: new Date().toLocaleString(),
        msg: msg
    });

    localStorage.setItem("MASTER_LOG", JSON.stringify(logs));
    loadLog();
}

function loadLog() {
    const tbody = document.querySelector("#logTable tbody");
    tbody.innerHTML = "";

    const logs = JSON.parse(localStorage.getItem("MASTER_LOG")) || [];

    logs.slice().reverse().forEach(l => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${l.time}</td>
            <td>${l.msg}</td>
        `;
        tbody.appendChild(row);
    });
}

/* ESPORTA LOG */
function exportLog() {
    const logs = localStorage.getItem("MASTER_LOG") || "[]";

    const blob = new Blob([logs], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "master-log.json";
    a.click();
}
