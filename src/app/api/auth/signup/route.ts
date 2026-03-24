/* POST /api/auth/signup — Register a new user */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, plan, charityId, charityPercentage } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const db = createServerClient();

    // Check if email already exists
    const { data: existing } = await db.from("users").select("id").eq("email", email).single();
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: user, error: userError } = await db
      .from("users")
      .insert({
        name,
        email,
        password_hash: passwordHash,
        role: "subscriber",
        avatar: name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
      })
      .select("id, name, email, role")
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
    }

    // Create subscription
    const selectedPlan = plan === "yearly" ? "yearly" : "monthly";
    const price = selectedPlan === "monthly" ? 9.99 : 89.99;
    const renewalDate = new Date();
    if (selectedPlan === "monthly") {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    await db.from("subscriptions").insert({
      user_id: user.id,
      plan: selectedPlan,
      status: "active",
      price,
      start_date: new Date().toISOString().split("T")[0],
      renewal_date: renewalDate.toISOString().split("T")[0],
    });

    // Set charity selection
    if (charityId) {
      await db.from("user_charities").insert({
        user_id: user.id,
        charity_id: charityId,
        percentage: Math.max(10, Math.min(50, charityPercentage || 10)),
      });

      // Update charity supporters count
      try {
        const { error } = await db.rpc("increment_supporters", { cid: charityId });
        if (error) throw error;
      } catch {
        // Fallback: manual update
        const { data } = await db.from("charities").select("supporters").eq("id", charityId).single();
        if (data) {
          await db.from("charities").update({ supporters: data.supporters + 1 }).eq("id", charityId);
        }
      }
    }

    // Create welcome notification
    await db.from("notifications").insert({
      user_id: user.id,
      type: "system",
      title: "Welcome to Softly Golf! 🎉",
      message: `Thanks for joining, ${name.split(" ")[0]}! Start by entering your golf scores to participate in the monthly draw.`,
    });

    // Create notification preferences
    await db.from("notification_preferences").insert({ user_id: user.id });

    // Refresh platform stats
    try { await db.rpc("refresh_platform_stats"); } catch {}

    // Sign JWT & set cookie
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });
  } catch (err: unknown) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
