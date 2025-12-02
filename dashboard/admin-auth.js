/* ============================================================
   SISTEMA AUTENTICAZIONE ADMIN – VERSIONE COMPLETA
   ============================================================ */

/* ===========================================
   CONFIGURAZIONE ADMIN (lettura da localStorage)
   =========================================== */

const DEFAULT_ADMIN_DATA = {
    guala: {
        role: "guala",
        loginMode: "password",     // "password" oppure "userpass"
        username: "",
        password: "1111"
    },

    piobesi: {
        role: "piobesi",
        loginMode: "password",
        username: "",
        password: "2222"
    },

    particomuni: {
        role: "particomuni",
        loginMode: "password",
        username: "",
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


/* ===========================================
   LOGIN ADMIN (usato da login-pin.html)
   =========================================== */

function loginAdmin() {

    const user = (document.getElementById("username")?.value || "").trim();
    const pass = (document.getElementById("password")?.value || "").trim();

    if (pass === "") {
        alert("Inserisci la password.");
        return;
    }

    // Controlla ogni ruolo
    for (const key in ADMIN_DATA) {
        const a = ADMIN_DATA[key];

        // Modalità PASSWORD
        if (a.loginMode === "password" && pass === a.password) {
            setAdminSession(a.role);
            return;
        }

        // Modalità USERNAME + PASSWORD
        if (a.loginMode === "userpass" &&
            user === a.username &&
            pass === a.password) {

            setAdminSession(a.role);
            return;
        }
    }

    alert("Credenziali errate.");
}


/* Imposta sessione admin */
function setAdminSession(role) {
    localStorage.setItem("ADMIN_SESSION", JSON.stringify({ role }));
    redirectToPanel(role);
}


/* Redireziona al pannello corretto */
function redirectToPanel(role) {
    switch (role) {
        case "guala":        window.location.href = "guala.html"; break;
        case "piobesi":      window.location.href = "piobesi.html"; break;
        case "particomuni":  window.location.href = "particomuni.html"; break;
        case "superadmin":   window.location.href = "superadmin.html"; break;
    }
}


/* ===========================================
   PROTEZIONE PAGINE
   =========================================== */

function requireRole(role) {
    const session = JSON.parse(localStorage.getItem("ADMIN_SESSION"));

    // Non loggato
    if (!session) {
        window.location.href = "../login-pin.html";
        return;
    }

    // Ruolo sbagliato
    if (session.role !== role && role !== "any") {
        alert("Accesso non autorizzato.");
        window.location.href = "../login-pin.html";
        return;
    }

    console.log("[AUTH] Accesso consentito:", session.role);
}


/* ===========================================
   LOGOUT
   =========================================== */
function adminLogout() {
    localStorage.removeItem("ADMIN_SESSION");
    window.location.href = "../login-pin.html";
}
