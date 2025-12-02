/* ============================================================
   SISTEMA AUTENTICAZIONE ADMIN – VERSIONE CORRETTA
   ============================================================ */

/* ===========================================
   CONFIGURAZIONE ADMIN
   =========================================== */

const DEFAULT_ADMIN_DATA = {
    guala: {
        role: "guala",
        loginMode: "userpass",
        username: "guala",
        password: "1111"
    },
    piobesi: {
        role: "piobesi",
        loginMode: "userpass",
        username: "piobesi",
        password: "2222"
    },
    particomuni: {
        role: "particomuni",
        loginMode: "userpass",
        username: "particomuni",
        password: "3333"
    },
    superadmin: {
        role: "superadmin",
        loginMode: "userpass",
        username: "admin",
        password: "4444"
    }
};

/* Carica configurazione admin */
function loadAdminConfig() {
    const saved = localStorage.getItem("ADMIN_CONFIG");
    if (!saved) {
        localStorage.setItem("ADMIN_CONFIG", JSON.stringify(DEFAULT_ADMIN_DATA));
        return DEFAULT_ADMIN_DATA;
    }
    return JSON.parse(saved);
}

/* Salva nuova configurazione admin */
function saveAdminConfig(newData) {
    localStorage.setItem("ADMIN_CONFIG", JSON.stringify(newData));
}

/* Admin Data globale */
let ADMIN_DATA = loadAdminConfig();


/* ============================================================
   LOGIN ADMIN – USATO DA login-pin.html
   ============================================================ */
function adminLoginAttempt(username, pin) {

    username = username.toLowerCase();

    for (const key in ADMIN_DATA) {

        const admin = ADMIN_DATA[key];

        // MODE: Solo password/PIN
        if (admin.loginMode === "password") {
            if (pin === admin.password) {
                setAdminSession(admin.role);
                return true;
            }
        }

        // MODE: Username + Password/PIN
        if (admin.loginMode === "userpass") {
            if (username === admin.username.toLowerCase() &&
                pin === admin.password) {

                setAdminSession(admin.role);
                return true;
            }
        }
    }

    return false;
}


/* ============================================================
   LOGIN: Salva sessione e reindirizza
   ============================================================ */
function setAdminSession(role) {
    localStorage.setItem("ADMIN_ROLE", role);
    redirectToPanel(role);
}

function redirectToPanel(role) {
    switch (role) {
        case "guala":        window.location.href = "dashboard/guala.html"; break;
        case "piobesi":      window.location.href = "dashboard/piobesi.html"; break;
        case "particomuni":  window.location.href = "dashboard/particomuni.html"; break;
        case "superadmin":   window.location.href = "dashboard/superadmin.html"; break;
    }
}


/* ============================================================
   PROTEZIONE PAGINE
   ============================================================ */
function requireRole(role) {
    const r = localStorage.getItem("ADMIN_ROLE");

    if (!r) {
        window.location.href = "../login-pin.html";
        return;
    }

    if (role !== "any" && r !== role) {
        alert("Accesso non autorizzato.");
        window.location.href = "../login-pin.html";
    }
}


/* ============================================================
   LOGOUT
   ============================================================ */
function adminLogout() {
    localStorage.removeItem("ADMIN_ROLE");
    window.location.href = "../login-pin.html";
}
