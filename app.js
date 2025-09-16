// app.js - controla navegação e interações do AI Trainer

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("y");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const pageLabel = document.getElementById("pageLabel");
  const links = Array.from(document.querySelectorAll(".nav a"));

  function setLabel(txt) {
    if (pageLabel) pageLabel.textContent = txt;
  }

  // Atualiza label ao clicar em links
  links.forEach((a) => {
    a.addEventListener("click", () => {
      links.forEach((x) => x.classList.remove("active"));
      a.classList.add("active");
      setLabel(a.dataset.label || a.textContent.trim());
    });
  });

  // Observa seções para atualizar label automaticamente
  const map = {
    inicio: "Início",
    treinos: "Treinos",
    alimentacao: "Alimentação",
    cardio: "Cardio / HIIT",
    conta: "Conta",
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          const label = map[id] || "Início";
          setLabel(label);
          links.forEach((x) =>
            x.classList.toggle(
              "active",
              x.getAttribute("href") === "#" + id
            )
          );
        }
      });
    },
    { threshold: 0.6 }
  );

  Object.keys(map).forEach((id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });
});
