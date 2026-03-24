/* /api/donations — Independent donations */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/** POST — Make a donation */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { charityId, amount, donorName, donorEmail } = body;

    if (!charityId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Charity ID and valid amount required." }, { status: 400 });
    }

    const db = createServerClient();
    const user = await getCurrentUser();

    // Insert donation
    const { data: donation, error } = await db
      .from("donations")
      .insert({
        user_id: user?.id || null,
        charity_id: charityId,
        amount: parseFloat(amount),
        donor_name: donorName || user?.name || "Anonymous",
        donor_email: donorEmail || user?.email || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update charity raised amount
    const { data: charity } = await db
      .from("charities")
      .select("raised")
      .eq("id", charityId)
      .single();

    if (charity) {
      await db
        .from("charities")
        .update({ raised: charity.raised + parseFloat(amount) })
        .eq("id", charityId);
    }

    // Refresh platform stats
    try { await db.rpc("refresh_platform_stats"); } catch {}

    return NextResponse.json({ donation }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to process donation." }, { status: 500 });
  }
}
