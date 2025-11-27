function badgeTipo(tipo) {
    if (["118", "112", "115"].includes(tipo)) return `<span class="badge badge-red">Emergenza</span>`;
    if (["ascensore","elettricista","idraulico","centrale","autoclave"].includes(tipo)) return `<span class="badge badge-orange">Alta</span>`;
    if (["serramenti","antincendio"].includes(tipo)) return `<span class="badge badge-yellow">Media</span>`;
    if (tipo.startsWith("parti-")) return `<span class="badge badge-yellow">Parti comuni</span>`;
    return `<span class="badge badge-green">Basso</span>`;
}

function getComplesso(scala) {
    if (scala.includes("131") || scala.includes("133")) return "guala";
    if (scala.includes("6") || scala.includes("8") || scala.includes("10")) return "piobesi";
    return "unknown";
}

function loadSegnalazioni(filterFn) {
    db.collection("segnalazioni").onSnapshot(snapshot => {
        let html = "";
        snapshot.forEach(doc => {
            const r = doc.data();
            r.id = doc.id;

            if (!filterFn(r)) return;

            html += `
                <tr>
                    <td>${r.timestamp}</td>
                    <td>${r.scala}</td>
                    <td>${r.piano}</td>
                    <td>${r.lato}</td>
                    <td>${r.nome}</td>
                    <td>${r.temperatura || "-"}</td>
                    <td>${badgeTipo(r.tipo)}</td>
                    <td>${r.descrizione || "-"}</td>
                </tr>
            `;
        });

        document.getElementById("tbody").innerHTML = html;
    });
}
