/* /api/admin/users — Admin User Management */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const db = createServerClient();

    const { data: users, error } = await db
      .from("users")
      .select(`
        id, name, email, role, avatar, created_at,
        subscriptions(plan, status, price, renewal_date),
        scores(id, value, score_date),
        user_charities(percentage, charities(name))
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform response format slightly for frontend easier consumption
    const formattedUsers = users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      subscription: u.subscriptions ? u.subscriptions[0] : null,
      scores: u.scores || [],
      charityPercentage: u.user_charities?.percentage || 10,
      charityName: u.user_charities?.charities?.name || 'Unassigned',
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Forbidden") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    if (message === "Unauthorized") return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { id, name, email, role, _subscriptionUpdates } = await req.json();

    if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const db = createServerClient();

    // Update user details
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;

    if (Object.keys(updates).length > 0) {
      const { error } = await db.from("users").update(updates).eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
