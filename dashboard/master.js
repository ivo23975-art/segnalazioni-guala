/* Segnalazioni Guala: manutenzione, nessun accesso al database. */
(() => { "use strict";
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/segnalazioni-guala/"))
    window.location.replace("/segnalazioni-guala/index.html?manutenzione=20261015-02");
})();
