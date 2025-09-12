// netlify/functions/billing.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Método não permitido" };
    }

    const { plan } = JSON.parse(event.body || "{}");

    let priceId;
    if (plan === "mensal") priceId = process.env.PRICE_ID_MENSAL;   // ex.: price_1999_gbp_xxx
    if (plan === "anual")  priceId = process.env.PRICE_ID_ANUAL;    // ex.: price_19999_gbp_xxx

    if (!priceId) {
      return { statusCode: 400, body: "Plano inválido ou PRICE_ID em falta" };
    }

    const base = process.env.PUBLIC_URL || "";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/sucesso.html`,
      cancel_url: `${base}/cancelado.html`,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Erro no billing:", err);
    return { statusCode: 500, body: "Erro interno" };
  }
};
