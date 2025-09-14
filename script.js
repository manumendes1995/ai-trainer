/* Liga os botões “Gerar Treino” e “Gerar Alimentação” ao novo planos.js */
(function(){
  // Seletores (ajusta os IDs se os teus forem outros)
  const sexoSel = document.getElementById("sexoSel");        // "fem" | "masc"
  const nivelSel = document.getElementById("nivelSel");      // "iniciante" | "avancado1"
  const objSel   = document.getElementById("objetivoSel");   // "emagrecimento" | "hipertrofia" | "vegetariano"
  const kcalSel  = document.getElementById("kcalSel");       // "1600" | "2000" | "2600" etc.
  const treinoOut = document.getElementById("treinoOut");    // <pre> ou <div>
  const alimOut   = document.getElementById("alimOut");      // <pre> ou <div>

  const btnTreino = document.getElementById("btnGerarTreino");
  const btnAlim   = document.getElementById("btnGerarAlim");

  function renderTreino(){
    const sexo = (sexoSel?.value || "fem");
    const nivel = (nivelSel?.value || "iniciante");
    const plano = window.getPlanoMensal ? window.getPlanoMensal(sexo, nivel) : [];
    if(!plano || !plano.length){
      treinoOut.textContent = "Sem plano para esta combinação.";
      return;
    }
    const linhas = plano.map(d => {
      const exs = d.exercicios.map(e => `• ${e}`).join("\n");
      return `${d.dia} — ${d.foco}\n${exs}`;
    }).join("\n\n");
    treinoOut.textContent = linhas;
  }

  function renderAlim(){
    const sexo = (sexoSel?.value || "fem");
    const obj  = (objSel?.value || "emagrecimento");
    const kcal = (kcalSel?.value || "2000");
    const lista = window.getCardapio ? window.getCardapio(sexo, obj, kcal) : [];
    if(!lista || !lista.length){
      alimOut.textContent = "Sem cardápio para esta combinação.";
      return;
    }
    const txt = lista.map(([refe,desc]) => `• ${refe}: ${desc}`).join("\n");
    alimOut.textContent = `Objetivo: ${obj} • ${kcal} kcal\n\n${txt}`;
  }

  btnTreino?.addEventListener("click", renderTreino);
  btnAlim?.addEventListener("click", renderAlim);

  // Slogan da home (“Junta-te a milhões de inscritos”)
  const pitch = document.getElementById("heroPitch");
  if(pitch){ pitch.textContent = "Junta-te a milhões de inscritos — experimenta 7 dias grátis!"; }

})();
