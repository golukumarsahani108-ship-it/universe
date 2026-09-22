import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function UniversePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: universe, error } = await supabase
    .from("universes")
    .select("id, slug, title, published, design")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !universe) notFound();

  const design = (universe.design ?? {}) as Record<string, unknown>;
  const templateId = typeof design.template_id === "string" ? design.template_id : null;

  if (templateId) {
    return (
      <main style={{ position: "fixed", inset: 0, width: "100vw", height: "100dvh", overflow: "hidden", background: "#080811" }}>
        <iframe
          title={universe.title || "A Little Surprise"}
          src={`/api/templates/${encodeURIComponent(templateId)}/index.html?slug=${encodeURIComponent(slug)}`}
          style={{ display: "block", width: "100%", height: "100%", border: 0 }}
          allow="autoplay; fullscreen"
          sandbox="allow-scripts allow-forms allow-modals"
        />
      </main>
    );
  }

  return (
    <main style={{ position: "fixed", inset: 0, width: "100vw", height: "100dvh", overflow: "hidden", background: "#210d18" }}>
      <iframe
        title={universe.title || "A Little Surprise"}
        src={`/surprise-template/index.html?slug=${encodeURIComponent(slug)}`}
        style={{ display: "block", width: "100%", height: "100%", border: 0 }}
        allow="autoplay"
      />
    </main>
  );
}
