"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Heart, Users, ArrowRight, ArrowLeft, X, Calendar, MapPin, Star } from "lucide-react";

const C = {
  bg: "#FDFCF8", ink: "#292524", muted: "#78716C", coral: "#FFB7B2",
  sage: "#E8EFE8", lavender: "#EFEDF4", border: "#e7e5e4",
};

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function CharitiesPage() {
  const router = useRouter();
  const [charities, setCharities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [donateModal, setDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState("10");
  const [donationSuccess, setDonationSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/charities").then(r => r.json()).then(d => setCharities(d.charities || [])).catch(() => {});
    if (typeof window !== "undefined") {
      const qs = new URLSearchParams(window.location.search);
      const q = qs.get("search");
      if (q) setSearch(q);
    }
  }, []);

  const categories = ["All", ...Array.from(new Set(charities.map((c: any) => c.category)))];

  const filtered = charities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featured = charities.filter((c) => c.featured);
  const detail = selectedCharity ? charities.find((c) => c.id === selectedCharity) : null;

  const handleDonate = async () => {
    if (!detail) return;
    try {
      await fetch("/api/donations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charityId: detail.id, amount: parseFloat(donateAmount) })
      });
    } catch {}
    setDonationSuccess(true);
    setTimeout(() => {
      setDonationSuccess(false);
      setDonateModal(false);
    }, 2000);
  };

  // Detail view
  if (detail) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: C.bg, color: C.ink, fontFamily: "var(--font-outfit)" }}>
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ backgroundColor: "rgba(253,252,248,0.8)", borderColor: C.border }}>
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <button onClick={() => setSelectedCharity(null)} className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: C.muted }}>
              <ArrowLeft className="w-4 h-4" />
              Back to Charities
            </button>
            <button onClick={() => router.push("/signup")} className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform">
              Subscribe & Support
            </button>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease }}>
            {/* Header */}
            <div className="flex items-start gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: C.sage }}>
                {detail.image}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-medium tracking-tight">{detail.name}</h1>
                  {detail.featured && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                </div>
                <span className="text-sm" style={{ color: C.muted }}>{detail.category}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="rounded-2xl border p-5" style={{ backgroundColor: "rgba(255,183,178,0.1)", borderColor: "rgba(255,183,178,0.3)" }}>
                <div className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: C.muted }}>Total Raised</div>
                <div className="text-2xl font-medium">£{detail.raised.toLocaleString()}</div>
              </div>
              <div className="rounded-2xl border p-5" style={{ backgroundColor: C.lavender, borderColor: "rgba(0,0,0,0.04)" }}>
                <div className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: C.muted }}>Supporters</div>
                <div className="text-2xl font-medium">{detail.supporters}</div>
              </div>
            </div>

            {/* About */}
            <div className="rounded-2xl border p-6 mb-6 bg-white" style={{ borderColor: C.border }}>
              <h3 className="font-medium mb-3">About</h3>
              <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{detail.long_description || detail.description}</p>
            </div>

            {/* Events */}
            {(detail.charity_events || []).length > 0 && (
              <div className="rounded-2xl border p-6 mb-6 bg-white" style={{ borderColor: C.border }}>
                <h3 className="font-medium mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                  {(detail.charity_events || []).map((ev: any) => (
                    <div key={ev.id} className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: "#f5f5f4" }}>
                      <div>
                        <div className="text-sm font-medium">{ev.title}</div>
                        <div className="flex items-center gap-3 text-xs mt-1" style={{ color: C.muted }}>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ev.event_date || ev.date}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setDonateModal(true)}
                className="flex-1 h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: C.coral, color: C.ink }}
              >
                <Heart className="w-4 h-4" />
                Make a Donation
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="flex-1 h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: C.ink, color: C.bg }}
              >
                Subscribe & Support
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Donate Modal */}
        {donateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-[2rem] p-8 bg-white border shadow-xl"
              style={{ borderColor: C.border }}
            >
              {donationSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Thank You!</h3>
                  <p className="text-sm" style={{ color: C.muted }}>Your donation of £{donateAmount} to {detail.name} has been received.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-medium">Donate to {detail.name}</h3>
                    <button onClick={() => setDonateModal(false)} className="p-1 rounded-full hover:bg-stone-100"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {["5", "10", "25", "50"].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setDonateAmount(amt)}
                        className="py-3 rounded-xl text-sm font-medium border transition-all"
                        style={{
                          borderColor: donateAmount === amt ? C.ink : C.border,
                          backgroundColor: donateAmount === amt ? "rgba(41,37,36,0.03)" : "transparent",
                        }}
                      >
                        £{amt}
                      </button>
                    ))}
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: C.muted }}>Custom Amount</label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium">£</span>
                      <input
                        type="number"
                        value={donateAmount}
                        onChange={(e) => setDonateAmount(e.target.value)}
                        className="w-full h-11 rounded-xl px-4 text-sm outline-none border"
                        style={{ backgroundColor: "#fafaf9", borderColor: C.border }}
                        min="1"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleDonate}
                    className="w-full h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: C.ink, color: C.bg }}
                  >
                    Donate £{donateAmount}
                    <Heart className="w-4 h-4" />
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, color: C.ink, fontFamily: "var(--font-outfit)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ backgroundColor: "rgba(253,252,248,0.8)", borderColor: C.border }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: C.coral }}>
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">Softly Golf</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/login")} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: C.muted }}>Login</button>
            <button onClick={() => router.push("/signup")} className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform">Subscribe</button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease }} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-3">
            Our{" "}
            <span className="font-cursive text-5xl md:text-6xl text-coral inline-block rotate-[-1deg]">charities</span>
          </h1>
          <p className="text-lg max-w-xl" style={{ color: C.muted }}>
            Every subscription makes an impact. Browse the charities you can support, or make a one-off donation.
          </p>
        </motion.div>

        {/* Featured Spotlight */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="mb-10"
        >
          <h3 className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: C.muted }}>Featured Charities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCharity(c.id)}
                className="p-5 rounded-2xl border text-left transition-all hover:shadow-lg hover:-translate-y-1 group"
                style={{ backgroundColor: "rgba(255,183,178,0.08)", borderColor: "rgba(255,183,178,0.25)" }}
              >
                <div className="text-2xl mb-3">{c.image}</div>
                <div className="font-medium mb-1">{c.name}</div>
                <div className="text-xs line-clamp-2" style={{ color: C.muted }}>{c.description}</div>
                <div className="mt-3 text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: C.coral }}>
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search & Filter */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2, ease }} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.muted }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search charities..."
                className="w-full h-11 rounded-xl pl-11 pr-4 text-sm outline-none border focus:ring-2"
                style={{ backgroundColor: "white", borderColor: C.border, color: C.ink }}
              />
            </div>
            <div className="flex gap-1 overflow-x-auto hide-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: activeCategory === cat ? C.ink : "transparent",
                    color: activeCategory === cat ? C.bg : C.muted,
                    border: activeCategory === cat ? "none" : "1px solid " + C.border,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: C.muted }}>
              No charities found matching your search.
            </div>
          ) : (
            filtered.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease }}
                onClick={() => setSelectedCharity(c.id)}
                className="w-full flex items-center justify-between p-5 rounded-2xl border bg-white text-left transition-all hover:shadow-md hover:-translate-y-0.5 group"
                style={{ borderColor: C.border }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: C.sage }}>
                    {c.image}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      {c.featured && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Featured</span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: C.muted }}>
                      {c.category} · £{c.raised.toLocaleString()} raised · {c.supporters} supporters
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: C.muted }} />
              </motion.button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
