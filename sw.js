const CACHE = "ai-trainer-v4";
const ASSETS = [
  "/",
  "/index.html",
  "/ia.js",
  "/manifest.json",
  "/favicon.ico"
];

self.addEventListener("install", (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE && caches.delete(k))))
  );
  self.clients.claim();
});

// network-first com fallback ao cache
self.addEventListener("fetch", (e)=>{
  const req = e.request;
  e.respondWith(
    fetch(req).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(req, copy));
      return res;
    }).catch(()=>caches.match(req).then(cached=> cached || caches.match("/index.html")))
  );
});
