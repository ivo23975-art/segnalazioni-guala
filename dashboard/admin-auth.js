/* =====================================================
   SISTEMA LOGIN ADMIN (VERSIONE DEFINITIVA)
   - Usa PIN
   - Usa ADMIN_CONFIG
   - Usa ADMIN_LOGGED
   - Controlla active: true/false
===================================================== */

/* =====================================================
   CONFIGURAZIONE DEFAULT (se manca ADMIN_CONFIG)
===================================================== */
let ADMIN_DATA = {
    superadmin: {
        role: "superadmin",
        username: "superadmin",
        pin: "482915",
        active: true
    },
    guala: {
        role: "guala",
        username: "guala",
        pin: "505493",
        active: true
    },
    piobesi: {
        role: "piobesi",
        username: "piobesi",
        pin: "000000",
        active: true
    },
    particomuni: {
        role: "particomuni",
        username: "particomuni",
        pin: "000000",
        active: true
    }
};

/* =====================================================
   CARICA OVERRIDE DA ADMIN_CONFIG
===================================================== */
const savedConfig = localStorage.getItem("ADMIN_CONFIG");
if (savedConfig) {
    try {
        ADMIN_DATA = JSON.parse(savedConfig);
    } catch (e) {
        console.error("Errore caricamento ADMIN_CONFIG:", e);
    }
}

/* =====================================================
   LOGIN ADMIN
===================================================== */
function adminLogin(role, username, pin) {
    const admin = ADMIN_DATA[role];
    if (!admin) return false;

    // Bloccato?
    if (!admin.active) return false;

    // Username sbagliato?
    if (admin.username !== username) return false;

    // PIN sbagliato?
    if (admin.pin !== pin) return false;

    // LOGIN OK
    localStorage.setItem("ADMIN_LOGGED", role);
    return true;
}

/* =====================================================
   LOGOUT
===================================================== */
function adminLogout() {
    localStorage.removeItem("ADMIN_LOGGED");
    window.location.href = "login-pin.html";
}

/* =====================================================
   PROTEZIONE PAGINE
===================================================== */
function requireRole(requiredRole) {
    const role = localStorage.getItem("ADMIN_LOGGED");

    if (!role) {
        window.location.href = "login-pin.html";
        return false;
    }

    // superadmin vede tutto
    if (role === "superadmin") return true;

    // ruolo richiesto corrisponde
    if (role === requiredRole) return true;

    // blocco + redirect
    window.location.href = "login-pin.html";
    return false;
}

/* =====================================================
   SALVATAGGIO NUOVA CONFIG SUPERADMIN
===================================================== */
function saveAdminConfig(newData) {
    localStorage.setItem("ADMIN_CONFIG", JSON.stringify(newData));
    ADMIN_DATA = newData;
}
