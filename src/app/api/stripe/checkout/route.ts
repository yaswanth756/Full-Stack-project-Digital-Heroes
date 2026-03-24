/* POST /api/stripe/checkout — Create a Stripe Checkout session */
import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email, name, charityId, charityPercentage } = await req.json();

    const selectedPlan = plan === "yearly" ? "yearly" : "monthly";
    const planConfig = PLANS[selectedPlan];

    // Use request origin so it works on both localhost and Vercel
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const appUrl = origin.replace(/\/$/, ""); // strip trailing slash

    // Create a Stripe Checkout session with one-time payment
    // (For recurring, you'd use mode: "subscription" with priceId from Stripe dashboard)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Softly Golf — ${planConfig.name} Plan`,
              description: planConfig.description,
              images: [],
            },
            unit_amount: Math.round(planConfig.price * 100), // Stripe uses pence
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        plan: selectedPlan,
        charityId: charityId || "",
        charityPercentage: String(charityPercentage || 10),
        name: name || "",
        email: email || "",
      },
      success_url: `${appUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/signup?cancelled=true`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: unknown) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
