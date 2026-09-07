import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UniverseExperience from "@/component/universe/UniverseExperience";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function UniversePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: universe,
    error: universeError,
  } = await supabase
    .from("universes")
    .select(
      `
        id,
        slug,
        title,
        person_name,
        relationship,
        opening_message,
        description,
        theme,
        design,
        music,
        password_enabled,
        password_screen
      `
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (universeError || !universe) {
    notFound();
  }

  const {
    data: pages,
    error: pagesError,
  } = await supabase
    .from("universe_pages")
    .select("*")
    .eq("universe_id", universe.id)
    .order("page_order", {
      ascending: true,
    });

  if (pagesError) {
    console.error("Universe pages error:", pagesError);
  }

  const {
    data: media,
    error: mediaError,
  } = await supabase
    .from("universe_media")
    .select("*")
    .eq("universe_id", universe.id)
    .order("media_order", {
      ascending: true,
    });

  if (mediaError) {
    console.error("Universe media error:", mediaError);
  }

  return (
    <UniverseExperience
      universe={universe}
      pages={pages || []}
      media={media || []}
    />
  );
}