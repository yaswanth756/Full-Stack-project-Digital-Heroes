"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "£9.99",
    period: "/month",
    features: [
      "Enter every monthly draw",
      "Track 5 rolling Stableford scores",
      "10% minimum to your chosen charity",
      "User dashboard & winnings tracker",
      "Cancel anytime",
    ],
    cta: "Start Monthly",
    highlight: false,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "£89.99",
    period: "/year",
    badge: "Save 25%",
    features: [
      "All monthly features included",
      "12 months of draw entries secured",
      "Boost your charity percentage anytime",
      "Priority winner verification",
      "Early access to new features",
    ],
    cta: "Start Yearly",
    highlight: true,
  },
];

export default function Pricing() {
  const router = useRouter();

  return (
    <section id="pricing" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blob-pink rounded-full blur-[150px] opacity-30 -z-10" />

      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-[56px] tracking-tight text-ink leading-tight mb-4">
            Simple, honest{" "}
            <span className="font-cursive text-5xl md:text-[72px] text-coral inline-block rotate-[-1deg]">
              pricing
            </span>
          </h2>
          <p className="text-muted max-w-md mx-auto text-lg mt-4">
            No hidden fees. A portion of every subscription goes to charity and
            the prize pool — transparently.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.12, ease }}
              className={`rounded-[2rem] p-8 border transition-all duration-300 relative ${
                plan.highlight
                  ? "bg-ink text-cream border-ink shadow-2xl shadow-ink/10"
                  : "bg-white text-ink border-stone-200 hover:shadow-lg"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-6 bg-coral text-ink text-xs font-semibold px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-lg font-medium tracking-tight mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-medium">{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? "text-cream/50" : "text-muted"}`}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        plan.highlight ? "text-coral" : "text-emerald-500"
                      }`}
                    />
                    <span className={plan.highlight ? "text-cream/80" : "text-muted"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push(`/signup?plan=${plan.id}`)}
                className={`w-full py-3.5 rounded-full font-medium text-sm flex items-center justify-center gap-2 group transition-transform hover:scale-[1.02] active:scale-100 ${
                  plan.highlight
                    ? "bg-coral text-ink"
                    : "bg-ink text-cream"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Pool Breakdown */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h4 className="text-sm font-medium uppercase tracking-widest text-muted mb-4">Where Your Subscription Goes</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-stone-50">
                <div className="text-2xl font-medium text-ink mb-1">40%</div>
                <div className="text-xs text-muted">Prize Pool</div>
              </div>
              <div className="p-4 rounded-xl bg-stone-50">
                <div className="text-2xl font-medium text-ink mb-1">10-50%</div>
                <div className="text-xs text-muted">Your Charity</div>
              </div>
              <div className="p-4 rounded-xl bg-stone-50">
                <div className="text-2xl font-medium text-ink mb-1">Rest</div>
                <div className="text-xs text-muted">Platform Ops</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
