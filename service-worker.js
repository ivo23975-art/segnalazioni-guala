const CACHE_NAME = "guala-cache-v1";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
  // Nessuna icona qui finché non esistono davvero
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// FETCH
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
