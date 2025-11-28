function badgeTipo(tipo) {
    if (!tipo) return `<span class="badge badge-green">N/D</span>`;

    if (["118", "112", "115"].includes(tipo)) 
        return `<span class="badge badge-red">Emergenza</span>`;

    if (["ascensore","elettricista","idraulico","centrale","autoclave"].includes(tipo)) 
        return `<span class="badge badge-orange">Alta</span>`;

    if (["serramenti","antincendio"].includes(tipo)) 
        return `<span class="badge badge-yellow">Media</span>`;

    if (
        tipo.startsWith("Luci") ||
        tipo.startsWith("Cancello") ||
        tipo.startsWith("Cortile") ||
        tipo.startsWith("Aree") ||
        tipo.startsWith("Box") ||
        tipo.startsWith("Serrande") ||
        tipo.startsWith("Vano") ||
        tipo.startsWith("Locale") ||
        tipo.startsWith("Tettoia") ||
        tipo.startsWith("Pensiline")
    )
        return `<span class="badge badge-yellow">Parti comuni</span>`;

    return `<span class="badge badge-green">Basso</span>`;
}

function risolviSegnalazione(id) {
    db.collection("segnalazioni").doc(id).update({
        stato: "risolta"
    });
}

function eliminaSegnalazione(id) {
    db.collection("segnalazioni").doc(id).delete();
}

function loadSegnalazioni(filterFn, superadmin = false) {
    db.collection("segnalazioni").onSnapshot(snapshot => {

        let html = "";

        snapshot.forEach(doc => {
            const r = doc.data();
            r.id = doc.id;

            // PREVIENE ERRORI se mancano campi vecchi
            if (!r.stato) r.stato = "attiva";
            if (!r.complesso) r.complesso = "unknown";

            // FILTRO DASHBOARD SPECIFICHE
            if (!filterFn(r)) return;

            html += `
            <tr>
                <td>${r.timestamp || "-"}</td>
                <td>${r.scala || "-"}</td>
                <td>${r.piano || "-"}</td>
                <td>${r.lato || "-"}</td>
                <td>${r.nome || "-"}</td>
                <td>${r.temperatura || "-"}</td>
                <td>${badgeTipo(r.tipo)}</td>
                <td>${r.descrizione || "-"}</td>
                <td>
                    <div style="display:flex;">
                        <div class="action-btn btn-green" onclick="risolviSegnalazione('${r.id}')">✔</div>
                        ${superadmin ? `<div class="action-btn btn-red" onclick="eliminaSegnalazione('${r.id}')">✖</div>` : ""}
                    </div>
                </td>
            </tr>`;
        });

        document.getElementById("tbody").innerHTML = html;
    });
}
