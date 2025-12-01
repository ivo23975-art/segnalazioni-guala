/* =====================================================
   LOGIN DEDICATO PER MASTER
===================================================== */

const MASTER_CREDENTIALS = {
    username: "master",
    pin: "999999"
};

function loginMaster() {

    const user = document.getElementById("username").value.trim();
    const pin = document.getElementById("pin").value.trim();
    const error = document.getElementById("error");

    error.textContent = "";

    if (!user || !pin) {
        error.textContent = "Inserisci username e PIN";
        return;
    }

    if (user === MASTER_CREDENTIALS.username && pin === MASTER_CREDENTIALS.pin) {
        localStorage.setItem("MASTER_LOGGED", "1");
        window.location.href = "dashboard/master.html";
        return;
    }

    error.textContent = "Utente inesistente";
}

function checkMasterLogin() {
    if (localStorage.getItem("MASTER_LOGGED") !== "1") {
        window.location.href = "../master-login.html";
    }
}

function logoutMaster() {
    localStorage.removeItem("MASTER_LOGGED");
    window.location.href = "../master-login.html";
}
