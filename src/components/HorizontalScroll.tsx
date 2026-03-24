"use client";

import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const steps = [
  {
    id: 1,
    step: "Step 01",
    text: "Pick a monthly or yearly subscription plan.",
    hoverColor: "group-hover:text-coral",
  },
  {
    id: 2,
    step: "Step 02",
    text: "Enter your last 5 Stableford scores (1–45).",
    hoverColor: "group-hover:text-amber-500",
  },
  {
    id: 3,
    step: "Step 03",
    text: "Choose a charity to receive part of your fee.",
    hoverColor: "group-hover:text-emerald-500",
  },
  {
    id: 4,
    step: "Step 04",
    text: "Match 3, 4 or all 5 numbers in the monthly draw.",
    hoverColor: "group-hover:text-sky-500",
  },
  {
    id: 5,
    step: "Step 05",
    text: "Win your share of the prize pool — jackpots roll over!",
    hoverColor: "group-hover:text-violet-500",
  },
];

export default function HorizontalScroll() {
  return (
    <section id="how-it-works" className="py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 mb-14">
        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="text-4xl md:text-[56px] tracking-tight text-ink leading-tight"
        >
          How it{" "}
          <span className="font-cursive text-5xl md:text-[72px] text-muted inline-block rotate-[-1deg]">
            works
          </span>
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="text-muted mt-4 max-w-md text-lg"
        >
          Five simple steps from subscribing to winning — all while supporting a cause close to your heart.
        </motion.p>
      </div>

      <motion.div
        initial={{ x: 60, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease }}
        className="flex gap-6 overflow-x-auto hide-scrollbar px-6 pb-8 snap-x snap-mandatory"
      >
        {steps.map((card) => (
          <div
            key={card.id}
            className="group flex-shrink-0 w-[288px] h-[160px] bg-white rounded-3xl p-6 flex flex-col justify-between cursor-pointer border border-stone-100 hover:shadow-lg hover:border-transparent transition-all duration-300 snap-center"
          >
            <span className="text-[13px] text-muted tracking-widest uppercase">
              {card.step}
            </span>
            <p
              className={`text-[18px] text-ink font-medium leading-snug transition-colors duration-300 ${card.hoverColor}`}
            >
              {card.text}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
