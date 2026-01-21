const CACHE_NAME = "vup-v17"; // Subimos la versión para que el celular detecte el cambio
const ASSETS = [
  "./", // Esto guarda la página principal (index.html)
  "./index.html",
  "https://raw.githubusercontent.com/semaforosvupsys-cmd/formulario-mantenimiento/main/manifest.json?v=3",
  "https://raw.githubusercontent.com/semaforosvupsys-cmd/formulario-mantenimiento/main/icons/icon-192.png",
  "https://raw.githubusercontent.com/semaforosvupsys-cmd/formulario-mantenimiento/main/icons/icon-512.png",
  "https://raw.githubusercontent.com/semaforosvupsys-cmd/formulario-mantenimiento/main/icons/logo.png" // Agregamos tu logo de empresa
];

// Instalación: Guarda todos los archivos en el caché del celular
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => {
      console.log("Instalando caché de activos...");
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: Borra versiones viejas para que no ocupen espacio
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if (k !== CACHE_NAME) {
          console.log("Borrando caché antiguo:", k);
          return caches.delete(k);
        }
      })
    ))
  );
});

// Estrategia de Red: Intenta buscar en internet, si falla, usa el caché (Modo Offline)
self.addEventListener("fetch", e => {
  // Solo manejamos peticiones GET (imágenes, html, iconos)
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
