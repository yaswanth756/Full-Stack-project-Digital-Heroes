/* POST /api/stripe/webhook — Handle Stripe webhook events */
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase/server";
import { hashPassword, signToken } from "@/lib/auth";
import Stripe from "stripe";

// Disable body parsing — Stripe needs raw body for signature verification
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("Webhook signature error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const db = createServerClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};

      const { userId, plan, charityId, charityPercentage, name, email } = metadata;

      // If userId exists, subscriber already exists — just activate subscription
      if (userId) {
        const selectedPlan = plan === "yearly" ? "yearly" : "monthly";
        const price = selectedPlan === "monthly" ? 9.99 : 89.99;
        const renewalDate = new Date();
        if (selectedPlan === "monthly") {
          renewalDate.setMonth(renewalDate.getMonth() + 1);
        } else {
          renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        }

        // Update subscription status to active
        const { data: existingSub } = await db
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (existingSub) {
          await db.from("subscriptions").update({
            status: "active",
            plan: selectedPlan,
            price,
            renewal_date: renewalDate.toISOString().split("T")[0],
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
          }).eq("user_id", userId);
        } else {
          await db.from("subscriptions").insert({
            user_id: userId,
            plan: selectedPlan,
            status: "active",
            price,
            start_date: new Date().toISOString().split("T")[0],
            renewal_date: renewalDate.toISOString().split("T")[0],
          });
        }

        // Send notification
        await db.from("notifications").insert({
          user_id: userId,
          type: "subscription",
          title: "Payment Confirmed! ✅",
          message: `Your ${selectedPlan} subscription payment of £${price} has been processed successfully.`,
        });

        // Refresh platform stats
        try { await db.rpc("refresh_platform_stats"); } catch {}
      }

      break;
    }

    case "checkout.session.expired": {
      // Handle expired sessions if needed
      console.log("Checkout session expired:", event.data.object);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
