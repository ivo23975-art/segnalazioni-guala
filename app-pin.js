/******************************************************
 * LOGIN APP — Collegato a Firestore (utenti_PPFG)
 * Controllo PIN, ruolo, stato active
 ******************************************************/

// Firestore è già inizializzato da firebase-config.js
const USERS = "utenti_PPFG";

/******************************************************
 * LOGIN UTENTE
 ******************************************************/
async function loginApp() {
    const user = document.getElementById("username").value.trim().toLowerCase();
    const pin = document.getElementById("pin").value.trim();
    const err = document.getElementById("error");

    err.textContent = "";

    if (user === "" || pin === "") {
        err.textContent = "Inserisci username e PIN.";
        return;
    }

    try {
        const docRef = await db.collection(USERS).doc(user).get();

        // Utente inesistente
        if (!docRef.exists) {
            err.textContent = "Utente inesistente.";
            return;
        }

        const u = docRef.data();

        // Utente disattivato
        if (!u.active) {
            err.textContent = "Utente disattivato.";
            return;
        }

        // PIN errato
        if (u.pin !== pin) {
            err.textContent = "PIN errato.";
            return;
        }

        /********************************************
         * LOGIN OK — salvataggio sessione
         ********************************************/
        localStorage.setItem("APP_USER_LOGGED", "appPPFG");
        localStorage.setItem("APP_USER_ROLE", u.ruolo);
        localStorage.setItem("APP_USER_NAME", u.username);

        /********************************************
         * REDIRECT IN BASE AL RUOLO
         ********************************************/
        switch (u.ruolo) {

            case "guala":
                window.location.href =
                  "dashboard/guala.html";
                break;

            case "piobesi":
                window.location.href =
                  "dashboard/piobesi.html";
                break;

            case "particomuni":
                window.location.href =
                  "dashboard/particomuni.html";
                break;

            case "superadmin":
                window.location.href =
                  "dashboard/superadmin.html";
                break;

            default:
                err.textContent = "Ruolo non valido.";
                break;
        }

    } catch (error) {
        console.error("ERRORE LOGIN:", error);
        err.textContent = "Errore interno. Controlla la console.";
    }
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
    localStorage.removeItem("APP_USER_ROLE");
    localStorage.removeItem("APP_USER_NAME");
    window.location.href = "login.html";
}
