// ====== Seletores
const video = document.getElementById("cameraVideo");
const canvas = document.getElementById("overlay");
const ctx = canvas ? canvas.getContext("2d") : null;
const statusEl = document.getElementById("status");
const tipEl = document.getElementById("tip");
const repsEl = document.getElementById("reps");
const timerEl = document.getElementById("timer");
const goalEl = document.getElementById("goal");
const exerciseSel = document.getElementById("exercise");
const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");
const btnPhoto = document.getElementById("btnPhoto");
const btnRecord = document.getElementById("btnRecord");
const btnDownload = document.getElementById("btnDownload");
const btnSave = document.getElementById("btnSave");
const btnHistory = document.getElementById("btnHistory");
const btnClear = document.getElementById("btnClear");
const historyTable = document.getElementById("historyTable");

// Treinos / Alimentação
const sexoEl = document.getElementById("sexo");
const objetivoEl = document.getElementById("objetivo");
const nivelEl = document.getElementById("nivel");
const diasEl = document.getElementById("dias");
const treinoOut = document.getElementById("treinoOut");
const btnGerarTreino = document.getElementById("btnGerarTreino");
const btnCopiarTreino = document.getElementById("btnCopiarTreino");

const prefEl = document.getElementById("pref");
const kcalEl = document.getElementById("kcal");
const alimOut = document.getElementById("alimOut");
const btnGerarAlim = document.getElementById("btnGerarAlim");
const btnCopiarAlim = document.getElementById("btnCopiarAlim");

// ====== Estado
let stream = null;
let mediaRecorder = null;
let chunks = [];
let timerId = null;
let secs = 0;
let reps = 0;

// iOS/Safari: garantir inline e sem fullscreen
if (video) {
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.muted = true;
}

// ====== Helpers UI
function setStatus(t){ if(statusEl) statusEl.textContent = t; }
function setTip(t){ if(tipEl) tipEl.textContent = t; }
function setReps(n){ reps = n; if(repsEl) repsEl.textContent = String(n); }
function resizeCanvas(){
  if(!canvas || !video) return;
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
}
function startTimer(){
  stopTimer();
  secs = 0;
  timerId = setInterval(()=>{
    secs++;
    const m = String(Math.floor(secs/60)).padStart(2,"0");
    const s = String(secs%60).padStart(2,"0");
    if(timerEl) timerEl.textContent = `${m}:${s}`;
  },1000);
}
function stopTimer(){ if(timerId) clearInterval(timerId); timerId=null; }

// ====== Câmara
async function openCamera(){
  try{
    setStatus("A abrir câmara…");
    // iPhone/Safari precisa de userGesture (chamado a partir do click do botão)
    const constraints = {
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height:{ ideal: 720 }
      }
    };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    await video.play();
    resizeCanvas();
    setStatus("Câmara ligada ✅");
    setTip("Posiciona-te com luz e a cabeça inteira enquadrada.");
  }catch(err){
    console.error(err);
    // Dicas específicas para Safari/iOS
    let msg = "Não consegui aceder à câmara. Dá permissão no browser.";
    if (err && (err.name === "NotAllowedError" || err.name === "SecurityError")) {
      msg += " No iPhone: AA (barra de endereço) → Website Settings → Camera: Allow.";
    }
    alert(msg);
    setStatus("Permissão recusada ❌");
  }
}
function stopCamera(){
  try{
    if(stream){
      stream.getTracks().forEach(t=>t.stop());
      stream = null;
    }
    setStatus("Parado.");
    stopTimer();
  }catch(e){ console.warn(e); }
}

// Foto
function takePhoto(){
  if(!video || !canvas) return;
  resizeCanvas();
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.classList.remove("hidden");
  setTip("Foto capturada. Mantém para comparar tua postura.");
}

// Gravação
function startRecord(){
  if(!stream){ alert("Liga a câmara primeiro."); return; }
  chunks = [];
  try{
    mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  }catch(_){
    // Safari iOS grava em mp4/h264 quando disponível
    mediaRecorder = new MediaRecorder(stream);
  }
  mediaRecorder.ondataavailable = e => { if(e.data.size>0) chunks.push(e.data); };
  mediaRecorder.onstop = ()=>{
    const blob = new Blob(chunks, { type: chunks[0]?.type || "video/webm" });
    const url = URL.createObjectURL(blob);
    btnDownload.disabled = false;
    btnDownload.onclick = ()=>{
      const a = document.createElement("a");
      a.href = url;
      a.download = "sessao-ai-trainer.webm";
      a.click();
      URL.revokeObjectURL(url);
    };
    setTip("Gravação concluída. Clica “Guardar vídeo”.");
  };
  mediaRecorder.start();
  startTimer();
  setStatus("A gravar…");
}
function stopRecord(){
  if(mediaRecorder && mediaRecorder.state !== "inactive"){
    mediaRecorder.stop();
    stopTimer();
    setStatus("Parado.");
  }
}

// Handlers botões
btnStart && btnStart.addEventListener("click", openCamera);
btnStop && btnStop.addEventListener("click", stopCamera);
btnPhoto && btnPhoto.addEventListener("click", takePhoto);
btnRecord && btnRecord.addEventListener("click", ()=>{
  if(mediaRecorder && mediaRecorder.state==="recording") stopRecord();
  else startRecord();
});

// ====== Lógica simples de reps (placeholder)
// Aqui só simulamos incremento quando clicas na foto, para provar o fluxo.
btnPhoto && btnPhoto.addEventListener("click", ()=>{
  setReps(reps+1);
  const g = Number(goalEl ? goalEl.textContent : 10) || 10;
  if(reps >= g) setTip("Meta atingida! Boa 👏");
});

// ====== Histórico (LocalStorage)
function saveSession(){
  const item = {
    ts: Date.now(),
    reps,
    goal: Number(goalEl ? goalEl.textContent : 10) || 10,
    duration: timerEl ? timerEl.textContent : "00:00",
    exercise: exerciseSel ? exerciseSel.value : "auto"
  };
  const arr = JSON.parse(localStorage.getItem("ai.trainer.hist") || "[]");
  arr.push(item);
  localStorage.setItem("ai.trainer.hist", JSON.stringify(arr));
  setTip("Sessão guardada.");
}
function showHistory(){
  const arr = JSON.parse(localStorage.getItem("ai.trainer.hist") || "[]");
  if(!arr.length){ historyTable.innerHTML = "<p>Sem registos ainda.</p>"; return; }
  const rows = arr.map(i => "<tr>"
    + "<td>"+ new Date(i.ts).toLocaleString() +"</td>"
    + "<td>"+ i.exercise +"</td>"
    + "<td>"+ i.reps +"</td>"
    + "<td>"+ i.goal +"</td>"
    + "<td>"+ i.duration +"</td>"
    + "</tr>").join("");
  const table = "<table><thead><tr><th>Data</th><th>Exercício</th><th>Reps</th><th>Meta</th><th>Duração</th></tr></thead><tbody>"
    + rows + "</tbody></table>";
  historyTable.innerHTML = table;
}
btnSave && btnSave.addEventListener("click", saveSession);
btnHistory && btnHistory.addEventListener("click", showHistory);
btnClear && btnClear.addEventListener("click", ()=>{
  localStorage.removeItem("ai.trainer.hist");
  historyTable.innerHTML = "<p>Sem registos ainda.</p>";
});

// ====== Gerador de Treino
function gerarTreino(){
  const sexo = sexoEl.value, obj = objetivoEl.value, nivel = nivelEl.value;
  const dias = Math.min(6, Math.max(2, Number(diasEl.value||4)));
  const split = (dias<=3) ? "Full body" : (dias===4? "Upper/Lower" : "Push/Pull/Legs");
  const foco = (obj==="perda") ? "Défice calórico leve + mais cardio" :
              (obj==="ganho") ? "Superávit leve + progressão de cargas" : "Manutenção + técnica";
  const base = `
Plano (${dias} dias/semana) — ${split}
Nível: ${nivel} • Objetivo: ${obj} • Sexo: ${sexo}

Aquecimento: 5–8min mobilidade + 2 séries leves do primeiro exercício.

Força/Principal (exemplo de dia):
- Agachamento/Leg Press 4x8–12
- Remada/Barra 4x8–12
- Supino/Press 4x8–12
- Acessórios 3x12–15 (core, ombros, glúteo)
Cardio: 10–20min pós força (RPE 6–7).

Notas: ${foco}. Dorme 7–8h, hidrata, regista cargas.`;
  treinoOut.textContent = base.trim();
}
btnGerarTreino && btnGerarTreino.addEventListener("click", gerarTreino);
btnCopiarTreino && btnCopiarTreino.addEventListener("click", async ()=>{
  const txt = treinoOut.textContent || "";
  try{ await navigator.clipboard.writeText(txt); alert("Plano copiado!"); }catch(_){ alert("Não consegui copiar."); }
});

// ====== Gerador de Alimentação
const exemplos = {
  omni: ["Iogurte + granola", "Frango/arroz/legumes", "Ovos + pão + fruta", "Peixe + batata + salada"],
  vege: ["Skyr + granola", "Tofu + arroz + legumes", "Wrap feijão + salada", "Ovos + batata + legumes"],
  lowcarb: ["Ovos mexidos + abacate", "Carne + salada + azeite", "Iogurte grego + nozes", "Peixe + legumes"]
};
function gerarAlim(){
  const pref = prefEl.value;
  const kcal = Number(kcalEl.value||2000);
  const p = Math.round(kcal*0.3/4);
  const c = Math.round(kcal*0.4/4);
  const g = Math.round(kcal*0.3/9);
  const cap = `
Diretrizes (${kcal} kcal):
- Proteínas ~${p}g • Hidratos ~${c}g • Gorduras ~${g}g
- 3 refeições + 1 lanche. Água: 30–35 ml/kg.

Ideias (${pref}):
- ${exemplos[pref][0]}
- ${exemplos[pref][1]}
- ${exemplos[pref][2]}
- ${exemplos[pref][3]}

Sugestão de dia:
- Pequeno-almoço: ${exemplos[pref][0]}
- Almoço: ${exemplos[pref][1]}
- Lanche: fruta + fonte de proteína
- Jantar: ${exemplos[pref][3]}
`;
  alimOut.textContent = cap.trim();
}
btnGerarAlim && btnGerarAlim.addEventListener("click", gerarAlim);
btnCopiarAlim && btnCopiarAlim.addEventListener("click", async ()=>{
  const txt = alimOut.textContent || "";
  try{ await navigator.clipboard.writeText(txt); alert("Cardápio copiado!"); }catch(_){ alert("Não consegui copiar."); }
});
