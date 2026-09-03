"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { CompanionState } from "./ai-config";

interface AICharacterProps {
  state: CompanionState;
  size: number;
  facing?: "left" | "right";
}

const STATE_STYLES: Record<
  CompanionState,
  {
    className: string;
    style?: CSSProperties;
  }
> = {
  idle: {
    className: "animate-[float_3s_ease-in-out_infinite]",
  },

  walking: {
    className: "animate-[bob_0.5s_ease-in-out_infinite]",
  },

  running: {
    className: "animate-[bob_0.3s_ease-in-out_infinite]",
  },

  waving: {
    className: "animate-[wave_0.6s_ease-in-out_2]",
  },

  thinking: {
    className: "",
    style: {
      transform: "rotate(-4deg)",
    },
  },

  happy: {
    className: "animate-[bounce_0.6s_ease-in-out_2]",
  },

  sad: {
    className: "",
    style: {
      transform: "translateY(4px) scale(0.96)",
      filter: "saturate(0.7)",
    },
  },

  sitting: {
    className: "",
    style: {
      transform: "scaleY(0.8) translateY(8px)",
    },
  },

  hiding: {
    className: "",
    style: {
      transform: "scale(0.5)",
      opacity: 0.3,
    },
  },

  peeking: {
    className: "",
    style: {
      transform: "scale(0.7) translateX(20%)",
      opacity: 0.9,
    },
  },

  dancing: {
    className: "animate-[dance_0.8s_ease-in-out_infinite]",
  },

  sleeping: {
    className: "",
    style: {
      transform: "rotate(90deg) scale(0.9)",
      filter: "brightness(0.85)",
    },
  },
};

export function AICharacter({
  state,
  size,
  facing = "right",
}: AICharacterProps) {
  const { className, style } = STATE_STYLES[state];

  const flip = facing === "left" ? -1 : 1;

  const stateTransform = style?.transform ?? "";

  /*
   * Keep the outer glass container exactly at the
   * requested companion size.
   */
  const imageSize = Math.round(size * 1.4);

  return (
    <div
      className="
        relative
        flex
        items-center
        justify-center
        rounded-full
        bg-white/30
        backdrop-blur-md
        border
        border-white/50
        shadow-[0_8px_30px_rgba(0,200,255,0.25)]
        transition-transform
        duration-300
        overflow-visible
      "
      style={{
        width: size,
        height: size,
      }}
      aria-label={`Companion is ${state}`}
    >
      {/* Glass ring */}

      <div
        className="
          absolute
          inset-0
          rounded-full
          ring-2
          ring-cyan-300/40
          pointer-events-none
        "
      />

      {/* Character */}

      <div
        className={`relative ${className}`}
        style={{
          ...style,
          transform: `${stateTransform} scaleX(${flip})`.trim(),
        }}
      >
        <Image
          src="/ai/companion.png"
          alt="AI companion"
          width={imageSize}
          height={imageSize}
          className="
            object-contain
            drop-shadow-md
            w-auto
            h-auto
          "
          priority
        />
      </div>
    </div>
  );
}