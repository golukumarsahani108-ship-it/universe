import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { mergeScriptSchema, prepareTemplateHtml, prepareTemplateScript } from "@/lib/templates/prepare";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { data: template, error } = await supabaseAdmin.from("website_templates")
      .select("id,package_path,entry_path,schema")
      .eq("id", id).maybeSingle();
    if (error || !template) return NextResponse.json({ error: error?.message || "Template not found." }, { status: 404 });

    const base = template.package_path;
    const bucket = supabaseAdmin.storage.from("universe-templates");
    const [htmlRes, cssRes, jsRes] = await Promise.all([
      bucket.download(`${base}/${template.entry_path || "index.html"}`),
      bucket.download(`${base}/style.css`),
      bucket.download(`${base}/script.js`),
    ]);
    if (htmlRes.error || !htmlRes.data) return NextResponse.json({ error: htmlRes.error?.message || "Could not read index.html." }, { status: 500 });
    const html = await htmlRes.data.text();
    const css = cssRes.data ? await cssRes.data.text() : "";
    const js = jsRes.data ? await jsRes.data.text() : "";
    const prepared = prepareTemplateHtml(html, css);
    const analysis = js ? prepareTemplateScript(js, prepared.schema) : { script: js, fields: [], pageAssignments: [] };
    const schema = mergeScriptSchema(prepared.schema, analysis);

    const htmlPath = `${base}/${template.entry_path || "index.html"}`;
    const { error: htmlUploadError } = await bucket.update(htmlPath, Buffer.from(prepared.html), { contentType: "text/html; charset=utf-8" });
    if (htmlUploadError) return NextResponse.json({ error: htmlUploadError.message }, { status: 500 });
    if (jsRes.data) {
      const { error: jsUploadError } = await bucket.update(`${base}/script.js`, Buffer.from(analysis.script), { contentType: "text/javascript; charset=utf-8" });
      if (jsUploadError) return NextResponse.json({ error: jsUploadError.message }, { status: 500 });
    }
    const { data, error: updateError } = await supabaseAdmin.from("website_templates").update({ schema, updated_at: new Date().toISOString() }).eq("id", id).select("id,schema,updated_at").single();
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json({ success: true, template: data, fields: schema.fields.length, pages: schema.pages?.length || 0 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not rebuild template." }, { status: 403 });
  }
}
