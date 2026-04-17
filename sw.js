const CACHE_NAME = "lhxliv-v1";
const urlsToCache = [
  "/LH-XLIV/",
  "/LH-XLIV/index.html"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  // Network first, then cache (para que los datos de Google Sheets se actualicen)
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // Si es una respuesta válida, guardarla en cache
        if (response && response.status === 200) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            // Solo cachear recursos locales, no Google Sheets
            if (event.request.url.indexOf('docs.google.com') === -1) {
              cache.put(event.request, responseClone);
            }
          });
        }
        return response;
      })
      .catch(function () {
        // Si falla la red, usar cache
        return caches.match(event.request);
      })
  );
});
