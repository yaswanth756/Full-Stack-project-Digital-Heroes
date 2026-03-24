"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-4 right-4 z-40 mx-auto max-w-5xl"
    >
      <div className="flex items-center justify-between rounded-full bg-white/70 backdrop-blur-[20px] border border-white/40 px-5 py-3 glow">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-coral flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <span className="font-sans font-semibold text-ink text-[15px] tracking-tight hidden sm:block">
            Softly Golf
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-muted">
          <Link href="#how-it-works" className="hover:text-ink transition-colors duration-300">How it works</Link>
          <Link href="/charities" className="hover:text-ink transition-colors duration-300">Charities</Link>
          <Link href="#pricing" className="hover:text-ink transition-colors duration-300">Pricing</Link>
          <Link href="#faq" className="hover:text-ink transition-colors duration-300">FAQ</Link>
          <Link href="/login" className="hover:text-ink transition-colors duration-300">Login</Link>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/signup")}
          className="bg-ink text-cream px-5 py-2 rounded-full text-[14px] font-medium hover:scale-105 active:scale-100 transition-transform duration-300"
        >
          Subscribe Now
        </button>
      </div>
    </motion.nav>
  );
}
