/* =====================================
   EXPORT ENGINE COMPLETO
   Stampa + PDF + XLSX + CSV
===================================== */

/* ===== LIBRERIE PER PDF & EXCEL ===== */
const jsPDFUrl = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const autoTableUrl = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js";
const sheetJSUrl = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";

/* Carica script da URL */
function loadScript(url) {
    return new Promise(resolve => {
        const s = document.createElement("script");
        s.src = url;
        s.onload = resolve;
        document.body.appendChild(s);
    });
}

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

    // PREPARO PACCHETTO DATI
    const exportData = {
        complesso,
        colore: colori[complesso],
        rows
    };

    localStorage.setItem("exportData", JSON.stringify(exportData));

    // APRE export.html
    window.open("../export.html", "_blank");
}

/* =====================================================
   EXPORT PDF — jsPDF + autoTable
===================================================== */
async function exportPDF() {

    await loadScript(jsPDFUrl);
    await loadScript(autoTableUrl);

    const json = localStorage.getItem("exportData");
    if (!json) return alert("Genera prima una stampa.");

    const data = JSON.parse(json);
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({ unit: "pt", format: "a4" });

    doc.setFontSize(18);
    doc.text("Report Segnalazioni", 40, 40);

    doc.setFontSize(12);
    doc.text(`Complesso: ${data.complesso.toUpperCase()}`, 40, 60);
    doc.text(`Generato il: ${new Date().toLocaleString()}`, 40, 80);

    const tableData = data.rows.map(r => [
        r.timestamp, r.scala, r.piano, r.lato, r.nome,
        r.temperatura, r.tipo, r.descrizione, r.stato
    ]);

    doc.autoTable({
        head: [[
            "Data", "Scala", "Piano", "Lato", "Nome",
            "Temp", "Tipo", "Descrizione", "Stato"
        ]],
        body: tableData,
        startY: 110,
        styles: { fontSize: 9 },
        headStyles: { fillColor: data.colore || "#000" }
    });

    doc.save("segnalazioni.pdf");
}

/* =====================================================
   EXPORT EXCEL — SheetJS (XLSX)
===================================================== */
async function exportExcel() {

    await loadScript(sheetJSUrl);

    const json = localStorage.getItem("exportData");
    if (!json) return alert("Genera prima una stampa.");

    const data = JSON.parse(json);

    const sheetData = [
        ["Data", "Scala", "Piano", "Lato", "Nome", "Temp", "Tipo", "Descrizione", "Stato"],
        ...data.rows.map(r => [
            r.timestamp, r.scala, r.piano, r.lato, r.nome,
            r.temperatura, r.tipo, r.descrizione, r.stato
        ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Segnalazioni");

    XLSX.writeFile(wb, "segnalazioni.xlsx");
}

/* =====================================================
   EXPORT CSV
===================================================== */
function exportCSV() {
    const json = localStorage.getItem("exportData");
    if (!json) return alert("Genera prima una stampa.");

    const data = JSON.parse(json);

    let csv = "Data;Scala;Piano;Lato;Nome;Temp;Tipo;Descrizione;Stato\n";

    data.rows.forEach(r => {
        csv += `${r.timestamp};${r.scala};${r.piano};${r.lato};${r.nome};${r.temperatura};${r.tipo};${r.descrizione};${r.stato}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "segnalazioni.csv";
    a.click();
}
