// component/ai/ai-config.ts

// =========================================================
// COMPANION VISUAL / BEHAVIOR STATES
// =========================================================

export type CompanionState =
  | "idle"
  | "walking"
  | "running"
  | "waving"
  | "thinking"
  | "happy"
  | "sad"
  | "sitting"
  | "hiding"
  | "peeking"
  | "dancing"
  | "sleeping";

// =========================================================
// FIXED / SYSTEM ROUTES
//
// IMPORTANT:
// AI feature routes yahan hard-code nahi karega.
//
// Real feature/item routes FeatureProvider se runtime par
// resolve honge.
//
// Ye list sirf known fixed application routes ko protect
// karne ke liye hai.
// =========================================================

export const ALLOWED_ROUTES = [
  "/",
  "/me",
  "/vibes",
  "/memories",
  "/dreams",
  "/study",
  "/settings",
] as const;

export type AllowedRoute =
  (typeof ALLOWED_ROUTES)[number];

// =========================================================
// SAFE ROUTE VALIDATION
// =========================================================
//
// IMPORTANT:
// Ye function check karta hai ki route:
//
// - internal hai
// - normal pathname hai
// - dangerous protocol use nahi karta
// - valid URL-safe path segments use karta hai
//
// Actual feature existence / ownership runtime
// FeatureProvider data se validate hoga.
// =========================================================

export function isAllowedRoute(
  path: string
): boolean {
  const route = path.trim();

  if (!route) {
    return false;
  }

  // -------------------------------------------------------
  // Reject external / dangerous URLs
  // -------------------------------------------------------

  if (
    route.startsWith("http://") ||
    route.startsWith("https://") ||
    route.startsWith("//") ||
    route.startsWith("javascript:") ||
    route.startsWith("data:") ||
    route.startsWith("vbscript:")
  ) {
    return false;
  }

  // -------------------------------------------------------
  // Must start with /
  // -------------------------------------------------------

  if (!route.startsWith("/")) {
    return false;
  }

  // -------------------------------------------------------
  // Reject whitespace
  // -------------------------------------------------------

  if (/\s/.test(route)) {
    return false;
  }

  // -------------------------------------------------------
  // Reject query/hash-only paths
  // -------------------------------------------------------

  if (
    route.startsWith("?") ||
    route.startsWith("#")
  ) {
    return false;
  }

  // -------------------------------------------------------
  // Fixed application routes
  // -------------------------------------------------------

  if (
    (ALLOWED_ROUTES as readonly string[]).includes(
      route
    )
  ) {
    return true;
  }

  // -------------------------------------------------------
  // Dynamic internal routes
  //
  // Examples:
  //
  // /study/mathematics
  // /study/science
  // /study/physics
  // /journal
  // /goals
  // /calendar
  // /future-me
  //
  // Allowed characters:
  // a-z
  // A-Z
  // 0-9
  // _
  // -
  //
  // Each path segment must contain at least one
  // allowed character.
  // -------------------------------------------------------

  return /^\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*$/i.test(
    route
  );
}

// =========================================================
// AI ACTION TYPES
// =========================================================

export type AIAction =
  // -------------------------------------------------------
  // Feature ON / OFF
  // -------------------------------------------------------

  | {
      type: "toggle_feature";
      featureId: string;
      enabled: boolean;
    }

  // -------------------------------------------------------
  // Navigate anywhere inside the application
  // -------------------------------------------------------

  | {
      type: "navigate";
      route: string;
    }

  // -------------------------------------------------------
  // Open feature using its real FeatureProvider ID
  // -------------------------------------------------------

  | {
      type: "open_feature";
      featureId: string;
    }

  // -------------------------------------------------------
  // Open a dynamically added item / subject
  // -------------------------------------------------------

  | {
      type: "open_subject";
      subject: string;
    }

  // -------------------------------------------------------
  // Close current panel
  // -------------------------------------------------------

  | {
      type: "close_panel";
    }

  // -------------------------------------------------------
  // Show normal AI message
  // -------------------------------------------------------

  | {
      type: "show_message";
      text: string;
    }

  // -------------------------------------------------------
  // Companion movement
  // -------------------------------------------------------

  | {
      type: "move_companion";
      target:
        | "user"
        | "left"
        | "right"
        | "center";
    }

  // -------------------------------------------------------
  // Companion state
  // -------------------------------------------------------

  | {
      type: "set_companion_state";
      state: CompanionState;
    }

  // -------------------------------------------------------
  // Stop companion movement
  // -------------------------------------------------------

  | {
      type: "stop_movement";
    }

  // -------------------------------------------------------
  // Open Settings
  // -------------------------------------------------------

  | {
      type: "open_settings";
    }

  // -------------------------------------------------------
  // Open Study
  // -------------------------------------------------------

  | {
      type: "open_study";
    };

// =========================================================
// ALLOWED ACTION TYPES
// =========================================================

export const ALLOWED_ACTION_TYPES: AIAction["type"][] = [
  "toggle_feature",
  "navigate",
  "open_feature",
  "open_subject",
  "close_panel",
  "show_message",
  "move_companion",
  "set_companion_state",
  "stop_movement",
  "open_settings",
  "open_study",
];

// =========================================================
// CHAT MESSAGE
// =========================================================

export interface AIChatMessage {
  id: string;

  role:
    | "user"
    | "companion";

  text: string;

  timestamp: number;
}

// =========================================================
// COMPANION DEFAULT CONFIG
// =========================================================

export const DEFAULT_COMPANION_CONFIG = {
  name: "Mochi",

  color: "cyan" as const,

  size: 96,

  mobileSize: 64,

  movementSpeed: 1,

  animationIntensity: 1,

  playfulBehaviorEnabled: true,
};

export type CompanionConfig =
  typeof DEFAULT_COMPANION_CONFIG;