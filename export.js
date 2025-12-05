/* INIT FIRESTORE */
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* Mappa colori per titolo */
const colori = {
    guala: "#007bff",
    piobesi: "#00b454",
    particomuni: "#ffcc00",
    tutti: "#822bff"
};

const titoli = {
    guala: "Complesso Guala",
    piobesi: "Complesso Piobesi",
    particomuni: "Parti Comuni",
    tutti: "Tutti i Complessi"
};

/* FUNZIONE PRINCIPALE */
async function exportReport(tipo) {

    let query = db.collection("segnalazioni");

    if (tipo === "guala") query = query.where("complesso", "==", "guala");
    if (tipo === "piobesi") query = query.where("complesso", "==", "piobesi");
    if (tipo === "particomuni") query = query.where("tipo", "==", "Parti comuni");

    const snap = await query.get();

    /* Apri pagina di esportazione */
    const win = window.open("../export.html", "_blank");

    win.onload = () => {

        /* Colore del complesso */
        win.document.documentElement.style.setProperty(
            "--color-main",
            colori[tipo]
        );

        /* Titoli */
        win.document.getElementById("export-title").innerText =
            "Segnalazioni – " + titoli[tipo];

        win.document.getElementById("export-subtitle").innerText =
            "Documento generato dal pannello MASTER";

        win.document.getElementById("export-date").innerText =
            "Data generazione: " + new Date().toLocaleString();

        /* Tabella */
        const tbody = win.document.querySelector("#exportTable tbody");
        tbody.innerHTML = "";

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

        /* Stampa automatica */
        setTimeout(() => {
            win.print();
        }, 500);
    };
}
