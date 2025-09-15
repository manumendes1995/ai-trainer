// ===== Seletores
const video = document.getElementById("cameraVideo");
const canvas = document.getElementById("cameraCanvas");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("camStatus");
const tipEl = document.getElementById("tip");
const repsEl = document.getElementById("reps");
const exerciseSel = document.getElementById("exercise");
const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");

// ===== Estado
let stream = null, detector = null, raf = 0;
let reps = 0, phase = "up";

// ===== Util
const setStatus = (t)=> statusEl && (statusEl.textContent = t);
const setTip = (t)=> tipEl && (tipEl.textContent = t);

// ===== Camera
async function openCamera(){
  if(stream) return;
  stream = await navigator.mediaDevices.getUserMedia({
    video:{ facingMode:"user", width:{ideal:640}, height:{ideal:480} }, audio:false
  });
  video.srcObject = stream;
  await video.play();
  // ajustar canvas
  const w = video.videoWidth || 640, h = video.videoHeight || 480;
  canvas.width = w; canvas.height = h;
  canvas.style.width = video.clientWidth+"px";
  canvas.style.height = (video.clientWidth * h / w) + "px";
}

// ===== IA (MoveNet)
async function loadDetector(){
  if(detector) return;
  await tf.setBackend("webgl");
  await tf.ready();
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
  });
}

// ===== Regras simples de repetição
function countReps(keypoints, mode){
  const by = {};
  (keypoints||[]).forEach(k=>{ if(k.name) by[k.name]=k; });
  const lh = by["left_wrist"], rh = by["right_wrist"];
  const ls = by["left_shoulder"], rs = by["right_shoulder"];
  const lk = by["left_knee"], rk = by["right_knee"];
  const lhip = by["left_hip"], rhip = by["right_hip"];
  if(!ls || !rs || !lhip || !rhip) return;

  if(mode==="arm-right" && rh && rs){
    if(rh.y < rs.y - 20){ phase = "up"; setTip("Desce controlado"); }
    if(phase==="up" && rh.y > rs.y + 20){ reps++; repsEl.textContent = String(reps); phase="down"; setTip("Sobe o braço"); }
  }
  if(mode==="arm-left" && lh && ls){
    if(lh.y < ls.y - 20){ phase = "up"; setTip("Desce controlado"); }
    if(phase==="up" && lh.y > ls.y + 20){ reps++; repsEl.textContent = String(reps); phase="down"; setTip("Sobe o braço"); }
  }
  if(mode==="squat" && lk && rk && lhip && rhip){
    const hipY = (lhip.y + rhip.y)/2;
    const kneeY = (lk.y + rk.y)/2;
    if(kneeY > hipY + 20){ phase="down"; setTip("Sobe com o tronco firme"); }
    if(phase==="down" && kneeY < hipY - 10){ reps++; repsEl.textContent = String(reps); phase="up"; setTip("Desce até 90°"); }
  }
}

// ===== Loop
async function loop(){
  const poses = await detector.estimatePoses(video, { flipHorizontal:true });
  ctx.clearRect(0,0,canvas.width,canvas.height); // sem esqueleto, só dicas
  if(poses && poses[0] && poses[0].keypoints){
    countReps(poses[0].keypoints, exerciseSel.value);
  }
  raf = requestAnimationFrame(loop);
}

// ===== Botões
btnStart?.addEventListener("click", async ()=>{
  try{
    await openCamera();
    await loadDetector();
    reps = 0; phase="up"; repsEl.textContent = "0";
    setStatus("a correr"); setTip("Alinha ombros e olha em frente");
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }catch(e){
    console.error(e);
    setStatus("erro"); setTip("Permite o acesso à câmara.");
    alert("A câmara não abriu. No iPhone usa Safari e aceita a permissão.");
  }
});
btnStop?.addEventListener("click", ()=>{
  cancelAnimationFrame(raf);
  setStatus("parado"); setTip("—");
  if(stream){ stream.getTracks().forEach(t=>t.stop()); stream = null; }
});

console.log("IA pronta.");
