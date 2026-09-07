"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageShell from "@/component/layout/PageShell";
import GlassButton from "@/component/glass/GlassButton";

import {
  DEFAULT_SURPRISE_DATA,
  SurpriseData,
} from "@/component/surprise/surprise-types";

function normalizeSurpriseData(
  input: Partial<SurpriseData> | null | undefined
): SurpriseData {
  const source = input ?? {};

  return {
    ...DEFAULT_SURPRISE_DATA,
    ...source,

    title:
      typeof source.title === "string"
        ? source.title
        : DEFAULT_SURPRISE_DATA.title,

    personName:
      typeof source.personName === "string"
        ? source.personName
        : DEFAULT_SURPRISE_DATA.personName,

    openingMessage:
      typeof source.openingMessage === "string"
        ? source.openingMessage
        : DEFAULT_SURPRISE_DATA.openingMessage,

    memories: {
      ...DEFAULT_SURPRISE_DATA.memories,
      ...(source.memories ?? {}),

      eyebrow:
        source.memories?.eyebrow ??
        DEFAULT_SURPRISE_DATA.memories.eyebrow,

      title:
        source.memories?.title ??
        DEFAULT_SURPRISE_DATA.memories.title,

      intro:
        source.memories?.intro ??
        DEFAULT_SURPRISE_DATA.memories.intro,

      bottomText:
        source.memories?.bottomText ??
        DEFAULT_SURPRISE_DATA.memories.bottomText,

      items: Array.isArray(source.memories?.items)
        ? source.memories.items
        : DEFAULT_SURPRISE_DATA.memories.items,
    },

    birthday: {
      ...DEFAULT_SURPRISE_DATA.birthday,
      ...(source.birthday ?? {}),

      eyebrow:
        source.birthday?.eyebrow ??
        DEFAULT_SURPRISE_DATA.birthday.eyebrow,

      title:
        source.birthday?.title ??
        DEFAULT_SURPRISE_DATA.birthday.title,

      message:
        source.birthday?.message ??
        DEFAULT_SURPRISE_DATA.birthday.message,

      forYouText:
        source.birthday?.forYouText ??
        DEFAULT_SURPRISE_DATA.birthday.forYouText,
    },

    reasons: {
      ...DEFAULT_SURPRISE_DATA.reasons,
      ...(source.reasons ?? {}),

      eyebrow:
        source.reasons?.eyebrow ??
        DEFAULT_SURPRISE_DATA.reasons.eyebrow,

      title:
        source.reasons?.title ??
        DEFAULT_SURPRISE_DATA.reasons.title,

      subtitle:
        source.reasons?.subtitle ??
        DEFAULT_SURPRISE_DATA.reasons.subtitle,

      items: Array.isArray(source.reasons?.items)
        ? source.reasons.items
        : DEFAULT_SURPRISE_DATA.reasons.items,
    },

    letter: {
      ...DEFAULT_SURPRISE_DATA.letter,
      ...(source.letter ?? {}),

      eyebrow:
        source.letter?.eyebrow ??
        DEFAULT_SURPRISE_DATA.letter.eyebrow,

      title:
        source.letter?.title ??
        DEFAULT_SURPRISE_DATA.letter.title,

      content:
        source.letter?.content ??
        DEFAULT_SURPRISE_DATA.letter.content,

      signature:
        source.letter?.signature ??
        DEFAULT_SURPRISE_DATA.letter.signature,
    },

    password: {
      ...DEFAULT_SURPRISE_DATA.password,
      ...(source.password ?? {}),

      enabled:
        typeof source.password?.enabled === "boolean"
          ? source.password.enabled
          : DEFAULT_SURPRISE_DATA.password.enabled,

      code:
        typeof source.password?.code === "string"
          ? source.password.code
          : DEFAULT_SURPRISE_DATA.password.code,

      hint:
        typeof source.password?.hint === "string"
          ? source.password.hint
          : DEFAULT_SURPRISE_DATA.password.hint,
    },

    music: {
      ...DEFAULT_SURPRISE_DATA.music,
      ...(source.music ?? {}),

      backgroundEnabled:
        typeof source.music?.backgroundEnabled === "boolean"
          ? source.music.backgroundEnabled
          : DEFAULT_SURPRISE_DATA.music.backgroundEnabled,

      backgroundMusic:
        typeof source.music?.backgroundMusic === "string"
          ? source.music.backgroundMusic
          : DEFAULT_SURPRISE_DATA.music.backgroundMusic,

      backgroundMusicPath:
        typeof source.music?.backgroundMusicPath === "string"
          ? source.music.backgroundMusicPath
          : DEFAULT_SURPRISE_DATA.music.backgroundMusicPath,

      surpriseMusic:
        typeof source.music?.surpriseMusic === "string"
          ? source.music.surpriseMusic
          : DEFAULT_SURPRISE_DATA.music.surpriseMusic,

      surpriseMusicPath:
        typeof source.music?.surpriseMusicPath === "string"
          ? source.music.surpriseMusicPath
          : DEFAULT_SURPRISE_DATA.music.surpriseMusicPath,
    },
  };
}

export default function SurprisePreviewPage() {
  const router = useRouter();

  const [data, setData] = useState<SurpriseData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("my-universe-surprise");

    if (!saved) {
      router.replace("/surprise/customize");
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      const normalized = normalizeSurpriseData(parsed);

      setData(normalized);

      // Save normalized data so future pages
      // always receive the complete structure.
      localStorage.setItem(
        "my-universe-surprise",
        JSON.stringify(normalized)
      );
    } catch {
      const fallback = normalizeSurpriseData(
        DEFAULT_SURPRISE_DATA
      );

      setData(fallback);

      localStorage.setItem(
        "my-universe-surprise",
        JSON.stringify(fallback)
      );
    }
  }, [router]);

  if (!data) {
    return (
      <PageShell
        title="Surprise Preview"
        description="Loading your surprise..."
      >
        <div className="surprise-preview-loading">
          Loading...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Surprise Preview"
      description="Everything except your content stays fixed."
      backHref="/surprise/customize"
      backLabel="Back to Customize"
    >
      <div className="surprise-preview">

        {/* =====================================
            WELCOME
        ===================================== */}

        <section className="surprise-preview-welcome glass">
          <span>
            A LITTLE SOMETHING
          </span>

          <h1>
            {data.title}
          </h1>

          {data.personName && (
            <h3>
              FOR {data.personName}
            </h3>
          )}

          <p>
            {data.openingMessage}
          </p>

          <div className="surprise-preview-heart">
            ♡
          </div>
        </section>


        {/* =====================================
            MEMORIES
        ===================================== */}

        <section className="surprise-preview-section glass">
          <span className="surprise-preview-eyebrow">
            {data.memories.eyebrow}
          </span>

          <h2>
            {data.memories.title}
          </h2>

          <p>
            {data.memories.intro}
          </p>

          <div className="surprise-preview-memory-grid">
            {data.memories.items.map((memory) => (
              <div
                key={memory.id}
                className="surprise-preview-memory glass"
              >
                <div className="surprise-preview-image">
                  {memory.image ? (
                    <img
                      src={memory.image}
                      alt={memory.caption || "Memory"}
                    />
                  ) : (
                    <span>
                      ♡
                    </span>
                  )}
                </div>

                <p>
                  {memory.caption}
                </p>
              </div>
            ))}
          </div>

          <div className="surprise-preview-bottom">
            {data.memories.bottomText}
          </div>
        </section>


        {/* =====================================
            BIRTHDAY
        ===================================== */}

        <section className="surprise-preview-section glass">
          <span className="surprise-preview-eyebrow">
            {data.birthday.eyebrow}
          </span>

          <div className="surprise-preview-cake">
            🎂
          </div>

          <h2>
            {data.birthday.title}
          </h2>

          <p>
            {data.birthday.message}
          </p>

          <div className="surprise-preview-for-you glass">
            {data.birthday.forYouText}
          </div>
        </section>


        {/* =====================================
            REASONS
        ===================================== */}

        <section className="surprise-preview-section glass">
          <span className="surprise-preview-eyebrow">
            {data.reasons.eyebrow}
          </span>

          <h2>
            {data.reasons.title}
          </h2>

          <p>
            {data.reasons.subtitle}
          </p>

          <div className="surprise-preview-reasons">
            {data.reasons.items.map((reason) => (
              <div
                key={reason.id}
                className="surprise-preview-reason glass"
              >
                <h3>
                  {reason.title}
                </h3>

                <p>
                  {reason.text}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* =====================================
            LETTER
        ===================================== */}

        <section className="surprise-preview-section glass">
          <span className="surprise-preview-eyebrow">
            {data.letter.eyebrow}
          </span>

          <h2>
            {data.letter.title}
          </h2>

          <div className="surprise-preview-letter glass">
            {data.letter.content}
          </div>

          <div className="surprise-preview-signature">
            {data.letter.signature}
          </div>
        </section>


        {/* =====================================
            PASSWORD
        ===================================== */}

        <section className="surprise-preview-section glass">
          <span className="surprise-preview-eyebrow">
            CHAPTER 05
          </span>

          <div className="surprise-preview-lock">
            🔐
          </div>

          <h2>
            {data.password.enabled
              ? "Secret Protected"
              : "No Password"}
          </h2>

          <p>
            {data.password.enabled
              ? "The recipient will enter the 4-digit password before unlocking the surprise."
              : "The surprise can be opened without a password."}
          </p>

          {data.password.enabled &&
            data.password.hint && (
              <div className="surprise-preview-hint glass">
                Hint: {data.password.hint}
              </div>
            )}
        </section>


        {/* =====================================
            MUSIC
        ===================================== */}

        <section className="surprise-preview-section glass">
          <span className="surprise-preview-eyebrow">
            MUSIC
          </span>

          <h2>
            Sound & Atmosphere ♫
          </h2>

          <p>
            {data.music.backgroundMusic
              ? "✓ Background music uploaded"
              : "No background music"}
          </p>

          <p>
            {data.music.surpriseMusic
              ? "✓ Surprise music uploaded"
              : "No surprise music"}
          </p>
        </section>


        {/* =====================================
            ACTIONS
        ===================================== */}

        <div className="surprise-preview-footer">
          <GlassButton
            onClick={() =>
              router.push("/surprise/customize")
            }
          >
            ← Edit
          </GlassButton>

          <GlassButton
            active
            onClick={() =>
              router.push("/surprise/publish")
            }
          >
            Publish Surprise ✨
          </GlassButton>
        </div>

      </div>
    </PageShell>
  );
}