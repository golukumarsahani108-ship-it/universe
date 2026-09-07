import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function UniversePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: universe, error } = await supabase
    .from("universes")
    .select("id, slug, title, published")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !universe) {
    notFound();
  }

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        background: "#210d18",
      }}
    >
      <iframe
        title={universe.title || "A Little Surprise"}
        src={`/surprise-template/index.html?slug=${encodeURIComponent(slug)}`}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
        }}
        allow="autoplay"
      />
    </main>
  );
}
