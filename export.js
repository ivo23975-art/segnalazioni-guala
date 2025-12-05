/* INIZIALIZZAZIONE FIREBASE */
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* =====================================
   FUNZIONE PRINCIPALE DI ESPORTAZIONE
===================================== */
async function stampaSegnalazioni() {

    const complesso = document.getElementById("exportComplesso").value;
    const tipo = document.getElementById("exportTipo").value;

    let q = db.collection("segnalazioni");

    // FILTRO COMPLESSO
    if (complesso === "guala") q = q.where("complesso", "==", "guala");
    if (complesso === "piobesi") q = q.where("complesso", "==", "piobesi");
    if (complesso === "particomuni") q = q.where("tipo", "==", "Parti comuni");

    // FILTRO STATO
    if (tipo === "attive") q = q.where("stato", "==", "attiva");
    if (tipo === "risolte") q = q.where("stato", "==", "risolta");

    const snap = await q.get();

    // APERTURA DEL TEMPLATE DI ESPORTAZIONE
    const win = window.open("./export.html", "_blank");

    win.onload = () => {

        // COLORI TEMA
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

        // INTESTAZIONI
        win.document.getElementById("title").innerText = "Report Segnalazioni";
        win.document.getElementById("subtitle").innerText =
            "Complesso: " + complesso.toUpperCase();
        win.document.getElementById("date").innerText =
            "Generato il: " + new Date().toLocaleString();

        const tbody = win.document.querySelector("#reportTable tbody");

        // POPOLAMENTO RIGHE
        snap.forEach(doc => {
            const r = doc.data();

            const tr = win.document.createElement("tr");
            tr.innerHTML = `
                <td>${r.timestamp?.toDate().toLocaleString() || ""}</td>
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

        // AVVIO STAMPA
        setTimeout(() => win.print(), 400);
    };
}

/* =====================================
   SEGNAPOSTO PER ESPORTAZIONI FUTURE
===================================== */
function exportPDF() { alert("PDF: funzione prevista."); }
function exportExcel() { alert("Excel: funzione prevista."); }
function exportCSV() { alert("CSV: funzione prevista."); }
