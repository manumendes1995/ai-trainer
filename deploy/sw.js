const CACHE="hello-camera-v15";
const ASSETS=["/","/ai-deploy.html","/ia.js","/manifest.json","/icon-192.png","/icon-512.png","/favicon.ico"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting(); console.log("SW: instalado ✅");});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); console.log("SW: ativo ✅");});
self.addEventListener("fetch",e=>{const r=e.request; e.respondWith(caches.match(r,{ignoreSearch:true}).then(cached=>{ if(cached) return cached;
  return fetch(r).then(resp=>{ if(r.method==="GET"&&resp&&resp.status===200){ const copy=resp.clone(); caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{});} return resp;})
  .catch(err=>{ if(r.mode==="navigate") return caches.match("/ai-deploy.html"); throw err; });}));});
