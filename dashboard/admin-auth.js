/* =====================================================
   SISTEMA LOGIN ADMIN
   Modalità: 
   - "password"  = solo password
   - "userpass"  = username + password
   (SuperAdmin può cambiare tutto dal pannello settings)
===================================================== */

// Password e username INIZIALI (modificabili da superadmin-settings.html)
let ADMIN_DATA = {
    superadmin: {
        role: "superadmin",
        loginMode: "password",
        username: "superadmin",
        password: "Super2024!"
    },
    guala: {
        role: "guala",
        loginMode: "password",
        username: "guala",
        password: "Guala2024!"
    },
    piobesi: {
        role: "piobesi",
        loginMode: "password",
        username: "piobesi",
        password: "Piobesi2024!"
    },
    particomuni: {
        role: "particomuni",
        loginMode: "password",
        username: "particomuni",
        password: "Parti2024!"
    }
};

/* =====================================================
   CARICA MODIFICHE LOCALE (SUPERADMIN OVERRIDE)
===================================================== */
if (localStorage.getItem("ADMIN_OVERRIDE")) {
    try {
        const override = JSON.parse(localStorage.getItem("ADMIN_OVERRIDE"));
        ADMIN_DATA = override;  // sostituisce i valori iniziali
    } catch (e) {
        console.error("Errore override admin:", e);
    }
}

/* =====================================================
   LOGIN
===================================================== */
function adminLogin(role, username, password) {

    const admin = ADMIN_DATA[role];
    if (!admin) return false;

    // Modalità 1 → SOLO PASSWORD
    if (admin.loginMode === "password") {
        if (password === admin.password) {
            localStorage.setItem("ADMIN_ROLE", role);
            return true;
        } else {
            return false;
        }
    }

    // Modalità 2 → USER + PASSWORD
    if (admin.loginMode === "userpass") {
        if (username === admin.username && password === admin.password) {
            localStorage.setItem("ADMIN_ROLE", role);
            return true;
        } else {
            return false;
        }
    }

    return false;
}

/* =====================================================
   LOGOUT
===================================================== */
function adminLogout() {
    localStorage.removeItem("ADMIN_ROLE");
    window.location.href = "login.html";
}

/* =====================================================
   CONTROLLO ACCESSO PAGINE
===================================================== */
function requireRole(requiredRole) {
    const role = localStorage.getItem("ADMIN_ROLE");

    // Superadmin può entrare ovunque
    if (role === "superadmin") return true;

    // Altri accessi normali
    if (role === requiredRole) return true;

    // Se non autorizzato → rimanda al login
    window.location.href = "login.html";
    return false;
}

/* =====================================================
   FUNZIONE PER SUPERADMIN (SALVATAGGIO MODIFICHE)
===================================================== */
function saveAdminConfig(newData) {
    localStorage.setItem("ADMIN_OVERRIDE", JSON.stringify(newData));
    ADMIN_DATA = newData;
}
