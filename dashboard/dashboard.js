/* ========================================================
   DASHBOARD – LETTURA REALTIME DELLE SEGNALAZIONI
======================================================== */

/**
 * Carica le segnalazioni in tempo reale e costruisce le righe della tabella.
 *
 * @param {Function} filterFn  funzione booleana che decide se una riga va mostrata
 * @param {boolean} superadmin se true mostra anche il tasto rosso di eliminazione
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

                // Normalizzazioni di sicurezza
                if (!r.stato)      r.stato      = "attiva";
                if (!r.tipo)       r.tipo       = "N/D";
                if (!r.complesso)  r.complesso  = "sconosciuto";

                // filtro personalizzato (Guala, Piobesi, Parti Comuni, SuperAdmin, …)
                const passa = filterFn(r);
                if (!passa) return;

                // Nome “sanitizzato” per l’attributo onclick (apostrofi ecc.)
                const safeNome = (r.nome || "-").replace(/'/g, "\\'");

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
                        <div style="
                            display:flex;
                            gap:6px;
                            align-items:center;
                            justify-content:center;
                        ">
                            <!-- pulsante verde: RISOLVI -->
                            <div class="action-btn btn-green"
                                 onclick="risolviSegnalazione('${r.id}')">
                                ✔
                            </div>

                            <!-- icona CHAT -->
                            <div class="chat-icon"
                                 title="Apri chat con il condomino"
                                 onclick="openChat('${r.id}', '${safeNome}')">
                                💬
                            </div>

                            ${
                                superadmin
                                    ? `<div class="action-btn btn-red"
                                           onclick="eliminaSegnalazione('${r.id}')">
                                           ✖
                                       </div>`
                                    : ""
                            }
                        </div>
                    </td>
                </tr>`;
            });

            const tbody = document.getElementById("tbody");
            if (tbody) tbody.innerHTML = html;
        },

        (error) => {
            console.error("[DEBUG] ERRORE Firestore:", error);
            alert("Errore Firestore: " + error.message);
        }
      );
}


/* ========================================================
   RISOLVI SEGNALAZIONE
======================================================== */

function risolviSegnalazione(id) {
    if (!confirm("Segnalazione risolta?")) return;

    db.collection("segnalazioni").doc(id).update({
        stato: "risolta",
        risolta_il: new Date()
    })
    .then(() => console.log("Segnalazione risolta:", id))
    .catch(err => alert("Errore: " + err.message));
}


/* ========================================================
   ELIMINA SEGNALAZIONE (solo SuperAdmin)
======================================================== */

function eliminaSegnalazione(id) {
    if (!confirm("Eliminare definitivamente la segnalazione?")) return;

    db.collection("segnalazioni").doc(id).delete()
      .then(() => console.log("Segnalazione eliminata:", id))
      .catch(err => alert("Errore: " + err.message));
}


/* ========================================================
   FORMATTATORE DATA
======================================================== */

function formatDate(ts) {
    if (!ts) return "-";

    try {
        const d = ts.toDate(); // Firestore Timestamp
        return d.toLocaleDateString("it-IT") + " " + d.toLocaleTimeString("it-IT");
    } catch {
        return "-";
    }
}


/* ========================================================
   GESTIONE TIPO + SOTTOTIPO
======================================================== */

function tipoConSottotipo(tipo, sottotipo) {

    if (!sottotipo) return tipo;

    return `${tipo} – <span class="sottotipo">${sottotipo}</span>`;
}

/* ========================================================
   CHAT POPUP – SOLO INTERFACCIA (STEP 1)
   (nessun salvataggio su Firestore per ora)
======================================================== */

let currentChatSegnalazioneId = null;

/**
 * Apertura popup chat.
 * @param {string} id   id della segnalazione
 * @param {string} nome nome del condomino (già sanitizzato)
 */
function openChat(id, nome) {
    console.log("[CHAT] openChat", id, nome);
    currentChatSegnalazioneId = id;

    const popup    = document.getElementById("chatPopup");
    const titleEl  = document.getElementById("chatTitle");
    const msgBox   = document.getElementById("chatMessages");
    const inputEl  = document.getElementById("chatInput");

    if (!popup || !titleEl || !msgBox || !inputEl) {
        alert("Struttura del popup chat mancante in HTML.");
        return;
    }

    titleEl.innerText = `Chat segnalazione – ${nome}`;
    msgBox.innerHTML  =
        `<p><em>(Chat di prova – id: ${id}. In questo step non salviamo ancora su Firestore.)</em></p>`;
    inputEl.value = "";

    popup.style.display = "flex";
}

/** Chiude il popup chat */
function closeChat() {
    const popup = document.getElementById("chatPopup");
    if (popup) popup.style.display = "none";
    currentChatSegnalazioneId = null;
}

/** Invia messaggio (per ora solo aggiunto a schermo, niente DB) */
function sendChatMessage() {
    const inputEl = document.getElementById("chatInput");
    const msgBox  = document.getElementById("chatMessages");

    if (!inputEl || !msgBox) return;

    const text = (inputEl.value || "").trim();
    if (!text) return;

    const now = new Date().toLocaleString("it-IT");

    msgBox.innerHTML += `<p><strong>[${now}] ADMIN:</strong> ${text}</p>`;
    inputEl.value = "";

    // scroll in fondo
    msgBox.scrollTop = msgBox.scrollHeight;
}
