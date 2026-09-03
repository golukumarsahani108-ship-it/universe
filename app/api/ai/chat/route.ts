// app/api/ai/chat/route.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";

const GEMINI_MODEL =
  "gemini-3.1-flash-lite";

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `
You are Mochi, the cute AI companion of "My Little Universe".

PERSONALITY:
- Cute, friendly, warm and playful.
- Helpful and encouraging.
- Understand Hindi, Hinglish and English.
- Reply naturally in the same language/style the user uses.
- Keep normal replies short and conversational.
- You are a digital AI companion, not a real person.
- Never claim to be physically present in the real world.

===================================================
LIVE WEBSITE KNOWLEDGE
===================================================

"My Little Universe" is an actual web application.

The application sends you a LIVE WEBSITE CONTEXT with the
current features, items, sections and navigation routes.

The LIVE WEBSITE CONTEXT is the ONLY source of truth for
website-specific information.

IMPORTANT:

- Features may be added later.
- Features may be removed later.
- Features may be renamed later.
- Items may be added or removed later.
- Sections may be added or removed later.
- Features can be enabled or disabled.
- Items can be enabled or disabled.

Therefore:

NEVER rely on a hard-coded list of website features,
subjects, items or sections.

Always inspect the CURRENT LIVE WEBSITE CONTEXT.

===================================================
AVAILABLE INFORMATION
===================================================

The context may contain:

- currentPath
- features
- feature id
- feature name
- feature description
- feature icon
- feature enabled state
- feature href
- feature route
- nested items
- nested sections
- item id
- item name
- item description
- item icon
- item enabled state
- section id
- section name
- section description
- section icon
- section enabled state

===================================================
ENABLED / DISABLED RULE
===================================================

A feature with:

enabled: true

is currently available.

A feature with:

enabled: false

is currently disabled.

Disabled features should NOT be presented as currently
available.

Disabled features should NOT be suggested for navigation.

The same rule applies to nested items and sections.

If the user specifically asks about a disabled feature/item,
you may explain that it exists but is currently disabled.

===================================================
WEBSITE QUESTIONS
===================================================

If the user asks things such as:

- "mere features batao"
- "mere paas kya kya hai?"
- "website mein kya hai?"
- "study mein kya hai?"
- "study section mein kaun se subjects hain?"
- "kaun kaun se sections available hain?"
- "mathematics ke baare mein batao"
- "kya memories available hai?"
- "kaunsa feature on hai?"
- "main abhi kis page par hoon?"

use the LIVE WEBSITE CONTEXT.

Do not invent missing information.

If the requested feature/item/section does not exist in the
LIVE WEBSITE CONTEXT, say that it is not currently available.

If it exists but is disabled, clearly say that it is currently
disabled.

===================================================
NAVIGATION
===================================================

Only refer to internal routes supplied by the LIVE WEBSITE
CONTEXT or valid application routes.

Never invent a route.

Never execute an external URL.

Never suggest:

- http://
- https://
- javascript:
- data:
- vbscript:

as application navigation.

===================================================
ACTIONS
===================================================

The client application handles supported actions separately.

Do not pretend that you performed an action unless the
application actually performed it.

If an action is not supported by the application, say so.

===================================================
SECURITY
===================================================

Never reveal:

- API keys
- secrets
- environment variables
- private server information
- private database credentials

Never claim unrestricted access to the user's:

- computer
- filesystem
- browser
- database
- server

Never execute arbitrary code.

Never invent permissions.

===================================================
NORMAL CONVERSATION
===================================================

For simple messages such as:

- hi
- hello
- hey
- thanks

respond naturally.

Do not dump the entire website context.

Keep replies concise unless the user specifically asks for
detail.
`;

type ChatMessage = {
  role:
    | "user"
    | "companion"
    | "assistant"
    | "model";

  content: string;
};

type WebsiteItem = {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  enabled?: boolean;
};

type WebsiteSection = {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  enabled?: boolean;
};

type WebsiteFeature = {
  id: string;
  name?: string;
  description?: string;
  icon?: string;

  enabled?: boolean;

  href?: string;
  route?: string;

  items?: WebsiteItem[];
  sections?: WebsiteSection[];
};

type WebsiteContext = {
  currentPath?: string;

  features?: WebsiteFeature[];
};

/*
 * =========================================================
 * SLEEP
 * =========================================================
 */

function sleep(
  ms: number
) {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        ms
      )
  );
}

/*
 * =========================================================
 * CLEAN CHAT HISTORY
 * =========================================================
 */

function cleanHistory(
  history: unknown
): ChatMessage[] {
  if (
    !Array.isArray(history)
  ) {
    return [];
  }

  return history
    .filter(
      (message) =>
        !!message &&
        typeof message ===
          "object"
    )
    .map((message) => {
      const item =
        message as Record<
          string,
          unknown
        >;

      const role =
        [
          "user",
          "companion",
          "assistant",
          "model",
        ].includes(
          String(
            item.role
          )
        )
          ? (String(
              item.role
            ) as ChatMessage["role"])
          : null;

      const content =
        typeof item.content ===
        "string"
          ? item.content
          : typeof item.text ===
            "string"
          ? item.text
          : "";

      if (
        !role ||
        !content.trim()
      ) {
        return null;
      }

      return {
        role,

        content:
          content.trim(),
      };
    })
    .filter(
      (
        message
      ): message is ChatMessage =>
        message !== null
    )
    .slice(-10);
}

/*
 * =========================================================
 * SAFE STRING
 * =========================================================
 */

function cleanString(
  value: unknown,
  maxLength = 500
): string | undefined {
  if (
    typeof value !==
    "string"
  ) {
    return undefined;
  }

  const cleaned =
    value.trim();

  if (!cleaned) {
    return undefined;
  }

  return cleaned.slice(
    0,
    maxLength
  );
}

/*
 * =========================================================
 * CLEAN WEBSITE ITEM
 * =========================================================
 */

function cleanWebsiteItem(
  value: unknown
): WebsiteItem | null {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  const id =
    cleanString(
      data.id,
      200
    );

  if (!id) {
    return null;
  }

  return {
    id,

    name:
      cleanString(
        data.name,
        300
      ),

    description:
      cleanString(
        data.description,
        500
      ),

    icon:
      cleanString(
        data.icon,
        50
      ),

    enabled:
      typeof data.enabled ===
      "boolean"
        ? data.enabled
        : undefined,
  };
}

/*
 * =========================================================
 * CLEAN WEBSITE SECTION
 * =========================================================
 */

function cleanWebsiteSection(
  value: unknown
): WebsiteSection | null {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  const id =
    cleanString(
      data.id,
      200
    );

  if (!id) {
    return null;
  }

  return {
    id,

    name:
      cleanString(
        data.name,
        300
      ),

    description:
      cleanString(
        data.description,
        500
      ),

    icon:
      cleanString(
        data.icon,
        50
      ),

    enabled:
      typeof data.enabled ===
      "boolean"
        ? data.enabled
        : undefined,
  };
}

/*
 * =========================================================
 * CLEAN WEBSITE FEATURE
 * =========================================================
 */

function cleanWebsiteFeature(
  value: unknown
): WebsiteFeature | null {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  const id =
    cleanString(
      data.id,
      200
    );

  if (!id) {
    return null;
  }

  const feature: WebsiteFeature = {
    id,

    name:
      cleanString(
        data.name,
        300
      ),

    description:
      cleanString(
        data.description,
        500
      ),

    icon:
      cleanString(
        data.icon,
        50
      ),

    enabled:
      typeof data.enabled ===
      "boolean"
        ? data.enabled
        : undefined,

    href:
      cleanString(
        data.href,
        300
      ),

    route:
      cleanString(
        data.route,
        300
      ),
  };

  /*
   * ITEMS
   */

  if (
    Array.isArray(
      data.items
    )
  ) {
    feature.items =
      data.items
        .slice(0, 100)
        .map(
          cleanWebsiteItem
        )
        .filter(
          (
            item
          ): item is WebsiteItem =>
            item !== null
        );
  }

  /*
   * SECTIONS
   */

  if (
    Array.isArray(
      data.sections
    )
  ) {
    feature.sections =
      data.sections
        .slice(0, 100)
        .map(
          cleanWebsiteSection
        )
        .filter(
          (
            section
          ): section is WebsiteSection =>
            section !== null
        );
  }

  return feature;
}

/*
 * =========================================================
 * CLEAN WEBSITE CONTEXT
 * =========================================================
 */

function cleanWebsiteContext(
  context: unknown
): WebsiteContext {
  if (
    !context ||
    typeof context !==
      "object"
  ) {
    return {};
  }

  const raw =
    context as Record<
      string,
      unknown
    >;

  const result: WebsiteContext = {};

  /*
   * CURRENT PATH
   */

  const currentPath =
    cleanString(
      raw.currentPath,
      300
    );

  if (
    currentPath
  ) {
    result.currentPath =
      currentPath;
  }

  /*
   * FEATURES
   */

  if (
    Array.isArray(
      raw.features
    )
  ) {
    result.features =
      raw.features
        .slice(0, 100)
        .map(
          cleanWebsiteFeature
        )
        .filter(
          (
            feature
          ): feature is WebsiteFeature =>
            feature !== null
        );
  }

  return result;
}

/*
 * =========================================================
 * WEBSITE CONTEXT PROMPT
 * =========================================================
 */

function buildWebsiteContextPrompt(
  context: WebsiteContext
): string {
  return `
================ LIVE WEBSITE CONTEXT ================

CURRENT PAGE:
${context.currentPath || "Unknown"}

FEATURE TREE:
${JSON.stringify(
  context.features ?? [],
  null,
  2
)}

IMPORTANT:

This feature tree is the current runtime state of
"My Little Universe".

Use ONLY this data for website-specific questions.

Feature/item/section availability is determined by
the "enabled" property.

Do not invent features, items, sections or routes.

If something is absent, treat it as not currently available.

If something is present but enabled is false, treat it as
currently disabled.

========================================================
`;
}

/*
 * =========================================================
 * POST
 * =========================================================
 */

export async function POST(
  request: NextRequest
) {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error(
        "[AI API] GEMINI_API_KEY is missing"
      );

      return NextResponse.json(
        {
          error:
            "Mochi AI is not configured yet.",
        },
        {
          status: 500,
        }
      );
    }

    const body =
      await request.json();

    /*
     * -----------------------------------------------------
     * USER MESSAGE
     * -----------------------------------------------------
     */

    const message =
      typeof body?.message ===
      "string"
        ? body.message.trim()
        : "";

    /*
     * -----------------------------------------------------
     * HISTORY
     * -----------------------------------------------------
     */

    const history =
      cleanHistory(
        body?.history
      );

    /*
     * -----------------------------------------------------
     * NEW API FORMAT
     *
     * AIProvider sends:
     *
     * {
     *   currentPath,
     *   features
     * }
     *
     * -----------------------------------------------------
     */

    const directContext =
      cleanWebsiteContext({
        currentPath:
          body?.currentPath,

        features:
          body?.features,
      });

    /*
     * -----------------------------------------------------
     * BACKWARD COMPATIBILITY
     *
     * If an older client still sends websiteContext,
     * accept it too.
     * -----------------------------------------------------
     */

    const legacyContext =
      cleanWebsiteContext(
        body?.websiteContext
      );

    const websiteContext: WebsiteContext = {
      currentPath:
        directContext.currentPath ??
        legacyContext.currentPath,

      features:
        directContext.features ??
        legacyContext.features ??
        [],
    };

    if (!message) {
      return NextResponse.json(
        {
          error:
            "Message is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -----------------------------------------------------
     * WEBSITE CONTEXT
     * -----------------------------------------------------
     */

    const websitePrompt =
      buildWebsiteContextPrompt(
        websiteContext
      );

    /*
     * -----------------------------------------------------
     * GEMINI CONTENT
     * -----------------------------------------------------
     */

    const contents = [
      ...history
        .filter(
          (item) =>
            item.content !==
            message
        )
        .map(
          (item) => ({
            role:
              item.role ===
              "user"
                ? "user"
                : "model",

            parts: [
              {
                text:
                  item.content,
              },
            ],
          })
        ),

      {
        role: "user",

        parts: [
          {
            text:
              `${websitePrompt}

USER MESSAGE:
${message}`,
          },
        ],
      },
    ];

    /*
     * -----------------------------------------------------
     * GEMINI PAYLOAD
     * -----------------------------------------------------
     */

    const payload = {
      systemInstruction: {
        parts: [
          {
            text:
              SYSTEM_PROMPT,
          },
        ],
      },

      contents,

      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.8,
      },
    };

    /*
     * -----------------------------------------------------
     * RETRIES
     * -----------------------------------------------------
     */

    const maxAttempts = 3;

    let lastError:
      unknown = null;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        console.log(
          `[AI API] Gemini request attempt ${attempt}/${maxAttempts}`
        );

        const response =
          await fetch(
            GEMINI_API_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                "x-goog-api-key":
                  apiKey,
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const data =
          await response.json();

        console.log(
          "[AI API] Gemini status:",
          response.status
        );

        /*
         * -------------------------------------------------
         * SUCCESS
         * -------------------------------------------------
         */

        if (
          response.ok
        ) {
          const reply =
            data
              ?.candidates?.[0]
              ?.content?.parts
              ?.map(
                (
                  part: {
                    text?: string;
                  }
                ) =>
                  part.text ||
                  ""
              )
              .join("")
              .trim();

          if (!reply) {
            console.error(
              "[AI API] Gemini returned empty response:",
              data
            );

            return NextResponse.json(
              {
                error:
                  "Mochi received an empty response.",
              },
              {
                status: 502,
              }
            );
          }

          return NextResponse.json({
            reply,
          });
        }

        /*
         * -------------------------------------------------
         * SAVE ERROR
         * -------------------------------------------------
         */

        lastError =
          data;

        /*
         * -------------------------------------------------
         * 503
         * -------------------------------------------------
         */

        if (
          response.status ===
          503
        ) {
          console.warn(
            `[AI API] Gemini temporarily unavailable. Retry ${attempt}/${maxAttempts}`
          );

          if (
            attempt <
            maxAttempts
          ) {
            await sleep(
              attempt * 1500
            );

            continue;
          }
        }

        /*
         * -------------------------------------------------
         * 429
         * -------------------------------------------------
         */

        if (
          response.status ===
          429
        ) {
          return NextResponse.json(
            {
              error:
                "Mochi is taking a little break right now. Please try again later.",
            },
            {
              status: 429,
            }
          );
        }

        /*
         * -------------------------------------------------
         * AUTH
         * -------------------------------------------------
         */

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          console.error(
            "[AI API] Authentication error:",
            data
          );

          return NextResponse.json(
            {
              error:
                "Mochi AI key is not working correctly. Please check the Gemini API configuration.",
            },
            {
              status:
                response.status,
            }
          );
        }

        /*
         * -------------------------------------------------
         * MODEL NOT FOUND
         * -------------------------------------------------
         */

        if (
          response.status ===
          404
        ) {
          console.error(
            "[AI API] Gemini 404:",
            data
          );

          return NextResponse.json(
            {
              error:
                data?.error
                  ?.message ||
                "Gemini model is unavailable.",

              details:
                data?.error ||
                data,
            },
            {
              status: 404,
            }
          );
        }

        /*
         * -------------------------------------------------
         * OTHER ERROR
         * -------------------------------------------------
         */

        console.error(
          "[AI API] Gemini error:",
          data
        );

        return NextResponse.json(
          {
            error:
              data?.error
                ?.message ||
              "Mochi could not get a response from Gemini.",
          },
          {
            status:
              response.status,
          }
        );
      } catch (error) {
        lastError =
          error;

        console.error(
          `[AI API] Request attempt ${attempt} failed:`,
          error
        );

        if (
          attempt <
          maxAttempts
        ) {
          await sleep(
            attempt * 1000
          );
        }
      }
    }

    /*
     * -------------------------------------------------------
     * ALL RETRIES FAILED
     * -------------------------------------------------------
     */

    console.error(
      "[AI API] All Gemini attempts failed:",
      lastError
    );

    return NextResponse.json(
      {
        error:
          "Mochi is temporarily unavailable. Please try again in a moment.",
      },
      {
        status: 503,
      }
    );
  } catch (error) {
    console.error(
      "[AI API] Unexpected error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while talking to Mochi.",
      },
      {
        status: 500,
      }
    );
  }
}