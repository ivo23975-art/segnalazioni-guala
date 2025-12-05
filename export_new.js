/* =====================================
   EXPORT ENGINE RISCRITTO
   Compatibile con GitHub Pages
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

    // colori tema
    const colori = {
        guala: "#007bff",
        piobesi: "#00b454",
        particomuni: "#ffcc00",
        tutti: "#822bff"
    };

    const rows = [];

    snap.forEach(doc => {
        const r = doc.data();
        rows.push({
            timestamp: r.timestamp ? r.timestamp.toDate().toLocaleString() : "",
            scala: r.scala || "",
            piano: r.piano || "",
            lato: r.lato || "",
            nome: r.nome || "",
            temperatura: r.temperatura || "",
            tipo: r.tipo || "",
            descrizione: r.descrizione || "",
            stato: r.stato || ""
        });
    });

    // PREPARO PACCHETTO DATI PER EXPORT.HTML
    const exportData = {
        complesso,
        colore: colori[complesso],
        rows
    };

    localStorage.setItem("exportData", JSON.stringify(exportData));

    // apro pagina export
    window.open("../export.html", "_blank");
}

/* ===== ESPORTAZIONI FUTURE ===== */
function exportPDF() { alert("PDF: funzione prevista."); }
function exportExcel() { alert("Excel: funzione prevista."); }
function exportCSV() { alert("CSV: funzione prevista."); }
