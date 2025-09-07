const CACHE="ai-trainer-v6"; // <- nova versão
const ASSETS=["/","/ai-deploy.html","/ia.js","/manifest.json","/icon-192.png","/icon-512.png","/favicon.ico"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim();});
self.addEventListener("fetch",e=>{
  const r=e.request;
  e.respondWith(
    caches.match(r,{ignoreSearch:true}).then(c=>c||fetch(r).then(res=>{
      if(r.method==="GET"&&res&&res.status===200){ const cp=res.clone(); caches.open(CACHE).then(cc=>cc.put(r,cp)).catch(()=>{}); }
      return res;
    }).catch(()=> r.mode==="navigate" ? caches.match("/ai-deploy.html") : Promise.reject()))
  );
});
