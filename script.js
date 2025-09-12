// =============================
// Navegação por separadores
// =============================
(function initTabs() {
  const links = Array.from(document.querySelectorAll("nav a"));
  function activate(tab) {
    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${tab}`));
    // scroll suave para a secção
    const el = document.querySelector(tab);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    // foco especial: se for a câmara, mostramos dica
    if (tab === "#camera") {
      const tip = document.getElementById("tip");
      if (tip) tip.textContent = "Dica: permite a câmara e posiciona-te centrado";
    }
  }
  function onHash() {
    const h = location.hash || "#home";
    activate(h);
  }
  links.forEach(a => a.addEventListener("click", e => {
    e.preventDefault();
    const h = a.getAttribute("href");
    history.replaceState(null, "", h);
    activate(h);
  }));
  window.addEventListener("hashchange", onHash);
  onHash();
})();

// =============================
// Utilitários
// =============================
function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).then(
    () => alert("Copiado!"),
    () => alert("Não consegui copiar — copia manualmente, por favor.")
  );
}

// =============================
// Gerador de Treinos (simples)
// =============================
(function initTreinos() {
  const sexo = document.getElementById("sexo");
  const gordura = document.getElementById("gordura");
  const objetivo = document.getElementById("objetivo");
  const out = document.getElementById("treinoOut");
  const btnGerar = document.getElementById("btnGerarTreino");
  const btnCopiar = document.getElementById("btnCopiarTreino");
  if (!sexo || !gordura || !objetivo || !out) return;

  function planoBase(obj) {
    const base = {
      "Hipertrofia": [
        "A: Agachamento 4x8–10 • Supino reto 4x8–10 • Remada 4x8–10 • Elevação lateral 3x12",
        "B: Levant. terra 4x6–8 • Barra fixa 4x6–8 • Desenvolvimento 4x8–10 • Rosca 3x12",
        "C: Lunge 4x10 • Supino inclinado 4x8–10 • Remada curvada 4x8–10 • Tríceps 3x12"
      ],
      "Definição": [
        "Circuito 1 (3–4 voltas): Agachamento 15 • Flexões 12 • Remada elástico 15 • Prancha 45s",
        "HIIT 15–20min: 20s forte / 40s leve (bicicleta, corrida, corda)",
        "Full-body 3x/sem: padrão empurrar/ puxar/ pernas, 12–15 reps"
      ],
      "Perda de peso": [
        "Caminhada vigorosa 40–60min 5–6x/sem",
        "Treino força 2–3x/sem: Agachamento, Remada, Flexões, Levant. terra — 3x10–12",
        "Core 3x/sem: Prancha 3x45–60s • Bird-dog 3x12 • Dead bug 3x12"
      ]
    };
    return base[obj] || base["Perda de peso"];
  }

  btnGerar?.addEventListener("click", () => {
    const s = sexo.value;
    const g = Number(gordura.value || 0);
    const obj = objetivo.value;
    const recomend = [];
    // micro-ajustes simples
    if (g >= 30) recomend.push("• Prioriza passos diários (>8.000) e treino de força 2–3x/sem.");
    if (s === "Feminino") recomend.push("• Foca em padrão de empurrar/puxar/pernas + glúteos 2x/sem.");
    if (obj === "Hipertrofia") recomend.push("• Superávit calórico leve (+200 a +300 kcal).");
    if (obj === "Definição" || obj === "Perda de peso") recomend.push("• Déficit moderado (300–500 kcal) e 7–9k passos/dia.");

    const plano = planoBase(obj).map((linha, i) => `${i+1}. ${linha}`).join("\n");
    out.textContent =
`Plano de Treino — ${obj}
Sexo: ${s} • Gordura: ${g}%

${plano}

Notas:
${recomend.join("\n") || "• Mantém consistência e progressão semanal."}`;
  });

  btnCopiar?.addEventListener("click", () => {
    if (!out.textContent.trim()) return alert("Gera primeiro o plano.");
    copyToClipboard(out.textContent);
  });
})();

// =============================
// Plano Alimentar (simples)
// =============================
(function initAlimentacao() {
  const pref = document.getElementById("pref");
  const kcal = document.getElementById("kcal");
  const out = document.getElementById("alimOut");
  const btnGerar = document.getElementById("btnGerarAlim");
  const btnCopiar = document.getElementById("btnCopiarAlim");
  if (!pref || !kcal || !out) return;

  const cardapios = {
    "Omnívoro": [
      "Peq: Ovos mexidos + pão/aveia + fruta",
      "Almoço: Frango/peixe + arroz/batata + legumes",
      "Lanche: Iogurte grego + fruta + frutos secos",
      "Jantar: Carne/peixe + salada + azeite"
    ],
    "Vegetariano": [
      "Peq: Iogurte/Skyr vegetal + granola",
      "Almoço: Tofu/tempeh + arroz/quinoa + salada",
      "Lanche: Smoothie proteína vegetal + banana",
      "Jantar: Omelete/queijo + legumes + batata"
    ],
    "Low Carb": [
      "Peq: Ovos + abacate",
      "Almoço: Carne/peixe + salada + azeite",
      "Lanche: Iogurte grego + nozes",
      "Jantar: Peixe + legumes salteados"
    ]
  };

  btnGerar?.addEventListener("click", () => {
    const p = pref.value;
    const k = Number(kcal.value || 2000);
    const lista = cardapios[p] || cardapios["Omnívoro"];
    out.textContent =
`Plano Alimentar (${p}) — alvo ≈ ${k} kcal

${lista.map((l,i)=>`${i+1}. ${l}`).join("\n")}

Notas:
• Proteína 1.6–2.2 g/kg/dia
• Água 30–35 ml/kg/dia
• Ajusta por fome/saciedade e progresso`;
  });

  btnCopiar?.addEventListener("click", () => {
    if (!out.textContent.trim()) return alert("Gera primeiro o plano.");
    copyToClipboard(out.textContent);
  });
})();

// =============================
// Câmara (controlos básicos)
// =============================
(function initCamera() {
  const v = document.getElementById("camera");
  const overlay = document.getElementById("overlay");
  const statusEl = document.getElementById("status");
  const tipEl = document.getElementById("tip");
  const btnStart = document.getElementById("btnStart");
  const btnStop = document.getElementById("btnStop");
  const btnPhoto = document.getElementById("btnPhoto");
  const btnRecord = document.getElementById("btnRecord");
  const btnDownload = document.getElementById("btnDownload");
  if (!v || !overlay) return;

  let stream = null;
  let mediaRec = null;
  let chunks = [];
  let lastBlob = null;

  function setStatus(t) { if (statusEl) statusEl.textContent = t; }
  function setTip(t) { if (tipEl) tipEl.textContent = t; }

  async function start() {
    try {
      setStatus("A abrir câmara…");
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      v.srcObject = stream;
      await v.play();
      resizeCanvas();
      setStatus("Câmara ativa");
      setTip("Posiciona-te ao centro. Boa luz ajuda muito!");
    } catch (e) {
      console.error(e);
      alert("Não consegui aceder à câmara. Dá permissão no browser.");
      setStatus("Erro na câmara");
    }
  }

  function stop() {
    mediaRec?.state === "recording" && mediaRec.stop();
    stream?.getTracks().forEach(t => t.stop());
    stream = null;
    v.srcObject = null;
    setStatus("Parado");
  }

  function resizeCanvas() {
    const c = overlay;
    const rect = v.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.floor(rect.width * dpr);
    c.height = Math.floor(rect.height * dpr);
    c.style.width = rect.width + "px";
    c.style.height = rect.height + "px";
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // limpar overlay
    ctx.clearRect(0,0,c.width,c.height);
  }
  window.addEventListener("resize", resizeCanvas);

  function takePhoto() {
    if (!v.videoWidth) return alert("Liga a câmara primeiro.");
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    c.toBlob(b => {
      if (!b) return alert("Falhou a foto");
      lastBlob = b;
      const url = URL.createObjectURL(b);
      btnDownload.dataset.href = url;
      btnDownload.textContent = "⬇️ Download (foto)";
      setStatus("Foto capturada");
    }, "image/jpeg", 0.92);
  }

  function toggleRecord() {
    if (!stream) return alert("Liga a câmara primeiro.");
    if (mediaRec && mediaRec.state === "recording") {
      mediaRec.stop();
      setStatus("A finalizar gravação…");
      return;
    }
    chunks = [];
    mediaRec = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRec.ondataavailable = e => e.data.size && chunks.push(e.data);
    mediaRec.onstop = () => {
      lastBlob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(lastBlob);
      btnDownload.dataset.href = url;
      btnDownload.textContent = "⬇️ Download (vídeo)";
      setStatus("Gravação concluída");
    };
    mediaRec.start();
    setStatus("A gravar…");
  }

  function download() {
    const href = btnDownload.dataset.href;
    if (!href) return alert("Nada para descarregar ainda.");
    const a = document.createElement("a");
    a.href = href;
    a.download = href.includes("video") ? "ai-trainer-video.webm" : "ai-trainer-foto.jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  btnStart?.addEventListener("click", start);
  btnStop?.addEventListener("click", stop);
  btnPhoto?.addEventListener("click", takePhoto);
  btnRecord?.addEventListener("click", toggleRecord);
  btnDownload?.addEventListener("click", download);
})();

// =============================
// Pagamentos (chama função Netlify)
// =============================
async function subscribe(plan) {
  try {
    const res = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    const data = await res.json();
    if (data.url) location.href = data.url;
    else alert(data.error || "Erro ao criar checkout");
  } catch (e) {
    console.error(e);
    alert("Falha de rede no checkout");
  }
}
