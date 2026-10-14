import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));
    if (typeof body.hide_surprise_buttons !== "boolean") {
      return NextResponse.json({ error: "A valid button visibility value is required." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("platform_settings")
      .update({ hide_surprise_buttons: body.hide_surprise_buttons })
      .eq("id", true);

    if (error) {
      console.error("Failed to update surprise display settings:", error);
      return NextResponse.json({ error: "Could not save settings. Run the platform settings SQL migration first." }, { status: 500 });
    }

    return NextResponse.json({ success: true, hide_surprise_buttons: body.hide_surprise_buttons });
  } catch {
    return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
  }
}
