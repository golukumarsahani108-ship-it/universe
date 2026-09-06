import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function UniversePage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: universe, error } = await supabase
    .from("universes")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Universe load error:", error);
    notFound();
  }

  if (!universe) {
    notFound();
  }

  const { data: pages, error: pagesError } = await supabase
    .from("universe_pages")
    .select("*")
    .eq("universe_id", universe.id)
    .order("page_order", { ascending: true });

  if (pagesError) {
    console.error("Universe pages load error:", pagesError);
  }

  const { data: media, error: mediaError } = await supabase
    .from("universe_media")
    .select("*")
    .eq("universe_id", universe.id)
    .order("media_order", { ascending: true });

  if (mediaError) {
    console.error("Universe media load error:", mediaError);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div
        className="glass"
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: 32,
          borderRadius: 32,
        }}
      >
        <p style={{ opacity: 0.65 }}>
          MY UNIVERSE
        </p>

        <h1 style={{ marginTop: 10 }}>
          {universe.title}
        </h1>

        <h2 style={{ marginTop: 8 }}>
          For {universe.person_name} ✨
        </h2>

        {universe.relationship && (
          <p style={{ opacity: 0.7 }}>
            {universe.relationship}
          </p>
        )}

        {universe.opening_message && (
          <p style={{ marginTop: 24 }}>
            {universe.opening_message}
          </p>
        )}

        {universe.description && (
          <p style={{ marginTop: 12, opacity: 0.75 }}>
            {universe.description}
          </p>
        )}

        <div style={{ marginTop: 30 }}>
          <strong>
            {pages?.length || 0} Pages
          </strong>

          <span style={{ margin: "0 12px", opacity: 0.4 }}>
            •
          </span>

          <strong>
            {media?.length || 0} Media
          </strong>
        </div>
      </div>
    </main>
  );
}