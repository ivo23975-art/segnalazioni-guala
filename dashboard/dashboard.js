/* ========================================================
   DASHBOARD – LETTURA REALTIME DELLE SEGNALAZIONI
======================================================== */

function loadSegnalazioni(filterFn, superadmin = false) {

    db.collection("segnalazioni")
      .orderBy("timestamp", "desc")
      .onSnapshot(
        (snapshot) => {

            let html = "";

            snapshot.forEach(doc => {

                const r = doc.data();
                r.id = doc.id;

                if (!filterFn(r)) return;

                if (!r.stato) r.stato = "attiva";
                if (!r.tipo) r.tipo = "N/D";

                html += `
                <tr>
                    <td data-label="Data">${formatDate(r.timestamp)}</td>
                    <td data-label="Scala">${r.scala || "-"}</td>
                    <td data-label="Piano">${r.piano || "-"}</td>
                    <td data-label="Lato">${r.lato || "-"}</td>
                    <td data-label="Nome">${r.nome || "-"}</td>
                    <td data-label="Temp">${r.temperatura || "-"}</td>

                    <td data-label="Tipo">
                        ${tipoConSottotipo(r.tipo, r.sottotipo)}
                    </td>

                    <td data-label="Descrizione">
                        ${r.descrizione || "-"}
                    </td>

                    <td data-label="Azioni">
                        <div style="display:flex; gap:6px;">

                            <!-- CHAT -->
                            <div class="action-btn btn-blue"
                                 onclick="openChat('${r.id}')">💬</div>

                            <!-- RISOLVI -->
                            <div class="action-btn btn-green"
                                 onclick="risolviSegnalazione('${r.id}')">✔</div>

                            <!-- ELIMINA solo se superadmin -->
                            ${ superadmin
                                ? `<div class="action-btn btn-red"
                                       onclick="eliminaSegnalazione('${r.id}')">✖</div>`
                                : ""
                            }
                        </div>
                    </td>
                </tr>`;
            });

            document.getElementById("tbody").innerHTML = html;
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
    });
}


/* ========================================================
   ELIMINA SEGNALAZIONE (solo SuperAdmin)
======================================================== */
function eliminaSegnalazione(id) {
    if (!confirm("Eliminare definitivamente la segnalazione?")) return;

    db.collection("segnalazioni").doc(id).delete();
}


/* ========================================================
   FORMATTATORE DATA
======================================================== */
function formatDate(ts) {
    if (!ts) return "-";
    try { return ts.toDate().toLocaleString("it-IT"); }
    catch { return "-"; }
}


/* ========================================================
   TIPO + SOTTOTIPO
======================================================== */
function tipoConSottotipo(tipo, sottotipo) {
    if (!sottotipo) return tipo;
    return `${tipo} – <span class="sottotipo">${sottotipo}</span>`;
}


/* ========================================================
   CHAT – LOGICA COMPLETA
======================================================== */

let currentChatSegnalazione = null;

/* APRI POPUP */
function openChat(idSegnalazione) {

    currentChatSegnalazione = idSegnalazione;

    document.getElementById("chatTitle").innerText =
        "Chat – Segnalazione " + idSegnalazione;

    document.getElementById("chatPopup").style.display = "flex";

    loadChatMessages(idSegnalazione);
}

/* CHIUDI POPUP */
function closeChat() {
    document.getElementById("chatPopup").style.display = "none";
}


/* INVIA MESSAGGIO */
function sendChatMessage() {
    const text = document.getElementById("chatInput").value.trim();
    if (!text) return;

    db.collection("segnalazioni")
      .doc(currentChatSegnalazione)
      .collection("chat")
      .add({
          testo: text,
          da_admin: true,
          timestamp: new Date()
      });

    document.getElementById("chatInput").value = "";
}


/* CARICA MESSAGGI REALTIME */
function loadChatMessages(id) {

    db.collection("segnalazioni")
      .doc(id)
      .collection("chat")
      .orderBy("timestamp")
      .onSnapshot(snap => {

        let html = "";

        snap.forEach(doc => {
            const m = doc.data();
            const stile = m.da_admin
                ? "color:#00ccff;"
                : "color:#aaffaa;";

            html += `
                <div style="${stile} margin-bottom:6px;">
                    <b>${m.da_admin ? "Admin" : "Condomino"}:</b>
                    ${m.testo}
                </div>`;
        });

        document.getElementById("chatMessages").innerHTML = html;
    });
}
