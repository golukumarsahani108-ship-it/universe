import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSafeTemplatePath } from "@/lib/templates/types";
import { mergeScriptSchema, prepareTemplateHtml, prepareTemplateScript } from "@/lib/templates/prepare";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  mp4: "video/mp4",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
};

function contentType(path: string) {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  return MIME[ext] || "application/octet-stream";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  const { id, path } = await params;
  const relativePath = (path || []).join("/");
  if (!relativePath || !isSafeTemplatePath(relativePath)) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  const { data: template, error: templateError } = await supabaseAdmin
    .from("website_templates")
    .select("id,package_path,status")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (templateError || !template) return new NextResponse("Template not found", { status: 404 });

  const storagePath = `${template.package_path}/${relativePath}`;
  const { data, error } = await supabaseAdmin.storage
    .from("universe-templates")
    .download(storagePath);

  if (error || !data) return new NextResponse("Template file not found", { status: 404 });

  let buffer = Buffer.from(await data.arrayBuffer());

  if (relativePath.toLowerCase() === "script.js" && !buffer.toString("utf8").includes("MLUApplyScriptData")) {
    const { data: indexFile } = await supabaseAdmin.storage
      .from("universe-templates")
      .download(`${template.package_path}/index.html`);
    if (indexFile) {
      const { data: cssFile } = await supabaseAdmin.storage
        .from("universe-templates")
        .download(`${template.package_path}/style.css`);
      const prepared = prepareTemplateHtml(
        await indexFile.text(),
        cssFile ? await cssFile.text() : ""
      );
      const analysis = prepareTemplateScript(buffer.toString("utf8"), prepared.schema);
      buffer = Buffer.from(analysis.script, "utf8");
    }
  }

  if (relativePath.toLowerCase() === "index.html") {
    const rawHtml = buffer.toString("utf8");
    // Older uploads are prepared on first read, so they also get the same
    // automatic text/photo/music editing support.
    if (!rawHtml.includes("data-mlu-edit=")) {
      const { data: cssFile } = await supabaseAdmin.storage
        .from("universe-templates")
        .download(`${template.package_path}/style.css`);
      buffer = Buffer.from(
        prepareTemplateHtml(rawHtml, cssFile ? await cssFile.text() : "").html,
        "utf8"
      );
    }

    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    // For a public universe, render its saved creator data into the template.
    if (slug) {
      const { data: universe } = await supabaseAdmin
        .from("universes")
        .select("id,design,published")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      const design = universe?.design as Record<string, unknown> | null;
      const savedTemplateId = typeof design?.template_id === "string" ? design.template_id : null;
      if (savedTemplateId === id) {
        const customData = design?.custom_data;
        const html = buffer.toString("utf8");
        buffer = Buffer.from(injectData(html, customData), "utf8");
      }
    }
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType(relativePath),
      "Cache-Control": relativePath.toLowerCase() === "index.html" ? "no-store" : "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'self' data: blob: https:; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self'",
    },
  });
}

function injectData(html: string, raw: unknown) {
  if (!raw || typeof raw !== "object") return html;
  const data = raw as Record<string, unknown>;

  // Replace image/audio/source URLs.
  let output = html.replace(/<(img|audio|source)\b([^>]*data-mlu-edit=["']([^"']+)["'][^>]*)>/gi, (full, tag: string, attrs: string, key: string) => {
    if (!(key in data) || data[key] == null || data[key] === "") return full;
    const value = escapeAttr(String(data[key]));
    const withoutSrc = attrs.replace(/\s+src\s*=\s*["'][^"']*["']/i, "");
    return `<${tag}${withoutSrc} src="${value}">`;
  });

  // Apply creator values to inputs such as password/secret-code fields.
  output = output.replace(/<input\b([^>]*data-mlu-edit=["']([^"']+)["'][^>]*)>/gi, (full, attrs: string, key: string) => {
    if (!(key in data) || data[key] == null || data[key] === "") return full;
    const value = escapeAttr(String(data[key]));
    const withoutValue = attrs.replace(/\s+value\s*=\s*["'][^"']*["']/i, "");
    return `<input${withoutValue} value="${value}">`;
  });

  // Apply uploaded creator photos to CSS/placeholder image slots.
  output = output.replace(/<([a-z0-9]+)\b([^>]*data-mlu-bg-image=["']true["'][^>]*)>/gi, (full, tag: string, attrs: string, key: string) => {
    const keyMatch = attrs.match(/data-mlu-edit=["']([^"']+)["']/i);
    const fieldKey = keyMatch?.[1];
    if (!fieldKey || !(fieldKey in data) || data[fieldKey] == null || data[fieldKey] === "") return full;
    const value = escapeAttr(String(data[fieldKey]));
    const styleMatch = attrs.match(/\bstyle=["']([^"']*)["']/i);
    const bg = `background-image:url(\"${value}\");`;
    if (styleMatch) {
      const style = styleMatch[1].replace(/background-image\s*:[^;]+;?/i, "");
      const nextStyle = `${style}${bg}`;
      return `<${tag}${attrs.replace(styleMatch[0], `style=\"${escapeAttr(nextStyle)}\"`)}>`;
    }
    return `<${tag}${attrs} style=\"${escapeAttr(bg)}\">`;
  });

  // Replace simple text nodes without destroying nested template markup.
  output = output.replace(/<([a-z0-9]+)\b([^>]*data-mlu-edit=["']([^"']+)["'][^>]*)>([^<>]*)<\/\1>/gi, (full, tag: string, attrs: string, key: string) => {
    if (!(key in data) || data[key] == null || data[key] === "") return full;
    return `<${tag}${attrs}>${escapeHtml(String(data[key]))}</${tag}>`;
  });

  // Make creator data available to the uploaded website JavaScript.
  // The value is JSON-escaped before being embedded in the HTML.
  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");
  const runtimeData = `<script>window.__MLU_TEMPLATE_DATA__=${serialized};</script>`;
  output = /<\/body>/i.test(output)
    ? output.replace(/<\/body>/i, `${runtimeData}</body>`)
    : `${output}${runtimeData}`;

  return output;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}
