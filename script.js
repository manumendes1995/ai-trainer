// ---------- Navegação por abas ----------
const tabs = ["home","treinos","alim","camera","conta"];
function showTab(t){
  tabs.forEach(id=>{
    document.getElementById(id).classList.toggle("hidden", id!==t);
    document.querySelectorAll('nav a').forEach(a=>{
      a.classList.toggle("active", a.dataset.tab===t);
    });
  });
  history.replaceState(null,"","#"+t);
}
document.querySelectorAll('nav a[data-tab]').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    showTab(a.dataset.tab);
  });
});
showTab(location.hash.replace("#","") || "home");

// ---------- Treinos ----------
const elSexo = document.getElementById("sexo");
const elNivel = document.getElementById("nivel");
const outTreino = document.getElementById("treinoOut");

function cardDia(d){
  const li = d.exercicios.map(x=>`<li>${x}</li>`).join("");
  return `<div class="card">
    <h3>${d.dia}</h3>
    <p class="muted">${d.foco}</p>
    <ul>${li}</ul>
    <p class="muted"><b>Complemento:</b> ${d.complemento}</p>
  </div>`;
}

function renderTreino(){
  const sexo = elSexo.value;           // fem | masc
  const nivel = elNivel.value;         // iniciante | av1
  const plano = PLANOS[sexo][nivel];
  outTreino.innerHTML = plano.map(cardDia).join("");
}

document.getElementById("btnGerarTreino").addEventListener("click", renderTreino);
document.getElementById("btnCopiarTreino").addEventListener("click", ()=>{
  const txt = outTreino.textContent.trim();
  if(!txt){ alert("Gera o plano primeiro."); return; }
  navigator.clipboard.writeText(txt).then(()=>alert("Plano copiado!"));
});

// ---------- Alimentação ----------
const elPref = document.getElementById("pref");
const elKcal = document.getElementById("kcal");
const outAlim = document.getElementById("alimOut");

function renderAlim(){
  const pref = elPref.value;   // emagrecimento | hipertrofia | vegetariano
  const kcal = elKcal.value;   // 1600 | 2000 | 2400
  const lista = MEALS[pref][kcal] || [];
  if(!lista.length){ outAlim.innerHTML = `<div class="card">Sem dados para ${pref} (${kcal}).</div>`; return; }
  outAlim.innerHTML = lista.map(([refeicao,desc])=>`
    <div class="card">
      <h3>${refeicao}</h3>
      <p>${desc}</p>
    </div>`).join("");
}
document.getElementById("btnGerarAlim").addEventListener("click", renderAlim);
document.getElementById("btnCopiarAlim").addEventListener("click", ()=>{
  const txt = outAlim.textContent.trim();
  if(!txt){ alert("Gera o cardápio primeiro."); return; }
  navigator.clipboard.writeText(txt).then(()=>alert("Cardápio copiado!"));
});

// ---------- Câmara (modo cartaz sem IA para já) ----------
const video = document.getElementById("cam");
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");
const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");
const btnPoster = document.getElementById("btnPoster");
const statusEl = document.getElementById("status");
const tipEl = document.getElementById("tip");
const repsEl = document.getElementById("reps");
const goalEl = document.getElementById("goal");
const camStatus = document.getElementById("camStatus");

let stream = null, poster = false;

function fitCanvas(){
  overlay.width = video.videoWidth || 640;
  overlay.height = video.videoHeight || 480;
}

async function startCam(){
  try{
    btnStart.disabled = true;
    camStatus.textContent = "A pedir permissão…";
    stream = await navigator.mediaDevices.getUserMedia({ video:{facingMode:"user"} , audio:false });
    video.srcObject = stream;
    await video.play();
    video.classList.remove("hidden");
    overlay.classList.remove("hidden");
    fitCanvas();
    statusEl.textContent = "online";
    camStatus.textContent = "A transmitir";
    tipEl.textContent = "Modo Cartaz esconde UI — ideal para apresentar.";
    drawFrame();
  }catch(err){
    camStatus.textContent = "Falha: " + err.message;
    statusEl.textContent = "erro";
    btnStart.disabled = false;
  }
}
function stopCam(){
  if(stream){
    stream.getTracks().forEach(t=>t.stop());
    stream = null;
  }
  video.classList.add("hidden");
  overlay.classList.add("hidden");
  statusEl.textContent = "offline";
  camStatus.textContent = "Parado";
  btnStart.disabled = false;
}
function drawFrame(){
  if(!stream) return;
  ctx.clearRect(0,0,overlay.width,overlay.height);
  // Ornamento simples “IA”
  ctx.strokeStyle = "rgba(124,77,255,.7)";
  ctx.lineWidth = 4;
  ctx.strokeRect(20,20,overlay.width-40,overlay.height-40);
  requestAnimationFrame(drawFrame);
}
btnStart.addEventListener("click", startCam);
btnStop.addEventListener("click", stopCam);
btnPoster.addEventListener("click", ()=>{
  poster = !poster;
  document.querySelector(".toolbar").style.display = poster? "none":"flex";
  tipEl.textContent = poster ? "Modo Cartaz ativo — toca no ecrã para sair." :
                               "Modo Cartaz desligado.";
});

// ---------- Conta (simples localStorage) ----------
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const signupMsg = document.getElementById("signupMsg");
document.getElementById("btnSignup").addEventListener("click", ()=>{
  const n = (nome.value||"").trim();
  const e = (email.value||"").trim();
  if(!n || !e || !e.includes("@")){ signupMsg.textContent = "Preenche nome e email válido."; return; }
  localStorage.setItem("ai.user", JSON.stringify({n,e,ts:Date.now()}));
  signupMsg.textContent = "Inscrição registada (simulada). Verificação por email é ativada na versão com servidor.";
});

// Pagamentos (demonstração nesta build)
document.getElementById("btnMensal").addEventListener("click", ()=> alert("Checkout real requer servidor (Stripe)."));
document.getElementById("btnAnual").addEventListener("click", ()=> alert("Checkout real requer servidor (Stripe)."));

// Ao abrir por hash direto
window.addEventListener("load", ()=>{
  const t = (location.hash||"#home").replace("#","");
  showTab(tabs.includes(t)?t:"home");
});
