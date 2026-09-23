import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";

function makeSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 45);

  return `${base || "surprise"}-${crypto.randomUUID().slice(0, 8)}`;
}

type MemoryItem = {
  id?: string;
  image?: string;
  storagePath?: string;
  caption?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Please login before publishing your surprise.",
        },
        { status: 401 }
      );
    }

    // =========================================================
    // REQUEST DATA
    // =========================================================

    const body = await request.json();
    const surprise = body?.surprise;

    if (!surprise) {
      return NextResponse.json(
        {
          error: "Surprise data is missing.",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // BASIC VALIDATION
    // =========================================================

    const requestedTemplate = String(surprise.template || "");
    const isBuiltInTemplate =
      requestedTemplate === "birthday-01" ||
      requestedTemplate === "birthday-02";

    // =========================================================
    // BUILT-IN BIRTHDAY BOX
    // =========================================================
    // The Box is a completely separate experience. Keep its
    // configuration in design.custom_data so the public route
    // can load the correct template instead of falling back to
    // the original birthday experience.
    if (requestedTemplate === "birthday-02") {
      const boxData =
        surprise &&
        typeof surprise === "object"
          ? surprise
          : {};

      const title =
        String(
          boxData.final?.title ||
            boxData.intro?.title ||
            "THE BOX — Birthday Edition"
        ).trim() || "THE BOX — Birthday Edition";

      const slug = makeSlug(title);

      const { data: universe, error: universeError } =
        await supabase
          .from("universes")
          .insert({
            owner_id: user.id,
            slug,
            title,
            person_name: null,
            relationship: null,
            opening_message:
              boxData.intro?.description ||
              "A little birthday mystery is waiting for you.",
            description: null,
            theme: "spatial-glass",
            design: {
              version: 2,
              fixed: true,
              type: "birthday-box",
              template_id: "birthday-02",
              custom_data: boxData,
            },
            music: {
              birthdayBoxMusic:
                boxData.frequency?.musicUrl || null,
              birthdayBoxMusicPath:
                boxData.frequency?.musicPath || null,
            },
            password_enabled: true,
            password_hash: null,
            password_screen: {
              hint: boxData.access?.hint || "",
            },
            published: true,
          })
          .select("id,slug")
          .single();

      if (universeError || !universe) {
        return NextResponse.json(
          {
            error:
              universeError?.message ||
              "Could not publish THE BOX.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        slug: universe.slug,
        url: `/u/${universe.slug}`,
        templateId: "birthday-02",
      });
    }

    // =========================================================
    // ADMIN-UPLOADED TEMPLATE
    // =========================================================
    // Uploaded templates use the same universes table as the original
    // experience, but keep their template id + creator data inside the
    // existing JSON design column. No new universe columns are required.
    if (!isBuiltInTemplate && /^[0-9a-f-]{36}$/i.test(requestedTemplate)) {
      const { data: template, error: templateError } = await supabase
        .from("website_templates")
        .select("id,name,slug,status,category")
        .eq("id", requestedTemplate)
        .eq("status", "published")
        .maybeSingle();

      if (templateError || !template) {
        return NextResponse.json({ error: "This website template is no longer available." }, { status: 404 });
      }

      const title = String(surprise.title || template.name || "A Little Surprise").trim();
      const personName = String(surprise.personName || "").trim();
      const slug = makeSlug(title);
      const templateData =
        surprise.templateData && typeof surprise.templateData === "object"
          ? surprise.templateData
          : {};

      const { data: universe, error: universeError } = await supabase
        .from("universes")
        .insert({
          owner_id: user.id,
          slug,
          title,
          person_name: personName || null,
          relationship: null,
          opening_message: "",
          description: null,
          theme: "spatial-glass",
          design: {
            version: 2,
            type: "uploaded-template",
            template_id: template.id,
            template_slug: template.slug,
            custom_data: templateData,
          },
          music: {},
          password_enabled: false,
          password_hash: null,
          password_screen: {},
          published: true,
        })
        .select("id,slug")
        .single();

      if (universeError || !universe) {
        return NextResponse.json({ error: universeError?.message || "Could not publish the website." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        slug: universe.slug,
        url: `/u/${universe.slug}`,
        templateId: template.id,
      });
    }

    // =========================================================
    // BASIC VALIDATION
    // =========================================================

    if (!surprise.personName?.trim()) {
      return NextResponse.json(
        {
          error: "Person name is required.",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // PASSWORD
    // =========================================================

    const passwordEnabled = Boolean(
      surprise.password?.enabled
    );

    const passwordCode = String(
      surprise.password?.code || ""
    );

    if (
      passwordEnabled &&
      !/^\d{4}$/.test(passwordCode)
    ) {
      return NextResponse.json(
        {
          error: "Password must contain exactly 4 digits.",
        },
        { status: 400 }
      );
    }

    let passwordHash: string | null = null;

    if (passwordEnabled) {
      passwordHash = await bcrypt.hash(
        passwordCode,
        12
      );
    }

    // =========================================================
    // SLUG
    // =========================================================

    const slug = makeSlug(
      surprise.title ||
        "A Little Surprise For You"
    );

    // =========================================================
    // LITTLE COLLECTION
    // =========================================================

    const collection = surprise.collection || {};

    const collectionItems =
      Array.isArray(collection.items) &&
      collection.items.length > 0
        ? collection.items
        : [
            {
              id: "collection-memories",
              title: "Memories",
              subtitle: "our little moments",
            },
            {
              id: "collection-letter",
              title: "Letter",
              subtitle: "words for you",
            },
            {
              id: "collection-flowers",
              title: "Flowers",
              subtitle: "a little bloom",
            },
            {
              id: "collection-surprise",
              title: "Surprise",
              subtitle: "something special",
            },
            {
              id: "collection-secret",
              title: "Secret",
              subtitle: "psst... don't tell",
            },
            {
              id: "collection-music",
              title: "Music",
              subtitle: "a song for you",
            },
          ];

    // =========================================================
    // CREATE UNIVERSE
    // =========================================================

    const { data: universe, error: universeError } =
      await supabase
        .from("universes")
        .insert({
          owner_id: user.id,

          slug,

          title:
            surprise.title ||
            "A Little Surprise For You ♡",

          person_name:
            surprise.personName,

          relationship: null,

          opening_message:
            surprise.openingMessage ||
            "There’s a surprise waiting for you.",

          description: null,

          theme: "blue-white-pink",

          design: {
            version: 1,
            fixed: true,
            style: "blue-white-pink",
          },

          // =====================================================
          // MUSIC
          // =====================================================

          music: {
            backgroundEnabled:
              surprise.music?.backgroundEnabled ??
              false,

            backgroundMusic:
              surprise.music?.backgroundMusic ||
              null,

            backgroundMusicPath:
              surprise.music?.backgroundMusicPath ||
              null,

            surpriseMusic:
              surprise.music?.surpriseMusic ||
              null,

            surpriseMusicPath:
              surprise.music?.surpriseMusicPath ||
              null,
          },

          // =====================================================
          // PASSWORD
          // =====================================================

          password_enabled:
            passwordEnabled,

          password_hash:
            passwordHash,

          password_screen: {
            hint:
              surprise.password?.hint ||
              "",
          },

          published: true,
        })
        .select("id, slug")
        .single();

    if (universeError || !universe) {
      console.error(
        "Universe insert error:",
        universeError
      );

      return NextResponse.json(
        {
          error:
            universeError?.message ||
            "Could not create the surprise.",
        },
        { status: 500 }
      );
    }

    // =========================================================
    // CREATE PAGES
    // =========================================================

    const pages = [
      // =======================================================
      // PAGE 1 — WELCOME
      // =======================================================

      {
        universe_id: universe.id,
        page_order: 1,
        page_type: "welcome",

        title:
          surprise.title ||
          "A Little Surprise For You ♡",

        content:
          surprise.openingMessage ||
          "There’s a surprise waiting for you.",

        settings: {
          personName:
            surprise.personName,
        },
      },

      // =======================================================
      // PAGE 2 — CHAPTER 01 MEMORIES
      // =======================================================

      {
        universe_id: universe.id,
        page_order: 2,
        page_type: "memories",

        title:
          surprise.memories?.title ||
          "Little moments, big memories.",

        content:
          surprise.memories?.intro ||
          "",

        settings: {
          eyebrow:
            surprise.memories?.eyebrow ||
            "01 · OUR MEMORIES ♡",

          bottomText:
            surprise.memories?.bottomText ||
            "made of moments I'll always remember ♡",
        },
      },

      // =======================================================
      // PAGE 3 — BIRTHDAY
      // =======================================================

      {
        universe_id: universe.id,
        page_order: 3,
        page_type: "birthday",

        title:
          surprise.birthday?.title ||
          "Happy Birthday beautiful ♡",

        content:
          surprise.birthday?.message ||
          surprise.birthday?.content ||
          "",

        settings: {
          eyebrow:
            surprise.birthday?.eyebrow ||
            "✦ A LITTLE CELEBRATION ✦",

          forYouText:
            surprise.birthday?.forYouText ||
            "FOR YOU",
        },
      },

      // =======================================================
      // PAGE 4 — REASONS
      // =======================================================

      {
        universe_id: universe.id,
        page_order: 4,
        page_type: "reasons",

        title:
          surprise.reasons?.title ||
          "Everything I love about You",

        content:
          surprise.reasons?.subtitle ||
          "",

        settings: {
          eyebrow:
            surprise.reasons?.eyebrow ||
            "CHAPTER 03",

          items:
            surprise.reasons?.items ||
            [],
        },
      },

      // =======================================================
      // PAGE 5 — LETTER
      // =======================================================

      {
        universe_id: universe.id,
        page_order: 5,
        page_type: "letter",

        title:
          surprise.letter?.title ||
          "A little letter just for you",

        content:
          surprise.letter?.content ||
          "",

        settings: {
          eyebrow:
            surprise.letter?.eyebrow ||
            "CHAPTER 04",

          signature:
            surprise.letter?.signature ||
            "With love ♡",
        },
      },

      // =======================================================
      // PAGE 6 — PASSWORD
      // =======================================================

      {
        universe_id: universe.id,
        page_order: 6,
        page_type: "password",

        title:
          "A secret is waiting",

        content: null,

        settings: {
          enabled:
            passwordEnabled,

          hint:
            surprise.password?.hint ||
            "",
        },
      },

      // =======================================================
      // PAGE 7 — UNLOCK
      // =======================================================

      {
        universe_id: universe.id,
        page_order: 7,
        page_type: "unlock",

        title:
          "SECRET UNLOCKED",

        content:
          "YOU GOT IT",

        settings: {},
      },

      // =======================================================
      // PAGE 8 — LITTLE COLLECTION
      // =======================================================

      {
        universe_id: universe.id,
        page_order: 8,
        page_type: "surprises",

        title:
          collection.title ||
          "Pick a little surprise ♡",

        content:
          collection.subtitle ||
          "six tiny things, made just for you",

        settings: {
          eyebrow:
            collection.eyebrow ||
            "THE LITTLE COLLECTION",

          items:
            collectionItems,

          memoriesText:
            collection.memoriesText ||
            "our little moments",

          letterText:
            collection.letterText ||
            "words for you",

          flowersText:
            collection.flowersText ||
            "a little bloom",

          surpriseText:
            collection.surpriseText ||
            "something special",

          secretText:
            collection.secretText ||
            "psst... don't tell",

          musicText:
            collection.musicText ||
            "a song for you",
        },
      },

      // =======================================================
      // PAGE 9 — FINAL
      // =======================================================

      {
        universe_id: universe.id,
        page_order: 9,
        page_type: "final",

        title:
          "ONE LAST THING",

        content:
          "Make a wish ♡",

        settings: {},
      },
    ];

    // =========================================================
    // INSERT PAGES
    // =========================================================

    const { error: pagesError } =
      await supabase
        .from("universe_pages")
        .insert(pages);

    if (pagesError) {
      console.error(
        "Pages insert error:",
        pagesError
      );

      await supabase
        .from("universes")
        .delete()
        .eq("id", universe.id)
        .eq("owner_id", user.id);

      return NextResponse.json(
        {
          error:
            pagesError.message,
        },
        { status: 500 }
      );
    }

    // =========================================================
    // MEMORY DATA
    // =========================================================

    /*
     * THERE ARE TWO DIFFERENT MEMORY SETS:
     *
     * 1. Chapter 01
     *    surprise.memories.items
     *
     * 2. Little Collection → Memories
     *    surprise.collection.memories
     *
     * They MUST have different source values.
     */

    const chapterMemoryItems: MemoryItem[] =
      Array.isArray(
        surprise.memories?.items
      )
        ? surprise.memories.items
        : [];

    const collectionMemoryItems: MemoryItem[] =
      Array.isArray(
        collection.memories
      )
        ? collection.memories
        : [];

    // =========================================================
    // CHAPTER 01 MEMORY MEDIA
    // =========================================================

    const chapterMemoryRows =
      chapterMemoryItems
        .filter(
          (item) =>
            Boolean(
              item.image ||
              item.storagePath
            )
        )
        .map(
          (item, index) => ({
            universe_id:
              universe.id,

            page_id: null,

            media_type:
              "image",

            storage_path:
              item.storagePath ||
              "",

            public_url:
              item.image ||
              null,

            media_order:
              index + 1,

            metadata: {
              caption:
                item.caption ||
                "",

              source:
                "chapter-memories",
            },
          })
        );

    // =========================================================
    // LITTLE COLLECTION → MEMORIES
    // =========================================================

    const collectionMemoryRows =
      collectionMemoryItems
        .filter(
          (item) =>
            Boolean(
              item.image ||
              item.storagePath
            )
        )
        .map(
          (item, index) => ({
            universe_id:
              universe.id,

            page_id: null,

            media_type:
              "image",

            storage_path:
              item.storagePath ||
              "",

            public_url:
              item.image ||
              null,

            media_order:
              index + 1,

            metadata: {
              caption:
                item.caption ||
                "",

              source:
                "collection-memories",
            },
          })
        );

    // =========================================================
    // COMBINE BOTH MEMORY SETS
    // =========================================================

    const mediaRows = [
      ...chapterMemoryRows,
      ...collectionMemoryRows,
    ];

    // =========================================================
    // SAVE MEDIA
    // =========================================================

    if (mediaRows.length > 0) {
      const { error: mediaError } =
        await supabase
          .from("universe_media")
          .insert(mediaRows);

      if (mediaError) {
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
          )
          .eq(
            "owner_id",
            user.id
          );

        return NextResponse.json(
          {
            error:
              mediaError.message,
          },
          { status: 500 }
        );
      }
    }

    // =========================================================
    // SUCCESS
    // =========================================================

    return NextResponse.json({
      success: true,

      slug:
        universe.slug,

      url:
        `/u/${universe.slug}`,
    });
  } catch (error) {
    console.error(
      "Publish surprise error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while publishing the surprise.",
      },
      { status: 500 }
    );
  }
}