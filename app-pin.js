/******************************************************
 * SISTEMA LOGIN APP SEGNALAZIONI — USERNAME + PIN
 * Salvataggio accesso: APP_USER_LOGGED = "appPPFG"
 ******************************************************/

// Inizializza storage utenti se non esiste
if (!localStorage.getItem("APP_PIN_USERS")) {
    const defaultUsers = {
        "chiara": { pin: "482915", active: true }
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
        window.location.href = "login-pin.html";
    }
}


/******************************************************
 * LOGOUT
 ******************************************************/
function appLogout() {
    localStorage.removeItem("APP_USER_LOGGED");
    window.location.href = "login-pin.html";
}


/******************************************************
 * FUNZIONI PER SUPERADMIN (gestione utenti)
 ******************************************************/
function getUsers() {
    return JSON.parse(localStorage.getItem("APP_PIN_USERS"));
}

function saveUsers(obj) {
    localStorage.setItem("APP_PIN_USERS", JSON.stringify(obj));
}

// CREA O MODIFICA UTENTE
function createOrUpdateUser(username, pin, active) {
    username = username.trim().toLowerCase();
    let users = getUsers();
    users[username] = { pin: pin, active: active };
    saveUsers(users);
}

// ATTIVA / DISATTIVA
function setUserActive(username, state) {
    let users = getUsers();
    if (users[username]) {
        users[username].active = state;
        saveUsers(users);
    }
}

// ELIMINA UTENTE
function deleteUser(username) {
    let users = getUsers();
    delete users[username];
    saveUsers(users);
}
