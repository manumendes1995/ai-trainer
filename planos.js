/* =========
   PLANOS MENSAIS (30 dias)
   - Sem “5 dias/semana” no título. É um calendário mensal de 30 dias.
   - Feminino e Masculino DIFERENTES.
   - “Dia 1…Dia 30”, com dias de descanso/mobilidade já indicados.
   - Repetições mudam quando repete grupo (variação).
   ========= */

const EXS = {
  fem: {
    fullLowerA: [
      "Agachamento com halter — 4x10",
      "Afundo (passada à frente) — 3x12 por perna",
      "Elevação pélvica (pausa no topo) — 4x12",
      "Cadeira extensora (elástico) — 3x15",
      "Cadeira abdutora (elástico) — 3x15",
      "Panturrilha em pé — 4x18",
      "Prancha — 3x40s"
    ],
    fullLowerB: [
      "Levantamento romeno (halter) — 4x10",
      "Afundo para trás — 3x12 por perna",
      "Elevação pélvica unilateral — 3x10 por perna",
      "Flexora caseira (elástico) — 3x15",
      "Good morning (elástico) — 3x15",
      "Panturrilha sentada — 4x15",
      "Prancha lateral — 3x30s por lado"
    ],
    upperA: [
      "Remada curvada — 4x10",
      "Puxada alta (elástico) — 3x12",
      "Elevação lateral — 3x14",
      "Press militar — 3x10",
      "Face pull (elástico) — 3x15",
      "Flexão inclinada — 3xAMRAP",
      "Core hollow — 3x25s"
    ],
    upperB: [
      "Supino no chão — 4x10",
      "Crucifixo no chão — 3x12",
      "Tríceps banco — 3x12",
      "Bíceps alternado — 3x12",
      "Rosca martelo — 2x15",
      "Remada unilateral — 3x12 por lado",
      "HIIT 6x30s/60s"
    ],
    metabolic: [
      "Agacha + press — 4x12",
      "Swing (halter leve) — 4x15",
      "Remada renegade leve — 3x10 por lado",
      "Escalador — 3x30s",
      "Burpee moderado — 3x10",
      "Abd infra — 3x12"
    ]
  },
  masc: {
    // Prioridade superiores, mas SEM treinar o mesmo músculo em dias seguidos
    chestTriA: [
      "Supino halter — 4x8–10",
      "Supino inclinado — 3x10",
      "Crucifixo — 3x12",
      "Tríceps testa — 3x10",
      "Tríceps corda/elástico — 3x12",
      "Elevação lateral — 3x14",
      "Panturrilha — 4x15"
    ],
    backBiA: [
      "Remada curvada — 4x8–10",
      "Puxada aberta — 3x10",
      "Remada unilateral — 3x12 por lado",
      "Bíceps barra/halters — 3x10",
      "Rosca martelo — 3x12",
      "Face pull — 3x15",
      "Abd prancha — 3x40s"
    ],
    legsA: [
      "Agachamento — 4x8–10",
      "Leg (elástico/faixa) — 3x12",
      "Romeno — 3x10",
      "Afundo búlgaro — 3x10 por perna",
      "Extensora caseira — 3x15",
      "Panturrilha — 4x18"
    ],
    chestTriB: [
      "Supino com pausa — 4x6–8",
      "Crossover elástico — 3x15",
      "Flexão declinada — 3xAMRAP",
      "Tríceps banco — 3x12",
      "Tríceps corda/elástico — 3x12",
      "Elevação frontal — 3x12",
      "Abd infra — 3x15"
    ],
    backBiB: [
      "Levantamento terra técnico (moderado) — 4x5",
      "Remada T (improviso) — 3x10",
      "Puxada supinada — 3x10",
      "Bíceps alternado — 3x12",
      "Rosca concentrada — 2x12",
      "Face pull — 3x15",
      "Prancha lateral — 3x30s por lado"
    ],
    legsB: [
      "Agachamento frontal (halter) — 4x8",
      "RDL — 3x10",
      "Passada em deslocamento — 3x12 por perna",
      "Good morning — 3x15",
      "Flexora caseira — 3x15",
      "Panturrilha sentada — 4x15"
    ]
  }
};

// Gera 30 dias a partir de um “ciclo” de 5–6 templates, inserindo descansos.
function gera30Dias(templates, ordem, descanso="Descanso / Mobilidade leve 15–20 min") {
  const dias = [];
  let idx = 0;
  for (let d=1; d<=30; d++) {
    // regra: 5 dias ON, 1 dia OFF (6º ou 7º conforme encaixe)
    const bloco = d % 6 === 0 ? "off" : "on";
    if (bloco === "off") {
      dias.push({ dia: `Dia ${d}`, foco: "Recuperação", exercicios: [descanso] });
    } else {
      const key = ordem[idx % ordem.length];
      dias.push({ dia: `Dia ${d}`, foco: key, exercicios: templates[key] });
      idx++;
    }
  }
  return dias;
}

const PLANOS_MENSAL = {
  fem: {
    iniciante: gera30Dias(EXS.fem, ["fullLowerA","upperA","fullLowerB","upperB","metabolic"]),
    avancado1: gera30Dias(EXS.fem, ["fullLowerA","upperA","fullLowerB","upperB","metabolic"])
  },
  masc: {
    iniciante: gera30Dias(EXS.masc, ["chestTriA","legsA","backBiA","chestTriB","legsB"]),
    avancado1: gera30Dias(EXS.masc, ["chestTriA","backBiA","legsA","chestTriB","backBiB"])
  }
};

/* =========
   CARDÁPIOS com QUANTIDADES (inclui HIPERTROFIA preenchido)
   Diferenciações simples F/M por calorias típicas.
   ========= */

const MEALS = {
  fem: {
    emagrecimento: {
      "1600": [
        ["Peq-almoço","170g iogurte/Skyr + 80g fruta + 30g aveia"],
        ["Almoço","120g frango grelhado + 150g salada + 100g batata-doce"],
        ["Lanche","100g queijo fresco + 20g nozes"],
        ["Jantar","150g peixe branco + 200g legumes salteados"]
      ],
      "1800": [
        ["Peq-almoço","2 ovos (100g) + 2 fatias pão + 100g fruta"],
        ["Almoço","150g peru + 100g arroz + 150g salada"],
        ["Lanche","170g iogurte grego + 20g amêndoas"],
        ["Jantar","160g salmão + 150g batata + 150g brócolos"]
      ]
    },
    hipertrofia: {
      "2000": [
        ["Peq-almoço","200g Skyr + 40g granola + 100g fruta"],
        ["Almoço","180g frango + 120g arroz + 10ml azeite + 150g salada"],
        ["Lanche","30g whey + 1 banana (100g) + 40g aveia"],
        ["Jantar","180g salmão + 100g massa integral + 150g legumes"]
      ],
      "2200": [
        ["Peq-almoço","3 ovos (150g) + 2 fatias pão + 10g manteiga amendoim"],
        ["Almoço","180g carne magra + 120g arroz + 100g feijão"],
        ["Lanche","170g iogurte + 25g frutos secos + 1 fruta (120g)"],
        ["Jantar","200g peixe + 150g batata + 200g legumes"]
      ]
    },
    vegetariano: {
      "1600": [
        ["Peq-almoço","170g iogurte vegetal + 40g granola + 100g fruta"],
        ["Almoço","150g tofu + 100g quinoa + 150g legumes"],
        ["Lanche","40g húmus + 150g palitos de legumes"],
        ["Jantar","150g feijão + 100g arroz + 150g salada"]
      ]
    }
  },
  masc: {
    emagrecimento: {
      "2000": [
        ["Peq-almoço","3 ovos (150g) + 2 fatias pão + 100g fruta"],
        ["Almoço","200g frango + 100g arroz + 150g salada"],
        ["Lanche","170g iogurte grego + 25g nozes"],
        ["Jantar","200g peixe branco + 200g legumes"]
      ],
      "2200": [
        ["Peq-almoço","200g Skyr + 50g granola + 100g fruta"],
        ["Almoço","200g peru + 120g batata-doce + 150g salada"],
        ["Lanche","30g whey + 1 banana + 40g aveia"],
        ["Jantar","200g carne magra + 150g legumes"]
      ]
    },
    hipertrofia: {
      "2600": [
        ["Peq-almoço","4 ovos (200g) + 2 fatias pão + 10g azeite"],
        ["Almoço","220g carne bovina magra + 120g arroz + 100g feijão"],
        ["Lanche","200g iogurte + 40g granola + 1 fruta (120g)"],
        ["Jantar","220g salmão + 120g massa integral + 200g legumes"]
      ],
      "2800": [
        ["Peq-almoço","250g Skyr + 60g granola + 100g fruta + 10g mel"],
        ["Almoço","220g frango + 150g arroz + 10ml azeite + 150g salada"],
        ["Lanche","2 tostas integrais + 40g manteiga de amendoim + 1 fruta"],
        ["Jantar","220g peixe + 150g batata + 200g legumes"]
      ]
    },
    vegetariano: {
      "2000": [
        ["Peq-almoço","60g aveia + 250ml bebida vegetal + 20g sementes + 100g fruta"],
        ["Almoço","200g grão-de-bico + 120g arroz + 150g legumes"],
        ["Lanche","200g iogurte vegetal + 25g frutos secos"],
        ["Jantar","2 ovos (100g) ou 80g queijo + 150g batata + 200g legumes"]
      ]
    }
  }
};

/* =========
   Helper simples para o UI já existente
   ========= */
function getPlanoMensal(sexo, nivel) {
  const s = (sexo === "masc") ? "masc" : "fem";
  const n = (nivel === "avancado1") ? "avancado1" : "iniciante";
  return PLANOS_MENSAL[s][n];
}

function getCardapio(sexo, objetivo, kcal) {
  const s = (sexo === "masc") ? "masc" : "fem";
  const o = MEALS[s][objetivo];
  if (!o) return [];
  return o[kcal] || [];
}

// Exporta para o script principal (se necessário)
window.PLANOS_MENSAL = PLANOS_MENSAL;
window.getPlanoMensal = getPlanoMensal;
window.getCardapio = getCardapio;
