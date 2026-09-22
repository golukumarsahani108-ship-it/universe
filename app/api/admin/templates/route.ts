import { NextResponse } from "next/server";
import * as unzipper from "unzipper";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSafeTemplatePath } from "@/lib/templates/types";
import { mergeScriptSchema, prepareTemplateHtml, prepareTemplateScript } from "@/lib/templates/prepare";

export const runtime = "nodejs";

const MAX_ZIP_BYTES = 25 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 50 * 1024 * 1024;
const MAX_FILES = 100;

function makeSlug(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `template-${crypto.randomUUID().slice(0, 8)}`
  );
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const category = String(form.get("category") || "general").trim() || "general";
    const description = String(form.get("description") || "").trim() || null;
    const editorNote = String(form.get("editor_note") || "").trim() || null;
    const file = form.get("file");

    if (!name) {
      return NextResponse.json({ error: "Template name is required." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload a ZIP file." }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json({ error: "Only .zip templates are supported." }, { status: 400 });
    }
    if (file.size > MAX_ZIP_BYTES) {
      return NextResponse.json({ error: "ZIP is too large. Maximum size is 25 MB." }, { status: 400 });
    }

    const zip = await unzipper.Open.buffer(Buffer.from(await file.arrayBuffer()));
    if (zip.files.length > MAX_FILES) {
      return NextResponse.json({ error: "Template contains too many files." }, { status: 400 });
    }

    const entries: { path: string; buffer: Buffer }[] = [];
    let totalBytes = 0;

    for (const entry of zip.files) {
      if (entry.type === "Directory") continue;
      const path = entry.path.replace(/^\.\//, "");
      if (!isSafeTemplatePath(path)) {
        return NextResponse.json({ error: `Invalid template path: ${path}` }, { status: 400 });
      }
      totalBytes += entry.uncompressedSize || 0;
      if (totalBytes > MAX_UNCOMPRESSED_BYTES) {
        return NextResponse.json({ error: "Template expands beyond the 50 MB limit." }, { status: 400 });
      }
      entries.push({ path, buffer: await entry.buffer() });
    }

    const hasIndex = entries.some((entry) => entry.path === "index.html");
    const hasCss = entries.some((entry) => entry.path === "style.css");
    const hasJs = entries.some((entry) => entry.path === "script.js");
    if (!hasIndex || !hasCss || !hasJs) {
      return NextResponse.json(
        { error: "Template ZIP must contain index.html, style.css and script.js." },
        { status: 400 }
      );
    }

    // Every uploaded website is creator-editable by default.
    // If a schema exists, keep its metadata; otherwise generate editable
    // text/photo/music fields automatically from index.html.
    const indexEntry = entries.find((entry) => entry.path === "index.html");
    if (!indexEntry) {
      return NextResponse.json({ error: "index.html is required." }, { status: 400 });
    }

    const cssEntry = entries.find((entry) => entry.path === "style.css");
    const prepared = prepareTemplateHtml(
      indexEntry.buffer.toString("utf8"),
      cssEntry?.buffer.toString("utf8") || ""
    );
    const jsEntry = entries.find((entry) => entry.path === "script.js");
    const scriptAnalysis = jsEntry
      ? prepareTemplateScript(jsEntry.buffer.toString("utf8"), prepared.schema)
      : { script: "", fields: [], pageAssignments: [] };
    const preparedSchema = mergeScriptSchema(prepared.schema, scriptAnalysis);

    const schemaEntry = entries.find((entry) => entry.path === "schema.json");
    let schema: Record<string, unknown> = preparedSchema as unknown as Record<string, unknown>;

    if (schemaEntry) {
      try {
        const parsed = JSON.parse(schemaEntry.buffer.toString("utf8"));
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("schema.json must contain an object");
        }
        schema = {
          ...preparedSchema,
          ...(parsed as Record<string, unknown>),
          autoEditable: true,
          fields: preparedSchema.fields,
          pages: preparedSchema.pages,
        };
      } catch {
        return NextResponse.json({ error: "schema.json is not valid JSON." }, { status: 400 });
      }
    }

    // Store the prepared index.html with edit markers and the runtime bridge.
    const preparedIndex = entries.findIndex((entry) => entry.path === "index.html");
    entries[preparedIndex] = { path: "index.html", buffer: Buffer.from(prepared.html, "utf8") };

    if (jsEntry) {
      const preparedJs = entries.findIndex((entry) => entry.path === "script.js");
      if (preparedJs >= 0) {
        entries[preparedJs] = { path: "script.js", buffer: Buffer.from(scriptAnalysis.script, "utf8") };
      }
    }

    const slugBase = makeSlug(name);
    const slug = `${slugBase}-${crypto.randomUUID().slice(0, 6)}`;
    const templateId = crypto.randomUUID();
    const packagePath = `${templateId}`;

    for (const entry of entries) {
      const storagePath = `${packagePath}/${entry.path}`;
      const { error } = await supabaseAdmin.storage
        .from("universe-templates")
        .upload(storagePath, entry.buffer, {
          upsert: false,
          contentType:
            entry.path.endsWith(".html") ? "text/html; charset=utf-8" :
            entry.path.endsWith(".css") ? "text/css; charset=utf-8" :
            entry.path.endsWith(".js") ? "text/javascript; charset=utf-8" :
            entry.path.endsWith(".json") ? "application/json" : undefined,
        });

      if (error) {
        await supabaseAdmin.storage.from("universe-templates").remove([packagePath]);
        return NextResponse.json({ error: `Could not upload ${entry.path}: ${error.message}` }, { status: 500 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from("website_templates")
      .insert({
        id: templateId,
        name,
        slug,
        category,
        description,
        editor_note: editorNote,
        thumbnail_path: null,
        package_path: packagePath,
        entry_path: "index.html",
        schema,
        version: "1.0.0",
        status: "published",
        created_by: admin.id,
      })
      .select("id, name, slug, status")
      .single();

    if (error) {
      await supabaseAdmin.storage.from("universe-templates").remove(
        entries.map((entry) => `${packagePath}/${entry.path}`)
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error) {
    console.error("ADMIN TEMPLATE UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Could not create template." }, { status: 500 });
  }
}
