// ===== Seletores
const video = document.getElementById("video");
const treinoOut = document.getElementById("treinoOut");
const alimOut = document.getElementById("alimOut");

// ===== Funções de Navegação (tabs)
const tabs = ["home","treinos","alimentacao","camera"];
document.querySelectorAll("nav a").forEach(a=>{
  a.addEventListener("click", ev=>{
    ev.preventDefault();
    const tab = a.getAttribute("href").substring(1);
    tabs.forEach(t=>{
      document.getElementById(t)?.style.setProperty("display", t===tab?"block":"none");
      document.querySelector(`nav a[href="#${t}"]`)?.classList.remove("active");
    });
    a.classList.add("active");
  });
});

// ===== Gerar Treino
function gerarTreino(){
  const sexo = document.getElementById("sexo").value;
  const gordura = document.getElementById("gordura").value;
  const objetivo = document.getElementById("objetivo").value;

  let plano = `Plano para ${sexo}, gordura ${gordura}%\nObjetivo: ${objetivo}\n\n`;
  if(objetivo==="Hipertrofia"){
    plano += "- Treino A: Supino, Agachamento, Remada, Desenvolvimento\n";
    plano += "- Treino B: Levantamento Terra, Barra Fixa, Ombros, Abdómen\n";
  } else if(objetivo==="Definição"){
    plano += "- Circuitos HIIT + musculação moderada\n";
    plano += "- Cardio 20-30 min pós treino\n";
  } else {
    plano += "- Treino Fullbody 3x/semana\n";
    plano += "- Cardio leve 2x/semana\n";
  }
  treinoOut.textContent = plano;
}

// ===== Gerar Alimentação
function gerarAlim(){
  const pref = document.getElementById("pref").value;
  const kcal = document.getElementById("kcal").value;

  let cardapio = `Cardápio (${kcal} kcal alvo)\nPreferência: ${pref}\n\n`;

  if(pref==="Omnívoro"){
    cardapio += "- Pequeno-almoço: Ovos + aveia + fruta\n";
    cardapio += "- Almoço: Frango + arroz integral + legumes\n";
    cardapio += "- Jantar: Salmão + batata doce + salada\n";
  } else if(pref==="Vegetariano"){
    cardapio += "- Pequeno-almoço: Iogurte/Skyr + granola\n";
    cardapio += "- Almoço: Tofu + arroz + salada\n";
    cardapio += "- Jantar: Wrap de feijão + legumes\n";
  } else {
    cardapio += "- Pequeno-almoço: Ovos mexidos + abacate\n";
    cardapio += "- Almoço: Carne + salada + azeite\n";
    cardapio += "- Jantar: Peixe grelhado + legumes salteados\n";
  }

  alimOut.textContent = cardapio;
}

// ===== Abrir Câmara
async function abrirCamera(){
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:false });
    video.srcObject = stream;
  } catch(err){
    alert("Permissão de câmara negada ou não disponível.");
    console.error(err);
  }
}
