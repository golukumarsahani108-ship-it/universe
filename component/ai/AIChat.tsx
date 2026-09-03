"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAICompanion } from "./AIProvider";

export function AIChat() {
  const {
    isChatOpen,
    closeChat,
    messages,
    sendUserMessage,
    config,
  } = useAICompanion();

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  /*
   * =========================================================
   * AUTO SCROLL
   * =========================================================
   */

  useEffect(() => {
    if (!isChatOpen) {
      return;
    }

    const container = scrollRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages, isChatOpen]);

  /*
   * =========================================================
   * SEND MESSAGE
   * =========================================================
   */

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();

    const text = draft.trim();

    if (!text || sending) {
      return;
    }

    console.log(
      "[AI CHAT] Sending message:",
      text
    );

    setDraft("");
    setSending(true);

    try {
      await sendUserMessage(text);

      console.log(
        "[AI CHAT] sendUserMessage completed"
      );
    } catch (error) {
      console.error(
        "[AI CHAT] sendUserMessage error:",
        error
      );
    } finally {
      setSending(false);
    }
  };

  /*
   * =========================================================
   * CLOSE CHAT
   * =========================================================
   *
   * IMPORTANT:
   * We call closeChat from AIProvider.
   * Once isChatOpen becomes false, this component returns null
   * and the complete chat panel is removed from the DOM.
   */

  const handleClose = () => {
    console.log("[AI CHAT] Closing chat");

    setDraft("");
    setSending(false);

    closeChat();
  };

  /*
   * =========================================================
   * CHAT CLOSED
   * =========================================================
   */

  if (!isChatOpen) {
    return null;
  }

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <div
      className="
        fixed
        z-[70]
        w-[300px]
        max-w-[calc(100vw-1.5rem)]
        rounded-2xl
        bg-white/40
        backdrop-blur-2xl
        border
        border-white/60
        shadow-[0_12px_40px_rgba(0,200,255,0.2)]
        flex
        flex-col
        overflow-hidden
        animate-in
        fade-in
        slide-in-from-bottom-4
      "
      style={{
        maxHeight: "50vh",
        bottom:
          "calc(96px + env(safe-area-inset-bottom, 0px))",
        right: "12px",
      }}
    >
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className="
          flex
          items-center
          justify-between
          pl-5
          pr-3
          pt-3.5
          pb-3
          border-b
          border-white/40
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            min-w-0
          "
        >
          <span
            className="
              w-2
              h-2
              rounded-full
              bg-emerald-400
              shadow-[0_0_8px_rgba(52,211,153,0.8)]
            "
          />

          <span
            className="
              font-medium
              text-slate-700
              text-sm
              truncate
            "
          >
            {config.name}
          </span>
        </div>

        {/* ================================================= */}
        {/* CLOSE BUTTON */}
        {/* ================================================= */}

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close chat"
          title="Close chat"
          className="
            shrink-0
            flex
            items-center
            justify-center
            w-8
            h-8
            rounded-full
            text-slate-600
            bg-white/30
            hover:bg-white/70
            hover:text-slate-900
            active:scale-90
            text-xl
            leading-none
            transition-all
            cursor-pointer
          "
        >
          ×
        </button>
      </div>

      {/* ================================================= */}
      {/* MESSAGES */}
      {/* ================================================= */}

      <div
        ref={scrollRef}
        className="
          flex-1
          overflow-y-auto
          px-3
          py-3
          space-y-2
          min-h-[120px]
        "
      >
        {messages.length === 0 && (
          <p
            className="
              text-xs
              text-slate-500
              text-center
              mt-6
            "
          >
            {config.name} se baat shuru karo 👋
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`
                max-w-[80%]
                rounded-2xl
                px-3
                py-2
                text-sm
                ${
                  m.role === "user"
                    ? "bg-cyan-400/30 text-slate-800"
                    : "bg-white/60 text-slate-700"
                }
              `}
            >
              {m.text}
            </div>
          </div>
        ))}

        {/* Thinking */}

        {sending && (
          <div className="flex justify-start">
            <div
              className="
                bg-white/60
                text-slate-500
                rounded-2xl
                px-3
                py-2
                text-sm
              "
            >
              {config.name} soch rahi hai
              <span className="ml-1 animate-pulse">
                •••
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* TEXT INPUT */}
      {/* ================================================= */}

      <form
        onSubmit={handleSend}
        className="
          flex
          items-center
          gap-2
          px-3
          py-3
          border-t
          border-white/40
        "
      >
        <input
          type="text"
          value={draft}
          onChange={(e) =>
            setDraft(e.target.value)
          }
          placeholder="Kuch likho..."
          disabled={sending}
          className="
            flex-1
            min-w-0
            rounded-full
            bg-white/60
            border
            border-white/70
            px-4
            py-2
            text-sm
            text-slate-700
            placeholder:text-slate-400
            outline-none
            focus:ring-2
            focus:ring-cyan-300/50
            disabled:opacity-60
          "
        />

        {/* Send */}

        <button
          type="submit"
          aria-label="Send"
          disabled={
            !draft.trim() || sending
          }
          className="
            rounded-full
            bg-cyan-400/70
            hover:bg-cyan-400/90
            disabled:opacity-40
            disabled:cursor-not-allowed
            text-white
            w-9
            h-9
            flex
            items-center
            justify-center
            shrink-0
            transition-colors
          "
        >
          {sending ? "…" : "➤"}
        </button>
      </form>
    </div>
  );
}
