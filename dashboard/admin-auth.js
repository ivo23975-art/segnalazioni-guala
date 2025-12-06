/* ============================================================
   SISTEMA AUTENTICAZIONE ADMIN – VERSIONE CORRETTA E FINALE
   ============================================================ */

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

/* LOAD / SAVE CONFIG */
function loadAdminConfig() {
    const saved = localStorage.getItem("ADMIN_CONFIG");
    if (!saved) {
        localStorage.setItem("ADMIN_CONFIG", JSON.stringify(DEFAULT_ADMIN_DATA));
        return DEFAULT_ADMIN_DATA;
    }
    return JSON.parse(saved);
}

function saveAdminConfig(data) {
    localStorage.setItem("ADMIN_CONFIG", JSON.stringify(data));
}

let ADMIN_DATA = loadAdminConfig();

/* LOGIN LOGIC */
function adminLoginAttempt(username, pin) {

    username = username.toLowerCase();

    for (const key in ADMIN_DATA) {
        const admin = ADMIN_DATA[key];

        if (admin.loginMode === "password") {
            if (pin === admin.password) {
                setAdminSession(admin.role);
                return true;
            }
        }

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

/* SESSION */
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

/* PROTECTION */
function requireRole(role) {
    const r = localStorage.getItem("ADMIN_ROLE");

    if (!r) {
        window.location.href = "../login.html";   // CORRETTO
        return;
    }

    if (role !== "any" && r !== role) {
        alert("Accesso non autorizzato.");
        window.location.href = "../login.html";   // CORRETTO
    }
}

/* LOGOUT */
function adminLogout() {
    localStorage.removeItem("ADMIN_ROLE");
    window.location.href = "../login.html";        // CORRETTO
}
