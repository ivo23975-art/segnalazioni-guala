/* ========================================================
   DASHBOARD – LETTURA REALTIME DELLE SEGNALAZIONI
======================================================== */

function loadSegnalazioni(filterFn, superadmin = false) {

    console.log("[DEBUG] loadSegnalazioni avviata…");

    // CHAT DISPONIBILE SOLO SE ESISTONO TUTTI GLI ELEMENTI HTML
    const chatAvailable =
        document.getElementById("chatPopup") &&
        document.getElementById("chatTitle") &&
        document.getElementById("chatMessages") &&
        document.getElementById("chatInput");

    db.collection("segnalazioni")
      .orderBy("timestamp", "desc")
      .onSnapshot(
        (snapshot) => {

            console.log("[DEBUG] Documenti ricevuti:", snapshot.size);

            let html = "";

            snapshot.forEach(doc => {

                const r = doc.data();
                r.id = doc.id;

                if (!r.stato) r.stato = "attiva";
                if (!r.tipo) r.tipo = "N/D";
                if (!r.complesso) r.complesso = "sconosciuto";

                // filtro personalizzato (Guala, Piobesi, Parti Comuni, SuperAdmin)
                const passa = filterFn(r);
                if (!passa) return;

                // Sicurezza per nome nel click
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

                    <!-- NUOVA COLONNA CHAT (solo se disponibile) -->
                    <td data-label="Chat">
                        ${
                            chatAvailable
                            ? `<div class="chat-icon"
                                   title="Apri chat"
                                   onclick="openChat('${r.id}', '${safeNome}')">
                                   💬
                               </div>`
                            : "-"
                        }
                    </td>

                    <!-- COLONNA AZIONI ORIGINALE -->
                    <td data-label="Azioni">
                        <div style="display:flex;">
                            <div class="action-btn btn-green"
                                 onclick="risolviSegnalazione('${r.id}')">✔</div>

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

            document.getElementById("tbody").innerHTML = html;
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
        const d = ts.toDate();
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
   CHAT POPUP – SOLO UI (STEP 1)
======================================================== */

let currentChatSegnalazioneId = null;

function openChat(id, nome) {

    console.log("[CHAT] openChat", id, nome);

    const popup    = document.getElementById("chatPopup");
    const titleEl  = document.getElementById("chatTitle");
    const msgBox   = document.getElementById("chatMessages");
    const inputEl  = document.getElementById("chatInput");

    // SE NON ESISTONO → CHAT NON SUPPORTATA IN QUESTA DASHBOARD
    if (!popup || !titleEl || !msgBox || !inputEl) {
        console.warn("[CHAT] Popup non presente → chat disabilitata.");
        return;
    }

    currentChatSegnalazioneId = id;

    titleEl.innerText = `Chat segnalazione – ${nome}`;
    msgBox.innerHTML  =
        `<p><em>(Chat di prova – id: ${id}. Non salviamo ancora su Firestore.)</em></p>`;
    inputEl.value = "";

    popup.style.display = "flex";
}

function closeChat() {
    const popup = document.getElementById("chatPopup");
    if (popup) popup.style.display = "none";
    currentChatSegnalazioneId = null;
}

function sendChatMessage() {
    const inputEl = document.getElementById("chatInput");
    const msgBox  = document.getElementById("chatMessages");

    if (!inputEl || !msgBox) {
        console.warn("[CHAT] Struttura chat non trovata.");
        return;
    }

    const text = (inputEl.value || "").trim();
    if (!text) return;

    const now = new Date().toLocaleString("it-IT");

    msgBox.innerHTML += `<p><strong>[${now}] ADMIN:</strong> ${text}</p>`;
    inputEl.value = "";

    msgBox.scrollTop = msgBox.scrollHeight;
}
