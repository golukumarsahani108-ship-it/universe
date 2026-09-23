"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageShell from "@/component/layout/PageShell";
import GlassButton from "@/component/glass/GlassButton";
import type { BirthdayBoxData } from "@/component/surprise/BirthdayBoxCustomizer";

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

    /* =====================================
       MEMORIES
    ===================================== */

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

    /* =====================================
       BIRTHDAY
    ===================================== */

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

    /* =====================================
       REASONS
    ===================================== */

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

    /* =====================================
       LETTER
    ===================================== */

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

    /* =====================================
       PASSWORD
    ===================================== */

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

    /* =====================================
       MUSIC
    ===================================== */

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

    /* =====================================
       LITTLE COLLECTION
       IMPORTANT:
       collection.memories MUST BE PRESERVED
    ===================================== */

    collection: {
      ...DEFAULT_SURPRISE_DATA.collection,
      ...(source.collection ?? {}),

      eyebrow:
        source.collection?.eyebrow ??
        DEFAULT_SURPRISE_DATA.collection.eyebrow,

      title:
        source.collection?.title ??
        DEFAULT_SURPRISE_DATA.collection.title,

      subtitle:
        source.collection?.subtitle ??
        DEFAULT_SURPRISE_DATA.collection.subtitle,

      items: Array.isArray(source.collection?.items)
        ? source.collection.items
        : DEFAULT_SURPRISE_DATA.collection.items,

      /*
       * These are completely separate from
       * Chapter 01 memories.
       *
       * Do NOT replace them with
       * DEFAULT_SURPRISE_DATA.collection.memories
       * when uploaded images already exist.
       */
      memories: Array.isArray(
        source.collection?.memories
      )
        ? source.collection.memories
        : DEFAULT_SURPRISE_DATA.collection.memories,

      memoriesText:
        typeof source.collection?.memoriesText === "string"
          ? source.collection.memoriesText
          : DEFAULT_SURPRISE_DATA.collection.memoriesText,

      letterText:
        typeof source.collection?.letterText === "string"
          ? source.collection.letterText
          : DEFAULT_SURPRISE_DATA.collection.letterText,

      flowersText:
        typeof source.collection?.flowersText === "string"
          ? source.collection.flowersText
          : DEFAULT_SURPRISE_DATA.collection.flowersText,

      surpriseText:
        typeof source.collection?.surpriseText === "string"
          ? source.collection.surpriseText
          : DEFAULT_SURPRISE_DATA.collection.surpriseText,

      secretText:
        typeof source.collection?.secretText === "string"
          ? source.collection.secretText
          : DEFAULT_SURPRISE_DATA.collection.secretText,

      musicText:
        typeof source.collection?.musicText === "string"
          ? source.collection.musicText
          : DEFAULT_SURPRISE_DATA.collection.musicText,
    },
  };
}


function BirthdayBoxPreview() {
  const router = useRouter();
  const [data, setData] = useState<BirthdayBoxData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("birthday-box-data");

    if (!stored) {
      router.replace("/surprise/customize?template=birthday-02");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as BirthdayBoxData;
      if (parsed?.template !== "birthday-02") {
        throw new Error("Invalid Birthday Box data.");
      }
      setData(parsed);
    } catch (error) {
      console.error("Invalid Birthday Box data:", error);
      localStorage.removeItem("birthday-box-data");
      router.replace("/surprise/customize?template=birthday-02");
    }
  }, [router]);

  const sendData = (frame: HTMLIFrameElement) => {
    if (!data) return;
    frame.contentWindow?.postMessage(
      { type: "MLU_BIRTHDAY_BOX_DATA", data },
      window.location.origin
    );
  };

  if (!data) {
    return (
      <PageShell title="THE BOX — Birthday Edition" description="Loading your preview...">
        <div className="surprise-preview-loading">Loading...</div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="THE BOX — Birthday Edition"
      description="Preview your customized Birthday Box before publishing."
      backHref="/surprise/customize?template=birthday-02"
      backLabel="Back to Customize"
    >
      <div className="space-y-5">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-2">
          <iframe
            title="THE BOX — Birthday Edition preview"
            src="/surprise-template-2/index.html?preview=1"
            onLoad={(event) => sendData(event.currentTarget)}
            sandbox="allow-scripts allow-forms allow-modals"
            className="h-[70vh] min-h-[520px] w-full rounded-2xl border-0 bg-black"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <GlassButton
            onClick={() =>
              router.push("/surprise/customize?template=birthday-02")
            }
          >
            ← Edit
          </GlassButton>

          <GlassButton
            active
            onClick={() => router.push("/surprise/publish?template=birthday-02")}
          >
            Publish Surprise ✨
          </GlassButton>
        </div>
      </div>
    </PageShell>
  );
}

function DynamicTemplatePreview({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [template, setTemplate] = useState<any>(null);
  const [data, setData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const stored = localStorage.getItem("my-universe-surprise");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed?.templateData ?? {});
      } catch {}
    }
    fetch(`/api/templates/${encodeURIComponent(templateId)}`)
      .then((r) => r.json())
      .then((result) => setTemplate(result.template))
      .catch(() => setTemplate(null));
  }, [templateId]);

  useEffect(() => {
    const frame = document.querySelector<HTMLIFrameElement>("[data-dynamic-preview]");
    if (frame) frame.contentWindow?.postMessage({ type: "MLU_TEMPLATE_DATA", data }, "*");
  }, [data, template]);

  if (!template) {
    return <PageShell title="Preview" description="Loading your uploaded website…"><div className="p-8 text-center text-white/50">Loading preview…</div></PageShell>;
  }

  return (
    <PageShell title={template.name} description="Preview your uploaded website before publishing.">
      <div className="space-y-5">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-2">
          <iframe
            data-dynamic-preview
            title={`${template.name} preview`}
            src={`/api/templates/${template.id}/${template.entry_path || "index.html"}`}
            onLoad={(event) => event.currentTarget.contentWindow?.postMessage({ type: "MLU_TEMPLATE_DATA", data }, "*")}
            sandbox="allow-scripts allow-forms allow-modals"
            className="h-[70vh] min-h-[520px] w-full rounded-2xl border-0 bg-black"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <GlassButton onClick={() => router.push(`/surprise/customize?template=${encodeURIComponent(template.id)}`)}>← Edit</GlassButton>
          <GlassButton active onClick={() => router.push("/surprise/publish")}>Publish Surprise ✨</GlassButton>
        </div>
      </div>
    </PageShell>
  );
}

export default function SurprisePreviewPage() {
  const router = useRouter();
  const [dynamicTemplateId, setDynamicTemplateId] = useState<string | null>(null);
  const [data, setData] = useState<SurpriseData | null>(null);

  useEffect(() => {
    const template = new URLSearchParams(window.location.search).get("template");
    if (template === "birthday-02") {
      return;
    }

    if (template && template !== "birthday-01") {
      setDynamicTemplateId(template);
      return;
    }

    const saved = localStorage.getItem("my-universe-surprise");
    if (!saved) {
      router.replace("/surprise/customize");
      return;
    }
    try {
      const normalized = normalizeSurpriseData(JSON.parse(saved));
      setData(normalized);
      localStorage.setItem("my-universe-surprise", JSON.stringify(normalized));
    } catch (error) {
      console.error("Invalid surprise data:", error);
      router.replace("/surprise/customize");
    }
  }, [router]);

  const currentTemplate =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("template")
      : null;

  if (currentTemplate === "birthday-02") {
    return <BirthdayBoxPreview />;
  }

  if (dynamicTemplateId) {
    return <DynamicTemplatePreview templateId={dynamicTemplateId} />;
  }

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

            {data.memories.items.map(
              (memory) => (
                <div
                  key={memory.id}
                  className="surprise-preview-memory glass"
                >

                  <div className="surprise-preview-image">

                    {memory.image ? (
                      <img
                        src={memory.image}
                        alt={
                          memory.caption ||
                          "Memory"
                        }
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
              )
            )}

          </div>

          <div className="surprise-preview-bottom">
            {data.memories.bottomText}
          </div>

        </section>


        {/* =====================================
            LITTLE COLLECTION MEMORIES
            PREVIEW
        ===================================== */}

        <section className="surprise-preview-section glass">

          <span className="surprise-preview-eyebrow">
            LITTLE COLLECTION
          </span>

          <h2>
            Memories inside the Little Collection ♡
          </h2>

          <p>
            These photos are separate from Chapter 01
            and appear when the recipient opens the
            Memories icon inside The Little Collection.
          </p>

          <div className="surprise-preview-memory-grid">

            {data.collection.memories.map(
              (memory) => (
                <div
                  key={memory.id}
                  className="surprise-preview-memory glass"
                >

                  <div className="surprise-preview-image">

                    {memory.image ? (
                      <img
                        src={memory.image}
                        alt={
                          memory.caption ||
                          "Collection memory"
                        }
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
              )
            )}

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

            {data.reasons.items.map(
              (reason) => (
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
              )
            )}

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
              router.push(
                "/surprise/customize"
              )
            }
          >
            ← Edit
          </GlassButton>

          <GlassButton
            active
            onClick={() =>
              router.push(
                "/surprise/publish"
              )
            }
          >
            Publish Surprise ✨
          </GlassButton>

        </div>

      </div>
    </PageShell>
  );
}