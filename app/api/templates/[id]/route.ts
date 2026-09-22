import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { mergeScriptSchema, prepareTemplateHtml, prepareTemplateScript } from "@/lib/templates/prepare";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("website_templates")
    .select("id,name,slug,category,description,editor_note,thumbnail_url,thumbnail_path,package_path,entry_path,schema,status,version")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Template not found." }, { status: 404 });

  // Backward compatibility: templates uploaded before automatic edit markers
  // were added still become editable without requiring a re-upload.
  const schema = data.schema as { version?: string; fields?: unknown[] } | null;
  if (!schema || schema.version !== "3.0" || !Array.isArray(schema.fields)) {
    const { data: file } = await supabaseAdmin.storage
      .from("universe-templates")
      .download(`${data.package_path}/${data.entry_path || "index.html"}`);
    if (file) {
      const { data: cssFile } = await supabaseAdmin.storage
        .from("universe-templates")
        .download(`${data.package_path}/style.css`);
      const prepared = prepareTemplateHtml(await file.text(), cssFile ? await cssFile.text() : "");
      const { data: scriptFile } = await supabaseAdmin.storage
        .from("universe-templates")
        .download(`${data.package_path}/script.js`);
      if (scriptFile) {
        const scriptAnalysis = prepareTemplateScript(await scriptFile.text(), prepared.schema);
        data.schema = mergeScriptSchema(prepared.schema, scriptAnalysis);
      } else {
        data.schema = prepared.schema;
      }
    }
  }

  return NextResponse.json({ template: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please login." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const templateData = body?.templateData;
  if (!templateData || typeof templateData !== "object") {
    return NextResponse.json({ error: "Template data is required." }, { status: 400 });
  }

  // This endpoint only verifies the template exists. The actual universe is
  // created by the publish endpoint so the selected data is stored atomically.
  const { data: template, error } = await supabaseAdmin
    .from("website_templates")
    .select("id,status")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !template) return NextResponse.json({ error: "Template not found." }, { status: 404 });
  return NextResponse.json({ ok: true, templateId: template.id });
}
