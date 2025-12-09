/* ========================================================
   DASHBOARD – LETTURA REALTIME DELLE SEGNALAZIONI
======================================================== */

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

                if (!r.stato) r.stato = "attiva";
                if (!r.tipo) r.tipo = "N/D";
                if (!r.complesso) r.complesso = "sconosciuto";

                const passa = filterFn(r);
                if (!passa) return;

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
                        <div style="display:flex; gap:6px; align-items:center; justify-content:center;">

                            <!-- RISOLVI -->
                            <div class="action-btn btn-green"
                                 onclick="risolviSegnalazione('${r.id}')">✔</div>

                            <!-- CHAT ICON -->
                            <div class="chat-icon"
                                 title="Apri chat"
                                 onclick="openChat('${r.id}', '${safeNome}')">💬</div>

                            <!-- ELIMINA (solo superadmin) -->
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
   FORMATTA DATA
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
   TIPO + SOTTOTIPO
======================================================== */

function tipoConSottotipo(tipo, sottotipo) {
    if (!sottotipo) return tipo;
    return `${tipo} – <span class="sottotipo">${sottotipo}</span>`;
}


/* ========================================================
   CHAT – REALTIME + WHATSAPP UI
======================================================== */

let currentChatSegnalazioneId = null;
let unsubscribeChatListener = null;


/* ===========================
   APRI CHAT
=========================== */
function openChat(id, nome) {

    const popup    = document.getElementById("chatPopup");
    const titleEl  = document.getElementById("chatTitle");
    const msgBox   = document.getElementById("chatMessages");
    const inputEl  = document.getElementById("chatInput");

    if (!popup || !titleEl || !msgBox || !inputEl) {
        alert("La chat è disponibile solo per il pannello Guala.");
        return;
    }

    currentChatSegnalazioneId = id;

    titleEl.innerText = `Chat con ${nome}`;
    msgBox.innerHTML = `<p class="chat-system">Chat collegata alla segnalazione: ${id}</p>`;

    popup.style.display = "flex";

    /* --- ATTIVO LISTENER REALTIME --- */
    if (unsubscribeChatListener) unsubscribeChatListener();

    unsubscribeChatListener = db.collection("segnalazioni")
        .doc(id)
        .collection("chat")
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) => {
            msgBox.innerHTML = "";

            snapshot.forEach((doc) => {
                const msg = doc.data();
                renderChatMessage(msg, msgBox);
            });

            msgBox.scrollTop = msgBox.scrollHeight;
        });
}


/* ===========================
   CHIUDI CHAT
=========================== */
function closeChat() {
    const popup = document.getElementById("chatPopup");
    if (popup) popup.style.display = "none";

    if (unsubscribeChatListener) unsubscribeChatListener();
    unsubscribeChatListener = null;

    currentChatSegnalazioneId = null;
}


/* ===========================
   INVIO MESSAGGIO ADMIN
=========================== */
function sendChatMessage() {

    const inputEl = document.getElementById("chatInput");
    if (!inputEl) return;

    const text = inputEl.value.trim();
    if (!text) return;

    if (!currentChatSegnalazioneId) {
        console.error("Nessuna segnalazione attiva.");
        return;
    }

    db.collection("segnalazioni")
      .doc(currentChatSegnalazioneId)
      .collection("chat")
      .add({
          testo: text,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          mittente: "admin"
      })
      .then(() => {
          inputEl.value = "";
      })
      .catch(err => {
          console.error("Errore invio messaggio:", err);
          alert("Errore durante l'invio del messaggio.");
      });
}


/* ===========================
   RENDER MESSAGGIO WHATSAPP
=========================== */
function renderChatMessage(msg, msgBox) {

    const isAdmin = msg.mittente === "admin";

    const bubble = document.createElement("div");
    bubble.className = isAdmin ? "chat-bubble chat-admin" : "chat-bubble chat-user";

    const textDiv = document.createElement("div");
    textDiv.className = "bubble-text";
    textDiv.innerText = msg.testo;

    const timeDiv = document.createElement("div");
    timeDiv.className = "bubble-time";

    if (msg.timestamp && msg.timestamp.toDate) {
        timeDiv.innerText = msg.timestamp.toDate().toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
        });
    } else {
        timeDiv.innerText = "";
    }

    bubble.appendChild(textDiv);
    bubble.appendChild(timeDiv);

    msgBox.appendChild(bubble);
}
