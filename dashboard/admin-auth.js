/******************************************************
 * SISTEMA LOGIN AMMINISTRATORI
 * Modalità unica: USERNAME + PIN (6 cifre)
 ******************************************************/

// Configurazione iniziale (se MASTER non ha cambiato nulla)
let ADMIN_DATA = {
    superadmin: { role: "superadmin", username: "superadmin", pin: "111111" },
    guala:      { role: "guala",      username: "guala",      pin: "222222" },
    piobesi:    { role: "piobesi",    username: "piobesi",    pin: "333333" },
    particomuni:{ role: "particomuni",username: "particomuni",pin: "444444" }
};

/******************************************************
 * CARICA OVERRIDE SALVATO DAL MASTER
 ******************************************************/
if (localStorage.getItem("ADMIN_OVERRIDE")) {
    try {
        ADMIN_DATA = JSON.parse(localStorage.getItem("ADMIN_OVERRIDE"));
    } catch (e) {
        console.error("Errore caricamento override admin:", e);
    }
}

/******************************************************
 * LOGIN AMMINISTRATORI
 ******************************************************/
function adminLogin(role, username, pin) {

    const admin = ADMIN_DATA[role];
    if (!admin) return false;

    if (username === admin.username && pin === admin.pin) {
        localStorage.setItem("ADMIN_ROLE", role);
        return true;
    }

    return false;
}

/******************************************************
 * LOGOUT
 ******************************************************/
function adminLogout() {
    localStorage.removeItem("ADMIN_ROLE");
    window.location.href = "login.html";
}

/******************************************************
 * CONTROLLO ACCESSO PAGINE
 ******************************************************/
function requireRole(requiredRole) {

    const role = localStorage.getItem("ADMIN_ROLE");

    if (role === "superadmin") return true;  // Superadmin vede tutto
    if (role === requiredRole) return true;

    window.location.href = "login.html";
    return false;
}

/******************************************************
 * SALVATAGGIO CONFIGURAZIONE DA SUPERADMIN
 ******************************************************/
function saveAdminConfig(newData) {
    ADMIN_DATA = newData;
    localStorage.setItem("ADMIN_OVERRIDE", JSON.stringify(newData));
}
