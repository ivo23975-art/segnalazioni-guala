/******************************************************
 * LOGIN MASTER – Utente principale
 ******************************************************/
const MASTER_USER = "master";
const MASTER_PIN = "280113";

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

function checkMasterLogin() {
    if (localStorage.getItem("MASTER_LOGGED") !== "YES") {
        window.location.href = "master-login.html";
        return;
    }

    loadUsers();
    loadLinks();
    loadLog();
}

function logoutMaster() {
    localStorage.removeItem("MASTER_LOGGED");
    window.location.href = "master-login.html";
}

/******************************************************
 * GESTIONE UTENTI APP (login-pin)
 ******************************************************/
function getUsers() {
    return JSON.parse(localStorage.getItem("APP_PIN_USERS")) || {};
}

function saveUsers(u) {
    localStorage.setItem("APP_PIN_USERS", JSON.stringify(u));
}

/* CREA UTENTE APP */
function createUser() {
    const user = document.getElementById("newUser").value.trim().toLowerCase();
    const pin = document.getElementById("newPin").value.trim();

    if (user === "" || pin.length !== 6) {
        alert("Username e PIN (6 cifre) obbligatori.");
        return;
    }

    let users = getUsers();

    if (users[user]) {
        alert("Utente già esistente!");
        return;
    }

    users[user] = { pin: pin, active: true };
    saveUsers(users);

    log(`Creato utente: ${user}`);
    loadUsers();
}

/* GENERA PIN RANDOM */
function generatePin() {
    const p = Math.floor(100000 + Math.random() * 900000);
    document.getElementById("newPin").value = p;
}

/* ATTIVA / DISATTIVA UTENTE */
function toggleUser(username) {
    let users = getUsers();
    users[username].active = !users[username].active;
    saveUsers(users);

    log(`Stato utente modificato: ${username}`);
    loadUsers();
}

/* ELIMINA UTENTE */
function deleteUser(username) {
    if (!confirm("Eliminare l'utente?")) return;

    let users = getUsers();
    delete users[username];
    saveUsers(users);

    log(`Utente eliminato: ${username}`);
    loadUsers();
}

/******************************************************
 * TABELLA UTENTI
 ******************************************************/
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
                <button onclick="toggleUser('${u}')">Att./Bloc.</button>
                <button onclick="deleteUser('${u}')">Elimina</button>
            </td>
        `;

        tbody.appendChild(row);
    }
}

/******************************************************
 * LINK AUTOMATICI
 ******************************************************/
function loadLinks() {
    const base = "https://ivo23975-art.github.io/segnalazioni-guala/";

    const links = [
        { name: "APP Principale", url: base + "index.html" },
        { name: "Login PIN Utenti", url: base + "login-pin.html" },
        { name: "Pannello Guala", url: base + "dashboard/guala.html" },
        { name: "Pannello Piobesi", url: base + "dashboard/piobesi.html" },
        { name: "Parti Comuni", url: base + "dashboard/particomuni.html" },
        { name: "SuperAdmin", url: base + "dashboard/superadmin.html" },
        { name: "SuperAdmin Settings", url: base + "dashboard/superadmin-settings.html" },
        { name: "MASTER Panel", url: base + "dashboard/master.html" }
    ];

    const ul = document.getElementById("linkList");
    ul.innerHTML = "";

    links.forEach(l => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${l.url}" target="_blank">${l.name}</a>`;
        ul.appendChild(li);
    });
}

/******************************************************
 * LOG ATTIVITÀ
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

function exportLog() {
    const logs = localStorage.getItem("MASTER_LOG");
    const blob = new Blob([logs], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "master-log.json";
    a.click();
}
