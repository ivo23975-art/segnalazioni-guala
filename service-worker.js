const CACHE_NAME = "guala-cache-v3";

const FILES_TO_CACHE = [
  "/segnalazioni-guala/",
  "/segnalazioni-guala/index.html",
  "/segnalazioni-guala/manifest.json",
  "/segnalazioni-guala/icons/icon-192.png",
  "/segnalazioni-guala/icons/icon-512.png"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// ACTIVATE (cancella cache vecchie)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(
      response => response || fetch(event.request)
    )
  );
});
