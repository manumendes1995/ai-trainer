const CACHE = "ai-trainer-v9";
const ASSETS = ["/","/index.html","/ai-deploy.html","/ia.js","/dev.js","/manifest.json","/icon-192.png","/icon-512.png","/favicon.ico","/cover-treinos.png","/cover-alimentacao.png","/cover-desafios.png","/cover-progresso.png","/splash-1080x1920.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))).then(()=>self.clients.claim()).then(()=>notifyAll({type:"SW_READY"}));});
self.addEventListener("fetch",e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(net=>{ const copy=net.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return net; }).catch(()=>fallback(e.request)))
  );
});
self.addEventListener("message",e=>{ if(e.data==="SKIP_WAITING") self.skipWaiting(); });
function fallback(req){ if(req.mode==="navigate") return caches.match("/ai-deploy.html"); return new Response("",{status:404}); }
async function notifyAll(msg){ const clients = await self.clients.matchAll({includeUncontrolled:true}); clients.forEach(c=>c.postMessage(msg)); }
