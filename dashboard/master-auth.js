/* ============================================
   SISTEMA LOGIN MASTER - DEFINITIVO
   POSIZIONE: /dashboard/master-auth.js
============================================ */

const MASTER_ACCOUNT = {
    username: "master",
    pin: "999999"   // Cambialo se vuoi
};

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

function logoutMaster() {
    localStorage.removeItem("MASTER_LOGGED");
    window.location.href = "master-login.html";
}

function checkMasterLogin() {
    if (localStorage.getItem("MASTER_LOGGED") !== "yes") {
        window.location.href = "master-login.html";
    }
}
