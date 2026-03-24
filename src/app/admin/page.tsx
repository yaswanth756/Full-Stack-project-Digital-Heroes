"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Trophy, Heart, Settings, LogOut, CheckCircle,
  Play, Check, Edit2, AlertCircle, TrendingUp, DollarSign,
  Plus, X, Search, Eye, Ban, Upload, Download, BarChart3,
} from "lucide-react";

const C = {
  bg: "#FDFCF8", ink: "#292524", muted: "#78716C", coral: "#FFB7B2",
  sage: "#E8EFE8", lavender: "#EFEDF4", border: "#e7e5e4", cardBg: "white",
};

type AdminTab = "overview" | "users" | "draws" | "charities" | "winners";

interface AdminUser {
  id: string; name: string; email: string; role: string; avatar: string;
  subscription: any; scores: any[]; charityPercentage: number; charityName: string;
}
interface AdminCharity {
  id: string; name: string; category: string; description: string;
  long_description?: string; image: string; raised: number; supporters: number; featured: boolean;
  charity_events?: any[];
}
interface AdminDraw {
  id: string; month: string; draw_date: string; drawn_numbers: number[];
  status: string; draw_logic: string; prize_pool_five: number; prize_pool_four: number;
  prize_pool_three: number; jackpot_rollover: number;
  winners: { id: string; user_id: string; match_type: number; matched_numbers: number[];
    prize: number; payment_status: string; verified: boolean; proof_uploaded: boolean;
    users?: { name: string; email: string; avatar: string } }[];
}
interface AdminStats {
  totalUsers: number; activeSubscribers: number; totalPrizePool: number;
  totalCharityContributions: number; monthlyRevenue: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Data state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [charities, setCharities] = useState<AdminCharity[]>([]);
  const [draws, setDraws] = useState<AdminDraw[]>([]);
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeSubscribers: 0, totalPrizePool: 0, totalCharityContributions: 0, monthlyRevenue: 0 });

  // Users state
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editUserData, setEditUserData] = useState({ name: "", email: "", plan: "monthly" as string, status: "active" as string });

  // Draw state
  const [runningDraw, setRunningDraw] = useState(false);
  const [drawResult, setDrawResult] = useState<number[] | null>(null);
  const [drawAnalysis, setDrawAnalysis] = useState<any[]>([]);
  const [simulatedDrawId, setSimulatedDrawId] = useState<string | null>(null);
  const [drawLogic, setDrawLogic] = useState("random");
  const [drawPublished, setDrawPublished] = useState(false);

  // Charity
  const [showAddCharity, setShowAddCharity] = useState(false);
  const [editingCharity, setEditingCharity] = useState<AdminCharity | null>(null);
  const [charityForm, setCharityForm] = useState({ name: "", category: "", description: "", featured: false });

  // Winners
  const [allWinners, setAllWinners] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Check auth first
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) { router.push("/login"); return; }
        const meData = await meRes.json();
        if (meData.user?.role !== "admin") { router.push("/dashboard"); return; }

        const [uRes, cRes, dRes, sRes, wRes] = await Promise.all([
          fetch("/api/admin/users"), fetch("/api/charities"), fetch("/api/draws"),
          fetch("/api/admin/stats"), fetch("/api/winners")
        ]);
        if (uRes.ok) { const d = await uRes.json(); setUsers(d.users || []); }
        if (cRes.ok) { const d = await cRes.json(); setCharities(d.charities || []); }
        if (dRes.ok) { const d = await dRes.json(); setDraws(d.draws || []); }
        if (sRes.ok) { const d = await sRes.json(); setStats(d.stats || stats); }
        if (wRes.ok) { const d = await wRes.json(); setAllWinners(d.winners || []); }
      } catch (err) { console.error("Admin data fetch error:", err); }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const refreshData = async () => {
    const [uRes, cRes, dRes, sRes, wRes] = await Promise.all([
      fetch("/api/admin/users"), fetch("/api/charities"), fetch("/api/draws"),
      fetch("/api/admin/stats"), fetch("/api/winners")
    ]);
    if (uRes.ok) setUsers((await uRes.json()).users || []);
    if (cRes.ok) setCharities((await cRes.json()).charities || []);
    if (dRes.ok) setDraws((await dRes.json()).draws || []);
    if (sRes.ok) setStats((await sRes.json()).stats || stats);
    if (wRes.ok) setAllWinners((await wRes.json()).winners || []);
  };

  const handleSimulateDraw = async () => {
    setRunningDraw(true); setDrawResult(null); setDrawPublished(false); setDrawAnalysis([]);
    try {
      const res = await fetch("/api/draws/simulate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logic: drawLogic })
      });
      if (res.ok) {
        const data = await res.json();
        setDrawResult(data.drawnNumbers || []);
        setDrawAnalysis(data.analysis || []);
        setSimulatedDrawId(data.draw?.id || null);
      } else { showToast("Simulation failed."); }
    } catch { showToast("Simulation error."); }
    setRunningDraw(false);
  };

  const handlePublishDraw = async () => {
    if (!simulatedDrawId) return;
    try {
      const res = await fetch("/api/draws/publish", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawId: simulatedDrawId })
      });
      if (res.ok) {
        setDrawPublished(true);
        showToast("Draw published!");
        await refreshData();
      }
    } catch {}
  };

  const handleVerifyWinner = async (winnerId: string) => {
    try {
      await fetch("/api/winners", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, action: "verify" })
      });
      showToast("Winner verified!");
      await refreshData();
    } catch {}
  };

  const handleMarkPaid = async (winnerId: string) => {
    try {
      await fetch("/api/winners", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, action: "markPaid" })
      });
      showToast("Payment marked as paid.");
      await refreshData();
    } catch {}
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setEditUserData({
      name: user.name, email: user.email,
      plan: user.subscription?.plan || "monthly",
      status: user.subscription?.status || "active",
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser.id, ...editUserData })
      });
      if (res.ok) { showToast("User updated!"); await refreshData(); }
    } catch {}
    setEditingUser(null);
  };

  const handleAddCharity = async () => {
    if (!charityForm.name) return;
    try {
      const res = await fetch("/api/charities", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(charityForm)
      });
      if (res.ok) { showToast("Charity added!"); await refreshData(); }
      else showToast("Failed to add charity.");
    } catch { showToast("Failed to add charity."); }
    setShowAddCharity(false);
    setCharityForm({ name: "", category: "", description: "", featured: false });
  };

  const handleEditCharity = (charity: AdminCharity) => {
    setEditingCharity(charity);
    setCharityForm({ name: charity.name, category: charity.category, description: charity.description, featured: charity.featured });
  };

  const handleSaveCharity = async () => {
    if (!editingCharity) return;
    try {
      const res = await fetch("/api/charities", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCharity.id, ...charityForm })
      });
      if (res.ok) { showToast("Charity updated!"); await refreshData(); }
    } catch { showToast("Failed to update."); }
    setEditingCharity(null);
    setCharityForm({ name: "", category: "", description: "", featured: false });
  };

  const handleDeleteCharity = async (id: string) => {
    try {
      const res = await fetch(`/api/charities?id=${id}`, { method: "DELETE" });
      if (res.ok) { showToast("Charity removed."); await refreshData(); }
    } catch { showToast("Error removing."); }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { id: "draws", label: "Draws", icon: <Play className="w-4 h-4" /> },
    { id: "charities", label: "Charities", icon: <Heart className="w-4 h-4" /> },
    { id: "winners", label: "Winners & Payouts", icon: <Trophy className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm" style={{ color: C.muted }}>Loading admin console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, color: C.ink, fontFamily: "var(--font-outfit)" }}>
      {toast && (
        <div className="fixed top-4 right-4 z-[100]">
          <div className="bg-black text-white px-5 py-3 rounded-2xl text-sm font-medium shadow-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" /> {toast}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ backgroundColor: "rgba(253,252,248,0.8)", borderColor: C.border }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black"><div className="w-2 h-2 rounded-full bg-white" /></div>
            <span className="font-semibold text-[15px] tracking-tight">Admin Console</span>
          </div>
          <button onClick={async () => { try { await fetch("/api/auth/logout", { method: "POST" }); } catch {} localStorage.removeItem("user"); router.push("/"); }}
            className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity" style={{ color: C.muted }}>
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Exit Admin</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        <nav className="flex flex-row md:flex-col gap-1 w-full md:w-56 overflow-x-auto hide-scrollbar pb-2 md:pb-0 shrink-0 border-b md:border-b-0 border-r-0 md:border-r border-stone-200">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all w-full text-left"
              style={{ backgroundColor: activeTab === tab.id ? C.ink : "transparent", color: activeTab === tab.id ? C.bg : C.muted }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 space-y-6 min-w-0">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <h1 className="text-3xl font-medium tracking-tight">Platform Reports</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: stats.totalUsers.toLocaleString(), bg: C.sage, icon: <Users className="w-5 h-5 opacity-40" /> },
                  { label: "Active Subs", value: stats.activeSubscribers.toLocaleString(), bg: C.lavender, icon: <CheckCircle className="w-5 h-5 opacity-40" /> },
                  { label: "Prize Pool", value: `£${stats.totalPrizePool.toLocaleString()}`, bg: "rgba(255,183,178,0.2)", icon: <Trophy className="w-5 h-5 opacity-40" /> },
                  { label: "Total Given", value: `£${stats.totalCharityContributions.toLocaleString()}`, bg: "#fafaf9", icon: <Heart className="w-5 h-5 opacity-40" /> },
                ].map((stat, i) => (
                  <div key={i} className="rounded-2xl p-5 border relative overflow-hidden" style={{ backgroundColor: stat.bg, borderColor: "rgba(0,0,0,0.04)" }}>
                    <div className="absolute right-4 top-4">{stat.icon}</div>
                    <div className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: C.muted }}>{stat.label}</div>
                    <div className="text-3xl font-medium">{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border p-6 bg-white" style={{ borderColor: C.border }}>
                  <h3 className="font-medium mb-4">Revenue Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Monthly Revenue", value: `£${stats.monthlyRevenue.toLocaleString()}` },
                      { label: "Prize Pool (40%)", value: `£${Math.round(stats.monthlyRevenue * 0.4).toLocaleString()}` },
                      { label: "Avg. Charity %", value: "~14%" },
                      { label: "Platform Ops", value: `£${Math.round(stats.monthlyRevenue * 0.46).toLocaleString()}` },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: C.muted }}>{item.label}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border p-6 bg-white" style={{ borderColor: C.border }}>
                  <h3 className="font-medium mb-4">Draw Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-sm" style={{ color: C.muted }}>Total Draws</span><span className="font-medium">{draws.length}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm" style={{ color: C.muted }}>Total Winners</span><span className="font-medium">{allWinners.length}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm" style={{ color: C.muted }}>Total Prizes Paid</span><span className="font-medium">£{allWinners.reduce((a: number, w: any) => a + (w.prize || 0), 0).toLocaleString()}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm" style={{ color: C.muted }}>Jackpot Rollover</span><span className="font-medium text-amber-600">£{draws[0]?.jackpot_rollover || 0}</span></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* USERS */}
          {activeTab === "users" && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-medium tracking-tight">User Management</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.muted }} />
                  <input type="text" placeholder="Search..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                    className="bg-white border rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:border-black" style={{ borderColor: C.border }} />
                </div>
              </div>
              <div className="bg-white rounded-2xl border overflow-x-auto" style={{ borderColor: C.border }}>
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead><tr className="border-b" style={{ borderColor: C.border, color: C.muted }}>
                    <th className="p-4 font-medium">Name / Email</th><th className="p-4 font-medium">Plan</th>
                    <th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Scores</th>
                    <th className="p-4 font-medium">Charity %</th><th className="p-4 font-medium text-right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-stone-50" style={{ borderColor: "#f5f5f4" }}>
                        <td className="p-4"><div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-medium">{u.avatar}</div>
                          <div><div className="font-medium">{u.name}</div><div className="text-xs" style={{ color: C.muted }}>{u.email}</div></div>
                        </div></td>
                        <td className="p-4 uppercase text-xs font-medium tracking-wider">{u.subscription?.plan || "—"}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.subscription?.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          u.subscription?.status === 'lapsed' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {u.subscription?.status || "none"}</span></td>
                        <td className="p-4">{u.scores?.length || 0} / 5</td>
                        <td className="p-4">{u.charityPercentage || 10}%</td>
                        <td className="p-4 text-right"><div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEditUser(u)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"><Edit2 className="w-4 h-4" style={{ color: C.muted }} /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-center" style={{ color: C.muted }}>Showing {filteredUsers.length} of {users.length} users</div>
            </>
          )}

          {/* DRAWS */}
          {activeTab === "draws" && (
            <>
              <h1 className="text-3xl font-medium tracking-tight mb-2">Draw Management</h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-2xl border p-6 bg-white shrink-0" style={{ borderColor: C.border }}>
                    <h3 className="font-medium text-lg mb-4">Run Simulation</h3>
                    <div className="flex items-center gap-4 mb-6">
                      <select value={drawLogic} onChange={(e) => setDrawLogic(e.target.value)}
                        className="bg-stone-50 border rounded-lg px-3 py-2 text-sm outline-none" style={{ borderColor: C.border }}>
                        <option value="random">Logic: Random Generation</option>
                        <option value="algorithmic">Logic: Algorithmic (Weighted)</option>
                      </select>
                      <button onClick={handleSimulateDraw} disabled={runningDraw}
                        className="flex-1 bg-black text-white rounded-lg px-4 py-2 font-medium text-sm disabled:opacity-50 flex justify-center transition-transform hover:scale-[1.01]">
                        {runningDraw ? "Simulating..." : "Run Simulation"}
                      </button>
                    </div>
                    {drawResult && (
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="text-xs font-medium text-emerald-800 uppercase tracking-widest mb-3">
                          Simulation Results {drawLogic === "algorithmic" && "· Weighted"}
                        </div>
                        <div className="flex gap-2 mb-4">
                          {drawResult.map((n, i) => (
                            <div key={i} className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-lg text-emerald-900 border border-emerald-200 shadow-sm">{n}</div>
                          ))}
                        </div>
                        <div className="mb-4 text-sm text-emerald-800">
                          <div className="font-medium mb-2">Match Analysis (Pre-publish):</div>
                          {drawAnalysis.length > 0 ? drawAnalysis.map((a: any) => (
                            <div key={a.userId} className="flex items-center gap-2 text-xs py-1">
                              <span className="font-medium">{a.name}</span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{a.matches}-match</span>
                              <span className="text-emerald-600">({a.matchedNums.join(", ")})</span>
                            </div>
                          )) : <div className="text-xs">No winners this round.</div>}
                        </div>
                        {!drawPublished ? (
                          <button onClick={handlePublishDraw}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 w-full shadow-sm transition-colors">
                            Publish Draw Results
                          </button>
                        ) : (
                          <div className="text-center py-2 text-sm font-medium text-emerald-700">✓ Draw Published Successfully</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border p-6 bg-white overflow-hidden" style={{ borderColor: C.border }}>
                    <h3 className="font-medium text-lg mb-4">All Draws</h3>
                    <div className="space-y-4">
                      {draws.map(d => (
                        <div key={d.id} className="flex justify-between items-center p-4 border rounded-xl bg-stone-50" style={{ borderColor: "#f5f5f4" }}>
                          <div>
                            <div className="font-medium">{d.month}</div>
                            <div className="text-xs text-stone-500 mt-1 uppercase tracking-wider">
                              Status: <span className={d.status === "pending" || d.status === "simulated" ? "text-amber-500" : "text-emerald-500"}>{d.status}</span>
                              {d.winners?.length > 0 && <span className="ml-2">· {d.winners.length} winner(s)</span>}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {d.drawn_numbers?.map((n: number, i: number) => (
                              <div key={i} className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-xs font-semibold" style={{ borderColor: C.border }}>{n}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {draws.length === 0 && <p className="text-sm text-center py-8" style={{ color: C.muted }}>No draws yet. Run a simulation above.</p>}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="rounded-2xl border p-6 bg-black text-white">
                    <div className="text-xs font-medium text-white/50 uppercase tracking-widest mb-2">Rollover</div>
                    <h3 className="text-2xl font-bold mb-4" style={{ color: C.coral }}>£{draws[0]?.jackpot_rollover || 0} Jackpot</h3>
                    <p className="text-sm text-white/70">Automatic trigger on 5-match win.</p>
                  </div>
                  <div className="rounded-2xl border p-6 bg-white" style={{ borderColor: C.border }}>
                    <h3 className="font-medium mb-3">Pool Distribution</h3>
                    <div className="space-y-3">
                      {[{ label: "5-Match (Jackpot)", pct: "40%", color: "#f59e0b" }, { label: "4-Match", pct: "35%", color: "#8b5cf6" }, { label: "3-Match", pct: "25%", color: "#22c55e" }].map((tier, i) => (
                        <div key={i}><div className="flex justify-between text-xs mb-1"><span style={{ color: C.muted }}>{tier.label}</span><span className="font-medium">{tier.pct}</span></div>
                        <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: tier.pct, backgroundColor: tier.color }} /></div></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CHARITIES */}
          {activeTab === "charities" && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-medium tracking-tight">Charity Management</h1>
                <button onClick={() => { setShowAddCharity(true); setCharityForm({ name: "", category: "", description: "", featured: false }); }}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-transform hover:scale-105">
                  <Plus className="w-4 h-4" /> Add Charity
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {charities.map(c => (
                  <div key={c.id} className="p-5 bg-white border rounded-2xl flex flex-col justify-between" style={{ borderColor: C.border }}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2"><span className="text-lg">{c.image}</span><h3 className="font-medium text-lg">{c.name}</h3></div>
                        {c.featured && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Featured</span>}
                      </div>
                      <span className="text-xs text-stone-500 mb-3 block">{c.category}</span>
                      <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">{c.description}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between text-sm">
                      <div className="text-stone-500"><span className="font-semibold text-black">£{c.raised?.toLocaleString()}</span> raised · {c.supporters} supporters</div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditCharity(c)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"><Edit2 className="w-4 h-4" style={{ color: C.muted }} /></button>
                        <button onClick={() => handleDeleteCharity(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><X className="w-4 h-4 text-red-400" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* WINNERS */}
          {activeTab === "winners" && (
            <>
              <h1 className="text-3xl font-medium tracking-tight mb-4">Winners & Verification</h1>
              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead><tr className="border-b bg-stone-50 text-stone-500" style={{ borderColor: C.border }}>
                    <th className="p-4 font-medium">Winner</th><th className="p-4 font-medium">Draw</th>
                    <th className="p-4 font-medium">Match</th><th className="p-4 font-medium">Prize</th>
                    <th className="p-4 font-medium">Verification</th><th className="p-4 font-medium">Payout</th>
                  </tr></thead>
                  <tbody>
                    {allWinners.map((w: any) => (
                      <tr key={w.id} className="border-b last:border-0 hover:bg-stone-50" style={{ borderColor: "#f5f5f4" }}>
                        <td className="p-4"><div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-medium">{w.users?.avatar || "?"}</div>
                          <span className="font-medium">{w.users?.name || "Unknown"}</span>
                        </div></td>
                        <td className="p-4">{w.draws?.month || "—"}</td>
                        <td className="p-4"><span className="px-2 py-1 rounded-md font-bold text-xs" style={{ backgroundColor: "rgba(255,183,178,0.15)", color: C.ink }}>{w.match_type}-Match</span></td>
                        <td className="p-4 font-medium">£{w.prize?.toLocaleString()}</td>
                        <td className="p-4">
                          {w.verified ? (
                            <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"><CheckCircle className="w-3 h-3" /> VERIFIED</span>
                          ) : (
                            <button onClick={() => handleVerifyWinner(w.id)} className="flex items-center gap-1 text-amber-600 text-xs font-semibold hover:text-amber-800 transition-colors">
                              <AlertCircle className="w-3 h-3" /> REVIEW & VERIFY
                            </button>
                          )}
                        </td>
                        <td className="p-4">
                          {w.payment_status === "paid" ? (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold tracking-wider bg-stone-100 text-stone-600 uppercase">Paid</span>
                          ) : (
                            <button onClick={() => handleMarkPaid(w.id)} className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors">Mark Paid</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {allWinners.length === 0 && (
                <div className="text-center py-12 text-sm" style={{ color: C.muted }}>No winners yet. Run and publish a draw to see results.</div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] p-8 bg-white border shadow-xl" style={{ borderColor: C.border }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-full hover:bg-stone-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>Name</label>
                <input value={editUserData.name} onChange={(e) => setEditUserData({...editUserData, name: e.target.value})} className="w-full h-11 rounded-xl px-4 text-sm outline-none border" style={{ backgroundColor: "#fafaf9", borderColor: C.border }} /></div>
              <div><label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>Email</label>
                <input value={editUserData.email} onChange={(e) => setEditUserData({...editUserData, email: e.target.value})} className="w-full h-11 rounded-xl px-4 text-sm outline-none border" style={{ backgroundColor: "#fafaf9", borderColor: C.border }} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>Plan</label>
                  <select value={editUserData.plan} onChange={(e) => setEditUserData({...editUserData, plan: e.target.value})} className="w-full h-11 rounded-xl px-4 text-sm outline-none border" style={{ backgroundColor: "#fafaf9", borderColor: C.border }}>
                    <option value="monthly">Monthly</option><option value="yearly">Yearly</option>
                  </select></div>
                <div><label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>Status</label>
                  <select value={editUserData.status} onChange={(e) => setEditUserData({...editUserData, status: e.target.value})} className="w-full h-11 rounded-xl px-4 text-sm outline-none border" style={{ backgroundColor: "#fafaf9", borderColor: C.border }}>
                    <option value="active">Active</option><option value="inactive">Inactive</option><option value="lapsed">Lapsed</option>
                  </select></div>
              </div>
              <div><label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>Scores</label>
                <div className="flex gap-1 flex-wrap">
                  {editingUser.scores?.map((s: any) => (
                    <span key={s.id} className="px-2 py-1 rounded-lg text-xs font-medium border" style={{ borderColor: C.border }}>{s.value} ({s.score_date || s.date})</span>
                  ))}
                  {(!editingUser.scores || editingUser.scores.length === 0) && <span className="text-xs" style={{ color: C.muted }}>No scores</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="flex-1 h-11 rounded-full border text-sm font-medium" style={{ borderColor: C.border }}>Cancel</button>
              <button onClick={handleSaveUser} className="flex-1 h-11 rounded-full text-sm font-medium" style={{ backgroundColor: C.ink, color: C.bg }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Charity Modal */}
      {showAddCharity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] p-8 bg-white border shadow-xl" style={{ borderColor: C.border }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Add Charity</h3>
              <button onClick={() => setShowAddCharity(false)} className="p-1 rounded-full hover:bg-stone-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>Name</label>
                <input value={charityForm.name} onChange={(e) => setCharityForm({...charityForm, name: e.target.value})} placeholder="Charity name" className="w-full h-11 rounded-xl px-4 text-sm outline-none border" style={{ backgroundColor: "#fafaf9", borderColor: C.border }} /></div>
              <div><label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>Category</label>
                <input value={charityForm.category} onChange={(e) => setCharityForm({...charityForm, category: e.target.value})} placeholder="e.g. Environment, Children" className="w-full h-11 rounded-xl px-4 text-sm outline-none border" style={{ backgroundColor: "#fafaf9", borderColor: C.border }} /></div>
              <div><label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>Description</label>
                <textarea value={charityForm.description} onChange={(e) => setCharityForm({...charityForm, description: e.target.value})} rows={3} placeholder="Brief description..." className="w-full rounded-xl px-4 py-3 text-sm outline-none border resize-none" style={{ backgroundColor: "#fafaf9", borderColor: C.border }} /></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={charityForm.featured} onChange={(e) => setCharityForm({...charityForm, featured: e.target.checked})} className="accent-black" />
                <span className="text-sm">Featured charity</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddCharity(false)} className="flex-1 h-11 rounded-full border text-sm font-medium" style={{ borderColor: C.border }}>Cancel</button>
              <button onClick={handleAddCharity} className="flex-1 h-11 rounded-full text-sm font-medium" style={{ backgroundColor: C.ink, color: C.bg }}>Add Charity</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Charity Modal */}
      {editingCharity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] p-8 bg-white border shadow-xl" style={{ borderColor: C.border }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Edit Charity</h3>
              <button onClick={() => setEditingCharity(null)} className="p-1 rounded-full hover:bg-stone-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>Name</label>
                <input value={charityForm.name} onChange={(e) => setCharityForm({...charityForm, name: e.target.value})} className="w-full h-11 rounded-xl px-4 text-sm outline-none border" style={{ backgroundColor: "#fafaf9", borderColor: C.border }} /></div>
              <div><label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>Category</label>
                <input value={charityForm.category} onChange={(e) => setCharityForm({...charityForm, category: e.target.value})} className="w-full h-11 rounded-xl px-4 text-sm outline-none border" style={{ backgroundColor: "#fafaf9", borderColor: C.border }} /></div>
              <div><label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>Description</label>
                <textarea value={charityForm.description} onChange={(e) => setCharityForm({...charityForm, description: e.target.value})} rows={3} className="w-full rounded-xl px-4 py-3 text-sm outline-none border resize-none" style={{ backgroundColor: "#fafaf9", borderColor: C.border }} /></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={charityForm.featured} onChange={(e) => setCharityForm({...charityForm, featured: e.target.checked})} className="accent-black" />
                <span className="text-sm">Featured charity</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingCharity(null)} className="flex-1 h-11 rounded-full border text-sm font-medium" style={{ borderColor: C.border }}>Cancel</button>
              <button onClick={handleSaveCharity} className="flex-1 h-11 rounded-full text-sm font-medium" style={{ backgroundColor: C.ink, color: C.bg }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
