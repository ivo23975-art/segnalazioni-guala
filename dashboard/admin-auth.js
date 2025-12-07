// ============================================================
// ADMIN AUTH COMPLETAMENTE ALLINEATO A FIRESTORE
// ============================================================

const USERS = "utenti_PPFG";

// LOGIN ADMIN (usato in admin-utenti-login.html)
async function adminLoginAttempt(username, pin) {
    username = username.toLowerCase();

    try {
        const ref = db.collection(USERS).doc(username);
        const snap = await ref.get();

        if (!snap.exists) return false;

        const user = snap.data();

        // Deve essere admin o superadmin
        if (user.ruolo !== "admin" && user.ruolo !== "superadmin") {
            return false;
        }

        if (!user.active) return false;
        if (user.pin !== pin) return false;

        // salva sessione
        localStorage.setItem("ADMIN_UTENTI_OK", "YES");

        return true;

    } catch (err) {
        console.error("Errore admin login:", err);
        return false;
    }
}

// Protezione pagine admin
function checkAdminAccess() {
    if (localStorage.getItem("ADMIN_UTENTI_OK") !== "YES") {
        window.location.href = "admin-utenti-login.html";
    }
}

// Logout admin
function logoutAdmin() {
    localStorage.removeItem("ADMIN_UTENTI_OK");
    window.location.href = "admin-utenti-login.html";
}
