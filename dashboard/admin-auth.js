/* =====================================================
   SISTEMA LOGIN ADMIN (VERSIONE PERFETTA)
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

// Override da localStorage
if (localStorage.getItem("ADMIN_CONFIG")) {
    try {
        ADMIN_DATA = JSON.parse(localStorage.getItem("ADMIN_CONFIG"));
    } catch {}
}

function adminLogin(role, username, pin) {
    const admin = ADMIN_DATA[role];
    if (!admin) return false;

    if (!admin.active) return false;
    if (admin.username !== username) return false;
    if (admin.pin !== pin) return false;

    localStorage.setItem("ADMIN_LOGGED", role);
    return true;
}

function adminLogout() {
    localStorage.removeItem("ADMIN_LOGGED");
    window.location.href = "../login-pin.html";
}

function requireRole(requiredRole) {
    const role = localStorage.getItem("ADMIN_LOGGED");

    if (!role) {
        window.location.href = "../login-pin.html";
        return false;
    }

    if (role === "superadmin") return true;
    if (role === requiredRole) return true;

    adminLogout();
    return false;
}

function saveAdminConfig(newData) {
    localStorage.setItem("ADMIN_CONFIG", JSON.stringify(newData));
    ADMIN_DATA = newData;
}
