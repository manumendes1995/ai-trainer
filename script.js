// ===== Seletores básicos (iguais aos IDs no index.html)
const $ = (s) => document.querySelector(s);

const video = $("#camera");          // <video id="camera">
const canvas = $("#overlay");        // <canvas id="overlay">
const ctx = canvas ? canvas.getContext("2d") : null;

const btnStart = $("#btnStart");
const btnStop = $("#btnStop");
const btnSnap = $("#btnSnap");
const btnRecord = $("#btnRecord");
const btnDownload = $("#btnDownload");
const statusEl = $("#status");
const swStateEl = $("#swState");

let stream = null;
let mediaRecorder = null;
let recordedChunks = [];
let rafId = 0;

// -------- Utils UI --------
function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
  console.log(msg);
}

// -------- Câmara --------
async function openCamera() {
  try {
    // iOS/Safari requer gesto do utilizador (clique num botão)
    // e HTTPS. O Netlify é HTTPS, por isso ok.
    setStatus("A pedir acesso à câmara…");

    const constraints = {
      audio: false,
      video: {
        facingMode: "user", // "environment" para traseira
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    await video.play();
    setStatus("Câmara ligada ✅");

    // Ajusta o canvas ao vídeo
    if (canvas && ctx) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    // (Opcional) loop de desenho leve (ex. moldura/grade)
    cancelAnimationFrame(rafId);
    const loop = () => {
      if (ctx && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // desenhar uma pequena borda suave
        ctx.strokeStyle = "rgba(255,255,255,.2)";
        ctx.lineWidth = 2;
        ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

  } catch (err) {
    console.error(err);
    setStatus("Permissão negada ou indisponível.");
    alert("Não foi possível aceder à câmara. Verifica as permissões do browser.");
  }
}

function stopCamera() {
  cancelAnimationFrame(rafId);
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  if (video) {
    video.pause();
    video.srcObject = null;
  }
  setStatus("Câmara desligada.");
}

// -------- Foto --------
function takePhoto() {
  if (!video || !canvas || !ctx || !stream) {
    return alert("Liga a câmara primeiro.");
  }
  // garantir tamanho
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // baixar como PNG
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "ai-trainer-foto.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setStatus("Foto guardada.");
}

// -------- Gravação de vídeo --------
function startRecording() {
  if (!stream) return alert("Liga a câmara primeiro.");
  recordedChunks = [];
  try {
    mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
  } catch {
    // fallback
    mediaRecorder = new MediaRecorder(stream);
  }

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: recordedChunks[0]?.type || "video/webm" });
    const url = URL.createObjectURL(blob);
    btnDownload.dataset.url = url;
    btnDownload.classList.remove("hidden");
    setStatus("Gravação concluída. Clique em ‘Descarregar vídeo’."); 
  };

  mediaRecorder.start();
  setStatus("A gravar vídeo…");
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
}

function downloadVideo() {
  const url = btnDownload?.dataset?.url;
  if (!url) return;
  const a = document.createElement("a");
  a.href = url;
  a.download = "ai-trainer-video.webm";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setStatus("Vídeo descarregado.");
}

// -------- Ligações de botões --------
btnStart?.addEventListener("click", openCamera);
btnStop?.addEventListener("click", stopCamera);
btnSnap?.addEventListener("click", takePhoto);
btnRecord?.addEventListener("click", () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    startRecording();
    btnRecord.textContent = "Parar gravação";
  } else {
    stopRecording();
    btnRecord.textContent = "Gravar vídeo";
  }
});
btnDownload?.addEventListener("click", downloadVideo);

// -------- SW estado (opcional) --------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (swStateEl) swStateEl.textContent = reg ? "SW ok" : "SW off";
  });
}
