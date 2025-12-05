/* =====================================
   EXPORT ENGINE
   Funziona con Firebase già inizializzato
   (firebase-config.js NON SI TOCCA)
===================================== */

/* ===== STAMPA ===== */
async function stampaSegnalazioni() {

    const complesso = document.getElementById("exportComplesso").value;
    const tipo = document.getElementById("exportTipo").value;

    let q = db.collection("segnalazioni");

    // filtro complesso
    if (complesso === "guala") q = q.where("complesso", "==", "guala");
    if (complesso === "piobesi") q = q.where("complesso", "==", "piobesi");
    if (complesso === "particomuni") q = q.where("tipo", "==", "Parti comuni");

    // filtro stato
    if (tipo === "attive") q = q.where("stato", "==", "attiva");
    if (tipo === "risolte") q = q.where("stato", "==", "risolta");

    const snap = await q.get();

    // apro pagina export.html nella root
    const win = window.open("../export.html", "_blank");

    win.onload = () => {

        // colori tema
        const colori = {
            guala: "#007bff",
            piobesi: "#00b454",
            particomuni: "#ffcc00",
            tutti: "#822bff"
        };

        win.document.documentElement.style.setProperty(
            "--main-color",
            colori[complesso]
        );

        // intestazioni
        win.document.getElementById("title").innerText = "Report Segnalazioni";
        win.document.getElementById("subtitle").innerText =
            "Complesso: " + complesso.toUpperCase();
        win.document.getElementById("date").innerText =
            "Generato il: " + new Date().toLocaleString();

        const tbody = win.document.querySelector("#reportTable tbody");

        snap.forEach(doc => {
            const r = doc.data();

            const tr = win.document.createElement("tr");
            tr.innerHTML = `
                <td>${r.timestamp ? r.timestamp.toDate().toLocaleString() : ""}</td>
                <td>${r.scala}</td>
                <td>${r.piano}</td>
                <td>${r.lato}</td>
                <td>${r.nome}</td>
                <td>${r.temperatura}</td>
                <td>${r.tipo}</td>
                <td>${r.descrizione}</td>
                <td>${r.stato}</td>
            `;
            tbody.appendChild(tr);
        });

        // stampa
        setTimeout(() => win.print(), 400);
    };
}

/* ===== ESPORTAZIONI FUTURE ===== */
function exportPDF() { alert("PDF: funzione prevista."); }
function exportExcel() { alert("Excel: funzione prevista."); }
function exportCSV() { alert("CSV: funzione prevista."); }
