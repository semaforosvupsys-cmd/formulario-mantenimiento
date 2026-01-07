const CACHE_NAME = "mnt-v8"; // Incrementamos versión para limpiar basura anterior
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/logo.png" // Asegúrate de que esta carpeta y archivo existan en GitHub
];

// Instalación: Guarda los archivos esenciales
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => {
      console.log("Cacheando archivos estáticos...");
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: Borra cachés viejos (limpia mnt-v7, v6, etc.)
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if (k !== CACHE_NAME) {
          console.log("Eliminando caché antiguo:", k);
          return caches.delete(k);
        }
      })
    ))
  );
  return self.clients.claim();
});

// Gestión de peticiones
self.addEventListener("fetch", e => {
  // 1. NO cachear peticiones de envío de datos (POST)
  if (e.request.method !== "GET") return;

  // 2. Estrategia: Network First (Internet primero, si falla, usa Caché)
  // Esto es mejor para formularios porque siempre queremos la versión más nueva
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Guardamos una copia actualizada de los archivos GET
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => {
        // Si no hay internet, buscamos en el caché
        return caches.match(e.request);
      })
  );
});
