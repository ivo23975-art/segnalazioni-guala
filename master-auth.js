/* =======================================================
   MASTER LOGIN SYSTEM (NUOVA VERSIONE CORRETTA)
======================================================= */

const MASTER_ACCOUNT = {
    username: "master",
    pin: "999999"   // Cambialo se vuoi
};

/* LOGIN */
function loginMaster() {
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("pin").value.trim();
    const err = document.getElementById("error");

    err.textContent = "";

    if (!u || !p) {
        err.textContent = "Inserisci username e PIN";
        return;
    }

    if (u === MASTER_ACCOUNT.username && p === MASTER_ACCOUNT.pin) {
        localStorage.setItem("MASTER_LOGGED", "yes");
        window.location.href = "master.html";
        return;
    }

    err.textContent = "Utente inesistente";
}

/* LOGOUT */
function logoutMaster() {
    localStorage.removeItem("MASTER_LOGGED");
    window.location.href = "master-login.html";
}

/* PROTEZIONE */
function checkMasterLogin() {
    if (!localStorage.getItem("MASTER_LOGGED")) {
        window.location.href = "master-login.html";
    }
}
