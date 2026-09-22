import { createClient } from "@/lib/supabase/server";
import BirthdayTemplateClient from "./BirthdayTemplateClient";

export default async function BirthdayTemplatePage() {
  const supabase = await createClient();

  const { data: templates, error } = await supabase
    .from("website_templates")
    .select(
      `
        id,
        name,
        slug,
        category,
        description,
        thumbnail_url,
        thumbnail_path,
        package_path,
        entry_path,
        schema,
        status,
        version
      `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load website templates:", error);
  }

  const dynamicTemplates =
    templates?.filter(
      (template) => template.category === "birthday"
    ) ?? [];

  return (
    <BirthdayTemplateClient
      templates={dynamicTemplates}
    />
  );
}