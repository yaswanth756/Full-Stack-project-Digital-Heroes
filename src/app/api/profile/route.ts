/* /api/profile — Profile & Subscription Management */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser, hashPassword } from "@/lib/auth";

/** PUT — Update profile details */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email, password } = await req.json();
    const db = createServerClient();
    const updates: Record<string, unknown> = {};

    if (name && name.trim()) updates.name = name.trim();
    if (email && email.trim()) updates.email = email.trim();
    if (password && password.length >= 6) updates.password_hash = await hashPassword(password);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates." }, { status: 400 });
    }

    const { error } = await db.from("users").update(updates).eq("id", user.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
