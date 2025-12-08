// dashboard.js
// Gestione segnalazioni + UI chat (solo dove presente il popup HTML)

// Assumo che Firebase sia già inizializzato in firebase-config.js
const db = firebase.firestore();

// ===============================
// Utility generali
// ===============================

function formatDate(ts) {
    if (!ts) return "";

    // Se è un Timestamp Firestore
    if (ts.seconds) {
        const date = ts.toDate();
        return date.toLocaleString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // Se è una Date JS
    if (ts instanceof Date) {
        return ts.toLocaleString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // Fallback
    try {
        const date = new Date(ts);
        if (!isNaN(date.getTime())) {
            return date.toLocaleString("it-IT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        }
    } catch (e) {
        console.warn("formatDate: valore non riconosciuto", ts);
    }

    return "";
}

function tipoConSottotipo(tipo, sottotipo) {
    if (!tipo && !sottotipo) return "";
    if (tipo && !sottotipo) return tipo;
    if (!tipo && sottotipo) return `<span class="sottotipo">${sottotipo}</span>`;
    return `${tipo} <span class="sottotipo">${sottotipo}</span>`;
}

// ===============================
// Caricamento segnalazioni
// ===============================

/**
 * Carica le segnalazioni in tempo reale e popola la tabella.
 * @param {Function} filterFn funzione che riceve un record "r" e ritorna true/false
 * @param {boolean} superadmin se true, mostra anche il bottone elimina
 */
function loadSegnalazioni(filterFn, superadmin = false) {
    const tbody = document.getElementById("tbody");
    if (!tbody) {
        console.error("Impossibile trovare tbody per le segnalazioni");
        return;
    }

    // Verifica se la pagina supporta la chat:
    // se NON esiste #chatPopup, non mostriamo l'icona 💬.
    const chatAvailable = !!document.getElementById("chatPopup");

    db.collection("segnalazioni")
        .orderBy("timestamp", "desc")
        .onSnapshot(snapshot => {
            tbody.innerHTML = "";

            snapshot.forEach(doc => {
                const data = doc.data() || {};
                const r = {
                    id: doc.id,
                    complesso: (data.complesso || "").toLowerCase(),
                    complessoLabel: data.complesso || "",
                    scala: data.scala || "",
                    piano: data.piano || "",
                    lato: data.lato || "",
                    nome: data.nome || "",
                    temperatura: (data.temperatura !== undefined && data.temperatura !== null)
                        ? data.temperatura
                        : "",
                    tipo: data.tipo || "",
                    sottotipo: data.sottotipo || "",
                    descrizione: data.descrizione || "",
                    stato: (data.stato || "").toLowerCase(),
                    timestamp: data.timestamp || null
                };

                // Applica filtro specifico (es. solo guala, solo attive, ecc.)
                if (typeof filterFn === "function" && !filterFn(r)) {
                    return;
                }

                // Normalizzazioni (solo label dove serve)
                const statoLabel = r.stato === "risolta" ? "Risolta" : "Attiva";

                const tipoLabelHtml = tipoConSottotipo(r.tipo, r.sottotipo);
                const dataLabel = formatDate(r.timestamp);

                // Safe per l'attributo HTML (nome in openChat)
                const safeNome = (r.nome || "")
                    .replace(/'/g, "&#39;")
                    .replace(/"/g, "&quot;");

                // Costruzione riga tabella
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td data-label="Data">${dataLabel}</td>
                    <td data-label="Complesso">${r.complessoLabel}</td>
                    <td data-label="Scala">${r.scala}</td>
                    <td data-label="Piano">${r.piano}</td>
                    <td data-label="Lato">${r.lato}</td>
                    <td data-label="Nome">${r.nome}</td>
                    <td data-label="Temperatura">${r.temperatura}</td>
                    <td data-label="Tipo">${tipoLabelHtml}</td>
                    <td data-label="Descrizione">${r.descrizione}</td>
                    <td data-label="Stato">${statoLabel}</td>
                    <td data-label="Azioni">
                        <div style="display:flex; gap:6px; align-items:center; justify-content:center;">
                            <div class="action-btn btn-green"
                                 onclick="risolviSegnalazione('${r.id}')">✔</div>

                            ${chatAvailable
                                ? `
                                    <div class="chat-icon"
                                         title="Apri chat con il condomino"
                                         onclick="openChat('${r.id}', '${safeNome}')">
                                        💬
                                    </div>
                                  `
                                : ""}

                            ${superadmin
                                ? `
                                    <div class="action-btn btn-red"
                                         onclick="eliminaSegnalazione('${r.id}')">✖</div>
                                  `
                                : ""}
                        </div>
                    </td>
                `;

                tbody.appendChild(tr);
            });
        }, error => {
            console.error("Errore nel listener delle segnalazioni:", error);
        });
}

// ===============================
// Azioni: risolvi / elimina
// ===============================

function risolviSegnalazione(id) {
    if (!id) return;

    const conferma = confirm("Segnare questa segnalazione come RISOLTA?");
    if (!conferma) return;

    db.collection("segnalazioni")
        .doc(id)
        .update({
            stato: "risolta",
            risolta_il: new Date()
        })
        .then(() => {
            console.log("Segnalazione risolta:", id);
        })
        .catch(err => {
            console.error("Errore nel risolvere la segnalazione:", err);
            alert("Si è verificato un errore nel segnare la segnalazione come risolta.");
        });
}

function eliminaSegnalazione(id) {
    if (!id) return;

    const conferma = confirm(
        "Sei sicuro di voler ELIMINARE definitivamente questa segnalazione?"
    );
    if (!conferma) return;

    db.collection("segnalazioni")
        .doc(id)
        .delete()
        .then(() => {
            console.log("Segnalazione eliminata:", id);
        })
        .catch(err => {
            console.error("Errore nell'eliminare la segnalazione:", err);
            alert("Si è verificato un errore nell'eliminare la segnalazione.");
        });
}

// ===============================
// BLOCCO CHAT - SOLO UI (nessun Firestore) - SAFE OVUNQUE
// ===============================

let currentChatSegnalazioneId = null;

/**
 * Recupera in modo sicuro gli elementi della chat.
 * Se non esistono (pagine senza popup), ritorna null
 * SENZA generare errori.
 */
function getChatElements() {
    const popup = document.getElementById("chatPopup");
    const title = document.getElementById("chatTitle");
    const messages = document.getElementById("chatMessages");
    const input = document.getElementById("chatInput");

    if (!popup || !title || !messages || !input) {
        // Niente chat su questa pagina → nessun errore, solo log.
        console.warn("UI chat non disponibile su questa dashboard.");
        return null;
    }

    return { popup, title, messages, input };
}

function openChat(segnalazioneId, nomeCondomino) {
    const els = getChatElements();
    if (!els) {
        // Eventuale feedback “gentile” per l’utente, ma opzionale:
        // alert("La chat non è disponibile in questa dashboard.");
        return;
    }

    currentChatSegnalazioneId = segnalazioneId;

    const { popup, title, messages, input } = els;

    // Titolo popup
    if (nomeCondomino) {
        title.innerText = `Chat segnalazione – ${nomeCondomino}`;
    } else {
        title.innerText = "Chat segnalazione";
    }

    // Per ora: puliamo i messaggi e mostriamo un messaggio di sistema di benvenuto
    messages.innerHTML = "";

    const now = new Date();
    const introDiv = document.createElement("div");
    introDiv.className = "chat-system-message";
    introDiv.innerText = `[${now.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit"
    })}] Chat avviata per questa segnalazione (SOLO INTERFACCIA, nessun salvataggio).`;

    messages.appendChild(introDiv);

    // Mostra popup
    popup.style.display = "flex";

    // Reset + focus input
    input.value = "";
    input.focus();
}

function closeChat() {
    const els = getChatElements();
    if (!els) return;

    const { popup, messages, input } = els;

    popup.style.display = "none";
    messages.innerHTML = "";
    input.value = "";
    currentChatSegnalazioneId = null;
}

function sendChatMessage() {
    const els = getChatElements();
    if (!els) return;

    const { messages, input } = els;

    const testo = (input.value || "").trim();
    if (!testo) return;

    const now = new Date();
    const oraStr = now.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit"
    });

    // Per ora: solo UI locale, nessun salvataggio su Firestore
    const msgDiv = document.createElement("div");
    msgDiv.className = "chat-message chat-message-admin";
    msgDiv.innerHTML = `
        <span class="chat-meta">[${oraStr}] ADMIN</span>
        <span class="chat-text"></span>
    `;
    msgDiv.querySelector(".chat-text").innerText = testo;

    messages.appendChild(msgDiv);

    // Reset input + scroll in basso
    input.value = "";
    messages.scrollTop = messages.scrollHeight;
}

// Opzionale: invio con ENTER (ma senza bloccare mai la pagina se gli elementi non esistono)
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
        const els = getChatElements();
        if (!els) return;

        const activeElement = document.activeElement;
        if (activeElement && activeElement.id === "chatInput") {
            e.preventDefault();
            sendChatMessage();
        }
    }
});
