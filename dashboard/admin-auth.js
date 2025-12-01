/* =====================================================
   SISTEMA LOGIN ADMIN
===================================================== */

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
   CARICA OVERRIDE SUPERADMIN
===================================================== */
if (localStorage.getItem("ADMIN_OVERRIDE")) {
    try {
        ADMIN_DATA = JSON.parse(localStorage.getItem("ADMIN_OVERRIDE"));
    } catch(e) {
        console.error("Errore override admin:", e);
    }
}

/* =====================================================
   LOGIN ADMIN
===================================================== */
function adminLogin(role, username, password) {

    const admin = ADMIN_DATA[role];
    if (!admin) return false;

    // SOLO PASSWORD
    if (admin.loginMode === "password") {
        return password === admin.password ? 
            (localStorage.setItem("ADMIN_ROLE", role), true) : false;
    }

    // USERNAME + PASSWORD
    if (admin.loginMode === "userpass") {
        return (username === admin.username && password === admin.password) ?
            (localStorage.setItem("ADMIN_ROLE", role), true) : false;
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
   PROTEZIONE PAGINE
===================================================== */
function requireRole(requiredRole) {
    const role = localStorage.getItem("ADMIN_ROLE");

    if (role === "superadmin") return true;
    if (role === requiredRole) return true;

    window.location.href = "login.html";
    return false;
}

/* =====================================================
   SALVA MODIFICHE SUPERADMIN
===================================================== */
function saveAdminConfig(newData) {
    localStorage.setItem("ADMIN_OVERRIDE", JSON.stringify(newData));
    ADMIN_DATA = newData;
}

