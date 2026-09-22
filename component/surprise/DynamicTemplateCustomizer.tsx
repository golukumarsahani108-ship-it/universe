"use client";

import { useEffect, useMemo, useState } from "react";
import GlassButton from "@/component/glass/GlassButton";
import GlassInput from "@/component/glass/GlassInput";
import "./dynamic-template-customizer.css";

export type DynamicTemplate = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  editor_note?: string | null;
  package_path: string;
  entry_path: string;
  schema: {
    fields?: Array<{ key: string; label: string; type: string; defaultValue?: string | number | boolean; placeholder?: string; description?: string }>;
    pages?: Array<{ id: string; title: string; order: number; fields: string[] }>;
  } | null;
};

type Value = string | number | boolean;
type Props = { template: DynamicTemplate; initialData?: Record<string, Value>; onContinue: (data: Record<string, unknown>) => void };

const iconFor = (type: string) => ({ image: "🖼", audio: "🎵", video: "🎬", password: "🔐", textarea: "📝", text: "✏️" }[type] || "⚙️");

export default function DynamicTemplateCustomizer({ template, initialData, onContinue }: Props) {
  const fields = useMemo(() => template.schema?.fields ?? [], [template.schema]);
  const pages = useMemo(() => {
    const schemaPages = template.schema?.pages ?? [];
    if (schemaPages.length) return [...schemaPages].sort((a, b) => a.order - b.order);
    return [{ id: "page-1", title: "Website Content", order: 1, fields: fields.map((f) => f.key) }];
  }, [template.schema, fields]);
  const [values, setValues] = useState<Record<string, Value>>(initialData ?? {});
  const [openPage, setOpenPage] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    const next = { ...(initialData ?? {}) } as Record<string, Value>;
    for (const f of fields) if (!(f.key in next) && f.defaultValue !== undefined) next[f.key] = f.defaultValue;
    setValues(next);
  }, [fields, initialData]);

  function setValue(key: string, value: Value) { setValues((current) => ({ ...current, [key]: value })); }

  async function upload(kind: "image" | "audio" | "video", field: { key: string }, file: File) {
    setUploading(field.key);
    try {
      const form = new FormData(); form.append("file", file); form.append("kind", kind);
      const response = await fetch(`/api/templates/${template.id}/media`, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      setValue(field.key, result.publicUrl);
    } catch (error) { alert(error instanceof Error ? error.message : "Upload failed."); }
    finally { setUploading(null); }
  }

  function postPreview() {
    document.querySelectorAll<HTMLIFrameElement>("[data-mlu-preview]").forEach((frame) => frame.contentWindow?.postMessage({ type: "MLU_TEMPLATE_DATA", data: values }, "*"));
  }
  useEffect(() => { if (iframeReady) postPreview(); }, [iframeReady, values]);

  const fieldMap = new Map(fields.map((f) => [f.key, f]));
  const pageFields = (page: (typeof pages)[number]) => page.fields.map((k) => fieldMap.get(k)).filter(Boolean) as NonNullable<ReturnType<typeof fieldMap.get>>[];

  function renderField(field: NonNullable<ReturnType<typeof fieldMap.get>>) {
    const value = String(values[field.key] ?? "");

    if (field.type === "image" || field.type === "audio" || field.type === "video") {
      const kind = field.type;
      return (
        <div key={field.key} className="dynamic-template-media">
          <div className="dynamic-template-media__head">
            <span className="dynamic-template-media__icon">{iconFor(kind)}</span>
            <div>
              <div className="dynamic-template-field__label">{field.label}</div>
              <div className="dynamic-template-field__help">
                {field.description || `Add ${kind === "image" ? "a photo" : "music"}.`}
              </div>
            </div>
          </div>
          {value && (
            <div className="dynamic-template-media__preview">
              {kind === "image" ? <img src={value} alt="Current" /> : kind === "audio" ? <audio controls src={value} /> : <video controls src={value} />}
            </div>
          )}
          <div className="dynamic-template-media__actions">
            <label className="dynamic-template-upload">
              <input
                type="file"
                hidden
                accept={kind === "image" ? "image/*" : kind === "audio" ? "audio/*" : "video/*"}
                disabled={uploading === field.key}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(kind, field, f);
                }}
              />
              {uploading === field.key ? "Uploading…" : value ? `Replace ${kind === "image" ? "Photo" : kind === "audio" ? "Music" : "Video"}` : `Add ${kind === "image" ? "Photo" : kind === "audio" ? "Music" : "Video"}`}
            </label>
            {value && <button type="button" className="dynamic-template-remove" onClick={() => setValue(field.key, "")}>Remove</button>}
          </div>
        </div>
      );
    }

    if (field.type === "password") {
      return (
        <div key={field.key} className="dynamic-template-media">
          <div className="dynamic-template-field__label">🔐 {field.label}</div>
          <div className="dynamic-template-field__help">Set the code visitors will enter on this website.</div>
          <div style={{ marginTop: 10 }}>
            <GlassInput type="password" value={value} onChange={(v) => setValue(field.key, v)} placeholder={field.placeholder || "Enter secret code"} />
          </div>
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.key} className="dynamic-template-field">
          <label className="dynamic-template-field__label">{iconFor(field.type)} {field.label}</label>
          {field.description && <div className="dynamic-template-field__help">{field.description}</div>}
          <textarea
            value={value}
            onChange={(e) => setValue(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="dynamic-template-textarea"
          />
        </div>
      );
    }

    return (
      <div key={field.key} className="dynamic-template-field">
        <label className="dynamic-template-field__label">{iconFor(field.type)} {field.label}</label>
        {field.description && <div className="dynamic-template-field__help">{field.description}</div>}
        <GlassInput value={value} onChange={(v) => setValue(field.key, v)} placeholder={field.placeholder} />
      </div>
    );
  }

  return (
    <div className="dynamic-template-editor">
      <div className="dynamic-template-editor__grid">
        <section className="dynamic-template-panel">
          <div>
            <div className="dynamic-template-kicker">Custom Template</div>
            <h2 className="dynamic-template-title">{template.name}</h2>
            <p className="dynamic-template-subtitle">
              The website was scanned automatically. Open only the pages you want to change — everything else stays original.
            </p>
          </div>

          <div className="dynamic-template-note">
            <div className="dynamic-template-note__title">⚠ Note</div>
            <div className="dynamic-template-note__text">
              {template.editor_note || "You do not need to edit every page. Open a page only when you want to customize it."}
            </div>
          </div>

          <div className="dynamic-template-pages">
            {pages.map((page) => {
              const pf = pageFields(page);
              const isOpen = openPage === page.id;

              return (
                <div key={page.id} className={`dynamic-template-page${isOpen ? " is-open" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setOpenPage(isOpen ? null : page.id)}
                    className="dynamic-template-page__toggle"
                  >
                    <span>
                      <span className="dynamic-template-page__meta">
                        PAGE {String(page.order).padStart(2, "0")}
                      </span>
                      <span className="dynamic-template-page__name">{page.title}</span>
                    </span>
                    <span className="dynamic-template-page__count">
                      {pf.length ? <><strong>{pf.length}</strong> editable</> : "Original"} {isOpen ? "⌃" : "⌄"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="dynamic-template-page__body">
                      {pf.length ? pf.map(renderField) : (
                        <div className="dynamic-template-field__help">
                          This page has no detected editable content. Keep the original page unchanged.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="dynamic-template-actions">
            <button type="button" className="dynamic-template-secondary" onClick={() => setOpenPage(null)}>
              Collapse all
            </button>
            <GlassButton
              active
              onClick={() => onContinue({ personName: "", title: template.name, template: template.id, templateData: values })}
            >
              Continue to Preview →
            </GlassButton>
          </div>
        </section>

        <section className="dynamic-template-preview">
          <div className="dynamic-template-preview__head">
            <span className="dynamic-template-preview__label">LIVE PREVIEW</span>
            <span className="dynamic-template-preview__live">● Changes update automatically</span>
          </div>
          <iframe
            data-mlu-preview
            title={`${template.name} preview`}
            src={`/api/templates/${template.id}/${template.entry_path || "index.html"}`}
            onLoad={() => setIframeReady(true)}
            className="dynamic-template-preview__frame"
            sandbox="allow-scripts allow-forms allow-modals"
          />
        </section>
      </div>
    </div>
  );
}
