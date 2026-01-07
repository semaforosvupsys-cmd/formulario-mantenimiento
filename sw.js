const CACHE_NAME = "vup-v11"; // Incrementamos versión para limpiar errores previos
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json", // Importante: Volvemos a incluir el archivo físico
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Instalación: Guarda los archivos en el celular para que abra rápido
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => {
      console.log("Instalando activos en caché...");
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: Borra versiones viejas de la app
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

// Peticiones: Si hay internet, busca lo nuevo. Si no, usa lo guardado.
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
