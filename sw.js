const CACHE_NAME = "mnt-v9"; // Subimos a v9 para forzar la actualización
const ASSETS = [
  "./",
  "./index.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/logo.png"
];

// Instalación
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => {
      console.log("Cacheando activos para instalación...");
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación y Limpieza
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if (k !== CACHE_NAME) return caches.delete(k);
      })
    ))
  );
  return self.clients.claim();
});

// Peticiones (Estrategia: Network First)
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
