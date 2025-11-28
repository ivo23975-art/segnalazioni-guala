/* ------------------------------
   FORMATTAZIONE DATA
--------------------------------*/
function formatDate(ts) {
    if (!ts) return "-";
    try {
        const date = ts.toDate(); // Firestore Timestamp → Date()
        return date.toLocaleString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch (e) {
        return "-";
    }
}

/* ------------------------------
   BADGE COLORE PER PRIORITÀ
--------------------------------*/
function badgeTipo(tipo) {

    if (!tipo)
        return `<span class="badge badge-green">N/D</span>`;

    // PARTI COMUNI
    if (tipo === "Parti comuni")
        return `<span class="badge badge-yellow">Parti comuni</span>`;

    // EMERGENZA
    if (["118","112","115"].includes(tipo))
        return `<span class="badge badge-red">Emergenza</span>`;

    // ALTA URGENZA
    if (["ascensore","elettricista","idraulico","centrale","autoclave"].includes(tipo))
        return `<span class="badge badge-orange">Alta</span>`;

    // MEDIA URGENZA
    if (["serramenti","antincendio"].includes(tipo))
        return `<span class="badge badge-yellow">Media</span>`;

    // Altre (basso)
    return `<span class="badge badge-green">${tipo}</span>`;
}

/* ------------------------------
   RIGA TIPO + SOTTOTIPO (MODE 2)
--------------------------------*/
function tipoConSottotipo(tipo, sottotipo) {

    let html = `${badgeTipo(tipo)}`;

    // aggiungiamo il sottotipo come seconda riga
    if (sottotipo && sottotipo.trim() !== "") {
        html += `
            <div style="
                margin-top:4px;
                padding:3px 6px;
                background:#333;
                color:#fff;
                font-size:0.85rem;
                border-radius:4px;
                display:inline-block;">
                ${sottotipo}
            </div>
        `;
    }

    return html;
}

/* ------------------------------
   AZIONE: RISOLVERE SEGNALAZIONE
--------------------------------*/
function risolviSegnalazione(id) {
    db.collection("segnalazioni").doc(id).update({
        stato: "risolta"
    });
}

/* ------------------------------
   AZIONE: ELIMINARE SEGNALAZIONE
   (solo SuperAdmin)
--------------------------------*/
function eliminaSegnalazione(id) {
    if (!confirm("Vuoi eliminare definitivamente questa segnalazione?")) return;
    db.collection("segnalazioni").doc(id).delete();
}

/* ------------------------------
   CARICAMENTO DINAMICO
--------------------------------*/
function loadSegnalazioni(filterFn, superadmin = false) {

    db.collection("segnalazioni")
      .orderBy("timestamp", "desc")
      .onSnapshot(snapshot => {

        let html = "";

        snapshot.forEach(doc => {

            const r = doc.data();
            r.id = doc.id;

            if (!r.stato) r.stato = "attiva";
            if (!r.tipo) r.tipo = "N/D";
            if (!r.complesso) r.complesso = "sconosciuto";

            // filtro personalizzato (Guala, Piobesi, Parti Comuni, SuperAdmin)
            if (!filterFn(r)) return;

            html += `
            <tr>
                <td data-label="Data">${formatDate(r.timestamp)}</td>
                <td data-label="Scala">${r.scala || "-"}</td>
                <td data-label="Piano">${r.piano || "-"}</td>
                <td data-label="Lato">${r.lato || "-"}</td>
                <td data-label="Nome">${r.nome || "-"}</td>
                <td data-label="Temp">${r.temperatura || "-"}</td>

                <td data-label="Tipo">
                    ${ tipoConSottotipo(r.tipo, r.sottotipo) }
                </td>

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
    });
}
