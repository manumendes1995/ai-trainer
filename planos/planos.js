// planos.js
// Estrutura dos treinos e planos de alimentação
// Alterado para diferenciar feminino/masculino e não repetir músculos seguidos

const planos = {
  feminino: {
    iniciante: {
      "Dia 1": [
        "Agachamento livre - 3x12",
        "Glúteo em quatro apoios - 3x15",
        "Prancha abdominal - 3x30s",
      ],
      "Dia 2": [
        "Flexão de braços adaptada - 3x10",
        "Remada elástica - 3x12",
        "Prancha lateral - 3x20s",
      ],
      "Dia 3": [
        "Afundo alternado - 3x12",
        "Ponte de glúteos - 3x15",
        "Elevação de pernas - 3x12",
      ],
    },
    avancado: {
      "Dia 1": [
        "Agachamento sumô com peso - 4x12",
        "Avanço com passada longa - 3x12",
        "Elevação pélvica com carga - 3x15",
      ],
      "Dia 2": [
        "Supino reto com halteres - 4x10",
        "Remada curvada - 4x12",
        "Prancha dinâmica - 3x40s",
      ],
      "Dia 3": [
        "Stiff com halteres - 4x12",
        "Cadeira abdutora (elástico) - 3x15",
        "Abdominal infra - 3x15",
      ],
      "Dia 4": [
        "Elevação lateral - 4x12",
        "Rosca direta - 3x12",
        "Tríceps testa - 3x12",
      ],
      "Dia 5": [
        "Agachamento búlgaro - 4x12",
        "Glúteo kickback - 4x15",
        "Abdominal bicicleta - 3x20",
      ],
    },
  },
  masculino: {
    iniciante: {
      "Dia 1": [
        "Supino reto com halteres - 3x12",
        "Flexão de braços - 3x12",
        "Abdominal infra - 3x15",
      ],
      "Dia 2": [
        "Agachamento livre - 3x15",
        "Afundo alternado - 3x12",
        "Prancha abdominal - 3x30s",
      ],
      "Dia 3": [
        "Remada elástica - 3x12",
        "Desenvolvimento de ombros - 3x12",
        "Prancha lateral - 3x20s",
      ],
    },
    avancado: {
      "Dia 1": [
        "Supino reto barra - 4x10",
        "Crucifixo inclinado - 3x12",
        "Tríceps mergulho - 3x12",
      ],
      "Dia 2": [
        "Agachamento livre com barra - 4x10",
        "Levantamento terra - 4x8",
        "Panturrilha em pé - 3x20",
      ],
      "Dia 3": [
        "Barra fixa - 4x6",
        "Remada curvada - 4x10",
        "Rosca direta - 3x12",
      ],
      "Dia 4": [
        "Desenvolvimento militar - 4x10",
        "Elevação lateral - 4x12",
        "Encolhimento de ombros - 3x15",
      ],
      "Dia 5": [
        "Stiff - 4x12",
        "Agachamento sumô - 4x10",
        "Abdominal bicicleta - 3x20",
      ],
    },
  },
  alimentacao: {
    emagrecimento: [
      "Pequeno almoço: Ovos mexidos + abacate",
      "Almoço: Frango grelhado + salada",
      "Lanche: Iogurte natural + nozes",
      "Jantar: Peixe grelhado + legumes",
    ],
    hipertrofia: [
      "Pequeno almoço: Panquecas de aveia + whey",
      "Almoço: Carne vermelha + arroz integral",
      "Lanche: Batata doce + frango desfiado",
      "Jantar: Salmão + quinoa + legumes",
    ],
    vegetariano: [
      "Pequeno almoço: Tofu mexido + pão integral",
      "Almoço: Quinoa + feijão + salada",
      "Lanche: Iogurte vegetal + sementes",
      "Jantar: Grão de bico + legumes assados",
    ],
    lactante: [
      "Pequeno almoço: Leite + pão integral + ovo cozido",
      "Almoço: Frango grelhado + arroz + feijão",
      "Lanche: Fruta + iogurte natural",
      "Jantar: Sopa rica em legumes + peixe",
    ],
  },
};

// Função para exibir treinos
function mostrarTreino(sexo, nivel) {
  const plano = planos[sexo]?.[nivel];
  if (!plano) return "Plano não encontrado.";
  return Object.entries(plano)
    .map(([dia, exercicios]) => {
      return `<h3>${dia}</h3><ul>${exercicios
        .map((ex) => `<li>${ex}</li>`)
        .join("")}</ul>`;
    })
    .join("");
}

// Função para exibir cardápios
function mostrarAlimentacao(tipo) {
  const plano = planos.alimentacao[tipo];
  if (!plano) return "Plano não encontrado.";
  return `<ul>${plano.map((ref) => `<li>${ref}</li>`).join("")}</ul>`;
}
