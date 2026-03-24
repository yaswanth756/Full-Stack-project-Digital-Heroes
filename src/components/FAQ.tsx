"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const faqs = [
  {
    id: 1,
    question: "How does the charity contribution work?",
    answer:
      "A minimum of 10% of your subscription goes directly to the charity you choose at sign-up. You can increase this percentage anytime from your dashboard. You can also make independent one-off donations that aren't tied to the draw.",
  },
  {
    id: 2,
    question: "What is the Stableford scoring system?",
    answer:
      "Stableford is a points-based golf scoring format. Scores range from 1 to 45 per round. You enter your 5 most recent scores—each time you add a new one, the oldest drops off automatically.",
  },
  {
    id: 3,
    question: "How does the monthly draw work?",
    answer:
      "At the end of each month, 5 numbers are drawn. If your entered scores match 3, 4, or all 5 numbers, you win a share of that tier's prize pool. The 5-match jackpot rolls over if unclaimed, growing every month.",
  },
  {
    id: 4,
    question: "What happens if I win?",
    answer:
      "Winners go through a simple verification process—upload a screenshot of your scores from the platform. Once approved by our admin team, your prize is paid out. You can track all payment statuses from your dashboard.",
  },
  {
    id: 5,
    question: "Can I choose monthly or yearly billing?",
    answer:
      "Yes. We offer a monthly plan at £9.99/month and a yearly plan at £89.99/year (saving 25%). Both include full access to score tracking, draws, charity selection, and your personal dashboard.",
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);
  const toggle = (id: number) => setOpenId(openId === id ? null : id);

  return (
    <section id="faq" className="py-28">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-[56px] tracking-tight text-ink leading-tight mb-4">
            Got{" "}
            <span className="font-cursive text-5xl md:text-[72px] text-coral inline-block rotate-[-1deg]">
              questions?
            </span>
          </h2>
          <p className="text-muted max-w-md mx-auto text-lg">
            Everything about subscriptions, scores, charities, and the draw.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                >
                  <span className="font-medium text-ink text-[17px] pr-4">
                    {faq.question}
                  </span>
                  <Plus
                    className={`w-5 h-5 text-muted flex-shrink-0 transition-transform duration-500 ease-in-out ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-muted leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
