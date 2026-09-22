import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please login." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") || "");
  if (!(file instanceof File)) return NextResponse.json({ error: "File is required." }, { status: 400 });
  if (kind !== "image" && kind !== "audio" && kind !== "video") return NextResponse.json({ error: "Invalid media type." }, { status: 400 });

  const max = kind === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.size > max) return NextResponse.json({ error: "File is too large." }, { status: 400 });
  if (kind === "image" && !file.type.startsWith("image/")) return NextResponse.json({ error: "Please choose an image." }, { status: 400 });
  if (kind === "audio" && !file.type.startsWith("audio/")) return NextResponse.json({ error: "Please choose an audio file." }, { status: 400 });
  if (kind === "video" && !file.type.startsWith("video/")) return NextResponse.json({ error: "Please choose a video file." }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `universes/${user.id}/templates/${id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("universe-media").upload(path, file, {
    upsert: false,
    cacheControl: "3600",
    contentType: file.type,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from("universe-media").getPublicUrl(path);
  return NextResponse.json({ storagePath: path, publicUrl: data.publicUrl });
}
