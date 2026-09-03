"use client";

// component/ai/AIBubble.tsx
// Small glass speech bubble that appears near the character.
// ASSUMPTION: swap the raw classNames below for your real GlassCard
// component once I can see its exact props, e.g.:
// import { GlassCard } from "@/component/glass/GlassCard";

interface AIBubbleProps {
  text: string;
  visible: boolean;
}

export function AIBubble({ text, visible }: AIBubbleProps) {
  if (!visible || !text) return null;

  return (
    <div
      className="max-w-[220px] rounded-2xl bg-white/50 backdrop-blur-xl
                 border border-white/60 shadow-lg px-4 py-2 text-sm text-slate-700
                 animate-in fade-in slide-in-from-bottom-2"
    >
      {text}
    </div>
  );
}