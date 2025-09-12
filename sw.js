self.addEventListener("install", (e) => {
  console.log("SW: instalado ✅");
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  console.log("SW: ativo ✅");
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((resp) => {
      return (
        resp ||
        fetch(e.request).then((response) => {
          const copy = response.clone();
          caches.open("ai-trainer-v1").then((cache) => {
            cache.put(e.request, copy);
          });
          return response;
        })
      );
    })
  );
});
