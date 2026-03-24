/* /api/subscription — Subscription Lifecycle Management */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/** PATCH — Change plan, cancel, or reactivate subscription */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, plan } = await req.json();
    const db = createServerClient();

    const { data: sub } = await db
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!sub) return NextResponse.json({ error: "No subscription found." }, { status: 404 });

    switch (action) {
      case "changePlan": {
        const newPlan = plan || (sub.plan === "monthly" ? "yearly" : "monthly");
        const newPrice = newPlan === "monthly" ? 9.99 : 89.99;
        const { error } = await db
          .from("subscriptions")
          .update({ plan: newPlan, price: newPrice })
          .eq("id", sub.id);
        if (error) throw error;
        return NextResponse.json({ success: true, plan: newPlan, price: newPrice });
      }

      case "cancel": {
        const { error } = await db
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("id", sub.id);
        if (error) throw error;

        // Notify
        await db.from("notifications").insert({
          user_id: user.id,
          type: "subscription",
          title: "Subscription Cancelled",
          message: `Your subscription has been cancelled. You'll retain access until ${sub.renewal_date}.`,
        });

        return NextResponse.json({ success: true, status: "cancelled" });
      }

      case "reactivate": {
        const renewalDate = new Date();
        renewalDate.setMonth(renewalDate.getMonth() + (sub.plan === "yearly" ? 12 : 1));

        const { error } = await db
          .from("subscriptions")
          .update({
            status: "active",
            renewal_date: renewalDate.toISOString().split("T")[0],
          })
          .eq("id", sub.id);
        if (error) throw error;

        await db.from("notifications").insert({
          user_id: user.id,
          type: "subscription",
          title: "Subscription Reactivated! 🎉",
          message: "Welcome back! Your subscription is now active. You can enter scores and participate in draws.",
        });

        return NextResponse.json({ success: true, status: "active" });
      }

      default:
        return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
