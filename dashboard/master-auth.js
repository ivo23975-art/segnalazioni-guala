/* =====================================================
   MASTER LOGIN SYSTEM
===================================================== */

const MASTER_DATA = {
    username: "master",
    pin: "999999"
};

/* =====================================================
   LOGIN
===================================================== */

function masterLogin() {
    const user = document.getElementById("masterUser").value.trim();
    const pin = document.getElementById("masterPin").value.trim();
    const errorBox = document.getElementById("errorBox");

    errorBox.textContent = "";

    if (!user || !pin) {
        errorBox.textContent = "Inserisci username e PIN";
        return false;
    }

    if (user === MASTER_DATA.username && pin === MASTER_DATA.pin) {
        localStorage.setItem("MASTER_LOGGED", "OK");
        window.location.href = "master.html";
        return true;
    }

    errorBox.textContent = "Credenziali errate";
    return false;
}

/* =====================================================
   PROTEZIONE PAGINE
===================================================== */

function checkMasterLogin() {
    const logged = localStorage.getItem("MASTER_LOGGED");
    if (!logged) {
        window.location.href = "master-login.html";
    }
}

/* =====================================================
   LOGOUT
===================================================== */

function logoutMaster() {
    localStorage.removeItem("MASTER_LOGGED");
    window.location.href = "master-login.html";
}
