// ===== ELEMENTOS =====
const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

const btn = document.getElementById("btnStart");
const snap = document.getElementById("btnSnap");
const dl = document.getElementById("dl");
const statusEl = document.getElementById("status");
const repsEl = document.getElementById("reps");
const btnReset = document.getElementById("btnReset");

// modos
const btnRight = document.getElementById("btnRight");
const btnLeft  = document.getElementById("btnLeft");
const btnSquat = document.getElementById("btnSquat");

// histórico / CSV
const btnSave  = document.getElementById("btnSave");
const btnShow  = document.getElementById("btnShow");
const btnClear = document.getElementById("btnClear");
const btnCSV   = document.getElementById("btnCSV");
const historyBox  = document.getElementById("historyBox");
const historyList = document.getElementById("historyList");

// gráfico
const btnChartShow = document.getElementById("btnChartShow");
const btnChartHide = document.getElementById("btnChartHide");
const chartBox = document.getElementById("chartBox");
const chartCanvas = document.getElementById("chart");
let chart = null;

// vídeo (MediaRecorder)
const btnRecStart = document.getElementById("btnRecStart");
const btnRecStop  = document.getElementById("btnRecStop");
const dlVideo     = document.getElementById("dlVideo");
const recAudio    = document.getElementById("recAudio");
const recQuality  = document.getElementById("recQuality");
const recTimerEl  = document.getElementById("recTimer");
let mediaRecorder = null;
let recChunks = [];
let recTimerId = null;
let recStartTs = 0;

// timer treino
const btnTrainStart = document.getElementById("btnTrainStart");
const btnTrainStop  = document.getElementById("btnTrainStop");
const trainTimerEl  = document.getElementById("trainTimer");
let trainTimerId = null;
let trainStartTs = 0;
let lastTrainDurationMs = 0;

// ===== ESTADO IA =====
let detector;
let reps = 0, phase = "down", mode = "right", dySmooth = 0;
let fps = 0, last = performance.now();

// ===== EVENTOS =====
btn.addEventListener("click", start);
btnReset.addEventListener("click", () => resetCounter("manual"));
btnRight.addEventListener("click", () => { mode = "right"; resetCounter("Braço Direito"); });
btnLeft .addEventListener("click", () => { mode = "left";  resetCounter("Braço Esquerdo"); });
btnSquat.addEventListener("click", () => { mode = "squat"; resetCounter("Agachamento"); });

snap.addEventListener("click", takePhoto);

// histórico
btnSave.addEventListener("click", saveSession);
btnShow.addEventListener("click", () => renderHistory(true));
btnClear.addEventListener("click", clearHistory);
btnCSV.addEventListener("click", exportCSV);

// gráfico
btnChartShow.addEventListener("click", showChart);
btnChartHide.addEventListener("click", hideChart);

// vídeo
btnRecStart.addEventListener("click", startRecording);
btnRecStop .addEventListener("click", stopRecording);

// treino
btnTrainStart.addEventListener("click", startTrainTimer);
btnTrainStop .addEventListener("click", stopTrainTimer);

// ===== UTIL =====
function fmt(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
}
function labelMode(m) { return m==="right"?"Braço Direito":m==="left"?"Braço Esquerdo":"Agachamento"; }
function resetCounter(reason) {
  reps = 0; phase = "down"; dySmooth = 0;
  repsEl.textContent = reps;
  if (reason!=="manual") statusEl.textContent = `Modo: ${reason}`;
}

// ===== FOTO =====
function takePhoto() {
  const out = document.createElement("canvas");
  out.width = canvas.width; out.height = canvas.height;
  const c = out.getContext("2d");
  c.drawImage(video, 0, 0); c.drawImage(canvas, 0, 0);
  dl.href = out.toDataURL("image/png");
  statusEl.textContent = "Foto capturada ✅";
}

// ===== HISTÓRICO / CSV =====
function loadSessions() {
  try { return JSON.parse(localStorage.getItem("sessions") || "[]"); }
  catch { return []; }
}
function saveSessions(arr) {
  localStorage.setItem("sessions", JSON.stringify(arr));
}
function saveSession() {
  const sessions = loadSessions();
  let durationMs = lastTrainDurationMs;
  if (trainTimerId) durationMs = Date.now() - trainStartTs;
  sessions.push({
    data: new Date().toLocaleString(),
    modo: mode,
    reps,
    duracao: fmt(durationMs)
  });
  saveSessions(sessions);
  statusEl.textContent = "Sessão guardada ✅";
  renderHistory(true); // mostra já o histórico
}
function renderHistory(show) {
  const sessions = loadSessions();
  historyList.innerHTML = "";
  sessions.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.data} — ${labelMode(s.modo)}: ${s.reps} reps — ${s.duracao}`;
    historyList.appendChild(li);
  });
  if (show) historyBox.style.display = sessions.length ? "block" : "none";
}
function clearHistory() {
  localStorage.removeItem("sessions");
  historyList.innerHTML = "";
  historyBox.style.display = "none";
  statusEl.textContent = "Histórico apagado";
}
function exportCSV() {
  const sessions = loadSessions();
  if (!sessions.length) { statusEl.textContent = "Sem sessões para exportar."; return; }
  const header = "data,modo,reps,duracao\n";
  const rows = sessions.map(s => `"${s.data}","${labelMode(s.modo)}",${s.reps},"${s.duracao}"`);
  const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href:url, download:`treinos_${Date.now()}.csv` });
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  statusEl.textContent = "CSV exportado ✅";
}

// ===== GRÁFICO =====
function showChart() {
  const sessions = loadSessions();
  if (!sessions.length) { statusEl.textContent = "Sem dados para o gráfico."; return; }
  const byDay = {};
  sessions.forEach(s => {
    const day = s.data.split(",")[0].trim();
    byDay[day] = (byDay[day] || 0) + Number(s.reps||0);
  });
  const labels = Object.keys(byDay);
  const data = labels.map(d => byDay[d]);

  chartBox.style.display = "block"; // mantém visível
  if (chart) chart.destroy();
  chart = new Chart(chartCanvas.getContext("2d"), {
    type: "bar",
    data: { labels, datasets: [{ label:"Reps por dia", data }] },
    options: { responsive:true, plugins:{ legend:{ display:true } }, scales:{ y:{ beginAtZero:true } } }
  });

  // desce a página até ao gráfico
  setTimeout(() => { chartBox.scrollIntoView({ behavior:"smooth", block:"start" }); }, 50);
}
function hideChart() {
  chartBox.style.display = "none";
  if (chart) { chart.destroy(); chart = null; }
}

// ===== IA =====
async function start() {
  btn.disabled = true;
  statusEl.textContent = "A abrir câmara…";

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width:{ideal:640}, height:{ideal:480} },
    audio: recAudio.checked
  });
  video.srcObject = stream;
  await video.play();

  canvas.width  = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  await tf.setBackend("cpu"); await tf.ready();
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
  );

  statusEl.textContent = "Pronto. A detetar…";
  requestAnimationFrame(loop);
}

// ===== VÍDEO =====
function pickMime() {
  const cands = ["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"];
  for (const t of cands) if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) return t;
  return "";
}
function bitrate(q){ return q==="high"?5_000_000:q==="med"?2_500_000:undefined; }

function startRecording() {
  const base = video.srcObject;
  if (!base) { statusEl.textContent = "Abra a câmara primeiro."; return; }

  let stream = base;
  if (recAudio.checked && !base.getAudioTracks().length) {
    navigator.mediaDevices.getUserMedia({ audio:true })
      .then(a => { stream = new MediaStream([...base.getVideoTracks(), ...a.getAudioTracks()]); reallyStart(stream); })
      .catch(e => { console.warn("Sem áudio:", e); statusEl.textContent="Áudio indisponível — a gravar só vídeo."; reallyStart(stream); });
  } else { reallyStart(stream); }

  function reallyStart(s) {
    const opts = {};
    const mt = pickMime(); const bps = bitrate(recQuality.value);
    if (mt) opts.mimeType = mt; if (bps) opts.bitsPerSecond = bps;

    try { recChunks=[]; mediaRecorder = new MediaRecorder(s, opts); }
    catch(e){ console.error(e); statusEl.textContent="Navegador não suporta gravação."; return; }

    mediaRecorder.ondataavailable = e => { if (e.data && e.data.size) recChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recChunks, { type: mediaRecorder.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      dlVideo.href = url; dlVideo.download = `video_${Date.now()}.webm`;
      statusEl.textContent = "Vídeo pronto para guardar ✅";
      // pára timer de vídeo
      if (recTimerId) { clearInterval(recTimerId); recTimerId=null; }
    };

    mediaRecorder.start();
    btnRecStart.disabled = true; btnRecStop.disabled = false;
    statusEl.textContent = "A gravar… 🔴";
    // temporizador de vídeo
    recStartTs = Date.now();
    recTimerEl.textContent = "00:00";
    if (recTimerId) clearInterval(recTimerId);
    recTimerId = setInterval(() => { recTimerEl.textContent = fmt(Date.now() - recStartTs); }, 200);
  }
}
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state!=="inactive") {
    mediaRecorder.stop();
    btnRecStart.disabled = false; btnRecStop.disabled = true;
    statusEl.textContent = "A processar vídeo…";
  }
}

// ===== TIMER TREINO =====
function startTrainTimer() {
  if (trainTimerId) return;
  trainStartTs = Date.now();
  lastTrainDurationMs = 0;
  trainTimerEl.textContent = "00:00";
  trainTimerId = setInterval(() => {
    trainTimerEl.textContent = fmt(Date.now() - trainStartTs);
  }, 200);
  statusEl.textContent = "Treino iniciado ⏱";
}
function stopTrainTimer() {
  if (!trainTimerId) return;
  clearInterval(trainTimerId); trainTimerId = null;
  lastTrainDurationMs = Date.now() - trainStartTs;
  statusEl.textContent = "Treino terminado ⏱";
}

// ===== LOOP IA =====
async function loop() {
  const poses = await detector.estimatePoses(video, { flipHorizontal: true });
  draw(poses);
  updateCounter(poses);

  const now = performance.now();
  fps = Math.round(1000 / (now - last)); last = now;
  requestAnimationFrame(loop);
}
function getKeypoint(poses, name) {
  const kp = poses[0]?.keypoints || [];
  return kp.find(p => p.name===name && p.score>=0.25);
}
function updateCounter(poses) {
  if (!poses.length) return;

  if (mode==="right" || mode==="left") {
    const shoulder = getKeypoint(poses, mode==="right"?"right_shoulder":"left_shoulder");
    const wrist    = getKeypoint(poses, mode==="right"?"right_wrist":"left_wrist");
    if (!shoulder || !wrist) return;

    const dy = (shoulder.y - wrist.y);
    dySmooth = 0.6*dySmooth + 0.4*dy;

    const UP=18, DOWN=6; // sensível
    if (phase==="down" && dySmooth>=UP) phase="up";
    else if (phase==="up" && dySmooth<=DOWN) { reps++; repsEl.textContent=reps; phase="down"; }
  } else {
    const hip  = getKeypoint(poses, "left_hip")  || getKeypoint(poses, "right_hip");
    const knee = getKeypoint(poses, "left_knee") || getKeypoint(poses, "right_knee");
    if (!hip || !knee) return;

    const dy = (hip.y - knee.y);
    dySmooth = 0.7*dySmooth + 0.3*dy;

    const DOWN=-25, UP=-10;
    if (phase==="up" && dySmooth<=DOWN) phase="down";
    else if (phase==="down" && dySmooth>=UP) { reps++; repsEl.textContent=reps; phase="up"; }
  }
}
function draw(poses) {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // centro (debug)
  ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2, 3, 0, Math.PI*2);
  ctx.fillStyle="#ff1744"; ctx.fill();

  // só desenhamos dentro do overlay; não mexe no gráfico/histórico
  if (!poses.length) { statusEl.textContent = `Modo: ${labelMode(mode)} | Reps: ${reps} | FPS: ${fps}`; return; }

  const kp = poses[0].keypoints || [];
  kp.forEach(p => {
    if (p && p.score>0.4) {
      ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2);
      ctx.fillStyle="#00E5FF"; ctx.fill();
    }
  });
  const pairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
  ctx.lineWidth=4; ctx.strokeStyle="deepskyblue";
  pairs.forEach(([i,j]) => {
    const a=kp[i], b=kp[j];
    if (a && b && a.score>0.5 && b.score>0.5) { ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
  });

  statusEl.textContent = `Modo: ${labelMode(mode)} | Reps: ${reps} | FPS: ${fps}`;
}
