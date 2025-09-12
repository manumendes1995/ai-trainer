const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const { plan } = JSON.parse(event.body);

    let priceId;
    if(plan === "mensal") priceId = process.env.PRICE_ID_MENSAL;
    if(plan === "anual")  priceId = process.env.PRICE_ID_ANUAL;

    if(!priceId){
      return { statusCode: 400, body: "Plano inválido" };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.PUBLIC_URL}/?success=true`,
      cancel_url: `${process.env.PUBLIC_URL}/?canceled=true`
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Erro interno" };
  }
};
