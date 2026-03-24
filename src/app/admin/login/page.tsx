"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Shield, Lock, AlertTriangle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter your admin credentials.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/admin");
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Subtle glow effects */}
      <div
        className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full blur-[150px] opacity-20 -z-10"
        style={{ backgroundColor: "#FFB7B2" }}
      />
      <div
        className="absolute bottom-[20%] right-[15%] w-[250px] h-[250px] rounded-full blur-[120px] opacity-15 -z-10"
        style={{ backgroundColor: "#8b5cf6" }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="w-full max-w-md">
        {/* Admin Badge */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
          >
            <Shield className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <span
              className="font-semibold text-lg tracking-tight block leading-tight"
              style={{ color: "#FDFCF8", fontFamily: "var(--font-outfit), sans-serif" }}
            >
              Admin Console
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
              Softly Golf
            </span>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-[2rem] p-8 md:p-10"
          style={{
            backgroundColor: "#141414",
            border: "1px solid #262626",
            boxShadow: "0 4px 40px -4px rgba(0,0,0,0.5)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-white/40" />
            <h1
              className="text-xl font-medium tracking-tight"
              style={{ color: "#FDFCF8", fontFamily: "var(--font-outfit), sans-serif" }}
            >
              Admin Authentication
            </h1>
          </div>
          <p className="text-sm mb-8" style={{ color: "#666" }}>
            Restricted access. Admin credentials only.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                className="block text-[10px] font-semibold mb-2 uppercase tracking-[0.2em]"
                style={{ color: "#555" }}
              >
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@softlygolf.com"
                className="w-full h-12 rounded-xl px-4 text-sm outline-none border transition-all focus:border-white/30 placeholder:text-white/15"
                style={{
                  backgroundColor: "#0a0a0a",
                  borderColor: "#262626",
                  color: "#FDFCF8",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              />
            </div>

            <div>
              <label
                className="block text-[10px] font-semibold mb-2 uppercase tracking-[0.2em]"
                style={{ color: "#555" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 rounded-xl px-4 text-sm outline-none border transition-all focus:border-white/30 placeholder:text-white/15"
                style={{
                  backgroundColor: "#0a0a0a",
                  borderColor: "#262626",
                  color: "#FDFCF8",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
              >
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span style={{ color: "#f87171" }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 group transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-60"
              style={{
                backgroundColor: "#FDFCF8",
                color: "#0a0a0a",
                fontFamily: "var(--font-outfit), sans-serif",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Access Admin Panel
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div
            className="mt-6 p-3 rounded-xl flex items-start gap-2"
            style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid #1a1a1a" }}
          >
            <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#444" }} />
            <p className="text-[11px] leading-relaxed" style={{ color: "#444" }}>
              This portal is for authorized administrators only.
              All login attempts are monitored and logged.
            </p>
          </div>
        </div>

        {/* Footer link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/login")}
            className="text-sm hover:underline underline-offset-4 transition-colors"
            style={{ color: "#444" }}
          >
            ← Back to user login
          </button>
        </div>
      </div>
    </div>
  );
}
