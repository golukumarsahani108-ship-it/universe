import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const note = typeof body.editor_note === "string" ? body.editor_note.trim() : null;
    const { data, error } = await supabaseAdmin
      .from("website_templates")
      .update({ editor_note: note || null, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id,editor_note")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ template: data });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Admin access required." }, { status: 403 });
  }
}

async function collectStorageFiles(prefix: string): Promise<string[]> {
  const bucket = supabaseAdmin.storage.from("universe-templates");
  const files: string[] = [];
  const folders: string[] = [prefix];
  while (folders.length) {
    const current = folders.pop()!;
    const { data, error } = await bucket.list(current, { limit: 1000 });
    if (error || !data) continue;
    for (const item of data as Array<{ name: string; id?: string | null }>) {
      const path = `${current}/${item.name}`;
      if (item.id) files.push(path);
      else folders.push(path);
    }
  }
  return files;
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { data: template, error: findError } = await supabaseAdmin
      .from("website_templates")
      .select("id,package_path")
      .eq("id", id)
      .maybeSingle();
    if (findError) return NextResponse.json({ error: findError.message }, { status: 500 });
    if (!template) return NextResponse.json({ error: "Template not found." }, { status: 404 });

    // Do not leave creator surprises pointing at a deleted template.
    // Existing universes keep their saved design; only this template registry
    // entry and its stored package are removed.
    const { error: deleteError } = await supabaseAdmin
      .from("website_templates")
      .delete()
      .eq("id", id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    if (template.package_path) {
      const files = await collectStorageFiles(template.package_path);
      if (files.length) {
        const { error: storageError } = await supabaseAdmin.storage
          .from("universe-templates")
          .remove(files);
        if (storageError) console.warn("Template storage cleanup warning:", storageError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Admin access required." }, { status: 403 });
  }
}
