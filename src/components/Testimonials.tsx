"use client";

import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const testimonials = [
  {
    id: 1,
    quote:
      "Tracking my Stableford scores here actually makes me look forward to entering them. And knowing part of my sub goes to the youth shelter? That&apos;s a win before the draw even happens.",
    signature: "James W.",
    rotate: "rotate-[1deg]",
  },
  {
    id: 2,
    quote:
      "The interface is so clean and intentional. No flashy golf clichés, no noise. Just my scores, my charity choice, and the monthly anticipation of the draw results.",
    signature: "Sarah L.",
    rotate: "-rotate-[1deg]",
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-[48px] tracking-tight text-ink leading-tight">
            Notes from the{" "}
            <span className="font-cursive text-4xl md:text-[64px] text-muted inline-block rotate-[-1deg]">
              green
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {testimonials.map((entry, idx) => (
            <motion.div
              key={entry.id}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.12, ease }}
              className={`bg-white p-8 md:p-10 rounded-sm border border-stone-100 glow hover:shadow-xl transition-shadow duration-300 cursor-default ${entry.rotate}`}
            >
              <p className="text-ink/80 text-lg md:text-xl leading-relaxed mb-10">
                &ldquo;{entry.quote}&rdquo;
              </p>

              <div className="flex flex-col items-end gap-2">
                <div className="w-8 h-px bg-stone-300" />
                <span className="font-cursive text-2xl text-muted">
                  {entry.signature}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
