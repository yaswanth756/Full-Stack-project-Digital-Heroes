"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-[20%] left-[15%] w-[420px] h-[420px] bg-blob-pink rounded-full blur-[120px] opacity-60 animate-float-slow -z-10" />
      <div className="absolute bottom-[15%] right-[10%] w-[500px] h-[500px] bg-blob-purple rounded-full blur-[140px] opacity-60 animate-float-reverse -z-10" />

      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* Pill badge */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 border border-stone-200/60 backdrop-blur-md rounded-full mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
          <span className="text-sm text-ink/80">Play golf · Support charity · Win prizes</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="text-[48px] md:text-[72px] leading-[1.05] tracking-tight text-ink mb-6"
        >
          Swing for the pin,
          <br />
          <span className="font-cursive text-[64px] md:text-[96px] text-coral inline-block rotate-[-2deg] -translate-y-1">
            impact
          </span>{" "}
          the world.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="text-lg md:text-xl text-muted max-w-[500px] mb-12 leading-relaxed"
        >
          Subscribe. Track your Stableford scores. Enter monthly prize draws.
          A portion of every subscription goes to the charity you choose.
        </motion.p>

        {/* Dual CTAs */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={() => router.push("/signup")}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-coral text-ink font-medium flex items-center justify-center gap-2 group hover:scale-[1.03] active:scale-100 transition-transform glow"
          >
            Start subscribing
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-stone-200 text-ink font-medium hover:bg-stone-50 transition-colors"
          >
            See how it works
          </button>
        </motion.div>
      </div>
    </section>
  );
}
