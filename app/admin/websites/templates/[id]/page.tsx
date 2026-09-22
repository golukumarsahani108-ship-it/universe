import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import TemplateNoteEditor from "@/component/admin/TemplateNoteEditor";
import DeleteTemplateButton from "@/component/admin/DeleteTemplateButton";
import RebuildTemplateButton from "@/component/admin/RebuildTemplateButton";

export default async function AdminTemplateManagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { data: template, error } = await supabaseAdmin
    .from("website_templates")
    .select("id,name,slug,category,description,editor_note,status,version,package_path,entry_path,schema,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !template) notFound();

  const schema = (template.schema as any) || {};
  const fields = Array.isArray(schema.fields) ? schema.fields : [];
  const pages = Array.isArray(schema.pages) ? schema.pages : [];
  const previewUrl = `/api/templates/${template.id}/${template.entry_path || "index.html"}`;

  return (
    <main className="admin-added-page">
      <div className="mx-auto max-w-6xl space-y-4">
        <Link href="/admin/websites/templates" className="inline-flex rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-xs text-white/55 hover:text-white">← Back to Added Websites</Link>

        <div className="admin-template-manage">
          <section className="admin-template-manage__panel admin-template-manage__info">
            <div className="admin-added-kicker">Template Management</div>
            <h1 className="admin-added-title">{template.name}</h1>
            <p className="admin-added-desc">{template.description || "No description added."}</p>

            <div className="admin-template-manage__meta">
              <div><span>Category</span><strong>{template.category}</strong></div>
              <div><span>Status</span><strong>{template.status}</strong></div>
              <div><span>Creator edit</span><strong>ON</strong></div>
              <div><span>Pages</span><strong>{pages.length || "—"}</strong></div>
              <div><span>Fields</span><strong>{fields.length}</strong></div>
              <div><span>Version</span><strong>{template.version}</strong></div>
            </div>

            <TemplateNoteEditor id={template.id} initialNote={template.editor_note} />

            <div className="admin-template-section">
              <div className="admin-template-section__title">Creator editing</div>
              <p className="mt-2 text-xs leading-6 text-white/45">
                The uploaded HTML/CSS/JS remains the design. The system scans HTML, CSS and JavaScript automatically, including photo slots, music, secret codes and interactive content, then gives creators only the editable items page-by-page.
              </p>
            </div>

            <div className="admin-template-section">
              <div className="admin-template-section__title">Detected editable fields</div>
              <div className="admin-template-fields">
                {fields.map((field: any) => (
                  <div key={field.key} className="admin-template-field-row">
                    <span>{field.label}</span>
                    <b>{field.type} · ON</b>
                  </div>
                ))}
                {!fields.length && <p className="text-xs text-white/35">No editable fields detected.</p>}
              </div>
            </div>

            <div className="admin-added-actions">
              <Link href={previewUrl} target="_blank" className="admin-added-btn admin-added-btn--primary">Open Full Preview ↗</Link>
              <Link href="/admin/websites/add" className="admin-added-btn">＋ Add Another Website</Link>
              <RebuildTemplateButton id={template.id} />
              <DeleteTemplateButton id={template.id} name={template.name} />
            </div>
          </section>

          <section className="admin-template-manage__panel admin-template-manage__preview">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-[9px] font-bold uppercase tracking-[.2em] text-white/35">LIVE TEMPLATE PREVIEW</span>
              <span className="text-[9px] text-emerald-300/60">Original design</span>
            </div>
            <iframe title={`${template.name} preview`} src={previewUrl} sandbox="allow-scripts allow-forms allow-modals" />
          </section>
        </div>
      </div>
    </main>
  );
}
