"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";

const C = {
  bg: "#FDFCF8", ink: "#292524", muted: "#78716C", coral: "#FFB7B2",
  sage: "#E8EFE8", border: "#e7e5e4",
};

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setPaymentInfo(data);
          setStatus(data.status === "paid" ? "success" : "loading");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    verifyPayment();

    // Poll for payment confirmation if still processing
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "paid") {
            setPaymentInfo(data);
            setStatus("success");
            clearInterval(interval);
          }
        }
      } catch {}
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ backgroundColor: C.bg }}
    >
      {/* Background blobs */}
      <div
        className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-50 -z-10"
        style={{ backgroundColor: "#E8EFE8" }}
      />
      <div
        className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[100px] opacity-50 -z-10"
        style={{ backgroundColor: "#E6E6FA" }}
      />

      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: C.sage }}>
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: C.ink }} />
            </div>
            <div>
              <h1 className="text-2xl font-medium tracking-tight mb-2" style={{ color: C.ink }}>
                Processing Payment...
              </h1>
              <p className="text-sm" style={{ color: C.muted }}>
                Please wait while we confirm your payment with Stripe.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: C.sage }}>
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-medium tracking-tight mb-2" style={{ color: C.ink, fontFamily: "var(--font-outfit)" }}>
                Payment Successful! 🎉
              </h1>
              <p className="text-sm mb-1" style={{ color: C.muted }}>
                Your subscription is now active.
              </p>
              {paymentInfo && (
                <p className="text-sm font-medium" style={{ color: C.ink }}>
                  {paymentInfo.amount_total
                    ? `£${(paymentInfo.amount_total / 100).toFixed(2)} paid`
                    : ""}
                  {paymentInfo.metadata?.plan
                    ? ` · ${paymentInfo.metadata.plan} plan`
                    : ""}
                </p>
              )}
            </div>

            <div
              className="rounded-2xl p-6 border text-left space-y-3"
              style={{ backgroundColor: "white", borderColor: "rgba(0,0,0,0.06)" }}
            >
              <div className="text-xs font-medium uppercase tracking-widest" style={{ color: C.muted }}>
                What&#39;s next?
              </div>
              {[
                { emoji: "⛳", text: "Enter your 5 latest golf scores" },
                { emoji: "🎗️", text: "Your charity contribution is active" },
                { emoji: "🎰", text: "You're entered into the next monthly draw" },
                { emoji: "🏆", text: "Match numbers to win from the prize pool" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-sm" style={{ color: C.ink }}>{item.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 group transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: C.ink, color: C.bg }}
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-red-50">
              <span className="text-3xl">❌</span>
            </div>
            <div>
              <h1 className="text-2xl font-medium tracking-tight mb-2" style={{ color: C.ink }}>
                Payment Issue
              </h1>
              <p className="text-sm" style={{ color: C.muted }}>
                We couldn&#39;t verify your payment. Please try again or contact support.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/signup")}
                className="flex-1 h-12 rounded-full font-medium text-sm border"
                style={{ borderColor: C.border, color: C.ink }}
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 h-12 rounded-full font-medium text-sm"
                style={{ backgroundColor: C.ink, color: C.bg }}
              >
                Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FDFCF8" }}>
          <div className="text-sm" style={{ color: "#78716C" }}>Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
