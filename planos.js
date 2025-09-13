// Planos autorais — 5 dias/semana
// Feminino: 7+ exercícios/dia. Masculino: divisão solicitada, ~1h e sem repetir o mesmo grupo em dias seguidos.
// Quando repete (peito+tríceps no Dia 5), mudamos exercícios em relação ao Dia 1.

const PLANOS = {
  fem: {
    iniciante: [
      { dia: "Dia 1 — Inferiores A", foco: "Glúteos & Quadríceps",
        exercicios: [
          "Agachamento peso corporal — 3x12",
          "Passada alternada — 3x10 p/perna",
          "Elevação pélvica — 3x12",
          "Abdução em pé (elástico) — 3x15",
          "Leg press caseiro (faixa) — 3x12",
          "Cadeira extensora caseira (elástico) — 2x15",
          "Panturrilha em pé — 3x18"
        ],
        complemento: "Core leve (prancha 3x30s)"
      },
      { dia: "Dia 2 — Superiores A", foco: "Costas & Ombros",
        exercicios: [
          "Remada curvada — 3x12",
          "Puxada elástico alto — 3x12",
          "Elevação lateral — 3x12",
          "Press acima da cabeça — 3x10",
          "Face pull elástico — 3x15",
          "Remada unilateral — 3x12 por lado",
          "Push-up joelhos — 3x8–10"
        ],
        complemento: "Caminhada 20–30 min"
      },
      { dia: "Dia 3 — Inferiores B", foco: "Posterior e Glúteos",
        exercicios: [
          "RDL leve — 3x10",
          "Passada atrás — 3x10 p/perna",
          "Good morning elástico — 3x12",
          "Elevação pélvica unil. — 3x10 p/perna",
          "Step-up — 3x12",
          "Cadeira flexora caseira (elástico) — 3x12",
          "Panturrilha sentada — 3x18"
        ],
        complemento: "Alongamentos 8–10 min"
      },
      { dia: "Dia 4 — Superiores B", foco: "Peito & Braços",
        exercicios: [
          "Supino no chão (garrafas) — 3x12",
          "Flexão inclinada — 3xAMRAP",
          "Crucifixo chão — 3x12",
          "Bíceps alternado — 3x12",
          "Tríceps banco — 3x10",
          "Rosca martelo — 2x15",
          "Fundos entre cadeiras (assistido) — 2x8–10"
        ],
        complemento: "Core (hollow hold 3x20s)"
      },
      { dia: "Dia 5 — Full + Cardio", foco: "Corpo inteiro",
        exercicios: [
          "Agacha + press — 3x12",
          "Remada unilateral — 3x12 p/lado",
          "Swing leve (halter) — 3x15",
          "Clean high pull leve — 3x10",
          "Panturrilha — 3x18",
          "Abd infra (pernas elevadas) — 3x12",
          "HIIT 6x30s/60s"
        ],
        complemento: "Alongar 10 min"
      }
    ],
    av1: [
      { dia: "Dia 1 — Glúteos ênfase", foco: "Glúteos/Quadríceps",
        exercicios: [
          "Agachamento goblet — 4x10",
          "Búlgaro — 4x10 p/perna",
          "Elevação pélvica com pausa — 4x10",
          "Cadeira adutora elástico — 3x15",
          "Leg press elástico — 3x12",
          "Extensora caseira — 3x15",
          "Panturrilha — 4x15"
        ],
        complemento: "Prancha 3x40s"
      }
      // … (mantém os outros dias como antes)
    ]
  },
  masc: {
    // … (mantém todos os treinos masculinos como já enviei antes)
  }
};

// Cardápios simples (agora com QUANTIDADES)
const MEALS = {
  emagrecimento: {
    "1600": [
      ["Peq-almoço","170g Iogurte/Skyr + 80g fruta + 30g aveia"],
      ["Almoço","120g Peito frango + 150g salada + 100g batata doce"],
      ["Lanche","100g Queijo fresco + 20g nozes"],
      ["Jantar","150g Peixe branco + 200g legumes salteados"]
    ],
    "2000": [
      ["Peq-almoço","3 ovos mexidos + 2 fatias pão integral + 100g fruta"],
      ["Almoço","150g Peru grelhado + 120g arroz + 150g salada"],
      ["Lanche","170g Iogurte grego + 25g frutos secos"],
      ["Jantar","180g Salmão + 150g batata + 200g brócolos"]
    ],
    "2400": [
      ["Peq-almoço","2 Panquecas aveia (80g aveia) + 100g fruta + 150g iogurte"],
      ["Almoço","180g Carne magra + 100g massa integral + 200g legumes"],
      ["Lanche","2 tostas integrais + 40g queijo/fiambre"],
      ["Jantar","150g Atum + 100g arroz + 150g salada"]
    ]
  },
  hipertrofia: {
    "2000": [
      ["Peq-almoço","3 ovos (150g) omelete + 2 fatias pão + 100g fruta"],
      ["Almoço","180g Carne bovina magra + 120g arroz + 100g feijão"],
      ["Lanche","30g Whey + 1 banana (100g) + 40g aveia"],
      ["Jantar","180g Salmão + 100g massa integral + 150g legumes"]
    ],
    "2400": [
      ["Peq-almoço","200g Skyr + 40g granola + 10g mel + 100g fruta"],
      ["Almoço","200g Frango + 150g arroz + 10ml azeite + 150g salada"],
      ["Lanche","2 fatias pão integral + 30g manteiga de amendoim"],
      ["Jantar","200g Peixe + 150g batata + 200g legumes"]
    ]
  },
  vegetariano: {
    "1600": [
      ["Peq-almoço","170g Iogurte vegetal + 40g granola + 100g fruta"],
      ["Almoço","150g Tofu grelhado + 100g quinoa + 150g legumes"],
      ["Lanche","40g Húmus + 150g palitos legumes"],
      ["Jantar","150g Feijão + 100g arroz + 150g salada"]
    ],
    "2000": [
      ["Peq-almoço","50g Aveia + 200ml bebida vegetal + 20g sementes + 100g fruta"],
      ["Almoço","150g Grão-de-bico + 120g arroz + 150g legumes"],
      ["Lanche","170g Skyr vegetal + 25g frutos secos"],
      ["Jantar","2 ovos ou 60g queijo + 150g batata + 200g legumes"]
    ]
  }
};
