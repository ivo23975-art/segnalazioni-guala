// ============================================================
// LOGIN UTENTI VIA FIRESTORE
// ============================================================

// Collection Firestore
const USERS = "utenti_PPFG";

// Login
async function loginApp() {
    const username = document.getElementById("username").value.trim().toLowerCase();
    const pin = document.getElementById("pin").value.trim();

    const errorBox = document.getElementById("error");

    if (username === "" || pin.length !== 6) {
        errorBox.textContent = "Inserisci username e PIN di 6 cifre.";
        return;
    }

    try {
        // Cerca utente
        const ref = db.collection(USERS).doc(username);
        const snap = await ref.get();

        if (!snap.exists) {
            errorBox.textContent = "Utente non trovato.";
            return;
        }

        const user = snap.data();

        // Utente bloccato
        if (!user.active) {
            errorBox.textContent = "Utente bloccato dall'amministratore.";
            return;
        }

        // Controllo PIN
        if (user.pin !== pin) {
            errorBox.textContent = "PIN errato.";
            return;
        }

        // SALVA SESSIONE
        localStorage.setItem("APP_USER", username);
        localStorage.setItem("APP_ROLE", user.ruolo);

        // Aggiorna Firestore
        await ref.update({
            online: true,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Reindirizzamento in base al ruolo
        switch (user.ruolo) {
            case "guala":
                window.location.href = "dashboard/guala.html";
                break;

            case "piobesi":
                window.location.href = "dashboard/piobesi.html";
                break;

            case "particomuni":
                window.location.href = "dashboard/particomuni.html";
                break;

            case "admin":
                window.location.href = "dashboard/admin-utenti.html";
                break;

            case "superadmin":
                window.location.href = "dashboard/superadmin.html";
                break;

            default:
                errorBox.textContent = "Ruolo non valido.";
                break;
        }

    } catch (err) {
        console.error("Errore login:", err);
        errorBox.textContent = "Errore durante il login.";
    }
}

// ============================================================
// LOGOUT (usato da tutte le dashboard)
// ============================================================
async function appLogout() {
    const username = localStorage.getItem("APP_USER");
    if (username) {
        try {
            await db.collection(USERS).doc(username).update({
                online: false,
                lastLogout: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.warn("Logout Firestore fallito:", e);
        }
    }

    localStorage.removeItem("APP_USER");
    localStorage.removeItem("APP_ROLE");

    window.location.href = "../login.html";
}

// ============================================================
// PROTEZIONE PAGINE
// ============================================================
function requireAppRole(allowedRoles) {
    const r = localStorage.getItem("APP_ROLE");

    if (!r) {
        window.location.href = "../login.html";
        return;
    }

    if (!allowedRoles.includes(r)) {
        alert("Accesso negato.");
        window.location.href = "../login.html";
    }
}
