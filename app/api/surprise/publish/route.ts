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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

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

    if (!surprise.personName?.trim()) {
      return NextResponse.json(
        {
          error: "Person name is required.",
        },
        { status: 400 }
      );
    }

    if (
      surprise.password?.enabled &&
      !/^\d{4}$/.test(surprise.password.code)
    ) {
      return NextResponse.json(
        {
          error: "Password must contain exactly 4 digits.",
        },
        { status: 400 }
      );
    }

    const slug = makeSlug(
      surprise.title || "A Little Surprise For You"
    );

    const passwordEnabled = Boolean(
      surprise.password?.enabled
    );

    /*
     * PASSWORD
     *
     * Never store the raw password.
     * The public frontend only receives password_enabled.
     */
    let passwordHash: string | null = null;

    if (passwordEnabled) {
      passwordHash = await bcrypt.hash(
        surprise.password.code,
        12
      );
    }

    /*
     * LITTLE COLLECTION
     *
     * Keep the original six collection items,
     * but allow their visible text to be customized.
     */
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

    /*
     * UNIVERSE
     */
    const { data: universe, error: universeError } =
      await supabase
        .from("universes")
        .insert({
          owner_id: user.id,
          slug,

          title:
            surprise.title ||
            "A Little Surprise For You ♡",

          person_name: surprise.personName,

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

          music: {
            backgroundEnabled:
              surprise.music?.backgroundEnabled ?? false,

            backgroundMusic:
              surprise.music?.backgroundMusic || null,

            backgroundMusicPath:
              surprise.music?.backgroundMusicPath || null,

            surpriseMusic:
              surprise.music?.surpriseMusic || null,

            surpriseMusicPath:
              surprise.music?.surpriseMusicPath || null,
          },

          password_enabled: passwordEnabled,

          password_hash: passwordHash,

          password_screen: {
            hint:
              surprise.password?.hint || "",
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

    /*
     * PAGE 1 — WELCOME
     */
    const pages = [
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
          personName: surprise.personName,
        },
      },

      /*
       * PAGE 2 — MEMORIES
       */
      {
        universe_id: universe.id,
        page_order: 2,
        page_type: "memories",

        title:
          surprise.memories?.title ||
          "Our little memories ♡",

        content:
          surprise.memories?.intro || "",

        settings: {
          eyebrow:
            surprise.memories?.eyebrow ||
            "CHAPTER 01",

          bottomText:
            surprise.memories?.bottomText ||
            "made of tiny moments",
        },
      },

      /*
       * PAGE 3 — BIRTHDAY
       */
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

      /*
       * PAGE 4 — REASONS
       */
      {
        universe_id: universe.id,
        page_order: 4,
        page_type: "reasons",

        title:
          surprise.reasons?.title ||
          "Everything I love about You",

        content:
          surprise.reasons?.subtitle || "",

        settings: {
          eyebrow:
            surprise.reasons?.eyebrow ||
            "CHAPTER 03",

          items:
            surprise.reasons?.items || [],
        },
      },

      /*
       * PAGE 5 — LETTER
       */
      {
        universe_id: universe.id,
        page_order: 5,
        page_type: "letter",

        title:
          surprise.letter?.title ||
          "A little letter just for you",

        content:
          surprise.letter?.content || "",

        settings: {
          eyebrow:
            surprise.letter?.eyebrow ||
            "CHAPTER 04",

          signature:
            surprise.letter?.signature ||
            "With love ♡",
        },
      },

      /*
       * PAGE 6 — PASSWORD
       */
      {
        universe_id: universe.id,
        page_order: 6,
        page_type: "password",

        title: "A secret is waiting",

        content: null,

        settings: {
          enabled: passwordEnabled,

          hint:
            surprise.password?.hint || "",
        },
      },

      /*
       * PAGE 7 — UNLOCK
       */
      {
        universe_id: universe.id,
        page_order: 7,
        page_type: "unlock",

        title: "SECRET UNLOCKED",

        content: "YOU GOT IT",

        settings: {},
      },

      /*
       * PAGE 8 — LITTLE COLLECTION
       */
      {
        universe_id: universe.id,
        page_order: 8,
        page_type: "surprises",

        title:
          collection.title ||
          "Little things for you ♡",

        content:
          collection.subtitle ||
          "A few little surprises, made especially for you.",

        settings: {
          eyebrow:
            collection.eyebrow ||
            "A LITTLE COLLECTION",

          items: collectionItems,

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

      /*
       * PAGE 9 — FINAL
       */
      {
        universe_id: universe.id,
        page_order: 9,
        page_type: "final",

        title: "ONE LAST THING",

        content: "Make a wish ♡",

        settings: {},
      },
    ];

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
          error: pagesError.message,
        },
        { status: 500 }
      );
    }

    /*
     * =========================================================
     * MEMORY MEDIA
     * =========================================================
     *
     * IMPORTANT:
     *
     * 1. surprise.memories.items
     *    = Chapter 01 Memories
     *
     * 2. surprise.collection.memories
     *    = Little Collection → Memories
     *
     * These are intentionally stored separately.
     */

    const chapterMemoryItems =
      Array.isArray(surprise.memories?.items)
        ? surprise.memories.items
        : [];

    const collectionMemoryItems =
      Array.isArray(collection.memories)
        ? collection.memories
        : [];

    /*
     * CHAPTER 01 MEMORY MEDIA
     */
    const chapterMemoryRows = chapterMemoryItems
      .filter(
        (item: {
          image?: string;
          storagePath?: string;
          caption?: string;
        }) =>
          item.image ||
          item.storagePath
      )
      .map(
        (
          item: {
            image?: string;
            storagePath?: string;
            caption?: string;
          },
          index: number
        ) => ({
          universe_id: universe.id,

          page_id: null,

          media_type: "image",

          storage_path:
            item.storagePath || "",

          public_url:
            item.image || null,

          media_order: index + 1,

          metadata: {
            caption:
              item.caption || "",

            source:
              "chapter-memories",
          },
        })
      );

    /*
     * LITTLE COLLECTION MEMORY MEDIA
     */
    const collectionMemoryRows =
      collectionMemoryItems
        .filter(
          (item: {
            image?: string;
            storagePath?: string;
            caption?: string;
          }) =>
            item.image ||
            item.storagePath
        )
        .map(
          (
            item: {
              image?: string;
              storagePath?: string;
              caption?: string;
            },
            index: number
          ) => ({
            universe_id: universe.id,

            page_id: null,

            media_type: "image",

            storage_path:
              item.storagePath || "",

            public_url:
              item.image || null,

            media_order: index + 1,

            metadata: {
              caption:
                item.caption || "",

              source:
                "collection-memories",
            },
          })
        );

    /*
     * COMBINE BOTH MEDIA SETS
     */
    const mediaRows = [
      ...chapterMemoryRows,
      ...collectionMemoryRows,
    ];

    /*
     * SAVE MEDIA
     */
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

        /*
         * Cleanup universe if media insert fails.
         */
        await supabase
          .from("universes")
          .delete()
          .eq("id", universe.id)
          .eq("owner_id", user.id);

        return NextResponse.json(
          {
            error: mediaError.message,
          },
          { status: 500 }
        );
      }
    }

    /*
     * SUCCESS
     */
    return NextResponse.json({
      success: true,

      slug: universe.slug,

      url: `/u/${universe.slug}`,
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