// Planos base (alterados/autorais) — 5 dias por semana
// Feminino prioriza membros inferiores/booty sem repetir grupo em dias seguidos
// Masculino prioriza superiores (peito/costas/ombros/braços) sem repetir em dias seguidos

const PLANOS = {
  fem: {
    iniciante: [
      { dia: "Dia 1 — Inferiores A", foco: "Glúteos & Quadríceps",
        exercicios: [
          "Agachamento com peso corporal — 3x12",
          "Avanço alternado — 3x10 por perna",
          "Elevação pélvica — 3x12",
          "Abdução em pé (elástico opcional) — 2x15"
        ],
        complemento: "Core leve (30 seg prancha x 3)"
      },
      { dia: "Dia 2 — Superiores A", foco: "Costas & Ombros",
        exercicios: [
          "Remada inclinada com mochila — 3x12",
          "Elevação lateral — 3x12",
          "Push-up joelhos — 3x8",
          "Face pull elástico — 2x15"
        ],
        complemento: "Caminhada 20–30 min"
      },
      { dia: "Dia 3 — Inferiores B", foco: "Posterior & Glúteos",
        exercicios: [
          "Deadlift romeno leve — 3x10",
          "Passada atrás (reverse lunge) — 3x10 por perna",
          "Step-up baixo — 3x12",
          "Panturrilha em pé — 3x15"
        ],
        complemento: "Alongamentos 8–10 min"
      },
      { dia: "Dia 4 — Superiores B", foco: "Peito & Braços",
        exercicios: [
          "Supino chão (garrafas) — 3x12",
          "Press acima da cabeça — 3x10",
          "Bíceps curl — 3x12",
          "Tríceps banco — 3x10"
        ],
        complemento: "Core leve (hollow hold 3x20s)"
      },
      { dia: "Dia 5 — Full & Cardio", foco: "Corpo inteiro + cardio leve",
        exercicios: [
          "Agacha + press — 3x12",
          "Remada unilateral — 3x12 por lado",
          "Good morning elástico — 3x12",
          "Saltitos no lugar — 3x30s"
        ],
        complemento: "Caminhada rápida 25–35 min"
      }
    ],
    av1: [
      { dia: "Dia 1 — Glúteo ênfase", foco: "Glúteos/Quadríceps",
        exercicios: [
          "Agachamento goblet — 4x10",
          "Passada búlgaro — 3x10 por perna",
          "Elevação pélvica unil. — 3x12 por perna",
          "Cadeira adutora elástico — 3x15"
        ],
        complemento: "Prancha 3x40s"
      },
      { dia: "Dia 2 — Costas/Ombros", foco: "Costas/Ombros",
        exercicios: [
          "Remada curvada — 4x10",
          "Puxada elástico alto — 3x12",
          "Desenvolvimento — 3x10",
          "Elevação lateral pausa — 3x12"
        ],
        complemento: "Cardio 20 min Z2"
      },
      { dia: "Dia 3 — Posterior forte", foco: "Posterior/Glúteos",
        exercicios: [
          "RDL carregado — 4x8–10",
          "Passada caminhada — 3x12",
          "Glute bridge com pausa — 4x10",
          "Panturrilha sentada — 3x18"
        ],
        complemento: "Mobilidade 10 min"
      },
      { dia: "Dia 4 — Peito/Braços", foco: "Peito/Braços",
        exercicios: [
          "Supino com pausa — 4x8–10",
          "Flexão + apoio — 3xAMRAP",
          "Rosca alternada — 3x12",
          "Tríceps francês — 3x12"
        ],
        complemento: "Core (side plank 3x30s)"
      },
      { dia: "Dia 5 — Full + HIIT leve", foco: "Full body",
        exercicios: [
          "Agacha + remada — 3x12",
          "Swing leve (halter) — 3x15",
          "Clean high pull leve — 3x10",
          "HIIT 6x30s/60s"
        ],
        complemento: "Alongar 10 min"
      }
    ]
  },

  masc: {
    iniciante: [
      { dia: "Dia 1 — Peito", foco: "Peito + tríceps",
        exercicios: [
          "Supino chão (garrafas) — 3x12",
          "Flexão inclinada — 3x8–10",
          "Crucifixo chão — 3x12",
          "Tríceps banco — 3x10"
        ],
        complemento: "Caminhada 20–30 min"
      },
      { dia: "Dia 2 — Costas", foco: "Costas + bíceps",
        exercicios: [
          "Remada curvada — 3x12",
          "Puxada elástico — 3x12",
          "Remo unilateral — 3x12 por lado",
          "Rosca direta — 3x12"
        ],
        complemento: "Core leve 3x30s"
      },
      { dia: "Dia 3 — Pernas A", foco: "Quadríceps/Glúteo",
        exercicios: [
          "Agachamento goblet — 3x12",
          "Passada alternada — 3x10 por perna",
          "Elevação pélvica — 3x12",
          "Panturrilha — 3x15"
        ],
        complemento: "Alongar 8 min"
      },
      { dia: "Dia 4 — Ombros", foco: "Ombros + trapézio",
        exercicios: [
          "Desenvolvimento — 3x10",
          "Elevação lateral — 3x12",
          "Elevação frontal — 3x12",
          "Encolhimento — 3x12"
        ],
        complemento: "Cardio leve 15–20 min"
      },
      { dia: "Dia 5 — Pernas B", foco: "Posterior",
        exercicios: [
          "RDL leve — 3x10",
          "Passada atrás — 3x10 por perna",
          "Good morning elástico — 3x12",
          "Panturrilha sentada — 3x18"
        ],
        complemento: "Mobilidade 10 min"
      }
    ],
    av1: [
      { dia: "Dia 1 — Peito forte", foco: "Peito/Tríceps",
        exercicios: [
          "Supino com pausa — 4x8–10",
          "Flexões — 4xAMRAP",
          "Crucifixo inclinado — 3x12",
          "Tríceps francês — 3x12"
        ],
        complemento: "Core 3x40s"
      },
      { dia: "Dia 2 — Costas densas", foco: "Costas/Bíceps",
        exercicios: [
          "Remada curvada — 4x10",
          "Puxada alta — 4x10",
          "Remo unilateral — 3x12",
          "Bíceps alternado — 3x12"
        ],
        complemento: "Cardio Z2 20 min"
      },
      { dia: "Dia 3 — Pernas A", foco: "Quad/Glúteo",
        exercicios: [
          "Agacha goblet — 4x10",
          "Passada búlgaro — 3x10 por perna",
          "Elevação pélvica — 4x10",
          "Panturrilha — 3x18"
        ],
        complemento: "Mobilidade 10 min"
      },
      { dia: "Dia 4 — Ombros/Trap", foco: "Ombros/Trapézio",
        exercicios: [
          "Desenvolvimento — 4x8–10",
          "Elevação lateral pausa — 4x12",
          "Face pull — 3x15",
          "Encolhimento — 3x12"
        ],
        complemento: "Core lateral 3x30s"
      },
      { dia: "Dia 5 — Pernas B", foco: "Posterior",
        exercicios: [
          "RDL — 4x8–10",
          "Passada caminhada — 3x12",
          "Good morning — 3x12",
          "Panturrilha — 4x15"
        ],
        complemento: "Alongar 10 min"
      }
    ]
  }
};

// Cardápios simples (exemplos)
const MEALS = {
  emagrecimento: {
    "1600": [
      ["Peq-almoço","Iogurte/Skyr + fruta + aveia"],
      ["Almoço","Peito frango + salada + batata doce"],
      ["Lanche","Queijo fresco + nozes"],
      ["Jantar","Peixe branco + legumes salteados"]
    ],
    "2000": [
      ["Peq-almoço","Ovos mexidos + pão integral + fruta"],
      ["Almoço","Peru grelhado + arroz + salada"],
      ["Lanche","Iogurte grego + frutos secos"],
      ["Jantar","Salmão + batata + brócolos"]
    ],
    "2400": [
      ["Peq-almoço","Panquecas aveia + fruta + iogurte"],
      ["Almoço","Carne magra + massa integral + legumes"],
      ["Lanche","Tosta integral + queijo/fiambre"],
      ["Jantar","Atum + arroz + salada"]
    ]
  },
  hipertrofia: {
    "2000": [
      ["Peq-almoço","Omelete 3 ovos + pão + fruta"],
      ["Almoço","Carne bovina magra + arroz + feijão"],
      ["Lanche","Batido whey + banana + aveia"],
      ["Jantar","Salmão + massa integral + legumes"]
    ],
    "2400": [
      ["Peq-almoço","Skyr + granola + mel + fruta"],
      ["Almoço","Frango + arroz + azeite + salada"],
      ["Lanche","Pão integral + manteiga de amendoim"],
      ["Jantar","Peixe + batata + legumes"]
    ]
  },
  vegetariano: {
    "1600": [
      ["Peq-almoço","Iogurte vegetal + granola + fruta"],
      ["Almoço","Tofu grelhado + quinoa + legumes"],
      ["Lanche","Húmus + palitos legumes"],
      ["Jantar","Feijão + arroz + salada"]
    ],
    "2000": [
      ["Peq-almoço","Papinha aveia + sementes + fruta"],
      ["Almoço","Grão-de-bico + arroz + legumes"],
      ["Lanche","Skyr vegetal + frutos secos"],
      ["Jantar","Ovos/queijo + batata + legumes"]
    ]
  }
};
