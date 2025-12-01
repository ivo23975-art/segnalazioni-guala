// UTENTE MASTER CORRETTO
const MASTER_LOGIN = {
    username: "master",
    pin: "482915" // puoi cambiarlo
};

// LOGIN
function loginMaster() {
    const user = document.getElementById("username").value.trim();
    const pin = document.getElementById("pin").value.trim();
    const err = document.getElementById("error");

    err.textContent = "";

    if (!user || !pin) {
        err.textContent = "Inserisci username e PIN";
        return;
    }

    if (user === MASTER_LOGIN.username && pin === MASTER_LOGIN.pin) {
        localStorage.setItem("MASTER_LOGGED", "YES");
        window.location.href = "master.html";
        return;
    }

    err.textContent = "Utente inesistente o PIN errato";
}
