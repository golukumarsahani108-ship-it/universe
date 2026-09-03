"use client";

// component/ai/AICompanion.tsx

import { useAICompanion } from "./AIProvider";
import { AICharacter } from "./AICharacter";
import { AIBubble } from "./AIBubble";
import { AIChat } from "./AIChat";
import { useEffect, useState } from "react";

export function AICompanion() {
  const {
    state,
    position,
    config,
    messages,
    openChat,
    isChatOpen,
    facing,
  } = useAICompanion();

  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  /*
   * Wait until browser mount.
   *
   * This also prevents the server/client size mismatch
   * that was causing the hydration warning.
   */
  if (!mounted) {
    return null;
  }

  const size = isMobile ? config.mobileSize : config.size;

  const lastCompanionMessage = [...messages]
    .reverse()
    .find((m) => m.role === "companion");

  return (
    <>
      {/* ================================
          MOCHI
          Always stays visible
          ================================ */}
      <div
        className="fixed z-[60] flex flex-col items-center gap-2 pointer-events-none"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* Speech bubble hides when chat is open */}
        <div className="pointer-events-auto">
          <AIBubble
            text={lastCompanionMessage?.text ?? ""}
            visible={!isChatOpen && !!lastCompanionMessage}
          />
        </div>

        {/* Mochi NEVER hides when chat opens */}
        <button
          type="button"
          onClick={openChat}
          className="pointer-events-auto"
          aria-label={`Open chat with ${config.name}`}
        >
          <AICharacter
            state={state}
            size={size}
            facing={facing}
          />
        </button>
      </div>

      {/* ================================
          CHAT
          Opens independently
          while Mochi remains visible
          ================================ */}
      <AIChat />
    </>
  );
}