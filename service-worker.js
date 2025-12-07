const CACHE_NAME = "guala-cache-v5";

const FILES_TO_CACHE = [
  "index.html",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// ACTIVATE – pulisce le vecchie versioni di cache
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // 🔹 1. NON intercettare richieste esterne (FireStore, googleapis, ecc.)
  if (url.origin !== self.location.origin) {
    // Lascia andare direttamente in rete
    return;
  }

  // 🔹 2. Per sicurezza, gestiamo solo GET
  if (event.request.method !== "GET") {
    return;
  }

  // 🔹 3. Cache-first per le nostre pagine/statici
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
