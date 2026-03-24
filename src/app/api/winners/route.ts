/* /api/winners — Winner verification & payout management */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser, requireAdmin } from "@/lib/auth";

/** GET — List winners (admin: all, user: own) */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = createServerClient();

    let query = db
      .from("winners")
      .select(`
        id, draw_id, user_id, match_type, matched_numbers, prize,
        payment_status, verified, proof_uploaded, proof_url,
        verified_at, paid_at, created_at,
        draws(month, draw_date, drawn_numbers),
        users(name, email, avatar)
      `)
      .order("created_at", { ascending: false });

    if (user.role !== "admin") {
      query = query.eq("user_id", user.id);
    }

    const { data: winners, error } = await query;
    if (error) throw error;

    return NextResponse.json({ winners: winners || [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch winners." }, { status: 500 });
  }
}

/** PATCH — Verify winner / Mark as paid (admin) or Upload proof (user) */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { winnerId, action } = body;

    if (!winnerId || !action) {
      return NextResponse.json({ error: "Winner ID and action required." }, { status: 400 });
    }

    const db = createServerClient();

    switch (action) {
      case "verify": {
        // Admin only
        if (user.role !== "admin") {
          return NextResponse.json({ error: "Admin access required." }, { status: 403 });
        }
        await db.from("winners").update({
          verified: true,
          verified_at: new Date().toISOString(),
        }).eq("id", winnerId);

        // Notify user
        const { data: winner } = await db.from("winners").select("user_id, prize").eq("id", winnerId).single();
        if (winner) {
          await db.from("notifications").insert({
            user_id: winner.user_id,
            type: "winner",
            title: "Proof Verified ✓",
            message: `Your winning proof has been verified! Your prize of £${winner.prize} will be processed shortly.`,
          });
        }
        break;
      }

      case "reject": {
        // Admin only
        if (user.role !== "admin") {
          return NextResponse.json({ error: "Admin access required." }, { status: 403 });
        }
        await db.from("winners").update({
          verified: false,
          proof_uploaded: false,
          proof_url: null,
        }).eq("id", winnerId);

        const { data: winner } = await db.from("winners").select("user_id").eq("id", winnerId).single();
        if (winner) {
          await db.from("notifications").insert({
            user_id: winner.user_id,
            type: "winner",
            title: "Proof Rejected",
            message: "Your score proof was not accepted. Please re-upload a valid screenshot.",
          });
        }
        break;
      }

      case "markPaid": {
        // Admin only
        if (user.role !== "admin") {
          return NextResponse.json({ error: "Admin access required." }, { status: 403 });
        }
        await db.from("winners").update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
        }).eq("id", winnerId);

        const { data: winner } = await db.from("winners").select("user_id, prize").eq("id", winnerId).single();
        if (winner) {
          await db.from("notifications").insert({
            user_id: winner.user_id,
            type: "winner",
            title: "Prize Paid! 💰",
            message: `Your prize of £${winner.prize} has been paid. Thank you for playing!`,
          });
        }
        break;
      }

      case "uploadProof": {
        // User can upload proof for their own winning
        const { data: winner } = await db.from("winners").select("user_id").eq("id", winnerId).single();
        if (!winner || winner.user_id !== user.id) {
          return NextResponse.json({ error: "Not your winning to upload proof for." }, { status: 403 });
        }
        await db.from("winners").update({
          proof_uploaded: true,
          proof_url: body.proofUrl || "uploaded",
        }).eq("id", winnerId);

        // Notify admin
        // Find admin users
        const { data: admins } = await db.from("users").select("id").eq("role", "admin");
        if (admins) {
          await db.from("notifications").insert(
            admins.map(admin => ({
              user_id: admin.id,
              type: "winner" as const,
              title: "New Proof Uploaded",
              message: `${user.name} has uploaded score proof for verification.`,
            }))
          );
        }
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
