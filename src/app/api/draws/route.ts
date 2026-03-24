/* /api/draws — Draw Management */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/** GET — List draws (published for users, all for admins) */
export async function GET() {
  try {
    const db = createServerClient();
    const user = await getCurrentUser();

    let query = db
      .from("draws")
      .select(`
        id, month, draw_date, drawn_numbers, status, draw_logic,
        prize_pool_five, prize_pool_four, prize_pool_three,
        jackpot_rollover, created_at, published_at,
        winners(id, user_id, match_type, matched_numbers, prize, payment_status, verified, proof_uploaded)
      `)
      .order("draw_date", { ascending: false });

    // Non-admins only see published draws
    if (!user || user.role !== "admin") {
      query = query.eq("status", "published");
    }

    const { data: draws, error } = await query;
    if (error) throw error;

    return NextResponse.json({ draws: draws || [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch draws." }, { status: 500 });
  }
}
