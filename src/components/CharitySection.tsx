"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Search } from "lucide-react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const charities = [
  {
    id: 1,
    name: "Youth Shelter Network",
    category: "Homelessness",
    raised: "£12,480",
    supporters: 342,
    color: "bg-coral/15 text-coral",
  },
  {
    id: 2,
    name: "Green Future Trust",
    category: "Environment",
    raised: "£9,210",
    supporters: 218,
    color: "bg-sage text-emerald-700",
  },
  {
    id: 3,
    name: "Hope & Play Foundation",
    category: "Children",
    raised: "£15,600",
    supporters: 467,
    color: "bg-lavender text-violet-700",
  },
];

export default function CharitySection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCharities = charities.filter((charity) =>
    charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    charity.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/charities?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/charities");
    }
  };

  return (
    <section id="charities" className="py-28 relative overflow-hidden">
      {/* Subtle background blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sage rounded-full blur-[180px] opacity-40 -z-10" />

      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-[56px] tracking-tight text-ink leading-tight mb-4">
            Choose where your{" "}
            <span className="font-cursive text-5xl md:text-[72px] text-coral inline-block rotate-[-1deg]">
              heart
            </span>{" "}
            goes.
          </h2>
          <p className="text-muted max-w-lg mx-auto text-lg mt-4">
            At least 10% of every subscription goes directly to the charity you
            pick. Explore our directory, find your cause, or increase your
            giving anytime.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="max-w-md mx-auto mb-14"
        >
          <form 
            onSubmit={handleSearch}
            className="flex items-center gap-3 bg-white rounded-full px-5 py-3 border border-stone-200/60 glow"
          >
            <button type="submit" className="text-muted hover:text-coral transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search charities…"
              className="flex-1 bg-transparent outline-none text-ink placeholder:text-stone-400 text-sm"
            />
          </form>
        </motion.div>

        {/* Charity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCharities.length > 0 ? (
            filteredCharities.map((charity, idx) => (
              <motion.div
                key={charity.id}
                onClick={() => router.push("/charities")}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.1, ease }}
                className="bg-white rounded-[2rem] p-7 border border-stone-100 hover:shadow-xl hover:border-transparent transition-all duration-300 cursor-pointer group"
              >
                {/* Category badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-5 ${charity.color}`}
                >
                  <Heart className="w-3 h-3" />
                  {charity.category}
                </div>

                <h3 className="text-xl font-medium text-ink tracking-tight mb-2 group-hover:text-coral transition-colors">
                  {charity.name}
                </h3>

                <div className="flex items-center justify-between mt-6 pt-5 border-t border-stone-100">
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wide">
                      Raised
                    </div>
                    <div className="text-lg font-medium text-ink">
                      {charity.raised}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted uppercase tracking-wide">
                      Supporters
                    </div>
                    <div className="text-lg font-medium text-ink">
                      {charity.supporters}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-3 text-center text-muted py-8">
              No charities found.
            </div>
          )}
        </div>

        {/* Spotlight */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="text-center mt-12"
        >
          <button
            onClick={() => router.push("/charities")}
            className="text-coral font-medium hover:underline underline-offset-4 transition-all"
          >
            View all charities →
          </button>
        </motion.div>
      </div>
    </section>
  );
}

