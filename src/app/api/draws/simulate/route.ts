/* POST /api/draws/simulate — Run a draw simulation (admin only) */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { logic, month } = await req.json();
    const db = createServerClient();

    let drawnNumbers: number[] = [];

    if (logic === "algorithmic") {
      // Weighted draw: pick from most common user scores
      const { data: allScores } = await db
        .from("scores")
        .select("value");

      const freq = new Map<number, number>();
      (allScores || []).forEach((s: { value: number }) => {
        freq.set(s.value, (freq.get(s.value) || 0) + 1);
      });

      // Sort by frequency (most common first)
      const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
      const pool = sorted.map(s => s[0]);

      // Pick from top scores with some randomness
      while (drawnNumbers.length < 5 && pool.length > 0) {
        const idx = Math.floor(Math.random() * Math.min(pool.length, 10));
        const pick = pool.splice(idx, 1)[0];
        if (!drawnNumbers.includes(pick)) drawnNumbers.push(pick);
      }

      // Fill remaining with random
      while (drawnNumbers.length < 5) {
        const r = Math.floor(Math.random() * 45) + 1;
        if (!drawnNumbers.includes(r)) drawnNumbers.push(r);
      }
    } else {
      // Random generation
      while (drawnNumbers.length < 5) {
        const r = Math.floor(Math.random() * 45) + 1;
        if (!drawnNumbers.includes(r)) drawnNumbers.push(r);
      }
    }

    drawnNumbers.sort((a, b) => a - b);

    // Pre-analysis: find potential matches for all active subscribers
    const { data: activeUsers } = await db
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active");

    const analysis: { userId: string; name: string; matches: number; matchedNums: number[] }[] = [];

    if (activeUsers) {
      for (const sub of activeUsers) {
        const { data: user } = await db
          .from("users")
          .select("id, name")
          .eq("id", sub.user_id)
          .single();

        const { data: scores } = await db
          .from("scores")
          .select("value")
          .eq("user_id", sub.user_id)
          .order("score_date", { ascending: false })
          .limit(5);

        if (user && scores) {
          const scoreValues = scores.map((s: { value: number }) => s.value);
          const matchedNums = drawnNumbers.filter(n => scoreValues.includes(n));
          if (matchedNums.length >= 3) {
            analysis.push({
              userId: user.id,
              name: user.name,
              matches: matchedNums.length,
              matchedNums,
            });
          }
        }
      }
    }

    // Calculate prize pools based on active subscriber count
    const subscriberCount = activeUsers?.length || 0;
    const monthlyPool = subscriberCount * 9.99 * 0.4; // 40% of revenue to prize pool
    const prizePoolFive = monthlyPool * 0.4;  // 40% of pool
    const prizePoolFour = monthlyPool * 0.35; // 35% of pool
    const prizePoolThree = monthlyPool * 0.25; // 25% of pool

    // Save as simulated draw
    const { data: draw, error } = await db
      .from("draws")
      .insert({
        month: month || new Date().toLocaleString("en-GB", { month: "long", year: "numeric" }),
        draw_date: new Date().toISOString().split("T")[0],
        drawn_numbers: drawnNumbers,
        status: "simulated",
        draw_logic: logic || "random",
        prize_pool_five: prizePoolFive,
        prize_pool_four: prizePoolFour,
        prize_pool_three: prizePoolThree,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      draw,
      drawnNumbers,
      analysis,
      pools: {
        fiveMatch: prizePoolFive,
        fourMatch: prizePoolFour,
        threeMatch: prizePoolThree,
        totalSubscribers: subscriberCount,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Forbidden") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    if (message === "Unauthorized") return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
