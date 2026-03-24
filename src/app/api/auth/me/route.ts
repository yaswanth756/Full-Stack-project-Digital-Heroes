/* GET /api/auth/me — Get current authenticated user */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const db = createServerClient();

    // Fetch scores
    const { data: scores } = await db
      .from("scores")
      .select("id, value, score_date")
      .eq("user_id", user.id)
      .order("score_date", { ascending: false })
      .limit(5);

    // Fetch winnings
    const { data: winnings } = await db
      .from("winners")
      .select("id, draw_id, match_type, prize, payment_status, verified, proof_uploaded")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Fetch notifications
    const { data: notifications } = await db
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    // Fetch charity details if selected
    let charityDetails = null;
    if (user.charity?.charity_id) {
      const { data } = await db
        .from("charities")
        .select("id, name, category, image, raised, supporters")
        .eq("id", user.charity.charity_id)
        .single();
      charityDetails = data;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        subscription: user.subscription,
        charity: user.charity ? { ...user.charity, details: charityDetails } : null,
        scores: scores || [],
        winnings: winnings || [],
        notifications: notifications || [],
      },
    });
  } catch (err: unknown) {
    console.error("Auth check error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
