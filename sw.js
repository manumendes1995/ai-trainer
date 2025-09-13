// SW para AI Trainer — rede-primeiro nos HTML/JS, cache de apoio para offline
const SW_VERSION = "ai-trainer-v9";
const CORE = [
  "/",                 // Netlify: raiz
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/planos/planos.js"
];

// GitHub Pages costuma servir sob /ai-trainer/.
// Se estiveres a usar GitHub Pages, descomenta a linha abaixo e comenta as de cima:
// const ROOT = "/ai-trainer/";
// const CORE = [`${ROOT}`, `${ROOT}index.html`, `${ROOT}manifest.json`, `${ROOT}favicon.ico`, `${ROOT}icon-192.png`, `${ROOT}icon-512.png`, `${ROOT}planos/planos.js`];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SW_VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
  // console.log("SW: instalado");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(keys.filter(k => k !== SW_VERSION).map(k => caches.delete(k)));
      await self.clients.claim();
    })
  );
  // console.log("SW: ativo");
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Só GET é elegível a cache
  if (req.method !== "GET") return;

  // Estratégia: rede-primeiro para HTML/JS; cache-primeiro para ícones/manif.
  const accept = req.headers.get("accept") || "";
  const isHTML = accept.includes("text/html");
  const isJS = req.destination === "script" || req.url.endsWith(".js");
  const isAsset = req.destination === "image" || req.url.endsWith(".png") || req.url.endsWith(".ico") || req.url.endsWith("manifest.json");

  if (isHTML || isJS) {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const clone = resp.clone();
          caches.open(SW_VERSION).then((c) => c.put(req, clone));
          return resp;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          // fallback para a homepage se estiver offline e sem cache daquele HTML
          return caches.match("/index.html");
        })
    );
    return;
  }

  if (isAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        return (
          cached ||
          fetch(req).then((resp) => {
            const clone = resp.clone();
            caches.open(SW_VERSION).then((c) => c.put(req, clone));
            return resp;
          })
        );
      })
    );
  }
});
