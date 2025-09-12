const CACHE = "ai-trainer-v1";
const ASSETS = ["/","/index.html","/script.js","/manifest.json","/icon-192.png","/icon-512.png","/favicon.ico"];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
  console.log("SW: instalado ✅");
});
self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))))
  self.clients.claim();
  console.log("SW: ativo ✅");
});
self.addEventListener("fetch", e=>{
  const url = new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(
      caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
        if(e.request.method==="GET"){
          const clone = resp.clone();
          caches.open(CACHE).then(c=>c.put(e.request, clone));
        }
        return resp;
      }).catch(()=>caches.match("/index.html")))
    );
  }
});
