/* /api/admin/stats — Platform Stats Overview */
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const db = createServerClient();

    // Stats table row (id=1)
    const { data: statsRow, error: pError } = await db
      .from("platform_stats")
      .select("*")
      .eq("id", 1)
      .single();

    if (pError) throw pError;

    // Detailed recent stats
    const { data: recentDraws, error } = await db
      .from("draws")
      .select("month, prize_pool_five, prize_pool_four, prize_pool_three, jackpot_rollover, winners(prize)")
      .order("draw_date", { ascending: false })
      .limit(5);

    if (error) throw error;

    return NextResponse.json({
      stats: {
        totalUsers: statsRow.total_users,
        activeSubscribers: statsRow.active_subscribers,
        totalPrizePool: statsRow.total_prize_pool,
        totalCharityContributions: statsRow.total_charity_contributions,
        monthlyRevenue: statsRow.monthly_revenue,
      },
      recentDraws,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Forbidden") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    if (message === "Unauthorized") return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
