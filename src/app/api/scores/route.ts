/* /api/scores — Score Management */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

/** GET — Fetch user's scores (latest 5) */
export async function GET() {
  try {
    const user = await requireAuth();
    const db = createServerClient();

    const { data: scores, error } = await db
      .from("scores")
      .select("id, value, score_date")
      .eq("user_id", user.id)
      .order("score_date", { ascending: false })
      .limit(5);

    if (error) throw error;
    return NextResponse.json({ scores: scores || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Unauthorized") return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST — Add a new score */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { value, date } = await req.json();

    // Validation
    if (!value || value < 1 || value > 45) {
      return NextResponse.json({ error: "Score must be between 1 and 45." }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: "Date is required." }, { status: 400 });
    }

    // Check subscription is active
    const db = createServerClient();
    const { data: sub } = await db
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .single();

    if (!sub || sub.status !== "active") {
      return NextResponse.json({ error: "Active subscription required to add scores." }, { status: 403 });
    }

    // Insert score (trigger will enforce max 5)
    const { data: score, error } = await db
      .from("scores")
      .insert({
        user_id: user.id,
        value: Math.floor(value),
        score_date: date,
      })
      .select("id, value, score_date")
      .single();

    if (error) throw error;

    return NextResponse.json({ score }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Unauthorized") return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE — Remove a score */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const scoreId = searchParams.get("id");

    if (!scoreId) {
      return NextResponse.json({ error: "Score ID required." }, { status: 400 });
    }

    const db = createServerClient();

    // Ensure the score belongs to this user
    const { error } = await db
      .from("scores")
      .delete()
      .eq("id", scoreId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Unauthorized") return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
