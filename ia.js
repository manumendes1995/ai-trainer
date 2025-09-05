/* ---------- i18n (auto por idioma do dispositivo) ---------- */
const LANG = ((navigator.language||'en').toLowerCase().startsWith('pt')) ? 'pt' : 'en';
const I18N = {
  en: {
    start:"Open Camera", reset:"Reset", exercise:"Exercise", rightArm:"Right Arm", leftArm:"Left Arm", squat:"Squat",
    goal:"Goal", reps:"Reps", repsShort:"reps", save:"Save", history:"History", clear:"Clear History", export:"Export CSV",
    historyTitle:"Session History", date:"Date", duration:"Duration",
    ready:"Ready…", opening:"Opening camera…", detecting:"Detecting…",
    showShoulderWrist:"Show shoulder and wrist", armExtend:"Extend the arm more",
    armUp:"Lift more (close the elbow)", comeCloser:"Come closer and face the camera",
    hipKnee:"Show hip and knee", squatLower:"Go lower (hip under knee)", postureOK:"Posture OK",
    saved:"Session saved ✅", cleared:"History cleared.", noData:"No sessions.", csvOK:"CSV exported ✅",
    goalHit:"Goal reached 🎉"
  },
  pt: {
    start:"Abrir Câmera", reset:"Reset", exercise:"Exercício", rightArm:"Braço Direito", leftArm:"Braço Esquerdo", squat:"Agachamento",
    goal:"Meta", reps:"Reps", repsShort:"reps", save:"Guardar", history:"Histórico", clear:"Apagar Histórico", export:"Exportar CSV",
    historyTitle:"Histórico de Sessões", date:"Data", duration:"Duração",
    ready:"Pronto…", opening:"A abrir câmara…", detecting:"A detetar…",
    showShoulderWrist:"Mostra ombro e pulso", armExtend:"Estica mais o braço",
    armUp:"Sobe mais (fecha o cotovelo)", comeCloser:"Aproxima-te e fica de frente",
    hipKnee:"Mostra anca e joelho", squatLower:"Desce mais (anca abaixo do joelho)", postureOK:"Postura ok",
    saved:"Sessão guardada ✅", cleared:"Histórico apagado.", noData:"Sem sessões.", csvOK:"CSV exportado ✅",
    goalHit:"Meta alcançada 🎉"
  }
};
function tr(key){ return (I18N[LANG] && I18N[LANG][key]) || I18N.en[key] || key; }
function applyI18N(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const k=el.getAttribute("data-i18n"); if(k && tr(k)) el.textContent = tr(k);
  });
}

/* ---------- Elementos ---------- */
const video=document.getElementById("camera");
const canvas=document.getElementById("overlay");
const ctx=canvas.getContext("2d");
const btnStart=document.getElementById("btnStart");
const btnReset=document.getElementById("btnReset");
const btnSave=document.getElementById("btnSave");
const btnHist=document.getElementById("btnHistory");
const btnClear=document.getElementById("btnClear");
const btnExport=document.getElementById("btnExport");
const exerciseSel=document.getElementById("exercise");
const repsEl=document.getElementById("reps");
const goalEl=document.getElementById("goal");
const statusEl=document.getElementById("status");
const modal=document.getElementById("historyModal");
const histBody=document.getElementById("histBody");
const closeHist=document.getElementById("closeHist");

/* ---------- Estado ---------- */
let detector=null, running=false, reps=0, lastPhase="down", dySmooth=0;
let startTime=null, timerId=null;
const SHOW_SKELETON=false; // mantém escondido

/* ---------- Utils UI ---------- */
const msg=t=>statusEl.textContent=t??"";
function beep(ms=120, freq=880){
  try{
    const a=new (window.AudioContext||window.webkitAudioContext)();
    const o=a.createOscillator(); const g=a.createGain();
    o.connect(g); g.connect(a.destination); o.type="sine"; o.frequency.value=freq; o.start();
    g.gain.setValueAtTime(0.2,a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime+ms/1000);
    setTimeout(()=>{o.stop(); a.close();}, ms+40);
  }catch{}
}
function vibrate(p=[120]){ try{ navigator.vibrate && navigator.vibrate(p); }catch{} }

/* ---------- Eventos ---------- */
applyI18N();
btnStart?.addEventListener("click", start);
btnReset?.addEventListener("click", resetAll);
btnSave ?.addEventListener("click", saveSession);
btnHist ?.addEventListener("click", ()=>{ renderHistory(); modal.style.display="grid"; });
closeHist?.addEventListener("click", ()=> modal.style.display="none");
btnClear?.addEventListener("click", ()=>{ localStorage.removeItem("sessions"); alert(tr("cleared")); renderHistory(); });
btnExport?.addEventListener("click", exportCSV);
exerciseSel?.addEventListener("change", ()=> resetCounters());

/* ---------- Timer ---------- */
function startTimer(){
  startTime = Date.now();
  if(timerId) clearInterval(timerId);
  timerId = setInterval(()=>{
    const s=Math.floor((Date.now()-startTime)/1000);
    const mStr=String(Math.floor(s/60)).padStart(2,"0");
    const sStr=String(s%60).padStart(2,"0");
    document.getElementById("timer").textContent = `${mStr}:${sStr}`;
  }, 500);
}
function stopTimer(){ if(timerId){ clearInterval(timerId); timerId=null; } }

/* ---------- IA ---------- */
async function start(){
  if(running) return; running=true; msg(tr("opening"));
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:480},facingMode:"user"},audio:false});
    video.srcObject=stream; await video.play();
    canvas.width=video.videoWidth||640; canvas.height=video.videoHeight||480;

    try{ await tf.setBackend("webgl"); await tf.ready(); } catch{ try{ await tf.setBackend("wasm"); await tf.ready(); } catch{} }
    detector=await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet,
      {modelType:poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING, enableSmoothing:true});
    msg(tr("detecting"));
    resetCounters(); startTimer();
    requestAnimationFrame(loop);
  }catch(e){ console.error(e); msg("Erro: "+(e?.message||e)); running=false; }
}

function resetCounters(){ reps=0; lastPhase="down"; dySmooth=0; repsEl.textContent="0"; }

/* ciclo */
async function loop(){
  if(!running) return;
  let poses=[]; try{ poses=await detector.estimatePoses(video,{flipHorizontal:true}); }catch(e){ console.error(e); }
  draw(poses); evaluateAndCount(poses);
  requestAnimationFrame(loop);
}

/* desenho (esqueleto oculto) */
function draw(poses){
  const w=canvas.width,h=canvas.height; ctx.clearRect(0,0,w,h);
  if(!SHOW_SKELETON||!poses.length) return;
  const kp=poses[0].keypoints||[];
  kp.forEach(p=>{ if(p.score>0.5){ ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fillStyle="#22c55e"; ctx.fill(); }});
  const L=n=>getKP(poses,"left_"+n), R=n=>getKP(poses,"right_"+n);
  const segs=[[L("shoulder"),R("shoulder")],[L("hip"),R("hip")],[L("shoulder"),L("elbow")],[L("elbow"),L("wrist")],[R("shoulder"),R("elbow")],[R("elbow"),R("wrist")],[L("hip"),L("knee")],[L("knee"),L("ankle")],[R("hip"),R("knee")],[R("knee"),R("ankle")]];
  ctx.strokeStyle="#60a5fa"; ctx.lineWidth=2; segs.forEach(([a,b])=>{ if(a&&b){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }});
}
function getKP(poses,name){ const kp=poses[0]?.keypoints||[]; return kp.find(p=>p.name===name&&p.score>=0.25); }
function angle(a,b,c){ if(!a||!b||!c) return null;
  const v1={x:a.x-b.x,y:a.y-b.y}, v2={x:c.x-b.x,y:c.y-b.y};
  const dot=v1.x*v2.x+v1.y*v2.y, n1=Math.hypot(v1.x,v1.y), n2=Math.hypot(v2.x,v2.y);
  if(!n1||!n2) return null;
  const cos=Math.max(-1,Math.min(1,dot/(n1*n2))); return Math.acos(cos)*180/Math.PI;
}

/* contagem + dicas */
function evaluateAndCount(poses){
  if(!poses.length){ msg(tr("comeCloser")); return; }
  const mode=exerciseSel.value;
  if(mode.startsWith("braco")) return evalArm(poses, mode==="braco_direito"?"right":"left");
  if(mode==="agachamento") return evalSquat(poses);
}

function evalArm(poses,side){
  const s=getKP(poses,`${side}_shoulder`), e=getKP(poses,`${side}_elbow`), w=getKP(poses,`${side}_wrist`);
  if(!s||!w){ msg(tr("showShoulderWrist")); return; }
  const dy=s.y-w.y; dySmooth=0.6*dySmooth+0.4*dy;
  const UP=18, DOWN=6;  // thresholds simples
  if(lastPhase==="down"&&dySmooth>=UP){ lastPhase="up"; }
  else if(lastPhase==="up"&&dySmooth<=DOWN){ countRep(); lastPhase="down"; }
  const ang=angle(s,e,w);
  if(lastPhase==="down"&&ang!==null&&ang<160) msg(tr("armExtend"));
  else if(lastPhase==="up"&&ang!==null&&ang>60) msg(tr("armUp"));
  else msg(tr("postureOK"));
}

function evalSquat(poses){
  const hip=getKP(poses,"left_hip")||getKP(poses,"right_hip");
  const knee=getKP(poses,"left_knee")||getKP(poses,"right_knee");
  const ankle=getKP(poses,"left_ankle")||getKP(poses,"right_ankle");
  if(!hip||!knee){ msg(tr("hipKnee")); return; }
  const depth=hip.y-knee.y; dySmooth=0.6*dySmooth+0.4*depth;
  const DOWN=8, UP=-6;
  if(lastPhase==="down"&&dySmooth>=DOWN){ lastPhase="up"; }
  else if(lastPhase==="up"&&dySmooth<=UP){ countRep(); lastPhase="down"; }
  if(depth<6) msg(tr("squatLower")); else msg(tr("postureOK"));
}

function countRep(){
  reps++; repsEl.textContent=reps;
  const goal = Math.max(1, parseInt(goalEl.value||"0",10));
  beep(120, 880); vibrate([60]);
  if(reps>=goal){ msg(tr("goalHit")); beep(180, 660); vibrate([100,60,100]); }
}

/* ---------- Histórico (localStorage) ---------- */
function loadSessions(){ try{ return JSON.parse(localStorage.getItem("sessions")||"[]"); }catch{ return []; } }
function saveSessions(a){ localStorage.setItem("sessions", JSON.stringify(a)); }

function saveSession(){
  const secs = startTime ? Math.floor((Date.now()-startTime)/1000) : 0;
  const dur = `${String(Math.floor(secs/60)).padStart(2,"0")}:${String(secs%60).padStart(2,"0")}`;
  const a = loadSessions();
  a.push({date:new Date().toLocaleString(), exercise:exerciseSel.value, reps, duration:dur});
  saveSessions(a);
  alert(tr("saved"));
}

function renderHistory(){
  const a=loadSessions(); histBody.innerHTML="";
  if(!a.length){ histBody.innerHTML=`<tr><td colspan="4">${tr("noData")}</td></tr>`; return; }
  a.forEach(s=>{
    const trEl=document.createElement("tr");
    trEl.innerHTML = `<td>${s.date}</td><td>${labelExercise(s.exercise)}</td><td>${s.reps}</td><td>${s.duration||"--:--"}</td>`;
    histBody.appendChild(trEl);
  });
}

function labelExercise(k){
  if(k==="braco_direito") return tr("rightArm");
  if(k==="braco_esquerdo") return tr("leftArm");
  if(k==="agachamento") return tr("squat");
  return k;
}

function exportCSV(){
  const a=loadSessions(); if(!a.length){ alert(tr("noData")); return; }
  const header="date,exercise,reps,duration\n";
  const rows=a.map(s=>`"${s.date}","${s.exercise}",${s.reps},"${s.duration||""}"`).join("\n");
  const blob=new Blob([header+rows],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const link=Object.assign(document.createElement("a"),{href:url,download:`sessions_${Date.now()}.csv`});
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  alert(tr("csvOK"));
}

/* ---------- Reset ---------- */
function resetAll(){
  resetCounters(); stopTimer(); startTimer(); // recomeça o cronómetro
  msg(tr("ready"));
}
