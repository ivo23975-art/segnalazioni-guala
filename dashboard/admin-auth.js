/* ============================
   LOGIN MASTER – VERSIONE FINALE
   ============================ */

/* Credenziali MASTER salvate internamente */
const MASTER_USERNAME = "master";
const MASTER_PIN = "123456";

/* Salva accesso */
function loginMaster() {
    const user = document.getElementById("username").value.trim();
    const pin = document.getElementById("pin").value.trim();
    const error = document.getElementById("error");

    if (user === "" || pin === "") {
        error.textContent = "Compila tutti i campi.";
        return;
    }

    if (user === MASTER_USERNAME && pin === MASTER_PIN) {
        localStorage.setItem("MASTER_LOGGED", "YES");
        window.location.href = "dashboard/master.html";
    } else {
        error.textContent = "Utente o PIN errato.";
    }
}

/* Controllo accesso sulle pagine del pannello */
function checkMasterLogin() {
    const logged = localStorage.getItem("MASTER_LOGGED");
    if (logged !== "YES") {
        window.location.href = "../master-login.html";
    }
}

/* Logout */
function logoutMaster() {
    localStorage.removeItem("MASTER_LOGGED");
    window.location.href = "../master-login.html";
}
