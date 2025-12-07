/* ============================================================
   SISTEMA AUTENTICAZIONE ADMIN – VERSIONE STABILE
============================================================ */

/* 🔥 CONFIG STATICA DEI RUOLI */
const ADMIN_ACCOUNTS = {
    guala: {
        role: "guala",
        username: "guala",
        pin: "111111"
    },
    piobesi: {
        role: "piobesi",
        username: "piobesi",
        pin: "222222"
    },
    particomuni: {
        role: "particomuni",
        username: "particomuni",
        pin: "333333"
    },
    superadmin: {
        role: "superadmin",
        username: "admin",
        pin: "444444"
    }
};

/* ============================================================
   LOGIN
============================================================ */

function adminLogin(role, user, pin) {
    const acc = ADMIN_ACCOUNTS[role];
    if (!acc) return false;

    if (acc.username === user && acc.pin === pin) {
        localStorage.setItem("ADMIN_LOGGED", JSON.stringify(acc));
        return true;
    }

    return false;
}

/* ============================================================
   REQUIRE ROLE – Protezione dashboard
============================================================ */

function requireRole(role) {
    try {
        const data = JSON.parse(localStorage.getItem("ADMIN_LOGGED"));

        if (!data) {
            window.location.href = "../login.html";
            return false;
        }

        if (data.role !== role) {
            window.location.href = "../login.html";
            return false;
        }

        return true;

    } catch (err) {
        console.error("Errore requireRole:", err);
        window.location.href = "../login.html";
        return false;
    }
}

/* ============================================================
   LOGOUT
============================================================ */

function adminLogout() {
    localStorage.removeItem("ADMIN_LOGGED");
    window.location.href = "../login.html";
}
