/* POST /api/auth/admin-login — Admin-only authentication */
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
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // ADMIN ONLY — reject non-admin users
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Admin credentials required." }, { status: 403 });
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Sign JWT with admin role & set cookie
    const token = signToken({ userId: user.id, email: user.email, role: "admin" });
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
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
