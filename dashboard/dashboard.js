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
                        <div style="display:flex;">
                            <div class="action-btn btn-green"
                                 onclick="risolviSegnalazione('${r.id}')">✔</div>

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
