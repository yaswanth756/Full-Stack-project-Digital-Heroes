"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to login. Please try again.");
        return;
      }

      // Block admin users from regular login — they must use /admin/login
      if (data.user.role === "admin") {
        setError("Admin accounts must use the admin portal.");
        // Clear cookie since the API set one
        try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: "#FDFCF8" }}
    >
      {/* Blobs */}
      <div
        className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-50 -z-10"
        style={{ backgroundColor: "#FFE4E1" }}
      />
      <div
        className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] rounded-full blur-[140px] opacity-50 -z-10"
        style={{ backgroundColor: "#E6E6FA" }}
      />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#FFB7B2" }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
          <span
            className="font-semibold text-xl tracking-tight"
            style={{ color: "#292524", fontFamily: "var(--font-outfit), sans-serif" }}
          >
            Softly Golf
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-[2rem] p-8 md:p-10 border"
          style={{
            backgroundColor: "white",
            borderColor: "rgba(0,0,0,0.06)",
            boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)",
          }}
        >
          <h1
            className="text-2xl font-medium tracking-tight mb-1"
            style={{ color: "#292524", fontFamily: "var(--font-outfit), sans-serif" }}
          >
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: "#78716C" }}>
            Sign in to your account to continue.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                className="block text-xs font-medium mb-2 uppercase tracking-widest"
                style={{ color: "#78716C" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="james@example.com"
                className="w-full h-12 rounded-xl px-4 text-sm outline-none border transition-all focus:ring-2"
                style={{
                  backgroundColor: "#fafaf9",
                  borderColor: "#e7e5e4",
                  color: "#292524",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-2 uppercase tracking-widest"
                style={{ color: "#78716C" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 rounded-xl px-4 text-sm outline-none border transition-all focus:ring-2"
                style={{
                  backgroundColor: "#fafaf9",
                  borderColor: "#e7e5e4",
                  color: "#292524",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: "#ef4444" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 group transition-transform hover:scale-[1.02] active:scale-100"
              style={{
                backgroundColor: "#292524",
                color: "#FDFCF8",
                fontFamily: "var(--font-outfit), sans-serif",
              }}
            >
              Sign in
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/signup")}
              className="text-sm font-medium hover:underline underline-offset-4"
              style={{ color: "#FFB7B2" }}
            >
              Don&apos;t have an account? Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
