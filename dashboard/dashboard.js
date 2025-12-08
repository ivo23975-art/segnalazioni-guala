/* =========================================================
   DASHBOARD – LETTURA REALTIME DELLE SEGNALAZIONI + CHAT
   Percorso: dashboard/dashboard.js
========================================================= */

/* ------------------------------------------------------------------
   VARIABILI GLOBALI PER LA CHAT
------------------------------------------------------------------ */

let currentChatSegnalazioneId = null;   // id della segnalazione aperta
let chatUnsubscribe = null;             // funzione per staccare il listener chat


/* ------------------------------------------------------------------
   LOAD SEGNALAZIONI
------------------------------------------------------------------ */
/**
 * Carica in realtime le segnalazioni e popola la tabella.
 *
 * @param {Function} filterFn   funzione che riceve una segnalazione "r"
 *                              e deve restituire true/false
 * @param {Boolean}  superadmin se true mostra anche il bottone "✖"
 */
function loadSegnalazioni(filterFn, superadmin = false) {

    console.log("[DEBUG] loadSegnalazioni avviata…");

    db.collection("segnalazioni")
      .orderBy("timestamp", "desc")
      .onSnapshot(
        (snapshot) => {

            console.log("[DEBUG] Documenti ricevuti:", snapshot.size);

            let html = "";

            snapshot.forEach(doc => {

                const r = doc.data();
                r.id = doc.id;

                if (!r.stato)     r.stato     = "attiva";
                if (!r.tipo)      r.tipo      = "N/D";
                if (!r.complesso) r.complesso = "sconosciuto";

                // filtro personalizzato (Guala, Piobesi, Parti Comuni, SuperAdmin)
                const passa = filterFn(r);
                if (!passa) return;

                html += `
                <tr>
                    <td data-label="Data">${formatDate(r.timestamp)}</td>
                    <td data-label="Scala">${r.scala || "-"}</td>
                    <td data-label="Piano">${r.piano || "-"}</td>
                    <td data-label="Lato">${r.lato || "-"}</td>
                    <td data-label="Nome">${r.nome || "-"}</td>
                    <td data-label="Temp">${r.temperatura || "-"}</td>
                    <td data-label="Tipo">${tipoConSottotipo(r.tipo, r.sottotipo)}</td>
                    <td data-label="Descrizione">${r.descrizione || "-"}</td>

                    <td data-label="Azioni">
                        <div style="display:flex; gap:6px;">
                            <div class="action-btn btn-green"
                                 onclick="risolviSegnalazione('${r.id}')">✔</div>

                            <!-- CHAT ICON -->
                            <div class="action-btn btn-chat"
                                 title="Apri chat"
                                 onclick="openChat('${r.id}')">💬</div>

                            ${
                                superadmin
                                  ? `<div class="action-btn btn-red"
                                         onclick="eliminaSegnalazione('${r.id}')">✖</div>`
                                  : ""
                            }
                        </div>
                    </td>
                </tr>`;
            });

            const bodyEl = document.getElementById("tbody");
            if (bodyEl) bodyEl.innerHTML = html;
        },

        (error) => {
            console.error("[DEBUG] ERRORE Firestore:", error);
            alert("Errore Firestore: " + error.message);
        }
      );
}


/* ------------------------------------------------------------------
   RISOLVI SEGNALAZIONE
------------------------------------------------------------------ */

function risolviSegnalazione(id) {
    if (!confirm("Segnalazione risolta?")) return;

    db.collection("segnalazioni").doc(id).update({
        stato: "risolta",
        risolta_il: new Date()
    })
    .then(() => console.log("Segnalazione risolta:", id))
    .catch(err => alert("Errore: " + err.message));
}


/* ------------------------------------------------------------------
   ELIMINA SEGNALAZIONE (solo SuperAdmin)
------------------------------------------------------------------ */

function eliminaSegnalazione(id) {
    if (!confirm("Eliminare definitivamente la segnalazione?")) return;

    db.collection("segnalazioni").doc(id).delete()
      .then(() => console.log("Segnalazione eliminata:", id))
      .catch(err => alert("Errore: " + err.message));
}


/* ------------------------------------------------------------------
   FORMATTAZIONE DATA
------------------------------------------------------------------ */

function formatDate(ts) {
    if (!ts) return "-";

    try {
        const d = ts.toDate(); // Firestore Timestamp
        return d.toLocaleDateString("it-IT") + " " + d.toLocaleTimeString("it-IT");
    } catch {
        return "-";
    }
}


/* ------------------------------------------------------------------
   TIPO + SOTTOTIPO
------------------------------------------------------------------ */

function tipoConSottotipo(tipo, sottotipo) {
    if (!sottotipo) return tipo || "N/D";
    return `${tipo} – <span class="sottotipo">${sottotipo}</span>`;
}


/* =========================================================
   SEZIONE CHAT
========================================================= */

/**
 * Apre il popup chat per una segnalazione.
 * - Mostra il popup
 * - Carica il titolo (scala/piano/nome) dalla segnalazione
 * - Attiva il listener realtime sui messaggi
 */
function openChat(segnalazioneId) {

    const popup   = document.getElementById("chatPopup");
    const titleEl = document.getElementById("chatTitle");
    const msgBox  = document.getElementById("chatMessages");
    const inputEl = document.getElementById("chatInput");

    // Se la pagina non ha la struttura della chat (es. altre dashboard)
    if (!popup || !titleEl || !msgBox || !inputEl) {
        console.warn("openChat: struttura chat non presente in questa pagina.");
        alert("Chat non disponibile su questa pagina.");
        return;
    }

    currentChatSegnalazioneId = segnalazioneId;

    // mostro overlay
    popup.style.display = "flex";

    // pulisco input
    inputEl.value = "";

    // setto titolo leggendo la segnalazione
    db.collection("segnalazioni").doc(segnalazioneId).get()
        .then(doc => {
            if (!doc.exists) {
                titleEl.innerText = "Segnalazione (non trovata)";
                return;
            }
            const r = doc.data();
            const parts = [];
            if (r.complesso) parts.push(r.complesso.toUpperCase());
            if (r.scala)     parts.push("Scala " + r.scala);
            if (r.piano)     parts.push(r.piano + "° piano");
            if (r.lato)      parts.push(r.lato);
            if (r.nome)      parts.push(r.nome);

            titleEl.innerText = parts.join(" • ") || "Chat segnalazione";
        })
        .catch(err => {
            console.warn("openChat: errore lettura segnalazione:", err);
            titleEl.innerText = "Chat segnalazione";
        });

    // attivo listener realtime sulla sotto-collezione "chat"
    subscribeChat(segnalazioneId);
}


/**
 * Attiva il listener realtime sui messaggi della chat.
 */
function subscribeChat(segnalazioneId) {

    // se c'era un listener precedente lo stacco
    if (chatUnsubscribe) {
        chatUnsubscribe();
        chatUnsubscribe = null;
    }

    const msgBox = document.getElementById("chatMessages");
    if (!msgBox) return;

    msgBox.innerHTML = "<p>Caricamento messaggi…</p>";

    chatUnsubscribe = db.collection("segnalazioni")
        .doc(segnalazioneId)
        .collection("chat")
        .orderBy("timestamp", "asc")
        .onSnapshot(
            (snapshot) => {
                let html = "";

                snapshot.forEach(doc => {
                    const m = doc.data();
                    const testo  = escapeHtml(m.text || "");
                    const sender = m.sender || "admin";
                    let when = "-";
                    try {
                        if (m.timestamp && m.timestamp.toDate) {
                            when = m.timestamp.toDate().toLocaleString("it-IT");
                        }
                    } catch (e) {}

                    html += `
                        <div class="chat-message">
                            <div class="chat-meta">
                                <span class="chat-sender">${escapeHtml(sender)}</span>
                                <span class="chat-time">${when}</span>
                            </div>
                            <div class="chat-text">${testo}</div>
                        </div>
                    `;
                });

                if (!html) {
                    html = "<p>Nessun messaggio ancora. Scrivi il primo.</p>";
                }

                msgBox.innerHTML = html;

                // scroll in fondo
                msgBox.scrollTop = msgBox.scrollHeight;
            },
            (error) => {
                console.error("subscribeChat: errore Firestore chat:", error);
                msgBox.innerHTML = "<p>Errore nel caricamento della chat.</p>";
            }
        );
}


/**
 * Invia un messaggio nella chat della segnalazione corrente.
 */
function sendChatMessage() {
    const inputEl = document.getElementById("chatInput");
    if (!inputEl) return;

    const text = (inputEl.value || "").trim();
    if (!text) return;

    if (!currentChatSegnalazioneId) {
        alert("Nessuna segnalazione selezionata.");
        return;
    }

    const segnalazioneId = currentChatSegnalazioneId;

    // puoi cambiare "guala-admin" con qualcosa di più specifico se vuoi
    const senderLabel = "guala-admin";

    db.collection("segnalazioni")
        .doc(segnalazioneId)
        .collection("chat")
        .add({
            text: text,
            sender: senderLabel,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            inputEl.value = "";
        })
        .catch(err => {
            console.error("sendChatMessage: errore invio:", err);
            alert("Errore nell'invio del messaggio.");
        });
}


/**
 * Chiude il popup chat e ferma il listener sui messaggi.
 */
function closeChat() {
    const popup   = document.getElementById("chatPopup");
    const msgBox  = document.getElementById("chatMessages");
    const inputEl = document.getElementById("chatInput");

    if (popup)  popup.style.display = "none";
    if (msgBox) msgBox.innerHTML = "";
    if (inputEl) inputEl.value = "";

    currentChatSegnalazioneId = null;

    if (chatUnsubscribe) {
        chatUnsubscribe();
        chatUnsubscribe = null;
    }
}


/* ------------------------------------------------------------------
   HELPER PER EVITARE PROBLEMI DI HTML NEL TESTO CHAT
------------------------------------------------------------------ */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
