const CACHE_NAME = "semaforos-v2"; // 👈 CAMBIAR VERSIÓN SIEMPRE

self.addEventListener("install", event => {
  self.skipWaiting(); // 👈 fuerza instalación
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // 👈 toma control inmediato
});

// 🔥 SOLO cachea GET (NUNCA POST)
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return; // 👈 deja pasar POST sin tocarlo
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

