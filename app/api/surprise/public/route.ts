import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = String(searchParams.get("slug") || "").trim();

    if (!slug) {
      return NextResponse.json({ error: "Missing slug." }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: universe, error: universeError } = await supabase
      .from("universes")
      .select(`
        id,
        slug,
        title,
        person_name,
        opening_message,
        music,
        password_enabled,
        password_screen
      `)
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (universeError) {
      console.error("Public surprise lookup error:", universeError);
      return NextResponse.json({ error: "Unable to load this surprise." }, { status: 500 });
    }

    if (!universe) {
      return NextResponse.json({ error: "Surprise not found." }, { status: 404 });
    }

    const { data: pages, error: pagesError } = await supabase
      .from("universe_pages")
      .select("id, universe_id, page_order, page_type, title, content, settings")
      .eq("universe_id", universe.id)
      .order("page_order", { ascending: true });

    if (pagesError) {
      console.error("Public surprise pages error:", pagesError);
      return NextResponse.json({ error: "Unable to load surprise pages." }, { status: 500 });
    }

    const { data: media, error: mediaError } = await supabase
      .from("universe_media")
      .select("id, universe_id, page_id, media_type, storage_path, public_url, media_order, metadata")
      .eq("universe_id", universe.id)
      .order("media_order", { ascending: true });

    if (mediaError) {
      console.error("Public surprise media error:", mediaError);
      return NextResponse.json({ error: "Unable to load surprise media." }, { status: 500 });
    }

    return NextResponse.json({
      universe: {
        ...universe,
        // Never expose password_hash from this public endpoint.
      },
      pages: pages || [],
      media: media || [],
    });
  } catch (error) {
    console.error("Public surprise API error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
