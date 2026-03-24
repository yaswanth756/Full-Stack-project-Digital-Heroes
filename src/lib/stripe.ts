/* ─── Stripe Configuration ─── */
import Stripe from "stripe";

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
  typescript: true,
});

// Subscription plan configuration
export const PLANS = {
  monthly: {
    name: "Monthly",
    price: 9.99,
    interval: "month" as const,
    description: "Monthly subscription — cancel anytime",
  },
  yearly: {
    name: "Yearly",
    price: 89.99,
    interval: "year" as const,
    description: "Yearly subscription — save 25%",
  },
} as const;

export type PlanId = keyof typeof PLANS;
