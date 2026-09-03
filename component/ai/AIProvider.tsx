"use client";

// component/ai/AIProvider.tsx

/*
 * Global context provider for the AI companion.
 *
 * Voice / Text-to-Speech is intentionally NOT included.
 * AI responses are text-only.
 *
 * IMPORTANT:
 * Chat history is NOT persisted.
 * Closing the chat completely clears messages.
 */

import { useFeatures } from "@/component/settings/feature-store";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  AIAction,
  AIChatMessage,
  CompanionConfig,
  CompanionState,
  DEFAULT_COMPANION_CONFIG,
  isAllowedRoute,
} from "./ai-config";

import {
  parseCommand,
} from "./ai-commands";

import {
  Position,
  clampToSafeArea,
  getCornerPosition,
  stepToward,
} from "./ai-movement";

/*
 * =========================================================
 * CONTEXT TYPE
 * =========================================================
 */

interface AIContextValue {
  state: CompanionState;

  setState: (
    s: CompanionState
  ) => void;

  position: Position;

  setPosition: (
    p: Position
  ) => void;

  moveTo: (
    target:
      | "user"
      | "left"
      | "right"
      | "center"
  ) => void;

  stop: () => void;

  facing:
    | "left"
    | "right";

  messages: AIChatMessage[];

  isChatOpen: boolean;

  openChat: () => void;

  closeChat: () => void;

  sendUserMessage: (
    text: string
  ) => Promise<void>;

  addCompanionMessage: (
    text: string
  ) => void;

  pathname: string;

  config: CompanionConfig;

  updateConfig: (
    partial: Partial<CompanionConfig>
  ) => void;

  playfulPaused: boolean;

  setPlayfulPaused: (
    v: boolean
  ) => void;

  executeAction: (
    action: AIAction
  ) => void;
}

/*
 * =========================================================
 * CONTEXT
 * =========================================================
 */

const AIContext =
  createContext<AIContextValue | null>(
    null
  );

const STORAGE_KEY =
  "my-little-universe-ai-companion";

/*
 * =========================================================
 * PROVIDER
 * =========================================================
 */

export function AIProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  /*
   * =======================================================
   * STATE
   * =======================================================
   */

  const [state, setState] =
    useState<CompanionState>(
      "idle"
    );

  const [
    position,
    setPositionRaw,
  ] = useState<Position>({
    x: 24,
    y: 24,
  });

  const [facing, setFacing] =
    useState<
      "left" | "right"
    >("right");

  /*
   * -------------------------------------------------------
   * CHAT MESSAGES
   *
   * This state exists ONLY in memory.
   *
   * It is NOT saved to localStorage.
   * Closing chat clears it completely.
   * -------------------------------------------------------
   */

  const [messages, setMessages] =
    useState<AIChatMessage[]>(
      []
    );

  const [
    isChatOpen,
    setIsChatOpen,
  ] = useState(false);

  const [
    playfulPaused,
    setPlayfulPaused,
  ] = useState(false);

  const [config, setConfig] =
    useState<CompanionConfig>(
      DEFAULT_COMPANION_CONFIG
    );

  const [isMobile, setIsMobile] =
    useState(false);

  /*
   * =======================================================
   * FEATURE PROVIDER
   * =======================================================
   */

  const {
    features,
    toggleFeature,
    isFeatureEnabled,
  } = useFeatures();

  const initialized =
    useRef(false);

  const animationFrameRef =
    useRef<number | null>(
      null
    );

  /*
   * =======================================================
   * MOBILE DETECTION
   * =======================================================
   */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 640
      );
    };

    checkMobile();

    window.addEventListener(
      "resize",
      checkMobile
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkMobile
      );
    };
  }, []);

  /*
   * =======================================================
   * LOAD SAVED CONFIG
   * =======================================================
   *
   * IMPORTANT:
   * Only companion CONFIG is saved.
   *
   * Chat messages are NEVER saved.
   * =======================================================
   */

  useEffect(() => {
    if (
      initialized.current
    ) {
      return;
    }

    initialized.current = true;

    let savedConfig:
      | Partial<CompanionConfig>
      | null = null;

    try {
      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (raw) {
        const parsed =
          JSON.parse(raw);

        if (
          parsed?.config
        ) {
          savedConfig =
            parsed.config;

          setConfig(
            (prev) => ({
              ...prev,
              ...parsed.config,
            })
          );
        }
      }
    } catch {
      // Ignore corrupt localStorage.
    }

    const initialConfig = {
      ...DEFAULT_COMPANION_CONFIG,
      ...(savedConfig ?? {}),
    };

    const mobile =
      window.innerWidth < 640;

    const size = mobile
      ? initialConfig.mobileSize
      : initialConfig.size;

    setPositionRaw(
      getCornerPosition(
        size,
        mobile
      )
    );
  }, []);

  /*
   * =======================================================
   * CLEANUP MOVEMENT
   * =======================================================
   */

  useEffect(() => {
    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;
      }
    };
  }, []);

  /*
   * =======================================================
   * SAFE POSITION SETTER
   * =======================================================
   */

  const setPosition =
    useCallback(
      (p: Position) => {
        const size =
          isMobile
            ? config.mobileSize
            : config.size;

        setPositionRaw(
          clampToSafeArea(
            p,
            size,
            isMobile
          )
        );
      },
      [
        config.size,
        config.mobileSize,
        isMobile,
      ]
    );

  /*
   * =======================================================
   * STOP MOVEMENT
   * =======================================================
   */

  const stop =
    useCallback(() => {
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;
      }

      setState("idle");
    }, []);

  /*
   * =======================================================
   * MOVE COMPANION
   * =======================================================
   */

  const moveTo =
    useCallback(
      (
        target:
          | "user"
          | "left"
          | "right"
          | "center"
      ) => {
        if (
          typeof window ===
          "undefined"
        ) {
          return;
        }

        const size =
          isMobile
            ? config.mobileSize
            : config.size;

        let destination: Position;

        switch (target) {
          case "left":
            destination = {
              x: 24,
              y: position.y,
            };
            break;

          case "right":
            destination = {
              x:
                window.innerWidth -
                size -
                24,
              y: position.y,
            };
            break;

          case "center":
            destination = {
              x:
                window.innerWidth /
                  2 -
                size / 2,

              y:
                window.innerHeight /
                  2 -
                size / 2,
            };
            break;

          case "user":
          default:
            destination = {
              x:
                window.innerWidth /
                  2 -
                size / 2,

              y:
                window.innerHeight -
                size -
                140,
            };
            break;
        }

        destination =
          clampToSafeArea(
            destination,
            size,
            isMobile
          );

        if (
          animationFrameRef.current !==
          null
        ) {
          cancelAnimationFrame(
            animationFrameRef.current
          );

          animationFrameRef.current =
            null;
        }

        setState("walking");

        const speed =
          Math.max(
            0.5,
            4 *
              config.movementSpeed
          );

        let currentPosition =
          position;

        const tick = () => {
          const result =
            stepToward(
              currentPosition,
              destination,
              speed
            );

          currentPosition =
            result.next;

          setPositionRaw(
            currentPosition
          );

          if (result.facing) {
            setFacing(
              result.facing
            );
          }

          if (
            result.arrived
          ) {
            animationFrameRef.current =
              null;

            setState("idle");

            return;
          }

          animationFrameRef.current =
            requestAnimationFrame(
              tick
            );
        };

        animationFrameRef.current =
          requestAnimationFrame(
            tick
          );
      },
      [
        position,
        isMobile,
        config.size,
        config.mobileSize,
        config.movementSpeed,
      ]
    );
/*
 * =======================================================
 * CHAT OPEN
 * =======================================================
 *
 * Every time a new chat is opened,
 * start with a completely fresh conversation.
 */

const openChat = useCallback(() => {
  setMessages([]);
  setState("idle");
  setIsChatOpen(true);
}, []);

/*
 * =======================================================
 * CHAT CLOSE
 * =======================================================
 *
 * Closing chat deletes ALL messages immediately.
 *
 * There is NO chat history.
 * There is NO chat localStorage.
 */

const closeChat = useCallback(() => {
  console.log(
    "[AI CHAT] Closing chat and clearing history"
  );

  setMessages([]);
  setIsChatOpen(false);
  setState("idle");
}, []);


  /*
   * =======================================================
   * COMPANION MESSAGE
   * =======================================================
   */

  const addCompanionMessage =
    useCallback(
      (text: string) => {
        const cleanText =
          text.trim();

        if (!cleanText) {
          return;
        }

        setMessages(
          (prev) => [
            ...prev,
            {
              id:
                crypto.randomUUID(),

              role:
                "companion",

              text:
                cleanText,

              timestamp:
                Date.now(),
            },
          ]
        );
      },
      []
    );

  /*
   * =======================================================
   * EXECUTE ACTION
   * =======================================================
   */

  const executeAction =
    useCallback(
      (action: AIAction) => {
        switch (action.type) {
          /*
           * ------------------------------------------------
           * NAVIGATE
           * ------------------------------------------------
           */

          case "navigate": {
            const route =
              action.route.trim();

            if (
              isAllowedRoute(
                route
              )
            ) {
              router.push(route);
            }

            break;
          }

          /*
           * ------------------------------------------------
           * MOVE
           * ------------------------------------------------
           */

          case "move_companion":
            moveTo(
              action.target
            );
            break;

          /*
           * ------------------------------------------------
           * STOP
           * ------------------------------------------------
           */

          case "stop_movement":
            stop();
            break;

          /*
           * ------------------------------------------------
           * CHARACTER STATE
           * ------------------------------------------------
           */

          case "set_companion_state":
            setState(
              action.state
            );
            break;

          /*
           * ------------------------------------------------
           * MESSAGE
           * ------------------------------------------------
           */

          case "show_message":
            addCompanionMessage(
              action.text
            );
            break;

          /*
           * ------------------------------------------------
           * CLOSE PANEL
           *
           * IMPORTANT:
           * Use closeChat() instead of only setting
           * isChatOpen false, so messages are also cleared.
           * ------------------------------------------------
           */

          case "close_panel":
            closeChat();
            break;

          /*
           * ------------------------------------------------
           * SETTINGS
           * ------------------------------------------------
           */

          case "open_settings":
            if (
              isAllowedRoute(
                "/settings"
              )
            ) {
              router.push(
                "/settings"
              );
            }

            break;

          /*
           * ------------------------------------------------
           * STUDY
           * ------------------------------------------------
           */

          case "open_study":
            if (
              isAllowedRoute(
                "/study"
              )
            ) {
              router.push(
                "/study"
              );
            }

            break;

          /*
           * ------------------------------------------------
           * FEATURE TOGGLE
           * ------------------------------------------------
           */

          case "toggle_feature": {
            const feature =
              features.find(
                (item) =>
                  item.id ===
                  action.featureId
              );

            if (!feature) {
              break;
            }

            const current =
              isFeatureEnabled(
                action.featureId
              );

            if (
              current !==
              action.enabled
            ) {
              toggleFeature(
                action.featureId
              );
            }

            break;
          }

          /*
           * ------------------------------------------------
           * OPEN EXISTING FEATURE
           *
           * FeatureConfig uses "href".
           * ------------------------------------------------
           */

          case "open_feature": {
            const feature =
              features.find(
                (item) =>
                  item.id ===
                  action.featureId
              );

            if (!feature) {
              break;
            }

            const route =
              typeof feature.href ===
              "string"
                ? feature.href.trim()
                : "";

            if (
              route &&
              isAllowedRoute(
                route
              )
            ) {
              router.push(route);
            }

            break;
          }

          /*
           * ------------------------------------------------
           * OPEN SUBJECT
           * ------------------------------------------------
           */

          case "open_subject": {
            const safeSubject =
              /^[a-z0-9-]+$/i.test(
                action.subject
              )
                ? action.subject.toLowerCase()
                : null;

            if (!safeSubject) {
              break;
            }

            const route =
              `/study/${safeSubject}`;

            if (
              isAllowedRoute(
                route
              )
            ) {
              router.push(
                route
              );
            }

            break;
          }

          default:
            break;
        }
      },
      [
        features,
        moveTo,
        stop,
        router,
        addCompanionMessage,
        isFeatureEnabled,
        toggleFeature,
        closeChat,
      ]
    );

  /*
 * =======================================================
 * BUILD WEBSITE CONTEXT
 * =======================================================
 *
 * FeatureProvider is the single source of truth.
 *
 * AI receives the CURRENT live feature tree:
 * feature
 *   ├── items
 *   └── sections
 *
 * Nothing is manually hard-coded here.
 */

const buildWebsiteContext =
  useCallback(() => {
    return {
      currentPath: pathname,

      features: features.map(
        (feature) => ({
          id: feature.id,
          name: feature.name,
          description: feature.description,
          icon: feature.icon,
          enabled: feature.enabled,

          /*
           * FeatureConfig currently uses href
           * as its navigation route.
           */
          href:
            typeof feature.href === "string"
              ? feature.href
              : undefined,

          route:
            typeof feature.href === "string"
              ? feature.href
              : undefined,

          /*
           * LIVE nested items.
           */
          items: Array.isArray(feature.items)
            ? feature.items.map((item) => ({
                id: item.id,
                name: item.name,
                icon: item.icon,
                description:
                  item.description,
                enabled: item.enabled,
              }))
            : [],

          /*
           * LIVE nested sections.
           */
          sections: Array.isArray(
            feature.sections
          )
            ? feature.sections.map(
                (section) => ({
                  id: section.id,
                  name: section.name,
                  icon: section.icon,
                  description:
                    section.description,
                  enabled:
                    section.enabled,
                })
              )
            : [],
        })
      ),
    };
  }, [
    pathname,
    features,
  ]);
  /*
   * =======================================================
   * SEND USER MESSAGE
   * =======================================================
   */

  const sendUserMessage =
    useCallback(
      async (text: string) => {
        const cleanText =
          text.trim();

        if (!cleanText) {
          return;
        }

        /*
         * --------------------------------------------------
         * SHOW USER MESSAGE
         * --------------------------------------------------
         */

        const userMsg = {
          id:
            crypto.randomUUID(),

          role:
            "user" as const,

          text:
            cleanText,

          timestamp:
            Date.now(),
        };

        setMessages(
          (prev) => [
            ...prev,
            userMsg,
          ]
        );

        /*
         * --------------------------------------------------
         * LOCAL COMMAND
         * --------------------------------------------------
         */

        const commandFeatures =
  features.map(
    (feature) => ({
      id: feature.id,

      name: feature.name,

      description:
        feature.description,

      icon:
        feature.icon,

      enabled:
        feature.enabled,

      route:
        typeof feature.href === "string"
          ? feature.href
          : undefined,

      href:
        typeof feature.href === "string"
          ? feature.href
          : undefined,

      items:
        Array.isArray(feature.items)
          ? feature.items
          : [],

      sections:
        Array.isArray(feature.sections)
          ? feature.sections
          : [],
    })
  );
        const match =
          parseCommand(
            cleanText,
            {
              features:
                commandFeatures,
            }
          );

        if (match) {
          executeAction(
            match.action
          );

          setMessages(
            (prev) => [
              ...prev,
              {
                id:
                  crypto.randomUUID(),

                role:
                  "companion",

                text:
                  match.reply,

                timestamp:
                  Date.now(),
              },
            ]
          );

          return;
        }

        /*
         * --------------------------------------------------
         * REAL AI CHAT
         * --------------------------------------------------
         */

        setState(
          "thinking"
        );

        try {
          /*
           * History exists ONLY in React memory.
           *
           * It is sent to the API for the current
           * conversation, but NEVER saved locally.
           */

          const history =
            messages
              .slice(-10)
              .map(
                (msg) => ({
                  role:
                    msg.role ===
                    "user"
                      ? "user"
                      : "assistant",

                  content:
                    msg.text,
                })
              );

          /*
           * Build LIVE website context.
           */

          const websiteContext =
            buildWebsiteContext();

          console.log(
            "[AI CHAT] Sending website context:",
            websiteContext
          );

          /*
           * ------------------------------------------------
           * REQUEST
           * ------------------------------------------------
           */

          const response =
            await fetch(
              "/api/ai/chat",
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

               body:
  JSON.stringify({
    message: cleanText,

    history,

    currentPath: pathname,

    features,

    /*
     * Keep this temporarily for compatibility
     * with the current API route.
     */
    websiteContext,
  }),
              }
            );

          const data =
            await response.json();

          console.log(
            "[AI CLIENT] Response:",
            {
              status:
                response.status,

              data,
            }
          );

          if (
            !response.ok
          ) {
            throw new Error(
              data?.details ||
                data?.error ||
                `AI request failed (${response.status})`
            );
          }

          const replyText =
            typeof data?.reply ===
            "string"
              ? data.reply.trim()
              : "";

          if (
            !replyText
          ) {
            throw new Error(
              "AI returned an empty reply."
            );
          }

          /*
           * ------------------------------------------------
           * AI RESPONSE
           * ------------------------------------------------
           */

          setMessages(
            (prev) => [
              ...prev,
              {
                id:
                  crypto.randomUUID(),

                role:
                  "companion",

                text:
                  replyText,

                timestamp:
                  Date.now(),
              },
            ]
          );

          setState(
            "idle"
          );
        } catch (error) {
          console.error(
            "[AI CLIENT] Chat error:",
            error
          );

          setState(
            "sad"
          );

          const errorReply =
            "Oops 😥 Mochi ko abhi reply dene mein thodi dikkat aa gayi.";

          setMessages(
            (prev) => [
              ...prev,
              {
                id:
                  crypto.randomUUID(),

                role:
                  "companion",

                text:
                  errorReply,

                timestamp:
                  Date.now(),
              },
            ]
          );

          setTimeout(
            () => {
              setState(
                "idle"
              );
            },
            2000
          );
        }
      },
      [
        executeAction,
        messages,
        features,
        buildWebsiteContext,
      ]
    );

  /*
   * =======================================================
   * UPDATE CONFIG
   * =======================================================
   */

  const updateConfig =
    useCallback(
      (
        partial:
          Partial<CompanionConfig>
      ) => {
        setConfig(
          (prev) => {
            const next = {
              ...prev,
              ...partial,
            };

            try {
              /*
               * Only CONFIG is saved.
               *
               * messages are intentionally NOT included.
               */
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                  version: 1,
                  config:
                    next,
                })
              );
            } catch {
              // Ignore localStorage errors.
            }

            return next;
          }
        );
      },
      []
    );

  /*
   * =======================================================
   * KEEP POSITION SAFE
   * =======================================================
   */

  useEffect(() => {
    const size =
      isMobile
        ? config.mobileSize
        : config.size;

    setPositionRaw(
      (current) =>
        clampToSafeArea(
          current,
          size,
          isMobile
        )
    );
  }, [
    config.size,
    config.mobileSize,
    isMobile,
  ]);

  /*
   * =======================================================
   * CONTEXT VALUE
   * =======================================================
   */

  const value =
    useMemo<AIContextValue>(
      () => ({
        state,

        setState,

        position,

        setPosition,

        moveTo,

        stop,

        facing,

        messages,

        isChatOpen,

        openChat,

        closeChat,

        sendUserMessage,

        addCompanionMessage,

        pathname,

        config,

        updateConfig,

        playfulPaused,

        setPlayfulPaused,

        executeAction,
      }),
      [
        state,
        position,
        setPosition,
        moveTo,
        stop,
        facing,
        messages,
        isChatOpen,
        openChat,
        closeChat,
        sendUserMessage,
        addCompanionMessage,
        pathname,
        config,
        updateConfig,
        playfulPaused,
        executeAction,
      ]
    );

  /*
   * =======================================================
   * PROVIDER
   * =======================================================
   */

  return (
    <AIContext.Provider
      value={value}
    >
      {children}
    </AIContext.Provider>
  );
}

/*
 * =========================================================
 * HOOK
 * =========================================================
 */

export function useAICompanion() {
  const context =
    useContext(
      AIContext
    );

  if (!context) {
    throw new Error(
      "useAICompanion must be used within an AIProvider"
    );
  }

  return context;
}
