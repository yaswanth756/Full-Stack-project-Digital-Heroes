/* POST /api/auth/login — Authenticate user */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = createServerClient();

    // Find user
    const { data: user } = await db
      .from("users")
      .select("id, name, email, role, password_hash, avatar")
      .eq("email", email)
      .single();

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Check subscription status (real-time validation per PRD)
    const { data: sub } = await db
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Check if subscription has lapsed (renewal_date passed)
    if (sub && sub.status === "active" && new Date(sub.renewal_date) < new Date()) {
      await db.from("subscriptions").update({ status: "lapsed" }).eq("id", sub.id);
    }

    // Sign JWT & set cookie
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
