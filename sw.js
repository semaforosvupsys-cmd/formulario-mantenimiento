// Nombre de la caché - incrementamos a v13 para forzar la actualización en los celulares
const CACHE_NAME = "vup-v13";

// Lista de archivos necesarios para que la App sea instalable y funcione offline
// Usamos rutas completas de GitHub para asegurar que el celular los encuentre
const ASSETS = [
  "https://raw.githubusercontent.com/semaforosvupsys-cmd/formulario-mantenimiento/main/index.html",
  "https://raw.githubusercontent.com/semaforosvupsys-cmd/formulario-mantenimiento/main/manifest.json",
  "https://raw.githubusercontent.com/semaforosvupsys-cmd/formulario-mantenimiento/main/icons/icon-192.png",
  "https://raw.githubusercontent.com/semaforosvupsys-cmd/formulario-mantenimiento/main/icons/icon-512.png"
];

// 1. INSTALACIÓN: Se ejecuta la primera vez que abren la App
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("SW: Cacheando archivos de GitHub...");
      // Intentamos cachear cada archivo uno por uno para evitar que uno solo dañe todo el proceso
      return Promise.allSettled(
        ASSETS.map((url) => {
          return cache.add(url).catch((err) => console.error("Fallo al cachear:", url, err));
        })
      );
    })
  );
  self.skipWaiting(); // Obliga al SW nuevo a activarse de inmediato
});

// 2. ACTIVACIÓN: Limpia memorias viejas de versiones anteriores
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("SW: Borrando caché antiguo:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. PETICIONES (FETCH): Estrategia "Network First"
// Intenta traer lo más nuevo de internet. Si falla (estás en la calle sin señal), usa lo guardado.
self.addEventListener("fetch", (event) => {
  // Solo manejamos peticiones GET (para archivos, no para el envío del formulario)
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si hay internet, guardamos una copia de lo que bajamos y lo entregamos
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Si NO hay internet, buscamos en la maleta (caché)
        return caches.match(event.request).then((response) => {
          if (response) return response;
          
          // Si es una página y no está en caché, podrías devolver una página offline aquí
          console.log("SW: No hay internet ni copia en caché para:", event.request.url);
        });
      })
  );
});
