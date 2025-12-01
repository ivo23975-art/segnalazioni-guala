/* ==========================================
   MASTER LOGIN SYSTEM
========================================== */

const MASTER_DATA = {
    username: "master",
    pin: "999999"
};

/* ==========================================
   LOGIN
========================================== */
function masterLogin() {
    const user = document.getElementById("masterUser").value.trim();
    const pin = document.getElementById("masterPin").value.trim();
    const err = document.getElementById("errorBox");

    err.textContent = "";

    if (!user || !pin) {
        err.textContent = "Inserisci username e PIN";
        return;
    }

    if (user === MASTER_DATA.username && pin === MASTER_DATA.pin) {
        localStorage.setItem("MASTER_LOGGED", "YES");
        window.location.href = "master.html";
        return;
    }

    err.textContent = "Credenziali errate";
}

/* ==========================================
   PROTEZIONE PAGINE
========================================== */
function checkMasterLogin() {
    if (!localStorage.getItem("MASTER_LOGGED")) {
        window.location.href = "master-login.html";
    }
}

/* ==========================================
   LOGOUT
========================================== */
function logoutMaster() {
    localStorage.removeItem("MASTER_LOGGED");
    window.location.href = "master-login.html";
}
