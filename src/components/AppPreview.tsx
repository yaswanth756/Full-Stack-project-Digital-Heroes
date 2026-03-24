"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function AppPreview() {
  return (
    <section className="py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
        {/* Heading */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-[56px] tracking-tight text-ink leading-tight mb-4">
            Experience{" "}
            <span className="font-cursive text-5xl md:text-[72px] text-coral inline-block rotate-[-2deg] -translate-y-1">
              designed
            </span>
            <br />
            for golfers who give.
          </h2>
          <p className="text-muted max-w-lg mx-auto text-lg mt-6">
            Simple score entry. Transparent charity giving. A monthly draw that
            keeps you coming back.
          </p>
        </motion.div>

        {/* Stacked Phone Mockups */}
        <div className="relative w-full max-w-[900px] h-[620px] md:h-[680px] mx-auto flex items-start justify-center">
          {/* Left Phone — Charity */}
          <motion.div
            initial={{ y: 120, opacity: 0, x: 40, rotate: -4 }}
            whileInView={{ y: 48, opacity: 0.8, x: -140, rotate: -6 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease, delay: 0.1 }}
            className="absolute z-10 w-[240px] md:w-[280px] h-[480px] md:h-[580px] bg-sage rounded-[3rem] border-[7px] border-white shadow-2xl overflow-hidden hidden md:block"
          >
            <div className="p-7 flex flex-col h-full">
              <div className="w-14 h-1 mt-3 mx-auto rounded-full bg-ink/10" />
              <div className="mt-10 text-center">
                <h3 className="font-medium text-ink/80 text-lg tracking-tight mb-1">
                  Your Charity
                </h3>
                <p className="text-sm text-muted">Giving: 15% of subscription</p>
              </div>
              <div className="mt-8 space-y-3">
                {["Hope Foundation", "Green Future", "Youth Shelter"].map(
                  (name, i) => (
                    <div
                      key={i}
                      className="h-14 flex items-center bg-white/50 rounded-2xl px-4 gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center text-xs font-semibold text-ink/40">
                        {name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-ink/70">
                          {name}
                        </div>
                        <div className="text-xs text-muted">Active</div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>

          {/* Center Phone — Score Entry */}
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            whileInView={{ y: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease }}
            className="absolute z-30 w-[280px] md:w-[300px] h-[540px] md:h-[620px] bg-white rounded-[3rem] border-[7px] border-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            <div className="p-7 flex flex-col items-center justify-center h-full gap-6 relative">
              <div className="absolute top-5 w-14 h-1 rounded-full bg-ink/5" />
              <div className="text-center">
                <h3 className="text-muted text-xs tracking-[0.2em] uppercase mb-2">
                  Latest Score
                </h3>
                <div className="font-cursive text-[56px] text-ink leading-none">
                  38
                </div>
                <div className="text-sm text-muted mt-1">Stableford points</div>
              </div>

              {/* Pulsing Submit Button */}
              <div className="w-[160px] h-[160px] rounded-full bg-coral/10 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full bg-coral/20 animate-pulse-ring" />
                <div className="w-[120px] h-[120px] rounded-full bg-coral flex items-center justify-center shadow-lg shadow-coral/30 cursor-pointer hover:scale-105 transition-transform duration-500">
                  <span className="font-medium text-white tracking-[0.15em] text-sm uppercase">
                    Submit
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted text-sm mt-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>4 of 5 scores entered</span>
              </div>
            </div>
          </motion.div>

          {/* Right Phone — Draw / Winnings */}
          <motion.div
            initial={{ y: 140, opacity: 0, x: -40, rotate: 4 }}
            whileInView={{ y: 96, opacity: 0.8, x: 140, rotate: 6 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease, delay: 0.2 }}
            className="absolute z-10 w-[240px] md:w-[280px] h-[480px] md:h-[580px] bg-lavender rounded-[3rem] border-[7px] border-white shadow-2xl overflow-hidden hidden md:block"
          >
            <div className="p-7 flex flex-col h-full items-center justify-center text-center">
              <div className="absolute top-5 w-14 h-1 rounded-full bg-ink/10" />
              <div className="w-20 h-20 rounded-full bg-white/50 mb-5 flex items-center justify-center">
                <span className="font-cursive text-4xl text-ink/70">🏆</span>
              </div>
              <h3 className="text-lg font-medium text-ink/80 mb-1">
                Monthly Draw
              </h3>
              <p className="text-sm text-muted mb-6 max-w-[180px]">
                3-match pool share secured this month.
              </p>
              <div className="w-full bg-white/50 rounded-2xl p-4 text-left">
                <div className="text-xs text-muted mb-2 tracking-wide uppercase">Winnings</div>
                <div className="flex justify-between items-end">
                  <div className="text-3xl font-medium text-ink">£184</div>
                  <div className="text-xs text-emerald-500 font-medium">Paid ✓</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
