"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, CreditCard, Lock, Shield } from "lucide-react";

const C = {
  bg: "#FDFCF8", ink: "#292524", muted: "#78716C", coral: "#FFB7B2",
  sage: "#E8EFE8", border: "#e7e5e4",
};

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get("plan");
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    plan: (preselectedPlan === "yearly" ? "yearly" : "monthly") as "monthly" | "yearly",
    charityId: "",
    charityPercentage: 10,
  });
  const [charities, setCharities] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/charities").then(r => r.json()).then(d => {
      const list = d.charities || [];
      setCharities(list);
      if (list.length > 0 && !form.charityId) setForm(f => ({ ...f, charityId: list[0].id }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (preselectedPlan === "yearly" || preselectedPlan === "monthly") {
      setForm(f => ({ ...f, plan: preselectedPlan }));
    }
  }, [preselectedPlan]);

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!form.name.trim()) { setError("Please enter your name."); return false; }
      if (!form.email.trim() || !form.email.includes("@")) { setError("Please enter a valid email."); return false; }
      if (!form.password || form.password.length < 6) { setError("Password must be at least 6 characters."); return false; }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleFinalSubmit = async () => {
    setProcessing(true);
    setError("");

    try {
      // Step 1: Create the user account first
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        setError(signupData.error || "Failed to sign up.");
        setProcessing(false);
        setStep(1);
        return;
      }

      localStorage.setItem("user", JSON.stringify(signupData.user));

      // Step 2: Create Stripe Checkout session
      const stripeRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: form.plan,
          userId: signupData.user.id,
          email: form.email,
          name: form.name,
          charityId: form.charityId,
          charityPercentage: form.charityPercentage,
        }),
      });

      const stripeData = await stripeRes.json();

      if (!stripeRes.ok) {
        // If Stripe fails (e.g. no keys configured), fallback to dashboard
        console.warn("Stripe checkout failed, proceeding without payment:", stripeData.error);
        setProcessing(false);
        router.push("/dashboard");
        return;
      }

      // Step 3: Redirect to Stripe Checkout
      if (stripeData.url) {
        window.location.href = stripeData.url;
      } else {
        // Fallback if no URL returned
        console.warn("No Stripe URL returned, proceeding to dashboard");
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setProcessing(false);
      setStep(1);
    }
  };
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ backgroundColor: C.bg }}
    >
      <div
        className="absolute top-[15%] right-[5%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-40 -z-10"
        style={{ backgroundColor: "#E6E6FA" }}
      />
      <div
        className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] rounded-full blur-[100px] opacity-40 -z-10"
        style={{ backgroundColor: "#FFE4E1" }}
      />

      <div className="w-full max-w-lg">
        {/* Logo */}
        <button onClick={() => router.push("/")} className="flex items-center justify-center gap-2 mb-8">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: C.coral }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
          <span
            className="font-semibold text-xl tracking-tight"
            style={{ color: C.ink, fontFamily: "var(--font-outfit)" }}
          >
            Softly Golf
          </span>
        </button>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[
            { num: 1, label: "Account" },
            { num: 2, label: "Plan" },
            { num: 3, label: "Charity" },
            { num: 4, label: "Confirm" },
          ].map((s, i, arr) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all"
                  style={{
                    backgroundColor: step >= s.num ? C.ink : "#f5f5f4",
                    color: step >= s.num ? C.bg : C.muted,
                  }}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-[10px] mt-1" style={{ color: step >= s.num ? C.ink : C.muted }}>{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div
                  className="w-8 h-0.5 rounded-full mb-4"
                  style={{ backgroundColor: step > s.num ? C.ink : "#e7e5e4" }}
                />
              )}
            </div>
          ))}
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
          <form onSubmit={handleSubmit}>
            {/* Step 1: Account */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2
                    className="text-2xl font-medium tracking-tight mb-1"
                    style={{ color: C.ink }}
                  >
                    Create your account
                  </h2>
                  <p className="text-sm" style={{ color: C.muted }}>
                    Join the community of golfers who give.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: C.muted }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="James Watson"
                    className="w-full h-12 rounded-xl px-4 text-sm outline-none border focus:ring-2"
                    style={{ backgroundColor: "#fafaf9", borderColor: C.border, color: C.ink }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: C.muted }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="james@example.com"
                    className="w-full h-12 rounded-xl px-4 text-sm outline-none border focus:ring-2"
                    style={{ backgroundColor: "#fafaf9", borderColor: C.border, color: C.ink }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: C.muted }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full h-12 rounded-xl px-4 text-sm outline-none border focus:ring-2"
                    style={{ backgroundColor: "#fafaf9", borderColor: C.border, color: C.ink }}
                    required
                  />
                  <div className="text-xs mt-1" style={{ color: C.muted }}>Minimum 6 characters</div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  className="w-full h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 group transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: C.ink, color: C.bg }}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Step 2: Plan */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-medium tracking-tight mb-1" style={{ color: C.ink }}>
                    Choose your plan
                  </h2>
                  <p className="text-sm" style={{ color: C.muted }}>
                    A portion of every subscription goes to charity & the prize pool.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "monthly", name: "Monthly", price: "£9.99/mo", desc: "Cancel anytime", breakdown: "~£4 prize pool · ~£1 charity · £5 platform" },
                    { id: "yearly", name: "Yearly", price: "£89.99/yr", desc: "Save 25%", badge: true, breakdown: "~£36 prize pool · ~£9 charity · £45 platform" },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setForm({ ...form, plan: plan.id as "monthly" | "yearly" })}
                      className="w-full p-5 rounded-2xl border text-left transition-all"
                      style={{
                        borderColor: form.plan === plan.id ? C.ink : C.border,
                        backgroundColor: form.plan === plan.id ? "rgba(41,37,36,0.03)" : "white",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium" style={{ color: C.ink }}>
                            {plan.name}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: C.muted }}>
                            {plan.desc}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {plan.badge && (
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: C.coral, color: C.ink }}
                            >
                              Best Value
                            </span>
                          )}
                          <span className="font-medium" style={{ color: C.ink }}>
                            {plan.price}
                          </span>
                        </div>
                      </div>
                      {form.plan === plan.id && (
                        <div className="text-xs mt-2 pt-2 border-t" style={{ borderColor: "#f5f5f4", color: C.muted }}>
                          {plan.breakdown}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 rounded-full font-medium text-sm border"
                    style={{ borderColor: C.border, color: C.ink }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 group transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: C.ink, color: C.bg }}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Charity */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-medium tracking-tight mb-1" style={{ color: C.ink }}>
                    Pick your charity
                  </h2>
                  <p className="text-sm" style={{ color: C.muted }}>
                    At least 10% of your subscription goes to this cause.
                  </p>
                </div>

                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {charities.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setForm({ ...form, charityId: c.id })}
                      className="w-full p-4 rounded-xl border text-left transition-all"
                      style={{
                        borderColor: form.charityId === c.id ? C.ink : C.border,
                        backgroundColor: form.charityId === c.id ? "rgba(41,37,36,0.03)" : "white",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{c.image}</span>
                        <div>
                          <div className="font-medium text-sm" style={{ color: C.ink }}>
                            {c.name}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: C.muted }}>
                            {c.category} · {c.supporters} supporters
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: C.muted }}>
                    Charity Percentage: {form.charityPercentage}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={form.charityPercentage}
                    onChange={(e) =>
                      setForm({ ...form, charityPercentage: parseInt(e.target.value) })
                    }
                    className="w-full accent-stone-800"
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: C.muted }}>
                    <span>10% min</span>
                    <span>50%</span>
                  </div>
                  <div className="mt-2 p-2 rounded-lg text-xs text-center" style={{ backgroundColor: C.sage }}>
                    £{((form.plan === "monthly" ? 9.99 : 89.99) * form.charityPercentage / 100).toFixed(2)} goes to {charities.find(c => c.id === form.charityId)?.name} per {form.plan === "monthly" ? "month" : "year"}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 h-12 rounded-full font-medium text-sm border"
                    style={{ borderColor: C.border, color: C.ink }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 group transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: C.ink, color: C.bg }}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-medium tracking-tight mb-1" style={{ color: C.ink }}>
                    Confirm & Subscribe
                  </h2>
                  <p className="text-sm" style={{ color: C.muted }}>
                    Review your details before completing signup.
                  </p>
                </div>

                {/* Summary */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border" style={{ borderColor: "#f5f5f4" }}>
                    <div className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: C.muted }}>Account</div>
                    <div className="text-sm font-medium">{form.name}</div>
                    <div className="text-xs" style={{ color: C.muted }}>{form.email}</div>
                  </div>
                  <div className="p-4 rounded-xl border" style={{ borderColor: "#f5f5f4" }}>
                    <div className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: C.muted }}>Plan</div>
                    <div className="text-sm font-medium">{form.plan === "monthly" ? "Monthly — £9.99/mo" : "Yearly — £89.99/yr"}</div>
                  </div>
                  <div className="p-4 rounded-xl border" style={{ borderColor: "#f5f5f4" }}>
                    <div className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: C.muted }}>Charity</div>
                    <div className="text-sm font-medium">{charities.find(c => c.id === form.charityId)?.name} — {form.charityPercentage}%</div>
                  </div>
                </div>

                {/* Stripe Payment Info */}
                <div className="p-4 rounded-xl border" style={{ borderColor: C.border, backgroundColor: "#fafaf9" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4" style={{ color: C.muted }} />
                    <span className="text-xs font-medium uppercase tracking-widest" style={{ color: C.muted }}>Payment via Stripe</span>
                  </div>
                  <div className="text-xs" style={{ color: C.muted }}>
                    You&apos;ll be securely redirected to Stripe to complete your payment.
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Shield className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-medium text-emerald-700">PCI-compliant · 256-bit SSL encrypted</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 h-12 rounded-full font-medium text-sm border"
                    style={{ borderColor: C.border, color: C.ink }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={processing}
                    className="flex-1 h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 group transition-transform hover:scale-[1.02] disabled:opacity-60"
                    style={{ backgroundColor: C.coral, color: C.ink }}
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin" />
                        Redirecting to Stripe...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pay & Subscribe
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/login")}
            className="text-sm hover:underline underline-offset-4"
            style={{ color: C.muted }}
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FDFCF8" }}>
        <div className="text-sm" style={{ color: "#78716C" }}>Loading...</div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
