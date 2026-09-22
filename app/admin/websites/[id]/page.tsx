import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminWebsiteManagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { data: website, error } = await supabaseAdmin
    .from("universes")
    .select("id,title,slug,owner_id,published,created_at,design,person_name")
    .eq("id", id)
    .maybeSingle();

  if (error || !website) notFound();

  const design = (website.design ?? {}) as Record<string, unknown>;
  const templateId = typeof design.template_id === "string" ? design.template_id : null;

  return (
    <main className="min-h-full">
      <div className="mx-auto max-w-4xl space-y-5">
        <Link href="/admin/websites" className="text-sm text-white/45 hover:text-white">← Back to Websites</Link>
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl sm:p-8">
          <div className="text-[10px] uppercase tracking-[0.25em] text-pink-300/70">WEBSITE MANAGEMENT</div>
          <h1 className="mt-2 text-3xl font-semibold">{website.title || "Untitled Universe"}</h1>
          <p className="mt-2 text-sm text-white/45">Manage this creator-published surprise website.</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/[0.035] p-4"><span className="text-xs text-white/30">Owner</span><strong className="mt-1 block break-all text-sm">{website.owner_id || "—"}</strong></div>
            <div className="rounded-2xl bg-white/[0.035] p-4"><span className="text-xs text-white/30">Status</span><strong className="mt-1 block">{website.published ? "Published" : "Draft"}</strong></div>
            <div className="rounded-2xl bg-white/[0.035] p-4"><span className="text-xs text-white/30">Slug</span><strong className="mt-1 block">{website.slug || "—"}</strong></div>
            <div className="rounded-2xl bg-white/[0.035] p-4"><span className="text-xs text-white/30">Template</span><strong className="mt-1 block">{templateId ? "Admin-added template" : "Original Surprise"}</strong></div>
          </div>

          {website.slug && <Link href={`/u/${website.slug}`} target="_blank" className="mt-6 inline-flex rounded-xl border border-white/10 bg-gradient-to-r from-pink-500/20 to-purple-500/20 px-5 py-3 text-sm font-semibold">View Published Website ↗</Link>}
        </section>
      </div>
    </main>
  );
}
