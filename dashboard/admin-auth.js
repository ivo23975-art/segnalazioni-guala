/* =====================================================
   GESTIONE LOGIN AMMINISTRATORI (USERNAME + PIN)
   Compatibile con MASTER PANEL (APP_PIN_USERS)
===================================================== */

/*  
   MASTER PANEL salva gli utenti così:

   localStorage.APP_PIN_USERS = {
       "guala": { pin: "123456", active: true },
       "piobesi": { pin: "654321", active: true },
       "superadmin": { pin: "280113", active: true },
       ...
   }
*/

function getAdminUsers() {
    return JSON.parse(localStorage.getItem("APP_PIN_USERS")) || {};
}

/* =====================================================
   LOGIN LOGICA
===================================================== */
function adminLogin(role, username, pin) {

    const users = getAdminUsers();

    // Normalizziamo username
    username = username.trim().toLowerCase();

    // Controllo esistenza utente
    if (!users[username]) return false;

    const u = users[username];

    // Controllo ruolo (username deve coincidere con ruolo)
    if (username !== role) return false;

    // Controllo attivazione
    if (!u.active) return false;

    // PIN corretto
    if (u.pin !== pin.trim()) return false;

    // Salvo sessione
    localStorage.setItem("ADMIN_ROLE", role);
    localStorage.setItem("ADMIN_USER", username);

    return true;
}

/* =====================================================
   LOGOUT
===================================================== */
function adminLogout() {
    localStorage.removeItem("ADMIN_ROLE");
    localStorage.removeItem("ADMIN_USER");
    location.href = "login.html";
}

/* =====================================================
   PROTEZIONE ACCESSO
===================================================== */
function requireRole(role) {

    const logged = localStorage.getItem("ADMIN_ROLE");

    // SuperAdmin può entrare ovunque
    if (logged === "superadmin") return true;

    // Accesso coincidente col ruolo richiesto
    if (logged === role) return true;

    // Accesso negato → logout
    location.href = "login.html";
    return false;
}
