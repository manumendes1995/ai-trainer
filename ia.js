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
const setStatus = (t)=> statusEl.textContent = t;
const setTip = (t)=> tipEl.textContent = t;

// ===== Camera
async function openCamera(){
  if(stream) return;
  stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"user", width:{ideal:640}, height:{ideal:480} }, audio:false });
  video.srcObject = stream;
  await video.play();
  // ajustar canvas
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
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
  // pega Y de punho/ombro/anca/joelho para heurísticas simples
  const byName = {};
  (keypoints||[]).forEach(k=>byName[k.name]=k);
  const lh = byName["left_wrist"], rh = byName["right_wrist"];
  const ls = byName["left_shoulder"], rs = byName["right_shoulder"];
  const lk = byName["left_knee"], rk = byName["right_knee"];
  const lhx = byName["left_hip"], rhx = byName["right_hip"];
  if(!ls || !rs || !lhx || !rhx) return;

  if(mode==="arm-right" && rh && rs){
    // braço sobe acima do ombro => fase "up"
    if(rh.y < rs.y - 20){ phase = "up"; setTip("Desce controlado"); }
    // volta a baixo do ombro => conta
    if(phase==="up" && rh.y > rs.y + 20){ reps++; repsEl.textContent = String(reps); phase="down"; setTip("Sobe o braço"); }
  }
  if(mode==="arm-left" && lh && ls){
    if(lh.y < ls.y - 20){ phase = "up"; setTip("Desce controlado"); }
    if(phase==="up" && lh.y > ls.y + 20){ reps++; repsEl.textContent = String(reps); phase="down"; setTip("Sobe o braço"); }
  }
  if(mode==="squat" && lk && rk && lhx && rhx){
    const hipY = (lhx.y + rhx.y)/2;
    const kneeY = (lk.y + rk.y)/2;
    // joelho abaixo da anca => baixo
    if(kneeY > hipY + 20){ phase="down"; setTip("Sobe com o tronco firme"); }
    // regressa acima => conta
    if(phase==="down" && kneeY < hipY - 10){ reps++; repsEl.textContent = String(reps); phase="up"; setTip("Desce até 90°"); }
  }
}

// ===== Loop
async function loop(){
  const poses = await detector.estimatePoses(video, { flipHorizontal:true });
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // (não desenhamos esqueleto – apenas dicas)
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
    setStatus("erro"); setTip("Permite o acesso à câmara no browser.");
    alert("A câmara não abriu. Em iPhone/iPad, usa Safari com HTTPS e aceita a permissão.");
  }
});
btnStop?.addEventListener("click", ()=>{
  cancelAnimationFrame(raf);
  setStatus("parado"); setTip("—");
  if(stream){
    stream.getTracks().forEach(t=>t.stop());
    stream = null;
  }
});

console.log("IA pronta.");
