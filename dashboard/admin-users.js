/************************************************************
 *  ADMIN USERS APP – FIRESTORE + MASTER INVISIBILE
 *  Percorso: dashboard/admin-app/admin-users.js
 *  Richiede:
 *   - firebase 8.x
 *   - ../firebase-config.js che espone "db"
 ************************************************************/

/* ==========================
   CONFIGURAZIONE
========================== */

// Collection utenti su Firestore
const USERS_COLLECTION = "utenti_PPFG";

// LocalStorage key per la sessione dell'admin panel
const ADMIN_PANEL_KEY = "ADMIN_PANEL_OK";

// LocalStorage key per lo storico locale
const ADMIN_STORICO_KEY = "ADMIN_USERS_STORICO";

// Account MASTER invisibile (non esiste in Firestore)
const MASTER_ACCOUNT = {
    username: "master",
    pin: "280113",
    role: "master"
};


/* ==========================
   LOGIN ADMIN APP
   Chiamata da admin-login.html
========================== */

/**
 * Login per l'app di gestione utenti.
 * - Se username/pin corrispondono al MASTER → login immediato.
 * - Altrimenti verifica su Firestore (utenti_PPFG).
 *
 * @param {string} roleSelected Ruolo selezionato nella select (superadmin/guala/...)
 * @param {string} username    Username digitato
 * @param {string} pin         PIN digitato
 * @returns {Promise<boolean>} true se login ok, false altrimenti
 */
async function adminAppLogin(roleSelected, username, pin) {
    const user = (username || "").trim().toLowerCase();
    const p = (pin || "").trim();

    if (!user || !p) {
        console.warn("adminAppLogin: username o PIN vuoti");
        return false;
    }

    // 🔒 1) MASTER OVERRIDE (invisibile, non in Firestore)
    if (user === MASTER_ACCOUNT.username && p === MASTER_ACCOUNT.pin) {
        saveAdminSession(MASTER_ACCOUNT.username, MASTER_ACCOUNT.role);
        logStorico("Login MASTER");
        console.log("Login MASTER eseguito.");
        return true;
    }

    // 🔒 2) Verifica utente su Firestore
    try {
        const docRef = db.collection(USERS_COLLECTION).doc(user);
        const snap = await docRef.get();

        if (!snap.exists) {
            console.warn("adminAppLogin: utente inesistente:", user);
            return false;
        }

        const u = snap.data();

        // PIN
        if (!u.pin || u.pin !== p) {
            console.warn("adminAppLogin: PIN errato per", user);
            return false;
        }

        // Utente disattivato?
        if (u.active === false) {
            console.warn("adminAppLogin: utente disattivato:", user);
            return false;
        }

        // Controllo ruolo se esiste
        if (roleSelected && u.ruolo && u.ruolo !== roleSelected) {
            console.warn("adminAppLogin: ruolo non corrispondente. Atteso:",
                roleSelected, "trovato:", u.ruolo);
            return false;
        }

        const effectiveRole = u.ruolo || roleSelected || "superadmin";

        // Aggiorno stato online (se possibile)
        try {
            await docRef.update({
                online: true,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (err) {
            console.warn("adminAppLogin: errore update online:", err);
        }

        saveAdminSession(user, effectiveRole);
        logStorico(`Login ${effectiveRole.toUpperCase()} – ${user}`);

        console.log("Login admin panel ok, ruolo:", effectiveRole);
        return true;

    } catch (err) {
        console.error("adminAppLogin: errore Firestore:", err);
        return false;
    }
}

/* Salva sessione admin panel in localStorage */
function saveAdminSession(username, role) {
    localStorage.setItem(
        ADMIN_PANEL_KEY,
        JSON.stringify({
            username: username,
            role: role
        })
    );
}

/* Legge sessione admin panel */
function getAdminSession() {
    const raw = localStorage.getItem(ADMIN_PANEL_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (e) {
        console.warn("getAdminSession: JSON invalido:", e);
        return null;
    }
}


/* ==========================
   PROTEZIONE ACCESSO PANNELLO
========================== */

/**
 * Consente accesso SOLO a:
 *  - MASTER
 *  - SUPERADMIN
 * Gli altri ruoli vengono buttati fuori.
 */
function requireSuperAccess() {
    const session = getAdminSession();

    if (!session) {
        alert("Sessione scaduta. Effettua nuovamente il login.");
        window.location.href = "admin-login.html";
        return false;
    }

    const role = session.role;

    // Solo MASTER o SUPERADMIN
    if (role !== "master" && role !== "superadmin") {
        alert("Accesso negato. Privilegi insufficienti.");
        window.location.href = "admin-login.html";
        return false;
    }

    return true;
}


/* ==========================
   INIZIALIZZAZIONE PAGINA admin-users.html
========================== */

function initAdminUsers() {
    if (!requireSuperAccess()) return;

    loadUsers();
    loadStorico();
}


/* ==========================
   LOGOUT ADMIN APP
========================== */

async function adminAppLogout() {
    try {
        const session = getAdminSession();
        if (session && session.username !== MASTER_ACCOUNT.username) {
            const user = session.username;
            const docRef = db.collection(USERS_COLLECTION).doc(user);

            try {
                await docRef.update({
                    online: false,
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (err) {
                console.warn("adminAppLogout: errore update offline:", err);
            }
        }
    } catch (e) {
        console.warn("adminAppLogout: errore generale:", e);
    }

    localStorage.removeItem(ADMIN_PANEL_KEY);
    logStorico("Logout admin panel");
    window.location.href = "admin-login.html";
}


/* ==========================
   GESTIONE UTENTI – FIRESTORE
========================== */

/* Crea nuovo utente */
async function createUser() {
    const newUserInput = document.getElementById("newUser");
    const newPinInput  = document.getElementById("newPin");
    const newRoleSel   = document.getElementById("newRole");

    const username = (newUserInput.value || "").trim().toLowerCase();
    const pin      = (newPinInput.value  || "").trim();
    const ruolo    = newRoleSel.value;

    if (!username || pin.length !== 6) {
        alert("Compila correttamente username e PIN (6 cifre).");
        return;
    }

    // Non permetto di creare un utente chiamato "master"
    if (username === MASTER_ACCOUNT.username) {
        alert("Non puoi creare o modificare l'utente MASTER.");
        return;
    }

    try {
        const docRef = db.collection(USERS_COLLECTION).doc(username);
        await docRef.set({
            username: username,
            pin: pin,
            ruolo: ruolo,
            active: true,
            online: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastSeen: null
        }, { merge: true });

        logStorico(`Creato utente: ${username} (ruolo: ${ruolo})`);

        newUserInput.value = "";
        newPinInput.value = "";

        await loadUsers();
        alert("Utente creato correttamente.");

    } catch (err) {
        console.error("createUser: errore Firestore:", err);
        alert("Errore nella creazione utente. Controlla la console.");
    }
}

/* Genera PIN casuale */
function generatePin() {
    const p = Math.floor(100000 + Math.random() * 900000);
    document.getElementById("newPin").value = String(p);
}

/* Carica lista utenti da Firestore */
async function loadUsers() {
    const tbody = document.getElementById("usersTable");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7">Caricamento...</td></tr>`;

    try {
        const snap = await db.collection(USERS_COLLECTION).orderBy("username").get();
        tbody.innerHTML = "";

        const session = getAdminSession();
        const currentRole = session ? session.role : null;

        snap.forEach(doc => {
            const u = doc.data();
            const username = u.username || doc.id;

            // Non mostro mai l'utente MASTER (non dovrebbe esistere comunque)
            if (username === MASTER_ACCOUNT.username) return;

            const tr = document.createElement("tr");

            // Stato attivo/bloccato
            const active = (u.active !== false);
            const statoLabel = active ? "ATTIVO" : "BLOCCATO";
            const statoClass = active ? "badge-green" : "badge-red";

            // Online/offline
            const online = (u.online === true);
            const onlineText = online ? "🟢 Online" : "⚫ Offline";

            // Ultimo accesso
            let lastSeenText = "-";
            try {
                if (u.lastSeen && u.lastSeen.toDate) {
                    lastSeenText = u.lastSeen.toDate().toLocaleString();
                }
            } catch (e) {
                lastSeenText = "-";
            }

            // Azioni consentite
            const canTouchSuperadmin =
                (u.ruolo === "superadmin") ? (currentRole === "master") : true;

            let actionsHtml = "";

            if (!canTouchSuperadmin) {
                actionsHtml = `<span class="badge badge-orange">Solo MASTER</span>`;
            } else {
                actionsHtml = `
                    <button class="btn-mini btn-toggle" 
                        onclick="toggleUserActive('${username}', ${active})">
                        ${active ? "Blocca" : "Attiva"}
                    </button>
                    <button class="btn-mini btn-delete" 
                        onclick="deleteUser('${username}', '${u.ruolo || ""}')">
                        Elimina
                    </button>
                `;
            }

            tr.innerHTML = `
                <td>${username}</td>
                <td>${u.pin || "-"}</td>
                <td>${u.ruolo || "-"}</td>
                <td><span class="badge ${statoClass}">${statoLabel}</span></td>
                <td>${onlineText}</td>
                <td>${lastSeenText}</td>
                <td>${actionsHtml}</td>
            `;

            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("loadUsers: errore Firestore:", err);
        tbody.innerHTML = `<tr><td colspan="7">Errore nel caricamento utenti.</td></tr>`;
    }
}

/* Attiva/Blocca utente */
async function toggleUserActive(username, isActive) {
    if (username === MASTER_ACCOUNT.username) {
        alert("Non puoi modificare l'utente MASTER.");
        return;
    }

    try {
        const docRef = db.collection(USERS_COLLECTION).doc(username);
        await docRef.update({
            active: !isActive
        });

        logStorico(`${!isActive ? "Attivato" : "Bloccato"} utente: ${username}`);
        await loadUsers();

    } catch (err) {
        console.error("toggleUserActive: errore:", err);
        alert("Errore nel cambio stato utente.");
    }
}

/* Elimina utente */
async function deleteUser(username, role) {
    if (username === MASTER_ACCOUNT.username) {
        alert("Non puoi eliminare l'utente MASTER.");
        return;
    }

    const session = getAdminSession();
    const currentRole = session ? session.role : null;

    if (role === "superadmin" && currentRole !== "master") {
        alert("Solo il MASTER può eliminare un SUPERADMIN.");
        return;
    }

    if (!confirm(`Eliminare definitivamente l'utente "${username}"?`)) {
        return;
    }

    try {
        await db.collection(USERS_COLLECTION).doc(username).delete();
        logStorico(`Eliminato utente: ${username}`);
        await loadUsers();

    } catch (err) {
        console.error("deleteUser: errore:", err);
        alert("Errore nell'eliminazione utente.");
    }
}


/* ==========================
   STORICO LOCALE
========================== */

function logStorico(msg) {
    try {
        const arr = JSON.parse(localStorage.getItem(ADMIN_STORICO_KEY)) || [];
        arr.push({
            time: new Date().toLocaleString(),
            msg: msg
        });
        localStorage.setItem(ADMIN_STORICO_KEY, JSON.stringify(arr));
        loadStorico();
    } catch (e) {
        console.warn("logStorico: errore salvataggio:", e);
    }
}

function loadStorico() {
    const box = document.getElementById("storicoList");
    if (!box) return;

    let arr = [];
    try {
        arr = JSON.parse(localStorage.getItem(ADMIN_STORICO_KEY)) || [];
    } catch (e) {
        arr = [];
    }

    box.innerHTML = arr
        .slice()
        .reverse()
        .map(item => `<p><strong>${item.time}:</strong> ${item.msg}</p>`)
        .join("");

    if (box.innerHTML === "") {
        box.innerHTML = "<p>Nessuna operazione registrata.</p>";
    }
}
