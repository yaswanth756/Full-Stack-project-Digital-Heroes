"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Waitlist() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sage rounded-full blur-[160px] opacity-40 -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blob-pink rounded-full blur-[140px] opacity-30 -z-10" />

      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="flex flex-col items-center"
        >
          {/* Dark icon */}
          <div className="w-14 h-14 bg-ink rounded-2xl flex items-center justify-center mb-10 shadow-lg">
            <div className="w-3 h-3 bg-coral rounded-full animate-pulse" />
          </div>

          <h2 className="text-4xl md:text-[56px] tracking-tight text-ink leading-tight mb-6">
            Ready to change
            <br />
            <span className="font-cursive text-[64px] md:text-[80px] text-coral inline-block rotate-[-2deg] -translate-y-3">
              the game?
            </span>
          </h2>

          <p className="text-muted text-lg mb-12 max-w-md mx-auto">
            Join the waitlist today. Be among the first to track scores, enter
            the draw, and support meaningful causes.
          </p>

          {/* Email form */}
          <form className="w-full max-w-md mx-auto relative group">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full h-14 bg-stone-50 border border-stone-200 focus:border-coral focus:ring-2 focus:ring-coral/20 rounded-full px-7 pr-16 text-ink text-[15px] outline-none transition-all placeholder:text-stone-400"
              required
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 w-11 h-11 bg-ink rounded-full flex items-center justify-center text-cream hover:scale-110 hover:bg-black transition-all duration-300"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
