// ====== Seletores ======
const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

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
const btnExport = document.getElementById("btnExport");
const historyTable = document.getElementById("historyTable");

// ====== Estado ======
let detector, stream = null, raf = 0;
let recording = false, mediaRecorder = null, chunks = [];
let startAt = 0, timerId = 0;
let reps = 0, phase = "down"; // para rep counting simples
let lastTipAt = 0;

// ====== Util ======
const fmt = (n) => n.toString().padStart(2, "0");
function setStatus(txt){ statusEl.textContent = txt; }
function setTip(txt){ tipEl.textContent = txt; lastTipAt = performance.now(); }
function nowSec(){ return Math.floor((performance.now()-startAt)/1000); }

// ====== Câmara ======
async function startCamera(){
  if (stream) return;
  stream = await navigator.mediaDevices.getUserMedia({ video: { width:1280, height:720 }, audio:false });
  video.srcObject = stream;
  await video.play();
  resizeCanvas();
}
function stopCamera(){
  if (!stream) return;
  stream.getTracks().forEach(t=>t.stop());
  stream = null;
  video.srcObject = null;
  cancelAnimationFrame(raf);
}
function resizeCanvas(){
  const r = video.getBoundingClientRect();
  const w = video.videoWidth || r.width;
  const h = video.videoHeight || r.height;
  canvas.width = w;
  canvas.height = h;
}

// ====== Timer ======
function startTimer(){
  startAt = performance.now();
  timerId = setInterval(()=>{
    const s = nowSec();
    timerEl.textContent = `${fmt(Math.floor(s/60))}:${fmt(s%60)}`;
  }, 1000);
}
function stopTimer(){
  clearInterval(timerId);
}

// ====== Foto ======
function takePhoto(){
  if (!stream){ setTip("Abra a câmara primeiro."); return; }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url; a.download = `ai-trainer-foto-${Date.now()}.png`; a.click();
  setTip("Foto guardada 📸");
}

// ====== Vídeo ======
function toggleRecord(){
  if (!stream){ setTip("Abra a câmara primeiro."); return; }
  if (!recording){
    chunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" });
    mediaRecorder.ondataavailable = e=>{ if(e.data.size>0) chunks.push(e.data); };
    mediaRecorder.onstop = ()=>{
      const blob = new Blob(chunks, { type:"video/webm" });
      const url = URL.createObjectURL(blob);
      btnDownload.disabled = false;
      btnDownload.onclick = ()=>{
        const a = document.createElement("a");
        a.href = url; a.download = `ai-trainer-video-${Date.now()}.webm`; a.click();
        URL.revokeObjectURL(url);
      };
      setTip("Gravação concluída. Clique “Guardar Vídeo”.");
    };
    mediaRecorder.start();
    recording = true;
    btnRecord.textContent = "⏹️ Parar gravação";
    setTip("A gravar vídeo…");
  } else {
    mediaRecorder?.stop();
    recording = false;
    btnRecord.textContent = "● Gravar";
  }
}

// ====== IA (Pose Detection) ======
async function initTF(){
  try{
    await tf.setBackend('webgl');
    await tf.ready();
  }catch{
    // fallback automático
  }
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
  );
}
async function loop(){
  if (!stream) return;
  const poses = await detector.estimatePoses(video, { flipHorizontal: true });
  draw(poses);
  raf = requestAnimationFrame(loop);
}
function draw(poses){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (!poses.length){ setStatus("A procurar pessoa…"); return; }
  setStatus("Detetado ✅");

  const kp = poses[0].keypoints || [];
  // desenhar pontos discretos
  ctx.fillStyle = "#00e676";
  kp.forEach(p=>{
    if (p.score>0.5){
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
    }
  });

  // rep counter simples (braço direito)
  const rightWrist = kp.find(p=>p.name?.includes("right_wrist"));
  const rightShoulder = kp.find(p=>p.name?.includes("right_shoulder"));
  if (exerciseSel.value === "rightArm" && rightWrist && rightShoulder){
    if (rightWrist.y + 30 < rightShoulder.y && phase==="down"){ phase = "up"; }
    if (rightWrist.y > rightShoulder.y + 30 && phase==="up"){ phase = "down"; reps++; repsEl.textContent = reps; maybeGoal(); setTip("Boa! Continua 💪"); }
  }

  if (exerciseSel.value === "leftArm"){
    if (performance.now()-lastTipAt>3000) setTip("Levanta e baixa o braço esquerdo até ao ombro.");
  } else if (exerciseSel.value === "squat"){
    if (performance.now()-lastTipAt>3000) setTip("Dobra os joelhos (quadris abaixo do joelho) e volta a subir.");
  }
}
function maybeGoal(){
  const goal = parseInt(goalEl.value||"0",10);
  if (goal>0 && reps>=goal){ setTip("Meta atingida ✅"); }
}

// ====== Histórico ======
function saveSession(){
  const item = { ts:new Date().toISOString(), exercise:exerciseSel.value, reps, goal:parseInt(goalEl.value||"0",10), duration:timerEl.textContent };
  const arr = JSON.parse(localStorage.getItem("ai.trainer.hist") || "[]");
  arr.push(item);
  localStorage.setItem("ai.trainer.hist", JSON.stringify(arr));
  setTip("Sessão guardada 💾");
}
function showHistory(){
  const arr = JSON.parse(localStorage.getItem("ai.trainer.hist") || "[]");
  if (!arr.length){ historyTable.innerHTML = "<p>Sem registos ainda.</p>"; return; }
  let html = "<table><thead><tr><th>Data</th><th>Exercício</th><th>Reps</th><th>Meta</th><th>Duração</th></tr></thead><tbody>";
  arr.forEach(i=>{
    html += `<tr><td>${new Date(i.ts).toLocaleString()}</td><td>${i.exercise}</td><td>${i.reps}</td><td>${i.goal}</td><td>${i.duration}</td></tr>`;
  });
  html += "</tbody></table>";
  historyTable.innerHTML = html;
}
function clearHistory(){
  localStorage.removeItem("ai.trainer.hist");
  historyTable.innerHTML = "<p>Histórico apagado.</p>";
}
function exportCSV(){
  const arr = JSON.parse(localStorage.getItem("ai.trainer.hist") || "[]");
  if (!arr.length){ setTip("Nada para exportar."); return; }
  const rows = [["data","exercicio","reps","goal","duracao"], ...arr.map(i=>[i.ts,i.exercise,i.reps,i.goal,i.duration])];
  const csv = rows.map(r=>r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "ai-trainer-historico.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ====== Eventos UI ======
btnStart.addEventListener("click", async ()=>{
  try{
    btnDownload.disabled = true;
    reps = 0; repsEl.textContent = "0"; phase="down";
    setStatus("A abrir câmara…");
    await startCamera();
    await initTF();
    startTimer();
    loop();
    setTip("Treino iniciado ✅");
  }catch(e){
    console.error(e);
    setTip("Erro ao iniciar: "+e.message);
  }
});
btnStop.addEventListener("click", ()=>{
  stopTimer();
  stopCamera();
  cancelAnimationFrame(raf);
  setStatus("Parado ⏹️");
  setTip("Treino parado.");
});
btnPhoto.addEventListener("click", takePhoto);
btnRecord.addEventListener("click", toggleRecord);

btnSave.addEventListener("click", saveSession);
btnHistory.addEventListener("click", showHistory);
btnClear.addEventListener("click", clearHistory);
btnExport.addEventListener("click", exportCSV);

// Ajustar canvas quando o vídeo ficar pronto
video.addEventListener("loadedmetadata", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
