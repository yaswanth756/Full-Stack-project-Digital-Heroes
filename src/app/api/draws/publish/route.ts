/* POST /api/draws/publish — Publish a simulated draw (admin only) */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { drawId } = await req.json();

    if (!drawId) {
      return NextResponse.json({ error: "Draw ID is required." }, { status: 400 });
    }

    const db = createServerClient();

    // Get the draw
    const { data: draw } = await db
      .from("draws")
      .select("*")
      .eq("id", drawId)
      .single();

    if (!draw) {
      return NextResponse.json({ error: "Draw not found." }, { status: 404 });
    }

    if (draw.status === "published") {
      return NextResponse.json({ error: "Draw already published." }, { status: 400 });
    }

    // Get all active subscribers' scores and find winners
    const { data: activeSubs } = await db
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active");

    const winnersToInsert: {
      draw_id: string;
      user_id: string;
      match_type: number;
      matched_numbers: number[];
      prize: number;
    }[] = [];

    // Track how many winners per tier for prize splitting
    const tierCounts = { 3: 0, 4: 0, 5: 0 };

    // First pass: count winners per tier
    if (activeSubs) {
      for (const sub of activeSubs) {
        const { data: scores } = await db
          .from("scores")
          .select("value")
          .eq("user_id", sub.user_id)
          .order("score_date", { ascending: false })
          .limit(5);

        if (scores) {
          const scoreValues = scores.map((s: { value: number }) => s.value);
          const matchedNums = draw.drawn_numbers.filter((n: number) => scoreValues.includes(n));
          const matchCount = Math.min(matchedNums.length, 5);

          if (matchCount >= 3) {
            tierCounts[matchCount as 3 | 4 | 5]++;
            winnersToInsert.push({
              draw_id: drawId,
              user_id: sub.user_id,
              match_type: matchCount,
              matched_numbers: matchedNums,
              prize: 0, // calculated below
            });
          }
        }
      }
    }

    // Calculate prizes (split equally among winners in each tier)
    const poolAmounts: Record<number, number> = {
      5: draw.prize_pool_five + (draw.jackpot_rollover || 0),
      4: draw.prize_pool_four,
      3: draw.prize_pool_three,
    };

    for (const winner of winnersToInsert) {
      const count = tierCounts[winner.match_type as 3 | 4 | 5];
      if (count > 0) {
        winner.prize = Math.round((poolAmounts[winner.match_type] / count) * 100) / 100;
      }
    }

    // Insert winners
    if (winnersToInsert.length > 0) {
      const { error: winnerError } = await db.from("winners").insert(winnersToInsert);
      if (winnerError) throw winnerError;

      // Create winner notifications
      for (const w of winnersToInsert) {
        await db.from("notifications").insert({
          user_id: w.user_id,
          type: "winner",
          title: `🏆 You Won in ${draw.month}!`,
          message: `Congratulations! You matched ${w.match_type} numbers and won £${w.prize.toFixed(2)}. Upload your proof to claim your prize.`,
        });
      }
    }

    // Determine new jackpot rollover
    const newJackpot = tierCounts[5] === 0 ? (draw.prize_pool_five + (draw.jackpot_rollover || 0)) : 0;

    // Update draw status to published
    const { error: updateError } = await db
      .from("draws")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        jackpot_rollover: 0, // consumed or rolled to next
      })
      .eq("id", drawId);

    if (updateError) throw updateError;

    // Create draw notification for all subscribers
    if (activeSubs) {
      const drawNotifs = activeSubs
        .filter(s => !winnersToInsert.some(w => w.user_id === s.user_id))
        .map(s => ({
          user_id: s.user_id,
          type: "draw" as const,
          title: `${draw.month} Draw Results`,
          message: `The ${draw.month} draw has been published. Check your dashboard to see the results!`,
        }));

      if (drawNotifs.length > 0) {
        await db.from("notifications").insert(drawNotifs);
      }
    }

    // Refresh platform stats
    try { await db.rpc("refresh_platform_stats"); } catch {}

    return NextResponse.json({
      success: true,
      winnersCount: winnersToInsert.length,
      winners: winnersToInsert,
      jackpotRollover: newJackpot,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Forbidden") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    if (message === "Unauthorized") return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
