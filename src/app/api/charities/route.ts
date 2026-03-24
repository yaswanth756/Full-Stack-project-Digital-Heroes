/* /api/charities — Charity Management */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser, requireAdmin } from "@/lib/auth";

/** GET — List all charities (public) */
export async function GET(req: NextRequest) {
  try {
    const db = createServerClient();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    let query = db.from("charities").select(`
      id, name, category, description, long_description, image,
      raised, supporters, featured, created_at,
      charity_events(id, title, event_date, location)
    `).order("featured", { ascending: false }).order("raised", { ascending: false });

    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (featured === "true") {
      query = query.eq("featured", true);
    }

    const { data: charities, error } = await query;
    if (error) throw error;

    return NextResponse.json({ charities: charities || [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch charities." }, { status: 500 });
  }
}

/** POST — Add a new charity (admin only) */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { name, category, description, longDescription, image, featured } = body;

    if (!name) {
      return NextResponse.json({ error: "Charity name is required." }, { status: 400 });
    }

    const db = createServerClient();
    const { data: charity, error } = await db
      .from("charities")
      .insert({
        name,
        category: category || "General",
        description: description || "",
        long_description: longDescription || description || "",
        image: image || "🎗️",
        featured: featured || false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ charity }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Forbidden") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    if (message === "Unauthorized") return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PUT — Update a charity (admin only) */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Charity ID is required." }, { status: 400 });
    }

    const db = createServerClient();
    // Map camelCase to snake_case
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.longDescription !== undefined) dbUpdates.long_description = updates.longDescription;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;

    const { data: charity, error } = await db
      .from("charities")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ charity });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Forbidden") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE — Remove a charity (admin only) */
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Charity ID is required." }, { status: 400 });
    }

    const db = createServerClient();
    const { error } = await db.from("charities").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Forbidden") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PATCH — Update user's charity selection */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { charityId, percentage } = await req.json();
    const db = createServerClient();

    if (charityId) {
      // Upsert user charity selection
      await db.from("user_charities").upsert({
        user_id: user.id,
        charity_id: charityId,
        percentage: Math.max(10, Math.min(50, percentage || 10)),
      }, { onConflict: "user_id" });
    }

    if (percentage !== undefined) {
      await db.from("user_charities")
        .update({ percentage: Math.max(10, Math.min(50, percentage)) })
        .eq("user_id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to update charity selection." }, { status: 500 });
  }
}
