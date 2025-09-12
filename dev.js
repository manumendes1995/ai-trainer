(() => {
  const DEV = new URLSearchParams(location.search).has('dev');
  if (!DEV) return;
  const box = document.createElement('div');
  box.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:99999;background:rgba(8,12,24,.9);color:#e7edff;font:12px/1.35 system-ui;border:1px solid #1a2748;border-radius:10px;padding:10px 12px;min-width:220px;box-shadow:0 6px 20px rgba(0,0,0,.35)";
  box.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <strong>DEV</strong>
      <span id="dev-fps" style="margin-left:auto;opacity:.8">FPS: --</span>
    </div>
    <label style="display:block;margin:6px 0;"><input id="dev-skel" type="checkbox" checked /> Mostrar esqueleto</label>
    <label style="display:block;margin:6px 0;"><input id="dev-logs" type="checkbox" /> Logs na consola</label>
    <button id="dev-clear-cache" style="margin-top:6px;width:100%;">Limpar cache SW</button>
  `;
  document.body.appendChild(box);
  window.__SHOW_SKEL = true;
  document.getElementById('dev-skel').addEventListener('change', e => window.__SHOW_SKEL = !!e.target.checked);
  window.__DEV_LOGS = false;
  document.getElementById('dev-logs').addEventListener('change', e => window.__DEV_LOGS = !!e.target.checked);
  document.getElementById('dev-clear-cache').addEventListener('click', async () => {
    if ('caches' in window) { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); alert("Cache limpo. Ctrl+Shift+R"); }
  });
  let last=performance.now(),frames=0,acc=0;
  (function tick(){ const now=performance.now(),dt=now-last; last=now; frames++; acc+=dt; if(acc>=500){ const fps=Math.round(1000*frames/acc); const el=document.getElementById('dev-fps'); if(el) el.textContent="FPS: "+fps; frames=0; acc=0; } requestAnimationFrame(tick);}());
  window.__DEV__ = true;
})();
