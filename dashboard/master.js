*****************************************************
 * ACCESSO MASTER
 **********************************************************/
const MASTER_USER = "master";
const MASTER_PIN = "280113";

funzione loginMaster() {
    const u = document.getElementById("utente").value.trim().toLowerCase();
    const p = document.getElementById("pin").value.trim();
    const err = document.getElementById("err");

    se (u === MASTER_USER && p === MASTER_PIN) {
        localStorage.setItem("MASTER_LOGGED", "SÌ");
        window.location.href = "master.html";
    } altro {
        err.textContent = "Credenziali errate.";
    }
}

funzione checkMasterLogin() {
    se (localStorage.getItem("MASTER_LOGGED") !== "SÌ") {
        window.location.href = "master-login.html";
    }

    caricaUtenti();
    caricaLink();
    caricaLog();
}

funzione logoutMaster() {
    localStorage.removeItem("MASTER_LOGGED");
    window.location.href = "master-login.html";
}

/********************************************************
 * GESTIONE UTENTI
 **********************************************************/
funzione getUsers() {
    restituisci JSON.parse(localStorage.getItem("APP_PIN_USERS")) || {};
}

funzione saveUsers(u) {
    localStorage.setItem("UTENTI_PIN_APP", JSON.stringify(u));
}

funzione createUser() {
    const utente = document.getElementById("newUser").value.trim().toLowerCase();
    const pin = document.getElementById("newPin").value.trim();

    se (utente === "" || lunghezza pin !== 6) {
        alert("Compila correttamente i campi.");
        ritorno;
    }

    lascia che gli utenti = getUsers();
    utenti[utente] = { pin: pin, attivo: vero };
    saveUsers(utenti);

    log(`Creato utente: ${utente}`);
    caricaUtenti();
}

funzione generatePin() {
    const p = Math.floor(100000 + Math.random() * 900000);
    document.getElementById("newPin").value = p;
}

funzione toggleUser(nome utente) {
    lascia che gli utenti = getUsers();
    utenti[nomeutente].attivo = !utenti[nomeutente].attivo;
    saveUsers(utenti);

    log(`Modificato stato utente: ${username}`);
    caricaUtenti();
}

funzione deleteUser(nomeutente) {
    if (!confirm("Eliminare utente?")) return;

    lascia che gli utenti = getUsers();
    elimina utenti[nome utente];
    saveUsers(utenti);

    log(`Rimosso utente: ${nomeutente}`);
    caricaUtenti();
}

funzione loadUsers() {
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "";

    const utenti = getUsers();

    per (lascia entrare gli utenti) {
        const row = document.createElement("tr");

        riga.HTML interno = `
            <td>${u}</td>
            <td>${utenti[u].pin}</td>
            <td>${utenti[u].attivo ? "ATTIVO" : "BLOCCATO"}</td>
            <td>
                <button onclick="toggleUser('${u}')">Attiva/Blocca</button>
                <button onclick="deleteUser('${u}')">Elimina</button>
            </td>
        `;

        tbody.appendChild(riga);
    }
}

/********************************************************
 * LINK AUTOAGGIORNATI
 **********************************************************/
funzione loadLinks() {
    const base = "https://ivo23975-art.github.io/segnalazioni-guala/";

    collegamenti costanti = [
        { name: "APP Principale", url: base + "index.html" },
        { name: "Login PIN Utenti", url: base + "login-pin.html" },
        { name: "Pannello SuperAdmin", url: base + "dashboard/superadmin.html" },
        { name: "Pannello MASTER", url: base + "dashboard/master.html" }
    ];

    const ul = document.getElementById("linkList");
    ul.innerHTML = "";

    link.forEach(l => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${l.url}" target="_blank">${l.name}</a>`;
        ul.appendChild(li);
    });
}

/********************************************************
 * LOG SISTEMA
 **********************************************************/
funzione log(msg) {
    registri costanti = JSON.parse(localStorage.getItem("MASTER_LOG")) || [];
    registri.push({
        ora: nuova data().toLocaleString(),
        messaggio: messaggio
    });

    localStorage.setItem("MASTER_LOG", JSON.stringify(log));
    caricaLog();
}

funzione loadLog() {
    const tbody = document.querySelector("#logTable tbody");
    tbody.innerHTML = "";

    registri costanti = JSON.parse(localStorage.getItem("MASTER_LOG")) || [];

    logs.slice().reverse().forEach(l => {
        const row = document.createElement("tr");
        riga.HTML interno = `
            <td>${l.time}</td>
            <td>${l.msg}</td>
        `;
        tbody.appendChild(riga);
    });
}

funzione exportLog() {
    registri costanti = localStorage.getItem("MASTER_LOG");
    const blob = new Blob([logs], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "master-log.json";
    a.click();
}
