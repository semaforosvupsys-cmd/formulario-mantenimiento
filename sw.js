const CACHE_VERSION = "mnt-v6"; // 👈 CAMBIA ESTE VALOR SIEMPRE
const CACHE_NAME = `mnt-cache-${CACHE_VERSION}`;

const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/logo.png"
];

/* ===== INSTALAR ===== */
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

/* ===== ACTIVAR (LIMPIA CACHÉ VIEJA) ===== */
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

/* ===== FETCH CONTROLADO ===== */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, copy);
        });
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
