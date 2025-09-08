const CACHE = "ai-trainer-v7";
const ASSETS = [
  "/",
  "/index.html",
  "/ai-deploy.html",
  "/ia.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
  console.log("SW: instalado ✅");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
  console.log("SW: ativo ✅");
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cacheResp) =>
      cacheResp ||
      fetch(req).then((netResp) => {
        const copy = netResp.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return netResp;
      }).catch(() => cacheFallback(req))
    )
  );
});

function cacheFallback(req){
  if (req.mode === "navigate") return caches.match("/ai-deploy.html");
  return new Response("", { status: 404 });
}
