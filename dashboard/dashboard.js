/* ========================================================
   DASHBOARD – LETTURA REALTIME DELLE SEGNALAZIONI
   FILE UNICO CONDIVISO DA TUTTI I PANNELLI
======================================================== */

let unsubscribeSegnalazioni = null;

function loadSegnalazioni(filterFn, superadmin = false) {

    console.log("[DASHBOARD] loadSegnalazioni avviata");

    if (!db) {
        console.error("[DASHBOARD] Firestore non inizializzato");
        return;
    }

    // Chiude eventuale listener precedente
    if (unsubscribeSegnalazioni) {
        unsubscribeSegnalazioni();
        unsubscribeSegnalazioni = null;
    }

    unsubscribeSegnalazioni = db
        .collection("segnalazioni")
        .orderBy("timestamp", "desc")
        .onSnapshot(
            (snapshot) => {

                console.log("[DASHBOARD] Documenti ricevuti:", snapshot.size);

                let html = "";
                let count = 0;

                snapshot.forEach(doc => {

                    const r = doc.data();
                    r.id = doc.id;

                    // valori di sicurezza
                    if (!r.stato) r.stato = "attiva";
                    if (!r.tipo) r.tipo = "N/D";
                    if (!r.complesso) r.complesso = "sconosciuto";

                    // filtro pannello (guala / piobesi / particomuni / superadmin)
                    if (typeof filterFn === "function" && !filterFn(r)) return;

                    count++;

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
                            <div style="display:flex; gap:6px; justify-content:center;">

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

                // Nessun risultato
                if (count === 0) {
                    html = `
                        <tr>
                            <td colspan="9" style="text-align:center; padding:20px; opacity:.6;">
                                Nessuna segnalazione presente
                            </td>
                        </tr>`;
                }

                document.getElementById("tbody").innerHTML = html;
            },

            (error) => {
                console.error("[DASHBOARD] Errore Firestore:", error);
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
        risolta_il: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => console.log("[DASHBOARD] Segnalazione risolta:", id))
    .catch(err => alert("Errore: " + err.message));
}


/* ========================================================
   ELIMINA SEGNALAZIONE (solo SuperAdmin)
======================================================== */

function eliminaSegnalazione(id) {
    if (!confirm("Eliminare definitivamente la segnalazione?")) return;

    db.collection("segnalazioni").doc(id).delete()
      .then(() => console.log("[DASHBOARD] Segnalazione eliminata:", id))
      .catch(err => alert("Errore: " + err.message));
}


/* ========================================================
   FORMATTA DATA
======================================================== */

function formatDate(ts) {
    if (!ts || !ts.toDate) return "-";

    try {
        const d = ts.toDate();
        return (
            d.toLocaleDateString("it-IT") + " " +
            d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
        );
    } catch {
        return "-";
    }
}


/* ========================================================
   TIPO + SOTTOTIPO
======================================================== */

function tipoConSottotipo(tipo, sottotipo) {
    if (!sottotipo) return tipo || "-";
    return `${tipo} – <span class="sottotipo">${sottotipo}</span>`;
}
