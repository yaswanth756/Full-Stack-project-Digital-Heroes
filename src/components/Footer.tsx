"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200/60 py-12">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-coral flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span className="font-medium text-ink text-[14px]">Softly Golf</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="#" className="hover:text-ink transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-ink transition-colors">
            Terms
          </Link>
          <Link href="#" className="hover:text-ink transition-colors">
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-1 text-muted">
          Made with <Heart className="w-3 h-3 text-coral fill-coral" /> for
          charity
        </div>
      </div>
    </footer>
  );
}
