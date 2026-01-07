const CACHE_NAME = "vup-v14";
const ASSETS = [
  "https://raw.githubusercontent.com/semaforosvupsys-cmd/formulario-mantenimiento/main/manifest.json",
  "https://raw.githubusercontent.com/semaforosvupsys-cmd/formulario-mantenimiento/main/icons/icon-192.png",
  "https://raw.githubusercontent.com/semaforosvupsys-cmd/formulario-mantenimiento/main/icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => k !== CACHE_NAME && caches.delete(k))
    ))
  );
  return self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
