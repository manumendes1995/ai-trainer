// ---------- util ----------
const $ = sel => document.querySelector(sel);
const video = $("#camera");
const canvas = $("#overlay");
const ctx = canvas.getContext("2d");
const tipEl = $("#tip"), repsEl = $("#reps"), timerEl = $("#timer");
const goalEl = $("#goal"), exSel = $("#exercise");
const btnStart = $("#btnStart"), btnStop = $("#btnStop");
const btnPhoto = $("#btnPhoto"), btnRecord = $("#btnRecord");
const btnDownload = $("#btnDownload"), btnSave = $("#btnSave");
const btnHistory = $("#btnHistory"), btnClear = $("#btnClear");
const btnExport = $("#btnExport"), historyTable = $("#historyTable");
const appStatus = $("#appStatus");

let stream=null, mediaRec=null, chunks=[], rec=false, raf=0;
let t0=0, timerId=0, reps=0, running=false;

function setTip(t){ tipEl.textContent = t; }
function setStatus(t){ appStatus.textContent = t; }

// ---------- tabs ----------
document.querySelectorAll("nav.tabs button").forEach(b=>{
  b.addEventListener("click", ()=>{
    document.querySelectorAll("nav.tabs button").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll("section.panel").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    document.getElementById(b.dataset.tab).classList.add("active");
  });
});

// ---------- camera ----------
async function startCam(){
  if(running) return;
  try{
    setStatus("A pedir permissão…");
    stream = await navigator.mediaDevices.getUserMedia({
      video:{ width:{ideal:1280}, height:{ideal:720}, facingMode:"user" },
      audio:true
    });
    video.srcObject = stream;
    await video.play();
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    startTimer();
    running = true;
    btnStop.disabled = false;
    btnPhoto.disabled = false;
    btnRecord.disabled = false;
    btnSave.disabled = false;
    setStatus("A gravar movimento…");
    loop();
  }catch(e){
    console.error(e);
    setStatus("Permissão negada ou indisponível.");
    setTip("Abre em HTTPS e aceita a câmara. No iPhone: Safari ► aA ► Definições ► Permitir câmara.");
  }
}
function stopCam(){
  if(!running) return;
  cancelAnimationFrame(raf);
  stopTimer();
  stream?.getTracks().forEach(t=>t.stop());
  stream=null; running=false;
  btnStop.disabled = true; btnPhoto.disabled = true; btnRecord.disabled = true;
  btnDownload.disabled = true; rec=false;
  setStatus("Parado.");
}
function resizeCanvas(){
  const r = video.getBoundingClientRect();
  canvas.width = r.width; canvas.height = r.height;
}
function loop(){
  // desenha um retângulo fino para dar “feedback” visual
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = "rgba(94,234,212,.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(12,12,canvas.width-24,canvas.height-24);
  raf = requestAnimationFrame(loop);
}

// ---------- timer & reps (básico por agora) ----------
function startTimer(){
  t0 = Date.now();
  timerId = setInterval(()=>{
    const s = Math.floor((Date.now()-t0)/1000);
    const mm = String(Math.floor(s/60)).padStart(2,"0");
    const ss = String(s%60).padStart(2,"0");
    timerEl.textContent = `${mm}:${ss}`;
  }, 1000);
}
function stopTimer(){ clearInterval(timerId); }

function resetSession(){
  reps = 0; repsEl.textContent = "0";
  goalEl.value = 10;
  timerEl.textContent = "00:00";
  setTip("Nova sessão.");
}

// ---------- foto ----------
function takePhoto(){
  if(!running) return;
  const ph = document.createElement("canvas");
  ph.width = video.videoWidth; ph.height = video.videoHeight;
  ph.getContext("2d").drawImage(video,0,0);
  ph.toBlob(b=>{
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = `foto-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, "image/png");
}

// ---------- gravar vídeo ----------
function toggleRecord(){
  if(!running) return;
  if(!rec){
    chunks = [];
    mediaRec = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
    mediaRec.ondataavailable = e=>{ if(e.data.size) chunks.push(e.data); };
    mediaRec.onstop = ()=>{
      const blob = new Blob(chunks,{type:"video/webm"});
      const url = URL.createObjectURL(blob);
      btnDownload.dataset.blob = url;
      btnDownload.disabled = false;
      setTip("Gravação pronta. Clica em Guardar Vídeo.");
    };
    mediaRec.start();
    rec = true;
    btnRecord.textContent = "■ A gravar…";
    setTip("A gravar vídeo…");
  }else{
    mediaRec?.stop();
    rec = false;
    btnRecord.textContent = "● Gravar";
  }
}
function downloadVideo(){
  const url = btnDownload.dataset.blob;
  if(!url) return;
  const a = document.createElement("a");
  a.href = url; a.download = `treino-${Date.now()}.webm`; a.click();
  setTip("Vídeo guardado.");
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

// ---------- histórico ----------
function saveSession(){
  const item = {
    ts: Date.now(),
    exercise: exSel.value,
    reps: Number(repsEl.textContent)||0,
    goal: Number(goalEl.value)||0,
    duration: timerEl.textContent
  };
  const arr = JSON.parse(localStorage.getItem("ai.trainer.hist")||"[]");
  arr.push(item);
  localStorage.setItem("ai.trainer.hist", JSON.stringify(arr));
  setTip("Sessão guardada.");
}
function showHistory(){
  const arr = JSON.parse(localStorage.getItem("ai.trainer.hist")||"[]");
  if(!arr.length){ historyTable.innerHTML = '<span class="badge">Sem registos</span>'; return; }
  const rows = arr.map(i=>`<tr>
    <td>${new Date(i.ts).toLocaleString()}</td>
    <td>${i.exercise}</td>
    <td>${i.reps}</td>
    <td>${i.goal}</td>
    <td>${i.duration}</td>
  </tr>`).join("");
  historyTable.innerHTML = `<table>
    <thead><tr><th>Data</th><th>Exercício</th><th>Reps</th><th>Meta</th><th>Duração</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}
function clearHistory(){
  localStorage.removeItem("ai.trainer.hist");
  showHistory();
}
function exportCSV(){
  const arr = JSON.parse(localStorage.getItem("ai.trainer.hist")||"[]");
  if(!arr.length){ setTip("Sem registos."); return; }
  const header = "ts,data,exercise,reps,goal,duration\n";
  const lines = arr.map(i=>[
    i.ts, JSON.stringify(new Date(i.ts).toLocaleString()), i.exercise, i.reps, i.goal, i.duration
  ].join(",")).join("\n");
  const blob = new Blob([header+lines],{type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "historico.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------- eventos ----------
btnStart.addEventListener("click", startCam);
btnStop.addEventListener("click", ()=>{ toggleStop(); });
function toggleStop(){
  if(rec){ toggleRecord(); }
  stopCam(); resetSession();
}
btnPhoto.addEventListener("click", takePhoto);
btnRecord.addEventListener("click", toggleRecord);
btnDownload.addEventListener("click", downloadVideo);
btnSave.addEventListener("click", saveSession);
btnHistory.addEventListener("click", showHistory);
btnClear.addEventListener("click", clearHistory);
btnExport.addEventListener("click", exportCSV);

// estado inicial
setStatus("Pronto…");
showHistory();
