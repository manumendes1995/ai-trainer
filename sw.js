// Service Worker — AI Trainer
const CACHE = "ai-trainer-v1";

// Lista de ficheiros essenciais para funcionar offline
const ASSETS = [
  "/",            // raiz (o Netlify reescreve para /index.html)
  "/index.html",
  "/manifest.json",
  "/ia.js",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png"
];

// Instalação: pré-cache dos assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
  console.log("SW: instalado ✅");
});

// Ativação: limpar caches antigos e assumir controlo
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
      await self.clients.claim();
      console.log("SW: ativo ✅");
    })()
  );
});

// Estratégias de cache:
// - Navegação (HTML): network-first com fallback cache/offline
// - Assets estáticos listados em ASSETS: cache-first com fallback rede
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Pedidos de navegação (ex.: entrar direto em /#camara)
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }

  // Assets conhecidos -> cache-first
  const url = new URL(req.url);
  const isAsset = ASSETS.includes(url.pathname);
  if (isAsset) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Outros pedidos: tenta rede com fallback cache
  event.respondWith(networkWithCacheFallback(req));
});

// Helpers ############################

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  const cache = await caches.open(CACHE);
  cache.put(req, res.clone());
  return res;
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    const cache = await caches.open(CACHE);
    cache.put(req, res.clone());
    return res;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    // Fallback mínimo: se pedir navegação e não houver cache, devolve index
    return caches.match("/index.html");
  }
}

async function networkWithCacheFallback(req) {
  try {
    const res = await fetch(req);
    const cache = await caches.open(CACHE);
    cache.put(req, res.clone());
    return res;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    throw e;
  }
}

// Mensagem opcional para forçar update imediato
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
