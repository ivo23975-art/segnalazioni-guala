/* ================
   FIRESTORE INIT
================ */
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* EXPORT ================================================= */

async function exportReport(tipo) {

    // TITOLO
    const titolo = {
        guala: "Complesso Guala",
        piobesi: "Complesso Piobesi",
        comune: "Parti Comuni",
        completo: "Tutti i Complessi"
    };

    // COLORE
    const colore = {
        guala: "#007bff",   // blu
        piobesi: "#00b454", // verde
        comune: "#ffcc00",  // giallo
        completo: "#822bff" // viola
    };

    // Query Firestore
    let query = db.collection("segnalazioni");

    if (tipo === "guala") query = query.where("complesso", "==", "guala");
    if (tipo === "piobesi") query = query.where("complesso", "==", "piobesi");
    if (tipo === "comune") query = query.where("tipo", "==", "Parti comuni");

    const snap = await query.get();

    // Apri nuova finestra invisibile
    const win = window.open("export.html", "_blank");

    win.onload = () => {

        // Imposta colore tema
        win.document.documentElement.style.setProperty("--color-main", colore[tipo]);

        // Titoli
        win.document.getElementById("export-title").innerText =
            "Report Segnalazioni – " + titolo[tipo];

        win.document.getElementById("export-subtitle").innerText =
            "Generato dal pannello MASTER";

        win.document.getElementById("export-date").innerText =
            "Data generazione: " + new Date().toLocaleString();

        // Tabella
        const tbody = win.document.querySelector("#exportTable tbody");
        tbody.innerHTML = "";

        snap.docs.forEach(doc => {
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

        // Stampa automatica
        setTimeout(() => {
            win.print();
        }, 600);
    };
}
