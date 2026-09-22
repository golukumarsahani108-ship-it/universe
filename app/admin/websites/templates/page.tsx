import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminWebsiteTemplatesPage() {
  await requireAdmin();
  const { data: templates, error } = await supabaseAdmin
    .from("website_templates")
    .select("id,name,slug,category,description,editor_note,status,version,schema,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Unable to load templates: ${error.message}`);

  return (
    <main className="admin-added-page">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="admin-added-hero">
          <div className="admin-added-kicker">Website Studio · Admin Added</div>
          <h1 className="admin-added-title">Your Added <span>Websites</span></h1>
          <p className="admin-added-desc">
            This area contains only websites uploaded from the Admin Panel. Open Manage to see the live template, detected editable content, and the creator note.
          </p>
          <div className="admin-added-actions">
            <Link href="/admin/websites" className="admin-added-btn">← All User Websites</Link>
            <Link href="/admin/websites/add" className="admin-added-btn admin-added-btn--primary">＋ Add Website</Link>
          </div>
        </section>

        {templates && templates.length > 0 ? (
          <div className="admin-added-grid">
            {templates.map((template) => {
              const fields = Array.isArray((template.schema as any)?.fields) ? (template.schema as any).fields : [];
              const pages = Array.isArray((template.schema as any)?.pages) ? (template.schema as any).pages : [];
              return (
                <article key={template.id} className="admin-added-card">
                  <div className="admin-added-card__top">
                    <div className="admin-added-card__head">
                      <div>
                        <div className="admin-added-card__category">{template.category}</div>
                        <h2 className="admin-added-card__name">{template.name}</h2>
                        <p className="admin-added-card__description">{template.description || "No description added."}</p>
                      </div>
                      <span className="admin-added-status">{template.status}</span>
                    </div>

                    <div className="admin-added-stats">
                      <div className="admin-added-stat"><span>Pages</span><strong>{pages.length || "—"}</strong></div>
                      <div className="admin-added-stat"><span>Editable</span><strong>{fields.length}</strong></div>
                      <div className="admin-added-stat"><span>Version</span><strong>{template.version}</strong></div>
                    </div>

                    {template.editor_note && (
                      <div className="admin-added-note"><b>NOTE:</b> {template.editor_note}</div>
                    )}
                  </div>
                  <div className="admin-added-card__bottom">
                    <Link href={`/admin/websites/templates/${template.id}`} className="admin-added-btn">Manage Website</Link>
                    <Link href={`/api/templates/${template.id}/index.html`} target="_blank" className="admin-added-btn">Preview ↗</Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-added-empty">No Admin-added websites yet. Use <b>Add Website</b> to upload your first ZIP.</div>
        )}
      </div>
    </main>
  );
}
