import type { TemplateField, TemplatePage, TemplateSchema, TemplateFieldType } from "./types";

function attrExists(attrs: string, name: string) { return new RegExp(`\\b${name}\\s*=`, "i").test(attrs); }
function addAttr(attrs: string, name: string, value: string) { return attrExists(attrs, name) ? attrs : `${attrs} ${name}="${value}"`; }
function cleanText(value: string) { return value.replace(/\s+/g, " ").trim(); }
function key(type: string, n: number) { return `${type}.${String(n).padStart(3, "0")}`; }

function pageRanges(html: string) {
  const ranges: Array<{ start: number; end: number; title: string; id: string }> = [];
  const re = /<(section|article|div)\b([^>]*(?:data-page\s*=|data-screen\s*=|class\s*=\s*["'][^"']*\b(?:page|screen|slide|step)\b|id\s*=\s*["'](?:page|screen|slide|step)[-_])[^>]*)>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const attrs = m[2] || "";
    const body = m[3] || "";
    if (cleanText(body).length < 5) continue;
    const heading = body.match(/<h[1-6]\b[^>]*>([^<>]+)<\/h[1-6]>/i)?.[1];
    const id = attrs.match(/\bid=["']([^"']+)["']/i)?.[1] || "";
    const semanticTitle: Record<string, string> = {
      introScreen: "INTRO",
      accessScreen: "PRIVATE ACCESS",
      fragmentsScreen: "LITTLE FRAGMENTS",
      mirrorScreen: "LOOK CLOSER",
      frequencyScreen: "BIRTHDAY FREQUENCY",
      archiveScreen: "THE ARCHIVE",
      messageScreen: "UNSENT MESSAGE",
      coreScreen: "THE CORE",
      finalScreen: "FINAL SURPRISE",
    };
    ranges.push({
      start: m.index,
      end: m.index + m[0].length,
      title: cleanText(heading || "") || semanticTitle[id] || "",
      id,
    });
  }
  return ranges.filter((r, i) => !ranges.some((x, j) => j < i && x.start === r.start));
}

function detectPages(html: string): TemplatePage[] {
  const ranges = pageRanges(html);
  if (!ranges.length) return [{ id: "page-1", title: "Main Page", order: 1, fields: [] }];
  return ranges.map((r, i) => ({
    id: `page-${i + 1}`,
    title: r.title || `Page ${String(i + 1).padStart(2, "0")}`,
    order: i + 1,
    fields: [],
  }));
}

function pageIndexAt(pages: TemplatePage[], html: string, offset: number): number {
  const ranges = pageRanges(html);
  for (let i = 0; i < ranges.length; i++) {
    if (ranges[i].start <= offset && offset <= ranges[i].end) return i;
  }
  return 0;
}

export function prepareTemplateHtml(html: string, css = "") {
  let output = html;
  const fields: TemplateField[] = [];
  const pages = detectPages(html);
  const counts: Record<string, number> = { text: 0, image: 0, audio: 0, video: 0, password: 0, button: 0 };

  function addField(field: TemplateField, sourceOffset: number, pageIndex?: number) {
    fields.push(field);
    const page = pages[pageIndex ?? pageIndexAt(pages, html, sourceOffset)] || pages[0];
    if (page && !page.fields.includes(field.key)) page.fields.push(field.key);
  }

  output = output.replace(/<img\b([^>]*)>/gi, (full, attrs: string, offset: number) => {
    if (attrExists(attrs, "data-mlu-edit")) return full;
    counts.image++;
    const k = key("image", counts.image);
    const src = attrs.match(/\bsrc\s*=\s*["']([^"']*)["']/i)?.[1] || "";
    addField({ key: k, label: `Photo ${counts.image}`, type: "image", defaultValue: src, description: "Replace this photo." }, offset);
    return `<img${addAttr(attrs, "data-mlu-edit", k)}>`;
  });

  output = output.replace(/<audio\b([^>]*)>/gi, (full, attrs: string, offset: number) => {
    if (attrExists(attrs, "data-mlu-edit")) return full;
    counts.audio++;
    const k = key("audio", counts.audio);
    const src = attrs.match(/\bsrc\s*=\s*["']([^"']*)["']/i)?.[1] || "";
    addField({ key: k, label: `Music ${counts.audio}`, type: "audio", defaultValue: src, description: "Replace this music." }, offset);
    return `<audio${addAttr(attrs, "data-mlu-edit", k)}>`;
  });

  output = output.replace(/<source\b([^>]*)>/gi, (full, attrs: string, offset: number) => {
    const src = attrs.match(/\bsrc\s*=\s*["']([^"']*)["']/i)?.[1] || "";
    if (!/audio|\.mp3|\.wav|\.ogg|\.m4a|\.aac/i.test(`${attrs} ${src}`) || attrExists(attrs, "data-mlu-edit")) return full;
    counts.audio++;
    const k = key("audio", counts.audio);
    addField({ key: k, label: `Music ${counts.audio}`, type: "audio", defaultValue: src, description: "Replace this music." }, offset);
    return `<source${addAttr(attrs, "data-mlu-edit", k)}>`;
  });

  output = output.replace(/<video\b([^>]*)>/gi, (full, attrs: string, offset: number) => {
    if (attrExists(attrs, "data-mlu-edit")) return full;
    counts.video++;
    const k = key("video", counts.video);
    const src = attrs.match(/\bsrc\s*=\s*["']([^"']*)["']/i)?.[1] || "";
    addField({ key: k, label: `Video ${counts.video}`, type: "video", defaultValue: src, description: "Replace this video." }, offset);
    return `<video${addAttr(attrs, "data-mlu-edit", k)}>`;
  });

  output = output.replace(/<input\b([^>]*)>/gi, (full, attrs: string, offset: number) => {
    if (attrExists(attrs, "data-mlu-edit")) return full;
    const type = attrs.match(/\btype\s*=\s*["']([^"']*)["']/i)?.[1] || "text";
    const name = attrs.match(/\b(?:name|id)\s*=\s*["']([^"']*)["']/i)?.[1] || "";
    if (type.toLowerCase() !== "password" && !/secret|pass|code/i.test(name)) return full;
    counts.password++;
    const k = key("password", counts.password);
    addField({ key: k, label: `Secret Code ${counts.password}`, type: "password", defaultValue: "", placeholder: "Enter your secret code", description: "Set the code visitors will enter." }, offset, 1);
    return `<input${addAttr(attrs, "data-mlu-edit", k)}>`;
  });

  const textTags = "h1|h2|h3|h4|h5|h6|p|span|small|strong|em|label|button|a|li";
  const textRegex = new RegExp(`<(${textTags})\\b([^>]*)>([^<>]+)<\\/\\1>`, "gi");
  output = output.replace(textRegex, (full, tag: string, attrs: string, text: string, offset: number) => {
    if (attrExists(attrs, "data-mlu-edit")) return full;
    const clean = cleanText(text);
    if (!clean) return full;
    counts.text++;
    const isButton = /^button$/i.test(tag);
    if (isButton) counts.button++;
    const k = key("text", counts.text);
    let label = `Text ${counts.text}`;
    if (/^h1$/i.test(tag)) label = `Heading ${counts.text}`;
    else if (/^h[2-6]$/i.test(tag)) label = `Subheading ${counts.text}`;
    else if (/^p$/i.test(tag)) label = `Paragraph ${counts.text}`;
    else if (isButton) label = `Button ${counts.button}`;
    const type: TemplateFieldType = clean.length > 140 ? "textarea" : "text";
    addField({ key: k, label, type, defaultValue: clean, description: "Change this text if you want." }, offset);
    return `<${tag}${addAttr(attrs, "data-mlu-edit", k)}>${text}</${tag}>`;
  });

  // Detect images used through CSS background-image as editable photos.
  // This covers templates that render photo frames as <div> elements
  // instead of <img>, such as archive cards in THE BOX.
  const cssImageRules = /([^{}]+)\{[^{}]*background(?:-image)?\s*:\s*url\(\s*(['"]?)([^'")]+)\2\s*\)[^{}]*\}/gi;
  for (const match of css.matchAll(cssImageRules)) {
    const selectors = match[1].split(",");
    const imageUrl = match[3];
    if (!/\.(?:png|jpe?g|webp|gif|svg)(?:[?#].*)?$/i.test(imageUrl)) continue;

    for (const rawSelector of selectors) {
      const selector = rawSelector.trim().replace(/::?[a-z-]+(?:\([^)]*\))?$/i, "").trim();
      const simple = selector.match(/^(?:[a-z][\w-]*)?(?:#([\w-]+))?(?:\.([\w-]+))?$/i);
      if (!simple || (!simple[1] && !simple[2])) continue;

      const idName = simple[1];
      const className = simple[2];
      const elementRe = idName
        ? new RegExp(`<([a-z][\\w-]*)\\b([^>]*\\bid=["']${idName}["'][^>]*)>`, "i")
        : new RegExp(`<([a-z][\\w-]*)\\b([^>]*\\bclass=["'][^"']*\\b${className}\\b[^"']*["'][^>]*)>`, "i");
      const found = elementRe.exec(output);
      const originalFound = elementRe.exec(html);
      if (!found || !originalFound) continue;
      const offset = originalFound.index;
      if (attrExists(found[2], "data-mlu-edit")) continue;

      counts.image++;
      const k = key("image", counts.image);
      addField({
        key: k,
        label: `Photo ${counts.image}`,
        type: "image",
        defaultValue: imageUrl,
        description: "Replace this photo.",
      }, offset);
      const replacement = `<${found[1]}${addAttr(addAttr(found[2], "data-mlu-edit", k), "data-mlu-bg-image", "true")}>`;
      output = output.slice(0, found.index) + replacement + output.slice(found.index + found[0].length);
    }
  }


  // Detect intentionally empty photo/image slots (for example
  // .archive-image / .photo-slot divs) even when the original template
  // does not contain an <img> or a CSS background URL yet.
  const slotRegex = /<([a-z][\w-]*)\b([^>]*(?:\b(?:class|id)=['"][^'"]*(?:photo|image|picture|avatar|gallery|cover|thumbnail|archive-image|photo-slot)[^'"]*['"])[^>]*)>/gi;
  output = output.replace(slotRegex, (full: string, tag: string, attrs: string, offset: number) => {
    if (attrExists(attrs, "data-mlu-edit")) return full;
    if (/^(img|audio|video|source)$/i.test(tag)) return full;
    // Avoid treating the entire page/container as a photo slot.
    const markerText = attrs.match(/\b(?:class|id)=['"]([^'"]+)['"]/i)?.[1] || "";
    if (!/(?:photo|image|picture|avatar|gallery|cover|thumbnail|archive-image|photo-slot)/i.test(markerText)) return full;
    counts.image++;
    const k = key("image", counts.image);
    addField({
      key: k,
      label: `Photo ${counts.image}`,
      type: "image",
      defaultValue: "",
      description: "Add or replace the photo shown in this image slot.",
    }, offset);
    return `<${tag}${addAttr(addAttr(attrs, "data-mlu-edit", k), "data-mlu-bg-image", "true")}>`;
  });

  output = output.replace(/\b(src|href)=(['"])(\/(?!\/)[^'"]+)\2/gi, (full, attr: string, quote: string, value: string) => {
    if (/^(?:data:|https?:|mailto:|tel:|#)/i.test(value)) return full;
    return `${attr}=${quote}./${value.replace(/^\//, "")}${quote}`;
  });

  const bridge = `
<script>
(function(){
  function apply(data){
    if(!data||typeof data!=="object")return;
    window.__MLU_TEMPLATE_DATA__=data;
    document.querySelectorAll("[data-mlu-edit]").forEach(function(el){
      var k=el.getAttribute("data-mlu-edit"); if(!k||!(k in data))return;
      var v=data[k]; if(v===null||v===undefined||v==="")return;
      if(el.tagName==="IMG"||el.tagName==="VIDEO"){el.setAttribute("src",String(v));return;}
      if(el.tagName==="AUDIO"||el.tagName==="SOURCE"){el.setAttribute("src",String(v));if(el.tagName==="AUDIO"){try{el.load()}catch(e){}}return;}
      if(el.tagName==="INPUT"){el.value=String(v);return;}
      if(el.hasAttribute("data-mlu-bg-image")){el.style.backgroundImage="url(\""+String(v).replace(/\"/g,"%22")+"\")";return;}
      el.textContent=String(v);
    });
    if(typeof window.MLUApplyScriptData==="function") window.MLUApplyScriptData(data);
  }
  window.addEventListener("message",function(e){
    if(e.source===window.parent&&e.data&&e.data.type==="MLU_TEMPLATE_DATA")apply(e.data.data);
  });
  window.MLUApplyTemplateData=apply;
  if(window.__MLU_TEMPLATE_DATA__) apply(window.__MLU_TEMPLATE_DATA__);
  window.addEventListener("DOMContentLoaded",function(){if(window.__MLU_TEMPLATE_DATA__)apply(window.__MLU_TEMPLATE_DATA__);});
})();
</script>`;
  output = /<\/body>/i.test(output) ? output.replace(/<\/body>/i, `${bridge}</body>`) : output + bridge;

  const schema: TemplateSchema = { version: "3.0", autoEditable: true, pages, fields };
  return { html: output, schema };
}

type ScriptAnalysis = {
  fields: TemplateField[];
  pageAssignments: Array<{ key: string; page: number }>;
  script: string;
};

function decodeJsString(raw: string, quote: string) {
  if (quote === '"') {
    try { return JSON.parse(`"${raw.replace(/"/g, '\\"')}"`); } catch { /* fallback */ }
  }
  return raw
    .replace(/\\(['"`])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\");
}

function findMatchingBrace(source: string, openIndex: number) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let i = openIndex; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractObject(source: string, variableName: string) {
  const marker = new RegExp(`(?:const|let|var)\\s+${variableName}\\s*=\\s*\\{`, "m").exec(source);
  if (!marker || marker.index === undefined) return null;
  const open = source.indexOf("{", marker.index);
  const close = findMatchingBrace(source, open);
  if (close < 0) return null;
  return { start: marker.index, open, close, end: close + 1, text: source.slice(open, close + 1) };
}

function extractNamedObjectStrings(objectText: string, propertyNames: string[]) {
  const out: Record<string, string> = {};
  for (const property of propertyNames) {
    const re = new RegExp(`\\b${property}\\s*:\\s*(['"])([\\s\\S]*?)\\1`);
    const m = re.exec(objectText);
    if (m) out[property] = decodeJsString(m[2], m[1]);
  }
  return out;
}

export function prepareTemplateScript(script: string, baseSchema: TemplateSchema) : ScriptAnalysis {
  let output = script;
  const fields: TemplateField[] = [];
  const assignments: Array<{ key: string; page: number }> = [];

  // A four-digit secret/code stored in JavaScript becomes an editable
  // password field. The value itself is not exposed by the editor UI as a label.
  const secretMatch = output.match(/(?:const|let|var)\s+SECRET_CODE\s*=\s*(['"])([^'"]*)\1/);
  if (secretMatch) {
    const keyName = "password.001";
    fields.push({
      key: keyName,
      label: "Set Your Secret Code",
      type: "password",
      defaultValue: "",
      placeholder: "Enter a 4 digit code",
      description: "Visitors will use this code to unlock the website.",
    });
    assignments.push({ key: keyName, page: 1 });
    output = output.replace(secretMatch[0], `let SECRET_CODE = ${JSON.stringify(secretMatch[2])};`);
  }

  const fragmentObject = extractObject(script, "fragmentData");
  if (fragmentObject) {
    const types = ["memory", "question", "secret", "sound", "message"];
    for (const type of types) {
      const typeMarker = new RegExp(`\\b${type}\\s*:\\s*\\{`, "m").exec(fragmentObject.text);
      if (!typeMarker || typeMarker.index === undefined) continue;
      const open = fragmentObject.text.indexOf("{", typeMarker.index);
      const close = findMatchingBrace(fragmentObject.text, open);
      if (open < 0 || close < 0) continue;
      const block = fragmentObject.text.slice(open, close + 1);
      const values = extractNamedObjectStrings(block, ["title", "description", "content"]);
      for (const prop of ["title", "description", "content"]) {
        if (!(prop in values)) continue;
        const fieldKey = `fragment.${type}.${prop}`;
        fields.push({
          key: fieldKey,
          label: `${type[0].toUpperCase()}${type.slice(1)} ${prop}`,
          type: prop === "content" && values[prop].length > 140 ? "textarea" : "text",
          defaultValue: values[prop],
          description: `Edit the ${prop} shown when ${type.toUpperCase()} is opened.`,
        });
        assignments.push({ key: fieldKey, page: 2 });
      }
    }
  }

  const archiveObject = extractObject(script, "archiveMessages");
  if (archiveObject) {
    for (const id of ["01", "02", "03"]) {
      const re = new RegExp(`['"]?${id}['"]?\\s*:\\s*(['"])([\\s\\S]*?)\\1`);
      const m = re.exec(archiveObject.text);
      if (!m) continue;
      const value = decodeJsString(m[2], m[1]);
      const fieldKey = `archive.${id}.message`;
      fields.push({
        key: fieldKey,
        label: `Archive ${id} Message`,
        type: value.length > 140 ? "textarea" : "text",
        defaultValue: value,
        description: `Edit the message opened by Archive ${id}.`,
      });
      assignments.push({ key: fieldKey, page: 5 });
    }
  }

  const injected = `
/* MLU automatic editor bridge */
(function(){
  function applyMLU(data){
    if(!data||typeof data!=="object")return;
    %SECRET%
    %FRAGMENTS%
    %ARCHIVE%
  }
  window.MLUApplyScriptData=applyMLU;
  if(window.__MLU_TEMPLATE_DATA__) applyMLU(window.__MLU_TEMPLATE_DATA__);
})();`;

  const injectedResolved = injected
    .replace("%SECRET%", secretMatch
      ? `if(Object.prototype.hasOwnProperty.call(data,"password.001")) SECRET_CODE=String(data["password.001"]);`
      : "")
    .replace("%FRAGMENTS%", fragmentObject ? `
    var f={
      memory:["title","description","content"],
      question:["title","description","content"],
      secret:["title","description","content"],
      sound:["title","description","content"],
      message:["title","description","content"]
    };
    Object.keys(f).forEach(function(type){
      if(!fragmentData[type])return;
      f[type].forEach(function(prop){
        var k="fragment."+type+"."+prop;
        if(Object.prototype.hasOwnProperty.call(data,k)) fragmentData[type][prop]=String(data[k]);
      });
    });` : "")
    .replace("%ARCHIVE%", archiveObject ? `
    ["01","02","03"].forEach(function(id){
      var k="archive."+id+".message";
      if(Object.prototype.hasOwnProperty.call(data,k)) archiveMessages[id]=String(data[k]);
    });` : "");

  // The original THE BOX script keeps its state inside the DOMContentLoaded
  // callback, so the bridge must live inside that callback too.
  const close = output.lastIndexOf("\n});");
  if (close >= 0) {
    output = `${output.slice(0, close)}\n${injectedResolved}\n${output.slice(close)}`;
  } else {
    output = `${output}\n${injectedResolved}\n`;
  }  return { script: output, fields, pageAssignments: assignments };
}

export function mergeScriptSchema(schema: TemplateSchema, analysis: ScriptAnalysis): TemplateSchema {
  const mergedFields = [...schema.fields];
  const existing = new Set(mergedFields.map((f) => f.key));
  for (const field of analysis.fields) if (!existing.has(field.key)) mergedFields.push(field);

  const pages = (schema.pages ?? []).map((page) => ({ ...page, fields: [...page.fields] }));
  for (const assignment of analysis.pageAssignments) {
    const page = pages[assignment.page] || pages[pages.length - 1] || { id: `page-${assignment.page + 1}`, title: `Page ${String(assignment.page + 1).padStart(2, "0")}`, order: assignment.page + 1, fields: [] };
    if (!pages.includes(page)) pages.push(page);
    if (!page.fields.includes(assignment.key)) page.fields.push(assignment.key);
  }
  return { ...schema, version: "3.0", autoEditable: true, fields: mergedFields, pages };
}
