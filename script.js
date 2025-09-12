// AI Trainer – script principal (defensivo: só atua se os elementos existirem)
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // =========================
  // Navegação por separadores
  // =========================
  function showTab(tab) {
    const tabs = ["home", "workout", "nutrition", "camera", "account"];
    tabs.forEach(id => {
      const sec = document.getElementById(id);
      if (sec) sec.style.display = (id === tab ? "block" : "none");
      const link = document.querySelector(`nav a[data-tab="${id}"]`);
      if (link) link.classList.toggle("active", id === tab);
    });
    // Hash na URL (para abrir direto)
    if (history.replaceState) {
      history.replaceState(null, "", "#" + tab);
    } else {
      location.hash = "#" + tab;
    }
  }

  // ligar cliques do nav
  $$("#nav a[data-tab]").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showTab(a.dataset.tab);
    });
  });

  // abrir tab inicial conforme hash
  const startTab = (location.hash || "#home").replace("#", "");
  showTab(["home", "workout", "nutrition", "camera", "account"].includes(startTab) ? startTab : "home");

  // =========================
  // Gerador de Treino (simples)
  // =========================
  const formT = $("#formTreino");
  const outT  = $("#treinoOut");
  const btnGT = $("#btnGerarTreino");
  const btnCT = $("#btnCopiarTreino");

  if (btnGT && formT && outT) {
    btnGT.addEventListener("click", () => {
      const sexo     = formT.sexo?.value || "indefinido";
      const objetivo = formT.objetivo?.value || "recomposição";
      const dias     = Number(formT.dias?.value || 3);
      const nivel    = formT.nivel?.value || "iniciante";
      const equips   = $$("#equipamentos input[type=checkbox]:checked").map(i => i.value);

      // sugerir divisão simples por dias
      const divisoes = {
        2: ["Full Body A", "Full Body B"],
        3: ["Empurrar", "Puxar", "Pernas"],
        4: ["Superior A", "Inferior A", "Superior B", "Inferior B"],
        5: ["Empurrar", "Puxar", "Pernas", "Ombros/Braços", "Full Body leve"]
      };
      const split = divisoes[dias] || divisoes[3];

      const baseEx = {
        "Empurrar": ["Supino", "Flexões", "Desenvolvimento Ombros", "Tríceps corda"],
        "Puxar": ["Remada", "Puxada Frente", "Face Pull", "Bíceps rosca"],
        "Pernas": ["Agachamento", "Levantamento Terra Romeno", "Passada", "Panturrilha"],
        "Superior A": ["Supino", "Remada", "Desenvolvimento", "Bíceps", "Tríceps"],
        "Inferior A": ["Agachamento", "Mesa Flexora", "Panturrilha", "Prancha"],
        "Superior B": ["Inclinado", "Puxada", "Elevação Lateral", "Bíceps", "Tríceps"],
        "Inferior B": ["Leg Press", "RDL", "Passada", "Core"],
        "Full Body A": ["Agachamento", "Supino", "Remada", "Prancha"],
        "Full Body B": ["Terra Romeno", "Desenvolvimento", "Puxada", "Core"],
        "Ombros/Braços": ["Desenvolvimento", "Elevação Lateral", "Rosca", "Tríceps"]
      };

      const linhas = [];
      linhas.push(`# Plano de Treino (${dias}x/semana) – ${nivel}`);
      linhas.push(`Objetivo: ${objetivo} | Sexo: ${sexo}`);
      linhas.push(`Equipamentos: ${equips.length ? equips.join(", ") : "Peso corporal / básicos"}`);
      linhas.push("");

      split.forEach((dia, i) => {
        linhas.push(`Dia ${i + 1} – ${dia}`);
        const lista = baseEx[dia] || ["Exercícios compostos", "Acessórios", "Core"];
        lista.forEach(ex => linhas.push(`• ${ex} — 3×8–12`));
        linhas.push("");
      });

      linhas.push("Notas:");
      linhas.push("• Aumenta peso quando fizeres 12 reps com boa técnica.");
      linhas.push("• Descanso 60–90s acessório / 90–120s composto.");
      linhas.push("• Aquecimento 5–10 min e alongamentos leves no final.");

      outT.value = linhas.join("\n");
      showToast("Plano de treino gerado!");
    });
  }

  if (btnCT && outT) {
    btnCT.addEventListener("click", async () => {
      await navigator.clipboard.writeText(outT.value || "");
      showToast("Plano copiado!");
    });
  }

  // =========================
  // Gerador de Alimentação (simples)
  // =========================
  const formA = $("#formAlim");
  const outA  = $("#alimOut");
  const btnGA = $("#btnGerarAlim");
  const btnCA = $("#btnCopiarAlim");

  if (btnGA && formA && outA) {
    btnGA.addEventListener("click", () => {
      const sexo = formA.sexoA?.value || "f";
      const peso = Number(formA.peso?.value || 70);
      const alt  = Number(formA.altura?.value || 170);
      const id   = Number(formA.idade?.value || 30);
      const obj  = formA.objAlim?.value || "perder";
      const pref = formA.pref?.value || "omni";
      const atv  = Number(formA.atividade?.value || 1.4);

      // Mifflin-St Jeor
      const tmb = sexo === "m"
        ? (10 * peso + 6.25 * alt - 5 * id + 5)
        : (10 * peso + 6.25 * alt - 5 * id - 161);
      let tdee = tmb * atv;
      if (obj === "perder") tdee -= 400;
      if (obj === "ganhar") tdee += 300;
      const kcal = Math.round(tdee);

      // macros (aprox.)
      const prot = Math.round(peso * 1.8);
      const gord = Math.round(peso * 0.8);
      const carb = Math.max(0, Math.round((kcal - prot * 4 - gord * 9) / 4));

      const ideias = {
        omni: [
          "Peq: Iogurte/Skyr + granola",
          "Alm: Frango + arroz + salada",
          "Jant: Peixe + batata + legumes",
          "Snack: Fruta + frutos secos"
        ],
        veg: [
          "Peq: Aveia + bebida vegetal + fruta",
          "Alm: Tofu + arroz/batata + salada",
          "Jant: Feijão/lentilha + legumes + pão/arepa",
          "Snack: Iogurte vegetal + nozes"
        ],
        lowcarb: [
          "Peq: Ovos mexidos + abacate",
          "Alm: Carne/Tofu + salada + azeite",
          "Jant: Peixe + legumes salteados",
          "Snack: Queijo/Skyr + nozes"
        ]
      };
      const lista = ideias[pref] || ideias.omni;

      const linhas = [];
      linhas.push(`# Alimentação – Diretrizes (${kcal} kcal/dia)`);
      linhas.push(`Macros alvo ~ P: ${prot}g | G: ${gord}g | C: ${carb}g`);
      linhas.push("");
      lista.forEach(l => linhas.push("• " + l));
      linhas.push("");
      linhas.push("Dicas:");
      linhas.push("• Prioriza proteína em cada refeição.");
      linhas.push("• Verduras/fibra diariamente.");
      linhas.push("• Água: 30–35 ml/kg/dia.");

      outA.value = linhas.join("\n");
      showToast("Plano de alimentação gerado!");
    });
  }

  if (btnCA && outA) {
    btnCA.addEventListener("click", async () => {
      await navigator.clipboard.writeText(outA.value || "");
      showToast("Cardápio copiado!");
    });
  }

  // =========================
  // Câmara (getUserMedia básico)
  // =========================
  const video = $("#camera");
  const canvas = $("#overlay");
  const btnStartCam = $("#btnStartCam");
  const btnStopCam  = $("#btnStopCam");
  const btnSnap     = $("#btnSnap");
  const linkPhoto   = $("#downloadPhoto");
  let mediaStream = null;

  if (btnStartCam && video) {
    btnStartCam.addEventListener("click", async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        video.srcObject = mediaStream;
        await video.play();
        showToast("Câmara ligada!");
      } catch (e) {
        console.error(e);
        alert("Não consegui aceder à câmara. Permite no navegador/telemóvel.");
      }
    });
  }

  if (btnStopCam) {
    btnStopCam.addEventListener("click", () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
        video && (video.srcObject = null);
        showToast("Câmara desligada.");
      }
    });
  }

  if (btnSnap && video && canvas && linkPhoto) {
    btnSnap.addEventListener("click", () => {
      try {
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, w, h);
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          linkPhoto.href = url;
          linkPhoto.download = `foto-${Date.now()}.png`;
          linkPhoto.classList.remove("hidden");
          showToast("Foto capturada! Usa o botão 'Guardar foto'.");
        }, "image/png", 0.92);
      } catch (e) {
        console.error(e);
        alert("Não foi possível tirar a foto agora.");
      }
    });
  }

  // =========================
  // Toast simples (mensagens)
  // =========================
  function showToast(msg = "OK") {
    let t = $("#toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.style.cssText = `
        position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
        background: #121a35; color: #eaf1ff; padding: 10px 14px; border-radius: 12px;
        border: 1px solid #1b2858; z-index: 9999; box-shadow: 0 6px 24px rgba(0,0,0,.35);
        transition: opacity .2s ease;
      `;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(t._h);
    t._h = setTimeout(() => (t.style.opacity = "0"), 1800);
  }

  // =========================
  // Registo do Service Worker (se ainda não registaste no HTML)
  // =========================
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("SW registado ✅"))
      .catch(() => console.warn("SW falhou a registar."));
  }
});
