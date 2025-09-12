// ===== Util =====
const $ = (sel) => document.querySelector(sel);
const on = (el, ev, cb) => el && el.addEventListener(ev, cb);

function log(msg){ try{ console.log(msg);}catch{} }
function setText(id, txt){ const el = document.getElementById(id); if(el) el.textContent = txt; }

// ===== Tabs (Início / Treinos / Alimentação / Câmara / Conta) =====
(function initTabs(){
  const links = document.querySelectorAll('nav a[data-tab]');
  if(!links.length) return;

  function showTab(tab){
    // marcar ativo no menu
    links.forEach(a => a.classList.toggle('active', a.dataset.tab === tab));
    // mostrar secção correspondente
    document.querySelectorAll('section[data-tab]').forEach(s => {
      s.classList.toggle('hidden', s.dataset.tab !== tab);
    });
    // atualizar hash (ex.: #camara)
    if(location.hash !== '#'+tab) location.hash = '#'+tab;
  }

  links.forEach(a => on(a, 'click', (e)=>{ e.preventDefault(); showTab(a.dataset.tab); }));
  const initial = (location.hash||'#home').replace('#','');
  if([...links].some(a => a.dataset.tab === initial)){
    showTab(initial);
  } else {
    showTab(links[0].dataset.tab);
  }

  window.addEventListener('hashchange', ()=>{
    const t = (location.hash||'#home').replace('#','');
    if([...links].some(a => a.dataset.tab === t)) showTab(t);
  });
})();

// ===== Câmara =====
let stream = null;
let mediaRecorder = null;
let recordedChunks = [];
let recording = false;

const video = $('#camera');
const canvas = $('#overlay');
const ctx = canvas ? canvas.getContext('2d') : null;

async function startCamera(){
  try{
    // Pede permissão
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: {ideal: 1280}, height: {ideal: 720} },
      audio: false
    });
    if(video){
      video.srcObject = stream;
      await video.play();
      setText('status', 'Câmara aberta ✅');
    }
  }catch(err){
    console.error(err);
    setText('status', 'Permissão negada ou indisponível. Vá a Definições do browser e permita a câmara.');
    alert('Não foi possível abrir a câmara. Verifique as permissões do navegador.');
  }
}

function stopCamera(){
  try{
    if(stream){
      stream.getTracks().forEach(t=>t.stop());
      stream = null;
    }
    if(video) video.srcObject = null;
    setText('status', 'Câmara parada ⏹️');
  }catch(e){ console.error(e); }
}

function takePhoto(){
  if(!video || !canvas || !ctx || !stream){ alert('Abra a câmara primeiro.'); return; }
  canvas.width  = video.videoWidth  || 1280;
  canvas.height = video.videoHeight || 720;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  // baixar
  canvas.toBlob((blob)=>{
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `foto_${new Date().toISOString().replace(/[:.]/g,'-')}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, 'image/png');
}

function toggleRecord(){
  if(!stream){ alert('Abra a câmara primeiro.'); return; }

  if(!recording){
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
    mediaRecorder.ondataavailable = (e)=>{ if(e.data && e.data.size) recordedChunks.push(e.data); };
    mediaRecorder.onstop = saveRecording;
    mediaRecorder.start();
    recording = true;
    setText('status', 'A gravar vídeo… ⏺️');
    const btn = document.getElementById('btnRecord');
    if(btn) btn.textContent = 'Parar Gravação';
  } else {
    mediaRecorder?.stop();
    recording = false;
    const btn = document.getElementById('btnRecord');
    if(btn) btn.textContent = 'Gravar Vídeo';
  }
}

function saveRecording(){
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `video_${new Date().toISOString().replace(/[:.]/g,'-')}.webm`;
  a.click();
  URL.revokeObjectURL(url);
  setText('status', 'Gravação concluída. 🎬');
}

// Botões (se existirem no HTML, ligamos)
on($('#btnStart'),  'click', startCamera);
on($('#btnStop'),   'click', stopCamera);
on($('#btnSnap'),   'click', takePhoto);
on($('#btnRecord'), 'click', toggleRecord);

// ===== Treinos (gerador simples) =====
on($('#btnGerarTreino'), 'click', ()=>{
  const sexo   = ($('#sexo')   && $('#sexo').value)   || 'indefinido';
  const gordura= ($('#gordura')&& $('#gordura').value)|| 'médio';
  const objetivo = ($('#objetivo') && $('#objetivo').value) || 'perda de peso';

  const dias = ($('#dias') && +$('#dias').value) || 3;

  const plano = [];
  for(let i=1;i<=dias;i++){
    plano.push(`Dia ${i}: 
- Aquecimento 10 min
- Treino: Agachamentos 4x12, Flexões 4x10, Remada elástico 4x12
- Core: Prancha 3x40s
- Cardio: 15 min moderado`);
  }

  const header = `Plano (${dias} dias/semana) — ${sexo}, ${gordura} BF, objetivo: ${objetivo}`;
  const out = [header, '', ...plano].join('\n');
  const el = $('#treinoOut');
  if(el) el.textContent = out;
});

on($('#btnCopiarTreino'), 'click', async ()=>{
  const txt = ($('#treinoOut') && $('#treinoOut').textContent) || '';
  if(!txt.trim()) return alert('Gera um plano primeiro.');
  await navigator.clipboard.writeText(txt);
  alert('Plano copiado!');
});

// ===== Alimentação (gerador simples) =====
on($('#btnGerarAlim'), 'click', ()=>{
  const pref = ($('#preferencia') && $('#preferencia').value) || 'omni'; // omni/vege/lowcarb
  const kcal = ($('#kcal') && $('#kcal').value) || '2000 kcal';

  const base = {
    omni: [
      'Pequeno-almoço: Iogurte/Skyr + granola + fruta',
      'Almoço: Frango + arroz + salada',
      'Lanche: Fruta + oleaginosas',
      'Jantar: Peixe + legumes + batata'
    ],
    vege: [
      'Pequeno-almoço: Tofu mexido + pão + fruta',
      'Almoço: Feijão + arroz + legumes',
      'Lanche: Iogurte vegetal + granola',
      'Jantar: Omelete/queijo + salada + batata'
    ],
    lowcarb: [
      'Pequeno-almoço: Ovos mexidos + abacate',
      'Almoço: Carne + salada + azeite',
      'Lanche: Iogurte grego + nozes',
      'Jantar: Peixe + legumes salteados'
    ]
  }[pref];

  const header = `Diretrizes (${kcal})`;
  const texto = [header, '', ...base].join('\n');
  const el = $('#alimOut');
  if(el) el.textContent = texto;
});

on($('#btnCopiarAlim'), 'click', async ()=>{
  const txt = ($('#alimOut') && $('#alimOut').textContent) || '';
  if(!txt.trim()) return alert('Gera o cardápio primeiro.');
  await navigator.clipboard.writeText(txt);
  alert('Cardápio copiado!');
});

// ===== SW register =====
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js')
    .then(()=>{ setText('swState', 'SW ok'); log('SW registado ✅'); })
    .catch(()=>{ setText('swState', 'SW falhou'); });
}

// ===== Dica para iOS (botão de câmara não aparece) =====
(function iosHint(){
  const ua = navigator.userAgent || '';
  const isiOS = /iPad|iPhone|iPod/.test(ua);
  if(isiOS && !navigator.mediaDevices){
    setText('status', 'No iOS, usa Safari e permite a câmara em Definições ▸ Safari ▸ Câmara.');
  }
})();
