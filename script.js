const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const btn = document.getElementById("btnStart");

let ticker = 0;
let anim;

btn.addEventListener("click", async () => {
  btn.disabled = true;
  statusEl.textContent = "A abrir a câmara…";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    video.srcObject = stream;
    await video.play();
    statusEl.textContent = "Câmara aberta. A testar overlay…";
    tick();
  } catch (e) {
    statusEl.textContent = "Erro: " + e.message;
    btn.disabled = false;
  }
});

function tick() {
  anim = requestAnimationFrame(tick);
  ticker++;

  // limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // quadrado vermelho a mexer
  const x = 20 + (ticker % 200);
  ctx.fillStyle = "rgba(255,0,0,0.6)";
  ctx.fillRect(x, 20, 60, 60);

  // texto de prova de vida
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(10, 420, 200, 30);
  ctx.fillStyle = "#fff";
  ctx.font = "16px system-ui";
  ctx.fillText("Overlay ativo ✔", 20, 440);
}