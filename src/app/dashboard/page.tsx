"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy, Heart, BarChart3, Settings, LogOut, Plus, Trash2,
  Calendar, ArrowRight, Check, X, Bell, Upload, ChevronDown,
  AlertCircle, CreditCard, ExternalLink, Award,
} from "lucide-react";

const C = {
  bg: "#FDFCF8", ink: "#292524", muted: "#78716C", coral: "#FFB7B2",
  sage: "#E8EFE8", lavender: "#EFEDF4", border: "#e7e5e4", cardBg: "white",
};

type Tab = "overview" | "scores" | "charity" | "draws" | "settings";

interface DashUser {
  id: string; name: string; email: string; role: string; avatar: string;
  subscription: any; charity: any; scores: any[]; winnings: any[]; notifications: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<DashUser | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [scores, setScores] = useState<any[]>([]);
  const [newScore, setNewScore] = useState({ value: "", date: "" });
  const [charityPct, setCharityPct] = useState(10);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [dbCharities, setDbCharities] = useState<any[]>([]);
  const [dbDraws, setDbDraws] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subPlan, setSubPlan] = useState("monthly");
  const [subStatus, setSubStatus] = useState("active");

  const [showUploadModal, setShowUploadModal] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState("10");
  const [donationSuccess, setDonationSuccess] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [res, cRes, dRes] = await Promise.all([
          fetch("/api/auth/me"), fetch("/api/charities"), fetch("/api/draws")
        ]);
        if (res.ok) {
          const data = await res.json();
          const user = data.user;
          if (!user) { router.push("/login"); return; }
          if (user.role === "admin") { router.push("/admin"); return; }
          setCurrentUser(user);
          setScores(user.scores || []);
          if (cRes.ok) setDbCharities((await cRes.json()).charities || []);
          if (dRes.ok) setDbDraws((await dRes.json()).draws || []);
          setCharityPct(user.charity?.percentage || 10);
          setSelectedCharity(user.charity?.charity_id || "");
          setProfileName(user.name);
          setProfileEmail(user.email);
          setSubPlan(user.subscription?.plan || "monthly");
          setSubStatus(user.subscription?.status || "active");
          setNotifs(user.notifications || []);
          setLoading(false);
          return;
        }
      } catch (err) { console.warn("API error", err); }
      router.push("/login");
    };
    fetchUser();
  }, [router]);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm" style={{ color: C.muted }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userCharity = dbCharities.find((c) => c.id === selectedCharity) || { name: "Not selected", image: "🎗️", category: "", raised: 0, supporters: 0 };
  const totalWon = (currentUser.winnings || []).reduce((a: number, w: any) => a + (w.prize || 0), 0);
  const unreadNotifs = notifs.filter((n: any) => !n.read).length;
  const subscriptionPrice = subPlan === "monthly" ? 9.99 : 89.99;
  const renewalDate = currentUser.subscription?.renewal_date || currentUser.subscription?.renewalDate || "—";

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleAddScore = async () => {
    const val = parseInt(newScore.value);
    if (!val || val < 1 || val > 45 || !newScore.date) { showToast("Please enter a valid score (1-45) and date."); return; }
    try {
      const res = await fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: val, date: newScore.date }) });
      if (!res.ok) throw new Error("Failed");
      const { score } = await res.json();
      setScores(prev => [score, ...prev].slice(0, 5));
      setNewScore({ value: "", date: "" });
      showToast("Score added successfully!");
    } catch { showToast("Error adding score"); }
  };

  const handleDeleteScore = async (id: string) => {
    try {
      await fetch(`/api/scores?id=${id}`, { method: "DELETE" });
      setScores(scores.filter((s) => s.id !== id));
      showToast("Score removed.");
    } catch { showToast("Error removing score"); }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, email: profileEmail })
      });
      if (res.ok) showToast("Profile updated successfully!");
      else showToast("Failed to update profile.");
    } catch { showToast("Error updating profile"); }
  };

  const handleChangePlan = async () => {
    try {
      const res = await fetch("/api/subscription", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changePlan" })
      });
      if (res.ok) {
        const data = await res.json();
        setSubPlan(data.plan);
        setShowPlanModal(false);
        showToast(`Plan changed to ${data.plan}!`);
      } else showToast("Failed to change plan.");
    } catch { showToast("Error changing plan."); }
  };

  const handleCancelSub = async () => {
    try {
      const res = await fetch("/api/subscription", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" })
      });
      if (res.ok) {
        setSubStatus("cancelled");
        setShowCancelModal(false);
        showToast("Subscription cancelled. You'll retain access until the end of your billing period.");
      }
    } catch { showToast("Error cancelling subscription."); }
  };

  const handleReactivate = async () => {
    try {
      const res = await fetch("/api/subscription", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reactivate" })
      });
      if (res.ok) { setSubStatus("active"); showToast("Subscription reactivated!"); }
      else showToast("Failed to reactivate.");
    } catch { showToast("Error reactivating."); }
  };

  const handleUploadProof = async (winnerId: string) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Call API
          fetch("/api/winners", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ winnerId, action: "uploadProof" }) });
          setShowUploadModal(null);
          showToast("Proof uploaded! Admin will review shortly.");
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handleDonate = async () => {
    setDonationSuccess(true);
    await fetch("/api/donations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ charityId: selectedCharity, amount: donateAmount }) });
    setTimeout(() => { setDonationSuccess(false); setShowDonateModal(false); showToast(`£${donateAmount} donated to ${userCharity.name}!`); }, 2000);
  };

  const markNotifRead = (id: string) => { setNotifs(notifs.map((n: any) => (n.id === id ? { ...n, read: true } : n))); };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "scores", label: "Scores", icon: <Trophy className="w-4 h-4" /> },
    { id: "charity", label: "Charity", icon: <Heart className="w-4 h-4" /> },
    { id: "draws", label: "Draws", icon: <Calendar className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const scoreValues = scores.map((s: any) => s.value);

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, color: C.ink, fontFamily: "var(--font-outfit)" }}>
      {toast && (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-black text-white px-5 py-3 rounded-2xl text-sm font-medium shadow-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />{toast}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ backgroundColor: "rgba(253,252,248,0.8)", borderColor: C.border }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: C.coral }}><div className="w-2 h-2 rounded-full bg-white" /></div>
            <span className="font-semibold text-[15px] tracking-tight">Softly Golf</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-full hover:bg-stone-100 transition-colors">
                <Bell className="w-5 h-5" style={{ color: C.muted }} />
                {unreadNotifs > 0 && (<span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadNotifs}</span>)}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border shadow-xl z-50 overflow-hidden" style={{ borderColor: C.border }}>
                  <div className="p-4 border-b" style={{ borderColor: C.border }}><h4 className="font-medium text-sm">Notifications</h4></div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifs.length === 0 && <p className="text-sm text-center py-6" style={{ color: C.muted }}>No notifications</p>}
                    {notifs.map((n: any) => (
                      <button key={n.id} onClick={() => markNotifRead(n.id)}
                        className="w-full text-left p-4 border-b last:border-0 hover:bg-stone-50 transition-colors"
                        style={{ borderColor: "#f5f5f4", backgroundColor: n.read ? "transparent" : "rgba(232,239,232,0.15)" }}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-transparent" : "bg-coral"}`} />
                          <div>
                            <div className="text-sm font-medium">{n.title}</div>
                            <div className="text-xs mt-0.5 line-clamp-2" style={{ color: C.muted }}>{n.message}</div>
                            <div className="text-xs mt-1" style={{ color: C.muted }}>{n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-medium">{currentUser.avatar}</div>
              <span className="text-sm hidden sm:block" style={{ color: C.muted }}>{currentUser.name}</span>
            </div>
            <button onClick={async () => { try { await fetch("/api/auth/logout", { method: "POST" }); } catch {} localStorage.removeItem("user"); router.push("/"); }}
              className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity" style={{ color: C.muted }}>
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {subStatus !== "active" && (
          <div className="mb-6 p-4 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: "rgba(245,158,11,0.05)", borderColor: "rgba(245,158,11,0.2)" }}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <div><div className="text-sm font-medium">Subscription {subStatus}</div>
                <div className="text-xs" style={{ color: C.muted }}>{subStatus === "lapsed" ? "Your subscription has lapsed. Renew to participate in draws." : "Your subscription is inactive. Reactivate to continue."}</div>
              </div>
            </div>
            <button onClick={handleReactivate} className="px-4 py-2 rounded-full text-sm font-medium bg-black text-white hover:scale-105 transition-transform">Reactivate</button>
          </div>
        )}

        <nav className="flex gap-1 mb-8 overflow-x-auto hide-scrollbar pb-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={{ backgroundColor: activeTab === tab.id ? C.ink : "transparent", color: activeTab === tab.id ? C.bg : C.muted }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </nav>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-medium tracking-tight">Welcome back, {currentUser.name.split(" ")[0]} 👋</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Subscription", value: subStatus === "active" ? "Active" : subStatus.charAt(0).toUpperCase() + subStatus.slice(1), sub: `${subPlan} · renews ${renewalDate}`, bg: subStatus === "active" ? C.sage : "rgba(245,158,11,0.1)" },
                { label: "Scores Entered", value: `${scores.length}/5`, sub: scores.length === 5 ? "All slots filled" : `${5 - scores.length} more needed`, bg: C.lavender },
                { label: "Charity Giving", value: `${charityPct}%`, sub: userCharity.name, bg: "rgba(255,183,178,0.15)" },
                { label: "Total Won", value: `£${totalWon}`, sub: `${(currentUser.winnings || []).length} prizes`, bg: "#fafaf9" },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl p-5 border" style={{ backgroundColor: stat.bg, borderColor: "rgba(0,0,0,0.04)" }}>
                  <div className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: C.muted }}>{stat.label}</div>
                  <div className="text-2xl font-medium">{stat.value}</div>
                  <div className="text-xs mt-1" style={{ color: C.muted }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border p-6" style={{ backgroundColor: C.ink, borderColor: C.ink }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "rgba(253,252,248,0.5)" }}>Next Draw</div>
                  <div className="text-3xl font-medium mb-1" style={{ color: C.bg, fontFamily: "var(--font-reenie)" }}>April 2026</div>
                  <div className="text-sm" style={{ color: "rgba(253,252,248,0.6)" }}>Your scores: {scoreValues.join(", ") || "None entered"}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(253,252,248,0.5)" }}>Jackpot</div>
                  <div className="text-2xl font-medium" style={{ color: C.coral }}>£{dbDraws[0]?.jackpot_rollover || 0}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Latest Scores</h3>
                <button onClick={() => setActiveTab("scores")} className="text-sm" style={{ color: C.coral }}>View all →</button>
              </div>
              <div className="space-y-2">
                {scores.slice(0, 3).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "#f5f5f4" }}>
                    <span className="text-sm" style={{ color: C.muted }}>{s.score_date || s.date}</span>
                    <span className="font-medium">{s.value} pts</span>
                  </div>
                ))}
                {scores.length === 0 && (<p className="text-sm py-4 text-center" style={{ color: C.muted }}>No scores yet. Add your first score!</p>)}
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
              <h3 className="font-medium mb-4">Winnings History</h3>
              {(currentUser.winnings || []).length === 0 ? (
                <p className="text-sm" style={{ color: C.muted }}>No winnings yet. Keep playing!</p>
              ) : (
                <div className="space-y-2">
                  {(currentUser.winnings || []).map((w: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b" style={{ borderColor: "#f5f5f4" }}>
                      <div>
                        <div className="text-sm font-medium">{w.draws?.month || "Draw"}</div>
                        <div className="text-xs" style={{ color: C.muted }}>{w.match_type}-number match</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium">£{w.prize}</div>
                          <div className="text-xs font-medium" style={{ color: w.payment_status === "paid" ? "#22c55e" : "#f59e0b" }}>
                            {w.payment_status === "paid" ? "Paid ✓" : "Pending"}
                          </div>
                        </div>
                        {w.payment_status === "pending" && !w.proof_uploaded && (
                          <button onClick={() => setShowUploadModal(w.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1">
                            <Upload className="w-3 h-3" />Upload Proof
                          </button>
                        )}
                        {w.proof_uploaded && w.payment_status === "pending" && (
                          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Proof Sent</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCORES */}
        {activeTab === "scores" && (
          <div className="space-y-6">
            <div><h1 className="text-3xl font-medium tracking-tight mb-1">Score Management</h1>
              <p className="text-sm" style={{ color: C.muted }}>Enter your latest Stableford scores (1–45). Only 5 most recent are kept.</p></div>
            <div className="rounded-2xl border p-6" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
              <h3 className="font-medium mb-4">Add New Score</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1"><label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color: C.muted }}>Score (1-45)</label>
                  <input type="number" min="1" max="45" value={newScore.value} onChange={(e) => setNewScore({ ...newScore, value: e.target.value })} placeholder="38"
                    className="w-full h-11 rounded-xl px-4 text-sm outline-none border focus:ring-2" style={{ backgroundColor: "#fafaf9", borderColor: C.border, color: C.ink }} /></div>
                <div className="flex-1"><label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color: C.muted }}>Date</label>
                  <input type="date" value={newScore.date} onChange={(e) => setNewScore({ ...newScore, date: e.target.value })}
                    className="w-full h-11 rounded-xl px-4 text-sm outline-none border focus:ring-2" style={{ backgroundColor: "#fafaf9", borderColor: C.border, color: C.ink }} /></div>
                <div className="flex items-end"><button onClick={handleAddScore}
                  className="h-11 px-6 rounded-xl font-medium text-sm flex items-center gap-2 transition-transform hover:scale-[1.02]" style={{ backgroundColor: C.ink, color: C.bg }}>
                  <Plus className="w-4 h-4" />Add</button></div>
              </div>
              {scores.length >= 5 && (<p className="text-xs mt-3" style={{ color: "#f59e0b" }}>⚠ All 5 slots filled. Adding a new score will replace the oldest.</p>)}
            </div>
            <div className="rounded-2xl border p-6" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
              <h3 className="font-medium mb-4">Your Scores ({scores.length}/5)</h3>
              {scores.length === 0 ? (<p className="text-sm" style={{ color: C.muted }}>No scores entered yet.</p>) : (
                <div className="space-y-2">
                  {scores.map((s: any, i: number) => (
                    <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border"
                      style={{ borderColor: "#f5f5f4", backgroundColor: i === 0 ? "rgba(232,239,232,0.2)" : "transparent" }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm" style={{ backgroundColor: C.lavender, color: C.ink }}>{s.value}</div>
                        <div><div className="text-sm font-medium">{s.value} Stableford points</div>
                          <div className="text-xs" style={{ color: C.muted }}>{s.score_date || s.date} {i === 0 && "· Latest"}</div></div>
                      </div>
                      <button onClick={() => handleDeleteScore(s.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" style={{ color: "#ef4444" }} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {scores.length > 0 && (
              <div className="rounded-2xl border p-6" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
                <h3 className="font-medium mb-4">Score Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl text-center" style={{ backgroundColor: C.sage }}><div className="text-2xl font-medium">{Math.max(...scoreValues)}</div><div className="text-xs" style={{ color: C.muted }}>Best</div></div>
                  <div className="p-4 rounded-xl text-center" style={{ backgroundColor: C.lavender }}><div className="text-2xl font-medium">{Math.round(scoreValues.reduce((a: number, v: number) => a + v, 0) / scoreValues.length)}</div><div className="text-xs" style={{ color: C.muted }}>Average</div></div>
                  <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "rgba(255,183,178,0.15)" }}><div className="text-2xl font-medium">{Math.min(...scoreValues)}</div><div className="text-xs" style={{ color: C.muted }}>Lowest</div></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHARITY */}
        {activeTab === "charity" && (
          <div className="space-y-6">
            <div><h1 className="text-3xl font-medium tracking-tight mb-1">Charity & Giving</h1>
              <p className="text-sm" style={{ color: C.muted }}>Choose your charity and how much of your subscription to contribute.</p></div>
            <div className="rounded-2xl border p-6" style={{ backgroundColor: "rgba(255,183,178,0.08)", borderColor: "rgba(255,183,178,0.3)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: C.muted }}>Currently Supporting</div>
                  <div className="text-xl font-medium mb-1">{userCharity.image} {userCharity.name}</div>
                  <div className="text-sm" style={{ color: C.muted }}>{charityPct}% of your subscription · £{((subscriptionPrice * charityPct) / 100).toFixed(2)}/{subPlan === "monthly" ? "month" : "year"}</div>
                </div>
                <button onClick={() => setShowDonateModal(true)} className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-transform hover:scale-105" style={{ backgroundColor: C.coral, color: C.ink }}>
                  <Heart className="w-4 h-4" />Donate Extra</button>
              </div>
            </div>
            <div className="rounded-2xl border p-6" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
              <h3 className="font-medium mb-4">Contribution Percentage</h3>
              <div className="flex items-center gap-4">
                <input type="range" min="10" max="50" value={charityPct} onChange={async (e) => {
                  const val = parseInt(e.target.value); setCharityPct(val);
                  await fetch("/api/charities", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ percentage: val }) });
                }} className="flex-1 accent-stone-800" />
                <span className="text-2xl font-medium w-16 text-right">{charityPct}%</span>
              </div>
              <div className="flex justify-between text-xs mt-2" style={{ color: C.muted }}><span>10% minimum</span><span>50% maximum</span></div>
              <div className="mt-4 p-3 rounded-xl text-sm" style={{ backgroundColor: C.sage }}>
                <span className="font-medium">£{((subscriptionPrice * charityPct) / 100).toFixed(2)}</span> goes to {userCharity.name} every {subPlan === "monthly" ? "month" : "year"}.
              </div>
            </div>
            <div className="rounded-2xl border p-6" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
              <h3 className="font-medium mb-4">Choose a Charity</h3>
              <div className="space-y-2">
                {dbCharities.map((c: any) => (
                  <button key={c.id} onClick={async () => {
                    setSelectedCharity(c.id);
                    await fetch("/api/charities", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ charityId: c.id }) });
                    showToast(`Charity changed to ${c.name}!`);
                  }} className="w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all"
                    style={{ borderColor: selectedCharity === c.id ? C.ink : "#f5f5f4", backgroundColor: selectedCharity === c.id ? "rgba(41,37,36,0.03)" : "transparent" }}>
                    <div className="flex items-center gap-3"><span className="text-lg">{c.image}</span>
                      <div><div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: C.muted }}>{c.category} · £{(c.raised || 0).toLocaleString()} raised · {c.supporters} supporters</div></div>
                    </div>
                    {selectedCharity === c.id && <Check className="w-5 h-5 flex-shrink-0" style={{ color: "#22c55e" }} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DRAWS */}
        {activeTab === "draws" && (
          <div className="space-y-6">
            <div><h1 className="text-3xl font-medium tracking-tight mb-1">Draw History</h1>
              <p className="text-sm" style={{ color: C.muted }}>Monthly draws using your 5 latest scores. Match 3, 4 or 5 numbers to win.</p></div>
            <div className="rounded-2xl border p-6" style={{ backgroundColor: C.ink, borderColor: C.ink }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "rgba(253,252,248,0.5)" }}>Next Draw</div>
                  <div className="text-3xl font-medium mb-1" style={{ color: C.bg, fontFamily: "var(--font-reenie)" }}>April 2026</div>
                  <div className="text-sm" style={{ color: "rgba(253,252,248,0.6)" }}>Your scores: {scoreValues.join(", ") || "None entered"}</div>
                  {scores.length < 5 && (<div className="text-xs mt-2 font-medium" style={{ color: "#f59e0b" }}>⚠ Enter {5 - scores.length} more score{5 - scores.length > 1 ? "s" : ""} to participate</div>)}
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(253,252,248,0.5)" }}>Jackpot Pool</div>
                  <div className="text-2xl font-medium" style={{ color: C.coral }}>£{dbDraws[0]?.jackpot_rollover || 0}</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border p-6 bg-white" style={{ borderColor: C.border }}>
              <h3 className="font-medium mb-4">Prize Distribution</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "rgba(255,183,178,0.1)" }}><Award className="w-6 h-6 mx-auto mb-2 text-amber-500" /><div className="text-lg font-medium">5-Match</div><div className="text-xs" style={{ color: C.muted }}>40% pool · Jackpot</div></div>
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: C.lavender }}><Trophy className="w-6 h-6 mx-auto mb-2 text-stone-500" /><div className="text-lg font-medium">4-Match</div><div className="text-xs" style={{ color: C.muted }}>35% pool</div></div>
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: C.sage }}><Trophy className="w-6 h-6 mx-auto mb-2 text-stone-400" /><div className="text-lg font-medium">3-Match</div><div className="text-xs" style={{ color: C.muted }}>25% pool</div></div>
              </div>
            </div>
            {dbDraws.map((draw: any) => {
              const myWinning = (currentUser.winnings || []).find((w: any) => w.draw_id === draw.id);
              return (
                <div key={draw.id} className="rounded-2xl border p-6" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{draw.month}</h3>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: draw.status === "published" ? C.sage : "rgba(245,158,11,0.1)", color: draw.status === "published" ? "#22c55e" : "#f59e0b" }}>{draw.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {(draw.drawn_numbers || []).map((n: number, i: number) => (
                      <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                        style={{ backgroundColor: scoreValues.includes(n) ? C.coral : "#f5f5f4", color: scoreValues.includes(n) ? C.ink : C.muted }}>{n}</div>
                    ))}
                  </div>
                  {myWinning ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4" style={{ color: "#f59e0b" }} />
                        <span className="font-medium">You won £{myWinning.prize} ({myWinning.match_type}-match)</span>
                        <span className="text-xs font-medium" style={{ color: myWinning.payment_status === "paid" ? "#22c55e" : "#f59e0b" }}>· {myWinning.payment_status}</span>
                      </div>
                      {myWinning.payment_status === "pending" && !myWinning.proof_uploaded && (
                        <button onClick={() => setShowUploadModal(myWinning.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Upload className="w-3 h-3" />Upload Proof</button>
                      )}
                    </div>
                  ) : (<p className="text-xs" style={{ color: C.muted }}>No matches this draw</p>)}
                </div>
              );
            })}
            {dbDraws.length === 0 && <p className="text-sm text-center py-8" style={{ color: C.muted }}>No published draws yet.</p>}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-medium tracking-tight">Settings</h1>
            <div className="rounded-2xl border p-6" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
              <h3 className="font-medium mb-4">Profile</h3>
              <div className="space-y-4">
                <div><label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color: C.muted }}>Name</label>
                  <input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full h-11 rounded-xl px-4 text-sm outline-none border" style={{ backgroundColor: "#fafaf9", borderColor: C.border }} /></div>
                <div><label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color: C.muted }}>Email</label>
                  <input value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full h-11 rounded-xl px-4 text-sm outline-none border" style={{ backgroundColor: "#fafaf9", borderColor: C.border }} /></div>
                <div><label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color: C.muted }}>Password</label>
                  <input type="password" defaultValue="••••••••" className="w-full h-11 rounded-xl px-4 text-sm outline-none border" style={{ backgroundColor: "#fafaf9", borderColor: C.border }} /></div>
              </div>
              <button onClick={handleSaveProfile} className="mt-4 px-6 h-10 rounded-full text-sm font-medium transition-transform hover:scale-[1.02]" style={{ backgroundColor: C.ink, color: C.bg }}>Save Changes</button>
            </div>
            <div className="rounded-2xl border p-6" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
              <h3 className="font-medium mb-2">Subscription</h3>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${subStatus === "active" ? "bg-emerald-100 text-emerald-700" : subStatus === "lapsed" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{subStatus}</span>
                <span className="text-sm" style={{ color: C.muted }}>{subPlan.charAt(0).toUpperCase() + subPlan.slice(1)} · £{subscriptionPrice}/{subPlan === "monthly" ? "mo" : "yr"} · Renews: {renewalDate}</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => setShowPlanModal(true)} className="px-5 h-10 rounded-full text-sm font-medium border transition-transform hover:scale-[1.02]" style={{ borderColor: C.border }}>Change Plan</button>
                <button onClick={async () => {
                  try {
                    const res = await fetch("/api/stripe/portal", { method: "POST" });
                    if (res.ok) {
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                    } else { showToast("Could not open payment portal."); }
                  } catch { showToast("Error opening payment portal."); }
                }} className="px-5 h-10 rounded-full text-sm font-medium border transition-transform hover:scale-[1.02] flex items-center gap-2" style={{ borderColor: C.border }}>
                  <CreditCard className="w-4 h-4" />Manage Payment
                </button>
                {subStatus === "active" ? (
                  <button onClick={() => setShowCancelModal(true)} className="px-5 h-10 rounded-full text-sm font-medium hover:bg-red-50 transition-colors" style={{ color: "#ef4444" }}>Cancel Subscription</button>
                ) : (
                  <button onClick={handleReactivate} className="px-5 h-10 rounded-full text-sm font-medium transition-transform hover:scale-[1.02]" style={{ backgroundColor: C.ink, color: C.bg }}>Reactivate</button>
                )}
              </div>
            </div>
            <div className="rounded-2xl border p-6" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
              <h3 className="font-medium mb-4">Email Notifications</h3>
              <div className="space-y-3">
                {[
                  { label: "Draw Results", desc: "Get notified when draw results are published" },
                  { label: "Winner Alerts", desc: "Receive alerts if you win a prize" },
                  { label: "Subscription Updates", desc: "Renewal, cancellation, and plan change notifications" },
                  { label: "Charity Updates", desc: "News from your supported charity" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div><div className="text-sm font-medium">{item.label}</div><div className="text-xs" style={{ color: C.muted }}>{item.desc}</div></div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-stone-200 peer-checked:bg-black rounded-full peer-focus:ring-2 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] p-8 bg-white border shadow-xl" style={{ borderColor: C.border }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Change Plan</h3>
              <button onClick={() => setShowPlanModal(false)} className="p-1 rounded-full hover:bg-stone-100"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm mb-4" style={{ color: C.muted }}>You&apos;re currently on the <span className="font-medium text-black">{subPlan}</span> plan. Switch to the {subPlan === "monthly" ? "yearly" : "monthly"} plan?</p>
            <div className="p-4 rounded-xl border mb-6" style={{ borderColor: C.border }}>
              <div className="font-medium">{subPlan === "monthly" ? "Yearly" : "Monthly"} Plan</div>
              <div className="text-2xl font-medium mt-1">{subPlan === "monthly" ? "£89.99/year" : "£9.99/month"}</div>
              <div className="text-xs mt-1" style={{ color: C.muted }}>{subPlan === "monthly" ? "Save 25% — that's 2.5 months free!" : "Flexible monthly billing"}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPlanModal(false)} className="flex-1 h-11 rounded-full border text-sm font-medium" style={{ borderColor: C.border }}>Cancel</button>
              <button onClick={handleChangePlan} className="flex-1 h-11 rounded-full text-sm font-medium" style={{ backgroundColor: C.ink, color: C.bg }}>Confirm Change</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Sub Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] p-8 bg-white border shadow-xl" style={{ borderColor: C.border }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Cancel Subscription</h3>
              <button onClick={() => setShowCancelModal(false)} className="p-1 rounded-full hover:bg-stone-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: "rgba(239,68,68,0.05)" }}>
              <p className="text-sm" style={{ color: "#ef4444" }}>Are you sure you want to cancel? You&apos;ll lose access to:</p>
              <ul className="text-sm mt-2 space-y-1" style={{ color: C.muted }}><li>• Monthly draw entries</li><li>• Prize pool participation</li><li>• Charity contribution tracking</li></ul>
            </div>
            <p className="text-xs mb-6" style={{ color: C.muted }}>You&apos;ll retain access until the end of your billing period ({renewalDate}).</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 h-11 rounded-full text-sm font-medium" style={{ backgroundColor: C.ink, color: C.bg }}>Keep Subscription</button>
              <button onClick={handleCancelSub} className="flex-1 h-11 rounded-full border text-sm font-medium" style={{ color: "#ef4444", borderColor: "#fecaca" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Proof Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] p-8 bg-white border shadow-xl" style={{ borderColor: C.border }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Upload Score Proof</h3>
              <button onClick={() => setShowUploadModal(null)} className="p-1 rounded-full hover:bg-stone-100"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm mb-4" style={{ color: C.muted }}>Upload a screenshot of your scores from the golf platform for verification.</p>
            <div className="border-2 border-dashed rounded-2xl p-8 text-center mb-4 cursor-pointer hover:bg-stone-50 transition-colors"
              style={{ borderColor: C.border }} onClick={() => handleUploadProof(showUploadModal)}>
              <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: C.muted }} />
              <div className="text-sm font-medium">Click to upload</div>
              <div className="text-xs mt-1" style={{ color: C.muted }}>PNG, JPG up to 5MB</div>
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-4"><div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-black rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div>
                <div className="text-xs text-center mt-1" style={{ color: C.muted }}>Uploading... {uploadProgress}%</div></div>
            )}
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] p-8 bg-white border shadow-xl" style={{ borderColor: C.border }}>
            {donationSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><Heart className="w-8 h-8 text-emerald-600" /></div>
                <h3 className="text-xl font-medium mb-2">Thank You!</h3>
                <p className="text-sm" style={{ color: C.muted }}>Your donation of £{donateAmount} has been received.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-medium">Donate to {userCharity.name}</h3>
                  <button onClick={() => setShowDonateModal(false)} className="p-1 rounded-full hover:bg-stone-100"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-sm mb-4" style={{ color: C.muted }}>Make an independent one-off donation to {userCharity.name}.</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {["5", "10", "25", "50"].map((amt) => (
                    <button key={amt} onClick={() => setDonateAmount(amt)}
                      className="py-3 rounded-xl text-sm font-medium border transition-all"
                      style={{ borderColor: donateAmount === amt ? C.ink : C.border, backgroundColor: donateAmount === amt ? "rgba(41,37,36,0.03)" : "transparent" }}>£{amt}</button>
                  ))}
                </div>
                <div className="mb-6"><label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: C.muted }}>Custom Amount</label>
                  <div className="flex items-center gap-2"><span className="text-lg font-medium">£</span>
                    <input type="number" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)}
                      className="w-full h-11 rounded-xl px-4 text-sm outline-none border" style={{ backgroundColor: "#fafaf9", borderColor: C.border }} min="1" /></div>
                </div>
                <button onClick={handleDonate} className="w-full h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2" style={{ backgroundColor: C.ink, color: C.bg }}>
                  Donate £{donateAmount}<Heart className="w-4 h-4" /></button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
