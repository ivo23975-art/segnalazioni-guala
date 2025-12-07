/******************************************************
 * SISTEMA LOGIN APP SEGNALAZIONI — USERNAME + PIN
 * Salvataggio accesso: APP_USER_LOGGED = "appPPFG"
 ******************************************************/

// Inizializza storage utenti se non esiste
if (!localStorage.getItem("APP_PIN_USERS")) {
    const defaultUsers = {
        "superadmin": { pin: "482915", active: true }
    };
    localStorage.setItem("APP_PIN_USERS", JSON.stringify(defaultUsers));
}


/******************************************************
 * LOGIN UTENTE (USERNAME + PIN)
 ******************************************************/
function loginApp() {
    const user = document.getElementById("username").value.trim().toLowerCase();
    const pin = document.getElementById("pin").value.trim();
    const err = document.getElementById("error");

    if (user === "" || pin === "") {
        err.textContent = "Inserisci username e PIN.";
        return;
    }

    let users = JSON.parse(localStorage.getItem("APP_PIN_USERS"));

    if (!users[user]) {
        err.textContent = "Utente inesistente.";
        return;
    }

    if (!users[user].active) {
        err.textContent = "Utente disattivato.";
        return;
    }

    if (users[user].pin !== pin) {
        err.textContent = "PIN errato.";
        return;
    }

    // Login OK → salva token principale
    localStorage.setItem("APP_USER_LOGGED", "appPPFG");

    // Vai all'app
    window.location.href = "indice.html";
}


/******************************************************
 * CONTROLLO ACCESSO PAGINE
 ******************************************************/
function checkAppLogin() {
    if (localStorage.getItem("APP_USER_LOGGED") !== "appPPFG") {
        window.location.href = "login.html";
    }
}


/******************************************************
 * LOGOUT
 ******************************************************/
function appLogout() {
    localStorage.removeItem("APP_USER_LOGGED");
    window.location.href = "login.html";
}
