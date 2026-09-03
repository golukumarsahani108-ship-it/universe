// component/ai/ai-commands.ts

import type { AIAction } from "./ai-config";
import { isAllowedRoute } from "./ai-config";

/*
 * =========================================================
 * AI COMMAND SYSTEM
 *
 * FeatureProvider / AIProvider is the source of truth.
 *
 * This parser does NOT maintain a hard-coded website,
 * feature, subject, item, or section list.
 *
 * Everything comes from runtime FeatureProvider data.
 * =========================================================
 */

export interface CommandItem {
  id: string;
  name?: string;
  icon?: string;
  description?: string;
  enabled?: boolean;
  href?: string;
  route?: string;
}

export interface CommandFeature {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  route?: string;
  href?: string;
  enabled?: boolean;
  items?: CommandItem[];
  sections?: CommandItem[];
}

export interface CommandContext {
  features?: CommandFeature[];
}

export interface CommandMatch {
  action: AIAction;
  reply: string;
}

/* =========================================================
   TEXT HELPERS
========================================================= */

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[?!.,]/g, " ")
    .replace(/\s+/g, " ");
}

function escapeRegExp(value: string): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function containsWord(
  text: string,
  value: string
): boolean {
  const normalizedValue = normalize(value);

  if (!normalizedValue) {
    return false;
  }

  return new RegExp(
    `(?:^|\\s)${escapeRegExp(normalizedValue)}(?:$|\\s)`,
    "i"
  ).test(text);
}

function matchesAny(
  text: string,
  patterns: RegExp[]
): boolean {
  return patterns.some((pattern) =>
    pattern.test(text)
  );
}

/* =========================================================
   OPEN COMMAND DETECTION
========================================================= */

function isOpenCommand(text: string): boolean {
  return matchesAny(text, [
    /\bkhol(?:o|na|do)\b/i,
    /\bkholo\b/i,
    /\bopen\b/i,
    /\bchalo\b/i,
    /\bjao\b/i,
    /\bdikhao\b/i,
    /\bdikha\b/i,
    /\bshow\b/i,
    /\bgo to\b/i,
    /\bgo\b/i,
  ]);
}

/* =========================================================
   INFORMATION / QUERY INTENT
 *
 * Important:
 * Questions such as:
 *
 * "mere paas kya kya hai?"
 * "study mein kya hai?"
 * "study section mein kaun se subjects hain?"
 *
 * must NOT accidentally become movement or toggle commands.
 *
 * These are left for the AI because the live feature tree
 * is supplied to Gemini.
========================================================= */

function isInformationQuery(text: string): boolean {
  return matchesAny(text, [
    /\bkya kya\b/i,
    /\bkya hai\b/i,
    /\bkaun\b/i,
    /\bkaun se\b/i,
    /\bkaun sa\b/i,
    /\bkitne\b/i,
    /\bavailable\b/i,
    /\bavailable hai\b/i,
    /\blist\b/i,
    /\bbatao\b/i,
    /\bbata do\b/i,
    /\bdetails\b/i,
    /\bdetail\b/i,
    /\bke baare mein\b/i,
    /\bke andar\b/i,
    /\bmein kya\b/i,
    /\bme kya\b/i,
  ]);
}

/* =========================================================
   NAME MATCH SCORE
========================================================= */

function scoreNameMatch(
  text: string,
  value: string | undefined
): number {
  if (!value) {
    return 0;
  }

  const normalizedValue = normalize(value);

  if (!normalizedValue) {
    return 0;
  }

  /*
   * Exact complete command.
   */
  if (text === normalizedValue) {
    return 100;
  }

  /*
   * Exact phrase inside command.
   */
  if (
    text.includes(
      ` ${normalizedValue} `
    )
  ) {
    return 80 + normalizedValue.length;
  }

  /*
   * Word boundary match.
   */
  if (
    containsWord(
      text,
      normalizedValue
    )
  ) {
    return 60 + normalizedValue.length;
  }

  return 0;
}

/* =========================================================
   FEATURE HELPERS
========================================================= */

function isFeatureEnabled(
  feature: CommandFeature
): boolean {
  return feature.enabled !== false;
}

function isItemEnabled(
  item: CommandItem
): boolean {
  return item.enabled !== false;
}

/* =========================================================
   FIND FEATURE
========================================================= */

function findFeature(
  text: string,
  features: CommandFeature[]
): CommandFeature | null {
  let bestFeature:
    | CommandFeature
    | null = null;

  let bestScore = 0;

  for (const feature of features) {
    /*
     * Disabled feature is not available.
     */
    if (!isFeatureEnabled(feature)) {
      continue;
    }

    const idScore =
      scoreNameMatch(
        text,
        feature.id
      );

    const nameScore =
      scoreNameMatch(
        text,
        feature.name
      );

    const score = Math.max(
      idScore,
      nameScore
    );

    if (score > bestScore) {
      bestScore = score;
      bestFeature = feature;
    }
  }

  return bestFeature;
}

/* =========================================================
   FIND CUSTOM ITEM
 *
 * Searches all enabled items and sections.
========================================================= */

interface ResolvedItem {
  feature: CommandFeature;
  item: CommandItem;
  score: number;
}

function findCustomItem(
  text: string,
  features: CommandFeature[]
): ResolvedItem | null {
  let bestMatch:
    | ResolvedItem
    | null = null;

  for (const feature of features) {
    if (!isFeatureEnabled(feature)) {
      continue;
    }

    const items = [
      ...(feature.items ?? []),
      ...(feature.sections ?? []),
    ];

    for (const item of items) {
      if (!isItemEnabled(item)) {
        continue;
      }

      /*
       * ID gets strong match.
       */
      const idScore =
        scoreNameMatch(
          text,
          item.id
        );

      /*
       * Display name gets strongest useful match.
       */
      const nameScore =
        scoreNameMatch(
          text,
          item.name
        );

      /*
       * Description is intentionally weaker.
       */
      const descriptionScore =
        scoreNameMatch(
          text,
          item.description
        ) * 0.5;

      const score = Math.max(
        idScore,
        nameScore,
        descriptionScore
      );

      if (
        score > 0 &&
        (
          !bestMatch ||
          score > bestMatch.score
        )
      ) {
        bestMatch = {
          feature,
          item,
          score,
        };
      }
    }
  }

  return bestMatch;
}

/* =========================================================
   GET ITEM ROUTE
 *
 * Priority:
 *
 * 1. item.route
 * 2. item.href
 * 3. parent feature.route
 * 4. parent feature.href
 * 5. /feature/item
========================================================= */

function getItemRoute(
  feature: CommandFeature,
  item: CommandItem
): string {
  if (
    typeof item.route === "string" &&
    item.route.trim()
  ) {
    return item.route.trim();
  }

  if (
    typeof item.href === "string" &&
    item.href.trim()
  ) {
    return item.href.trim();
  }

  const featureRoute =
    typeof feature.route === "string"
      ? feature.route.trim()
      : "";

  const featureHref =
    typeof feature.href === "string"
      ? feature.href.trim()
      : "";

  const parentRoute =
    featureRoute ||
    featureHref;

  if (parentRoute) {
    return `${parentRoute.replace(
      /\/$/,
      ""
    )}/${encodeURIComponent(
      item.id
    )}`;
  }

  if (feature.id) {
    return `/${encodeURIComponent(
      feature.id
    )}/${encodeURIComponent(
      item.id
    )}`;
  }

  return "";
}

/* =========================================================
   STOP COMMAND
========================================================= */

function parseStopCommand(
  command: string
): CommandMatch | null {
  if (
    command === "ruko" ||
    command.includes("ruk jao") ||
    command.includes("ruk ja") ||
    command === "stop" ||
    command.includes("stop karo") ||
    command.includes("stop kar do") ||
    command.includes("रुको")
  ) {
    return {
      action: {
        type: "stop_movement",
      },

      reply:
        "Theek hai 😄 yahin ruk gayi.",
    };
  }

  return null;
}

/* =========================================================
   STUDY ON / OFF
 *
 * IMPORTANT FIX:
 *
 * This function ONLY runs when the user explicitly wants
 * Study ON/OFF.
 *
 * Examples:
 *   "study on"
 *   "study on kar do"
 *   "study off"
 *   "study band kar do"
 *
 * It will NOT match:
 *   "study mein kya hai?"
 *   "study section mein kaun se subjects hain?"
 *   "study ke baare mein batao"
========================================================= */

function parseStudyToggle(
  command: string,
  features: CommandFeature[]
): CommandMatch | null {
  const mentionsStudy =
    containsWord(command, "study") ||
    containsWord(command, "padhai") ||
    command.includes("पढ़ाई");

  if (!mentionsStudy) {
    return null;
  }

  const wantsStudyOff =
    matchesAny(command, [
      /\bstudy\s+(?:ko\s+)?off\b/i,
      /\bstudy\s+(?:ko\s+)?band\b/i,
      /\bstudy\s+(?:ko\s+)?banda\b/i,
      /\bstudy\s+(?:ko\s+)?बंद\b/i,
      /\bstudy\s+off\s+kar(?:o|do)\b/i,
      /\bstudy\s+band\s+kar(?:o|do)\b/i,
      /\bstudy\s+disable\b/i,
      /\bpadhai\s+(?:ko\s+)?off\b/i,
      /\bpadhai\s+(?:ko\s+)?band\b/i,
      /study off$/i,
      /study band$/i,
    ]);

  const wantsStudyOn =
    matchesAny(command, [
      /\bstudy\s+(?:ko\s+)?on\b/i,
      /\bstudy\s+(?:ko\s+)?chalu\b/i,
      /\bstudy\s+(?:ko\s+)?start\b/i,
      /\bstudy\s+(?:ko\s+)?चालू\b/i,
      /\bstudy\s+on\s+kar(?:o|do)\b/i,
      /\bstudy\s+chalu\s+kar(?:o|do)\b/i,
      /\bstudy\s+start\s+kar(?:o|do)\b/i,
      /\bpadhai\s+(?:ko\s+)?on\b/i,
      /\bpadhai\s+(?:ko\s+)?chalu\b/i,
      /study on$/i,
      /study chalu$/i,
    ]);

  /*
   * If the user did not explicitly say ON/OFF,
   * this is NOT a toggle command.
   */
  if (
    !wantsStudyOff &&
    !wantsStudyOn
  ) {
    return null;
  }

  /*
   * Resolve Study dynamically from FeatureProvider.
   */
  const studyFeature =
    features.find(
      (feature) =>
        isFeatureEnabled(feature) &&
        (
          feature.id === "study" ||
          normalize(feature.name ?? "") === "study" ||
          normalize(feature.name ?? "") === "padhai"
        )
    ) ??
    features.find(
      (feature) =>
        feature.id === "study" ||
        normalize(feature.name ?? "") === "study" ||
        normalize(feature.name ?? "") === "padhai"
    );

  if (!studyFeature) {
    return null;
  }

  if (wantsStudyOff) {
    return {
      action: {
        type: "toggle_feature",
        featureId: studyFeature.id,
        enabled: false,
      },

      reply:
        "Okay 😄 Study off kar diya.",
    };
  }

  if (wantsStudyOn) {
    return {
      action: {
        type: "toggle_feature",
        featureId: studyFeature.id,
        enabled: true,
      },

      reply:
        "Yay ✨ Study on kar diya.",
    };
  }

  return null;
}

/* =========================================================
   GENERIC FEATURE ON / OFF
 *
 * Mochi can control ANY feature provided by FeatureProvider.
 *
 * Examples:
 *   fun off kar do
 *   memories on kar do
 *   journal band kar do
 *   calendar chalu kar do
 *   friends enable kar do
 *
 * No hard-coded feature list.
========================================================= */

function parseFeatureToggle(
  command: string,
  features: CommandFeature[]
): CommandMatch | null {
  const wantsOff =
    matchesAny(command, [
      /\boff\b/i,
      /\bb बंद\b/i,
      /\bband\b/i,
      /\bbanda\b/i,
      /\bdisable\b/i,
      /\bdisabled\b/i,
      /\bबंद\b/i,
    ]);

  const wantsOn =
    matchesAny(command, [
      /\bon\b/i,
      /\bchalu\b/i,
      /\bstart\b/i,
      /\benable\b/i,
      /\benabled\b/i,
      /\bचालू\b/i,
    ]);

  /*
   * No ON/OFF intent = not a toggle command.
   */
  if (!wantsOn && !wantsOff) {
    return null;
  }

  /*
   * Find the best matching runtime feature.
   */
  const feature = findFeature(
    command,
    features
  );

  if (!feature) {
    return null;
  }

  /*
   * Do not allow a feature to be toggled if the command
   * does not actually mention its name/id.
   *
   * This prevents:
   *
   * "calendar ke baare mein batao"
   *
   * from becoming a toggle.
   */
  const featureMentioned =
    scoreNameMatch(
      command,
      feature.id
    ) > 0 ||
    scoreNameMatch(
      command,
      feature.name
    ) > 0;

  if (!featureMentioned) {
    return null;
  }

  if (wantsOff) {
    return {
      action: {
        type: "toggle_feature",
        featureId: feature.id,
        enabled: false,
      },

      reply:
        `${feature.name ?? feature.id} off kar diya.`,
    };
  }

  if (wantsOn) {
    return {
      action: {
        type: "toggle_feature",
        featureId: feature.id,
        enabled: true,
      },

      reply:
        `${feature.name ?? feature.id} on kar diya ✨`,
    };
  }

  return null;
}

/* =========================================================
   SETTINGS
========================================================= */

function parseSettingsCommand(
  command: string
): CommandMatch | null {
  if (
    command.includes("settings") ||
    command.includes("setting") ||
    command.includes("सेटिंग")
  ) {
    return {
      action: {
        type: "open_settings",
      },

      reply:
        "Settings khol rahi hoon ⚙️",
    };
  }

  return null;
}

/* =========================================================
   MOVEMENT
 *
 * IMPORTANT FIX:
 *
 * "mere paas kya kya hai?"
 * must NOT trigger movement.
 *
 * Movement requires an actual movement intent.
========================================================= */

function parseMovementCommand(
  command: string
): CommandMatch | null {
  /*
   * LEFT
   */
  if (
    matchesAny(command, [
      /\bleft\b/i,
      /\bleft side\b/i,
      /\bbaye\b/i,
      /\bbaaye\b/i,
      /\bbayi taraf\b/i,
      /\bbaye taraf\b/i,
      /बाएं/i,
      /बायीं तरफ/i,
    ])
  ) {
    return {
      action: {
        type: "move_companion",
        target: "left",
      },

      reply:
        "Left side aa rahi hoon 👈",
    };
  }

  /*
   * RIGHT
   */
  if (
    matchesAny(command, [
      /\bright\b/i,
      /\bright side\b/i,
      /\bdaaye\b/i,
      /\bdaye\b/i,
      /\bdaayi taraf\b/i,
      /\bdaye taraf\b/i,
      /दाएं/i,
      /दायीं तरफ/i,
    ])
  ) {
    return {
      action: {
        type: "move_companion",
        target: "right",
      },

      reply:
        "Right side aa rahi hoon 👉",
    };
  }

  /*
   * CENTER
   */
  if (
    matchesAny(command, [
      /\bcenter\b/i,
      /\bcentre\b/i,
      /\bbeech\b/i,
      /बीच/i,
    ])
  ) {
    return {
      action: {
        type: "move_companion",
        target: "center",
      },

      reply:
        "Center mein aa rahi hoon ✨",
    };
  }

  /*
   * COME TO USER
   *
   * "mere paas" alone is NOT enough.
   *
   * Required examples:
   *   mere paas aao
   *   mere paas aa jao
   *   mere pass aao
   *   come here
   *   idhar aao
   */
  if (
    matchesAny(command, [
      /\b(?:mere paas|mere pass)\s+(?:aao|aa\s+jao|aa\s+ja|aaja|a\s+jao)\b/i,
      /\bcome here\b/i,
      /\bidhar aao\b/i,
      /\bidhar aa jao\b/i,
      /पास आओ/i,
      /पास आ जाओ/i,
    ])
  ) {
    return {
      action: {
        type: "move_companion",
        target: "user",
      },

      reply:
        "Aa rahi hoon 💙",
    };
  }

  return null;
}

/* =========================================================
   COMPANION STATE
========================================================= */

function parseCompanionState(
  command: string
): CommandMatch | null {
  if (
    command.includes("happy") ||
    command.includes("khush")
  ) {
    return {
      action: {
        type: "set_companion_state",
        state: "happy",
      },

      reply:
        "Yay! Main happy hoon 😄",
    };
  }

  if (
    command.includes("dance") ||
    command.includes("dancing") ||
    command.includes("nach")
  ) {
    return {
      action: {
        type: "set_companion_state",
        state: "dancing",
      },

      reply:
        "Let's dance! 💃✨",
    };
  }

  if (
    command.includes("sleep") ||
    command.includes("so jao") ||
    command.includes("so ja")
  ) {
    return {
      action: {
        type: "set_companion_state",
        state: "sleeping",
      },

      reply:
        "Good night 😴💤",
    };
  }

  return null;
}

/* =========================================================
   SAFE ROUTE
========================================================= */

function getSafeRoute(
  route: string | undefined
): string {
  if (
    typeof route !== "string"
  ) {
    return "";
  }

  const cleanRoute = route.trim();

  if (
    !cleanRoute ||
    !isAllowedRoute(cleanRoute)
  ) {
    return "";
  }

  return cleanRoute;
}

/* =========================================================
   MAIN COMMAND PARSER
========================================================= */

export function parseCommand(
  text: string,
  context: CommandContext = {}
): CommandMatch | null {
  const command =
    normalize(text);

  if (!command) {
    return null;
  }

  const features =
    context.features ?? [];

  /*
   * =======================================================
   * 1. STOP
   * =======================================================
   */

  const stopCommand =
    parseStopCommand(command);

  if (stopCommand) {
    return stopCommand;
  }

  /*
   * =======================================================
   * 2. SETTINGS
   * =======================================================
   */

  const settingsCommand =
    parseSettingsCommand(command);

  if (settingsCommand) {
    return settingsCommand;
  }

  /*
   * =======================================================
   * 3. INFORMATION QUERIES
   *
   * IMPORTANT:
   *
   * Do this BEFORE movement and feature navigation.
   *
   * This prevents:
   *
   * "mere paas kya kya hai?"
   *
   * from becoming:
   *
   * "Aa rahi hoon 💙"
   *
   * The AI receives the live feature tree and answers it.
   * =======================================================
   */

  if (
    isInformationQuery(command) &&
    !isOpenCommand(command)
  ) {
    return null;
  }

  /*
   * =======================================================
   * 4. STUDY ON / OFF
   *
   * Explicit ON/OFF only.
   * =======================================================
   */

  const studyToggle =
    parseStudyToggle(
      command,
      features
    );

  if (studyToggle) {
    return studyToggle;
  }

  /*
   * =======================================================
   * 5. MOVEMENT
   * =======================================================
   */

  const movementCommand =
    parseMovementCommand(command);

  if (movementCommand) {
    return movementCommand;
  }

  /*
   * =======================================================
   * 6. COMPANION STATE
   * =======================================================
   */

  const companionState =
    parseCompanionState(command);

  if (companionState) {
    return companionState;
  }

  /*
   * =======================================================
   * 7. CUSTOM ITEM / SECTION NAVIGATION
   *
   * Only navigation commands reach this section.
   *
   * Example:
   *   mathematics kholo
   *   english open karo
   *   goals dikhao
   * =======================================================
   */

  if (isOpenCommand(command)) {
    const customItem =
      findCustomItem(
        command,
        features
      );

    if (customItem) {
      const route =
        getSafeRoute(
          getItemRoute(
            customItem.feature,
            customItem.item
          )
        );

      if (route) {
        return {
          action: {
            type: "navigate",
            route,
          },

          reply:
            `${customItem.item.name ?? customItem.item.id} ` +
            "khol rahi hoon ✨",
        };
      }

      /*
       * If no direct route exists,
       * open the parent feature.
       */
      return {
        action: {
          type: "open_feature",
          featureId:
            customItem.feature.id,
        },

        reply:
          `${customItem.item.name ?? customItem.item.id} ` +
          "ke andar ja rahi hoon ✨",
      };
    }
  }

  /*
   * =======================================================
   * 8. STUDY PAGE
   *
   * Only navigation phrases such as:
   *
   *   study kholo
   *   study open karo
   *
   * reach here.
   *
   * "study section mein kaun se subjects hain?"
   * was already stopped above as an information query.
   * =======================================================
   */

  const mentionsStudy =
    containsWord(command, "study") ||
    containsWord(command, "padhai") ||
    command.includes("पढ़ाई");

  if (
    mentionsStudy &&
    isOpenCommand(command)
  ) {
    const studyFeature =
      features.find(
        (feature) =>
          isFeatureEnabled(feature) &&
          (
            feature.id === "study" ||
            normalize(feature.name ?? "") === "study" ||
            normalize(feature.name ?? "") === "padhai"
          )
      );

    if (studyFeature) {
      const route =
        getSafeRoute(
          typeof studyFeature.route === "string"
            ? studyFeature.route
            : studyFeature.href
        );

      if (route) {
        return {
          action: {
            type: "navigate",
            route,
          },

          reply:
            "Study page khol rahi hoon 📚",
        };
      }

      return {
        action: {
          type: "open_feature",
          featureId: studyFeature.id,
        },

        reply:
          "Study page khol rahi hoon 📚",
      };
    }
  }

  /*
   * =======================================================
   * 9. GENERIC FEATURE NAVIGATION
   * =======================================================
   */

  if (isOpenCommand(command)) {
    const feature =
      findFeature(
        command,
        features
      );

    if (feature) {
      const route =
        getSafeRoute(
          typeof feature.route === "string"
            ? feature.route
            : feature.href
        );

      if (route) {
        return {
          action: {
            type: "navigate",
            route,
          },

          reply:
            `${feature.name ?? feature.id} ` +
            "khol rahi hoon ✨",
        };
      }

      return {
        action: {
          type: "open_feature",
          featureId: feature.id,
        },

        reply:
          `${feature.name ?? feature.id} ` +
          "khol rahi hoon ✨",
      };
    }
  }

  /*
   * =======================================================
   * 10. NOTHING MATCHED
   *
   * Return null so AIProvider can send the request to Gemini.
   * =======================================================
   */

  return null;
}