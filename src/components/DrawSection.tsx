"use client";

import { motion } from "framer-motion";
import { Trophy, Zap, Heart } from "lucide-react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function DrawSection() {
  const tiers = [
    {
      match: "5-Number Match",
      share: "40%",
      rollover: true,
      label: "Jackpot",
      icon: <Trophy className="w-5 h-5" />,
      accent: "bg-coral/10 text-coral border-coral/20",
    },
    {
      match: "4-Number Match",
      share: "35%",
      rollover: false,
      label: "Tier 2",
      icon: <Zap className="w-5 h-5" />,
      accent: "bg-amber-50 text-amber-600 border-amber-200/40",
    },
    {
      match: "3-Number Match",
      share: "25%",
      rollover: false,
      label: "Tier 3",
      icon: <Heart className="w-5 h-5" />,
      accent: "bg-lavender text-violet-600 border-violet-200/40",
    },
  ];

  return (
    <section className="py-28 relative overflow-hidden bg-white/40">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-[56px] tracking-tight text-ink leading-tight mb-4">
            The monthly{" "}
            <span className="font-cursive text-5xl md:text-[72px] text-coral inline-block rotate-[-1deg]">
              draw
            </span>
          </h2>
          <p className="text-muted max-w-lg mx-auto text-lg mt-4">
            Every month, your 5 scores become your entries. Match them against
            the draw to win a share of the prize pool. No jackpot winner? It
            rolls over.
          </p>
        </motion.div>

        {/* Prize Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.match}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease }}
              className={`rounded-[2rem] p-7 border transition-all duration-300 hover:shadow-lg cursor-default ${tier.accent}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
                  {tier.icon}
                </div>
                <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                  {tier.label}
                </span>
              </div>
              <h3 className="text-xl font-medium text-ink tracking-tight mb-1">
                {tier.match}
              </h3>
              <div className="text-3xl font-medium text-ink mt-3">{tier.share}</div>
              <p className="text-sm text-muted mt-2">
                of prize pool{tier.rollover ? " · Rolls over monthly" : ""}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Jackpot Counter */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="bg-ink rounded-[2rem] p-8 md:p-12 text-center glow"
        >
          <p className="text-cream/60 text-xs tracking-[0.2em] uppercase mb-3">
            Current Jackpot Pool
          </p>
          <div className="font-cursive text-[72px] md:text-[96px] text-coral leading-none">
            £4,820
          </div>
          <p className="text-cream/50 mt-4 max-w-md mx-auto text-sm">
            Split equally among all 5-match winners. If unclaimed, the full
            amount carries forward to next month&apos;s draw.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
