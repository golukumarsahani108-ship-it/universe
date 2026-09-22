import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getAuthenticatedAdmin() {
  // Session/auth user ko normal server client se read karo
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("ADMIN AUTH USER ERROR:", userError);
    return null;
  }

  if (!user) {
    console.error("ADMIN AUTH: NO USER FOUND");
    return null;
  }

  console.log("ADMIN AUTH USER:", user.id, user.email);

  // Admin role ko service-role client se check karo.
  // admin_users par RLS intentionally client access block karta hai.
  const { data: admin, error: adminError } = await supabaseAdmin
    .from("admin_users")
    .select("user_id, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (adminError) {
    console.error("ADMIN ROLE ERROR:", adminError);
    return null;
  }

  if (!admin) {
    console.error("ADMIN ROLE: USER IS NOT ADMIN");
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
  };
}

export async function requireAdmin() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}