import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";

function createSlugPart(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
  personName: string
) {
  const base =
    createSlugPart(personName) ||
    createSlugPart(title) ||
    "my-universe";

  for (let attempt = 0; attempt < 20; attempt++) {
    const suffix = Math.random()
      .toString(36)
      .slice(2, 8);

    const slug =
      attempt === 0
        ? `${base}-${suffix}`
        : `${base}-${suffix}${attempt}`;

    const { data } = await supabase
      .from("universes")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) {
      return slug;
    }
  }

  throw new Error(
    "Could not generate a unique universe link."
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    /*
     * -----------------------------------------
     * 1. Verify logged-in user
     * -----------------------------------------
     */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You must be logged in to publish a universe.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      universeId,
      data,
      pages,
      design,
      music,
      password,
      media,
    } = body;

    /*
     * -----------------------------------------
     * 2. Basic validation
     * -----------------------------------------
     */

    if (
      !universeId ||
      !data?.universeName ||
      !data?.personName
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Universe name and person name are required.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(pages) ||
      pages.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "At least one universe page is required.",
        },
        { status: 400 }
      );
    }

    /*
     * -----------------------------------------
     * 3. Password
     * -----------------------------------------
     */

    let passwordHash: string | null = null;

    if (password?.enabled) {
      const plainPassword = String(
        password.password || ""
      );

      const confirmPassword = String(
        password.confirmPassword || ""
      );

      if (!plainPassword) {
        return NextResponse.json(
          {
            success: false,
            error: "Please enter a password.",
          },
          { status: 400 }
        );
      }

      if (
        plainPassword !== confirmPassword
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Passwords do not match.",
          },
          { status: 400 }
        );
      }

      passwordHash =
        await bcrypt.hash(
          plainPassword,
          12
        );
    }

    /*
     * -----------------------------------------
     * 4. Generate unique slug
     * -----------------------------------------
     */

    const slug =
      await generateUniqueSlug(
        supabase,
        data.universeName,
        data.personName
      );

    /*
     * -----------------------------------------
     * 5. Create universe
     * -----------------------------------------
     */

    const {
      data: universe,
      error: universeError,
    } = await supabase
      .from("universes")
      .insert({
        id: universeId,

        owner_id: user.id,

        slug,

        title:
          data.universeName,

        person_name:
          data.personName,

        relationship:
          data.relationship === "Custom"
            ? data.customRelationship ||
              "Special Person"
            : data.relationship || null,

        opening_message:
          data.openingMessage || null,

        description:
          data.description || null,

        theme:
          design?.theme ||
          "spatial-glass",

        design:
          design || {},

        music:
          music || {},

        password_enabled:
          Boolean(password?.enabled),

        password_hash:
          passwordHash,

        password_screen: {
          title:
            password?.screenTitle ||
            "A little secret awaits ♡",

          message:
            password?.screenMessage ||
            "Only someone special knows the magic needed to enter this universe.",

          buttonText:
            password?.buttonText ||
            "Enter Universe",
        },

        published: true,
      })
      .select()
      .single();

    if (
      universeError ||
      !universe
    ) {
      console.error(
        "Universe insert error:",
        universeError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            universeError?.message ||
            "Failed to create universe.",
        },
        { status: 500 }
      );
    }

    /*
 * -----------------------------------------
 * 6. Create pages
 *
 * IMPORTANT:
 * Frontend page IDs are NOT trusted as DB UUIDs.
 * Database generates the real UUID.
 * -----------------------------------------
 */

const pageRows = pages.map(
  (page: any, index: number) => ({
    universe_id: universe.id,

    page_order:
      typeof page.order === "number"
        ? page.order
        : index + 1,

    page_type:
      page.type || "Custom",

    title:
      page.title ||
      `Page ${index + 1}`,

    content:
      page.content || null,

    settings: {
      /*
       * Common page settings
       */
      musicEnabled:
        Boolean(page.musicEnabled),

      animationEnabled:
        Boolean(page.animationEnabled),

      buttonEnabled:
        Boolean(page.buttonEnabled),

      buttonText:
        page.buttonText || "",

      buttonAction:
        page.buttonAction || "next",

      /*
       * -----------------------------------------
       * Images
       * -----------------------------------------
       */

      images:
        Array.isArray(page.images)
          ? page.images.map(
              (
                image: any,
                imageIndex: number
              ) => ({
                id:
                  image.id ||
                  crypto.randomUUID(),

                name:
                  image.name || "",

                url:
                  image.url || "",

                storagePath:
                  image.storagePath ||
                  "",

                type:
                  image.type || "",

                size:
                  typeof image.size ===
                  "number"
                    ? image.size
                    : 0,

                order:
                  imageIndex,
              })
            )
          : [],

      /*
       * -----------------------------------------
       * Dynamic page-specific data
       * -----------------------------------------
       */

      reasons:
        Array.isArray(page.reasons)
          ? page.reasons
          : [],

      favouriteThings:
        Array.isArray(
          page.favouriteThings
        )
          ? page.favouriteThings
          : [],

      quotes:
        Array.isArray(page.quotes)
          ? page.quotes
          : [],

      timeline:
        Array.isArray(page.timeline)
          ? page.timeline
          : [],

      /*
       * Letter
       */

      letter:
        typeof page.letter === "string"
          ? page.letter
          : "",

      /*
       * Surprise
       */

      surprise:
        typeof page.surprise === "string"
          ? page.surprise
          : "",

      /*
       * Secret
       */

      secret:
        typeof page.secret === "string"
          ? page.secret
          : "",

      /*
       * Final reveal
       */

      finalMessage:
        typeof page.finalMessage ===
        "string"
          ? page.finalMessage
          : "",

      /*
       * Custom page data
       */

      customData:
        page.customData &&
        typeof page.customData ===
          "object"
          ? page.customData
          : {},
    },
  })
);

/*
 * -----------------------------------------
 * Insert pages
 * -----------------------------------------
 */

const {
  data: insertedPages,
  error: pagesError,
} = await supabase
  .from("universe_pages")
  .insert(pageRows)
  .select("id, page_order");

/*
 * -----------------------------------------
 * Handle page insert error
 * -----------------------------------------
 */

if (
  pagesError ||
  !insertedPages
) {
  console.error(
    "Pages insert error:",
    pagesError
  );

  await supabase
    .from("universes")
    .delete()
    .eq(
      "id",
      universe.id
    );

  return NextResponse.json(
    {
      success: false,

      error:
        pagesError?.message ||
        "Failed to save universe pages.",
    },
    {
      status: 500,
    }
  );
}

/*
 * -----------------------------------------
 * 7. Build frontend page ID
 * -> database page ID
 * -----------------------------------------
 */

const pageIdMap =
  new Map<string, string>();

pages.forEach(
  (
    page: any,
    index: number
  ) => {
    const frontendPageId =
      page.id;

    const databasePage =
      insertedPages[index];

    if (
      frontendPageId &&
      databasePage?.id
    ) {
      pageIdMap.set(
        frontendPageId,
        databasePage.id
      );
    }
  }
);

/*
 * -----------------------------------------
 * 8. Validate and save media
 * -----------------------------------------
 */

const mediaList =
  Array.isArray(media)
    ? media
    : [];

if (
  mediaList.length > 0
) {
  const mediaRows =
    mediaList.map(
      (
        item: any,
        index: number
      ) => {
        /*
         * Music does not belong
         * to a specific page.
         *
         * Images can have pageId.
         */

        let databasePageId:
          string | null = null;

        if (
          item.pageId
        ) {
          databasePageId =
            pageIdMap.get(
              item.pageId
            ) || null;
        }

        return {
          universe_id:
            universe.id,

          page_id:
            databasePageId,

          media_type:
            item.mediaType ||
            "image",

          storage_path:
            item.storagePath,

          public_url:
            item.publicUrl ||
            null,

          media_order:
            typeof item.order ===
            "number"
              ? item.order
              : index,

          metadata:
            item.metadata || {},
        };
      }
    );

  /*
   * -----------------------------------------
   * Validate storage paths
   * -----------------------------------------
   */

  const invalidMedia =
    mediaRows.some(
      (
        item: any
      ) =>
        !item.storage_path
    );

  if (
    invalidMedia
  ) {
    console.error(
      "Invalid media payload:",
      mediaRows
    );

    await supabase
      .from("universes")
      .delete()
      .eq(
        "id",
        universe.id
      );

    return NextResponse.json(
      {
        success: false,

        error:
          "One or more media files are missing a storage path.",
      },
      {
        status: 400,
      }
    );
  }

  /*
   * -----------------------------------------
   * Insert media
   * -----------------------------------------
   */

  const {
    error: mediaError,
  } = await supabase
    .from(
      "universe_media"
    )
    .insert(
      mediaRows
    );

  if (
    mediaError
  ) {
    console.error(
      "Media insert error:",
      mediaError
    );

    await supabase
      .from("universes")
      .delete()
      .eq(
        "id",
        universe.id
      );

    return NextResponse.json(
      {
        success: false,

        error:
          mediaError.message ||
          "Failed to save universe media.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * -----------------------------------------
 * 9. Success
 * -----------------------------------------
 */

return NextResponse.json({
  success: true,

  universe: {
    id:
      universe.id,

    slug:
      universe.slug,

    url:
      `/u/${universe.slug}`,
  },

  pages:
    insertedPages || [],
});
    /*
     * -----------------------------------------
     * 9. Success
     * -----------------------------------------
     */

    return NextResponse.json({
      success: true,

      universe: {
        id:
          universe.id,

        slug:
          universe.slug,

        url:
          `/u/${universe.slug}`,
      },

      pages:
        insertedPages || [],
    });
  } catch (error) {
    console.error(
      "Publish universe error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while publishing.",
      },
      { status: 500 }
    );
  }
}