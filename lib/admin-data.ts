import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

/*
 * ============================================================
 * ADMIN SCHEMA ADAPTER
 * ============================================================
 *
 * These columns are based on the existing publish API.
 *
 * IMPORTANT:
 * - Owner column is owner_id, NOT user_id.
 * - We do not invent database columns here.
 */

export const ADMIN_SCHEMA = {
  websitesTable: "universes",

  websiteIdColumn: "id",
  websiteTitleColumn: "title",
  websiteOwnerColumn: "owner_id",
  websiteSlugColumn: "slug",
  websiteCreatedColumn: "created_at",

  websitePublishedColumn: "published",
} as const;

export type AdminWebsite = {
  id: string;
  title: string;
  ownerId: string | null;
  slug: string | null;
  createdAt: string | null;
  published: boolean;
};

function valueOr<T>(
  value: T | null | undefined,
  fallback: T
): T {
  return value ?? fallback;
}

/*
 * ============================================================
 * GET WEBSITES
 * ============================================================
 */

export async function getAdminWebsites(): Promise<
  AdminWebsite[]
> {
  const s = ADMIN_SCHEMA;

  const { data, error } = await supabaseAdmin
    .from(s.websitesTable)
    .select(
      [
        s.websiteIdColumn,
        s.websiteTitleColumn,
        s.websiteOwnerColumn,
        s.websiteSlugColumn,
        s.websiteCreatedColumn,
        s.websitePublishedColumn,
      ].join(", ")
    )
    .order(s.websiteCreatedColumn, {
      ascending: false,
    });

  if (error) {
    console.error(
      "Admin websites query error:",
      error
    );

    throw new Error(
      `Unable to load websites: ${error.message}`
    );
  }

  const rows =
    (data ?? []) as unknown as Record<
      string,
      unknown
    >[];

  return rows.map((row) => ({
    id: String(
      row[s.websiteIdColumn] ?? ""
    ),

    title: valueOr(
      row[s.websiteTitleColumn] as string | null,
      "Untitled Surprise"
    ),

    ownerId:
      (row[s.websiteOwnerColumn] as string | null) ??
      null,

    slug:
      (row[s.websiteSlugColumn] as string | null) ??
      null,

    createdAt:
      (row[s.websiteCreatedColumn] as string | null) ??
      null,

    published:
      Boolean(
        row[s.websitePublishedColumn]
      ),
  }));
}

/*
 * ============================================================
 * DASHBOARD STATS
 * ============================================================
 */

export async function getDashboardStats() {
  /*
   * User count comes directly from Supabase Auth.
   */

  const {
    data: users,
    error: usersError,
  } =
    await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (usersError) {
    throw new Error(
      `Unable to load users: ${usersError.message}`
    );
  }

  const websites =
    await getAdminWebsites();

  const totalUsers =
    users?.users.length ?? 0;

  const totalWebsites =
    websites.length;

  const publishedWebsites =
    websites.filter(
      (website) => website.published
    ).length;

  const draftWebsites =
    totalWebsites - publishedWebsites;

  /*
   * Views are not currently confirmed in the
   * existing universes schema.
   *
   * Do not invent/fake a value.
   */
  const totalViews: number | null = null;

  /*
   * Active-user tracking is not currently
   * available from the known schema.
   */
  const activeUsers: number | null = null;

  return {
    totalUsers,
    totalWebsites,
    publishedWebsites,
    draftWebsites,
    totalViews,
    activeUsers,
  };
}

/*
 * ============================================================
 * RECENT USERS
 * ============================================================
 */

export async function getRecentUsers() {
  const {
    data,
    error,
  } =
    await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (error) {
    throw new Error(
      `Unable to load recent users: ${error.message}`
    );
  }

  return (data?.users ?? [])
    .sort(
      (a, b) =>
        new Date(
          b.created_at
        ).getTime() -
        new Date(
          a.created_at
        ).getTime()
    )
    .slice(0, 8)
    .map((user) => ({
      id: user.id,
      email: user.email ?? "",
      createdAt: user.created_at,
    }));
}