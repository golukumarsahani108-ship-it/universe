"use client";

import { ChangeEvent, useState } from "react";

import GlassCard from "@/component/glass/GlassCard";
import GlassInput from "@/component/glass/GlassInput";
import GlassButton from "@/component/glass/GlassButton";

import { createClient } from "@/lib/supabase/client";

export type BirthdayBoxData = {
  template: "birthday-02";

  intro: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    buttonText: string;
    footerText: string;
  };

  access: {
    eyebrow: string;
    panelLabel: string;
    title: string;
    highlight: string;
    description: string;
    code: string;
    hint: string;
    error: string;
    buttonText: string;
  };

  fragments: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;

    items: {
      id: string;
      number: string;
      icon: string;
      title: string;
      shortText: string;
      content: string;
    }[];
  };

  mirror: {
    eyebrow: string;
    smallText: string;
    title: string;
    highlight: string;
    message: string;
    buttonText: string;
  };

  frequency: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    musicUrl: string;
    musicPath: string;
    playText: string;
    pauseText: string;
    buttonText: string;
  };

  archive: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;

    items: {
      id: string;
      number: string;
      title: string;
      text: string;
    }[];
  };

  message: {
    eyebrow: string;
    title: string;
    description: string;
    content: string;
    signature: string;
    buttonText: string;
  };

  core: {
    eyebrow: string;
    title: string;
    highlight: string;
    message: string;
    buttonText: string;
  };

  final: {
    eyebrow: string;
    title: string;
    highlight: string;
    message: string;
    cardLabel: string;
    cardText: string;
    restartText: string;
  };
};

const DEFAULT_BIRTHDAY_BOX_DATA: BirthdayBoxData = {
  template: "birthday-02",

  intro: {
    eyebrow: "A LITTLE BIRTHDAY SECRET",
    title: "SOMETHING WAS LEFT",
    highlight: "HERE FOR YOU.",
    description:
      "A tiny little mystery filled with memories, music, messages and one final birthday surprise.",
    buttonText: "ENTER THE BOX",
    footerText: "A LITTLE WORLD MADE JUST FOR YOU",
  },

  access: {
    eyebrow: "PRIVATE ACCESS",
    panelLabel: "BIRTHDAY ACCESS REQUIRED",
    title: "Enter the",
    highlight: "secret code.",
    description:
      "Four little numbers stand between you and what is waiting inside.",
    code: "",
    hint: "ENTER THE 4 DIGIT CODE",
    error: "That's not the right little secret. Try again.",
    buttonText: "UNLOCK",
  },

  fragments: {
    eyebrow: "LITTLE FRAGMENTS",
    title: "A few things",
    highlight: "saved for today.",
    description:
      "Open them one by one. Some things are meant to be discovered slowly.",

    items: [
      {
        id: "memory",
        number: "01",
        icon: "◌",
        title: "MEMORY",
        shortText: "A little moment",
        content:
          "Some moments are tiny, but somehow they stay.\n\nKeep the little moments close. The random laughs, the silly conversations, the unexpected good days — those are often the ones that become the best memories.",
      },
      {
        id: "question",
        number: "02",
        icon: "?",
        title: "QUESTION",
        shortText: "A tiny question",
        content:
          "A tiny question for your birthday.\n\nIf you could keep one feeling from this year and carry it into the next one, what would you choose?",
      },
      {
        id: "secret",
        number: "03",
        icon: "✦",
        title: "SECRET",
        shortText: "Something hidden",
        content:
          "Something small was hidden here.\n\nHere is the secret: you made it this far. And that means there is still one more thing waiting for you.",
      },
      {
        id: "sound",
        number: "04",
        icon: "♫",
        title: "SOUND",
        shortText: "A little atmosphere",
        content:
          "A little atmosphere for the moment.\n\nSometimes a song can turn an ordinary moment into a memory. There is a little sound waiting for you in the next room.",
      },
      {
        id: "message",
        number: "05",
        icon: "♡",
        title: "MESSAGE",
        shortText: "Words saved for you",
        content:
          "Words that were waiting to be opened.\n\nWhatever this new year brings, I hope you find more reasons to smile, more things to look forward to and plenty of moments worth remembering.",
      },
    ],
  },

  mirror: {
    eyebrow: "LOOK CLOSER",
    smallText: "MOVE CLOSER",
    title: "THERE IS",
    highlight: "MORE HERE.",
    message:
      "today is a little more special because it belongs to you.",
    buttonText: "KEEP GOING",
  },

  frequency: {
    eyebrow: "BIRTHDAY FREQUENCY",
    title: "Press play.",
    highlight: "Let it glow.",
    description:
      "A little sound for this little moment.",
    musicUrl: "",
    musicPath: "",
    playText: "PLAY",
    pauseText: "PAUSE",
    buttonText: "KEEP GOING",
  },

  archive: {
    eyebrow: "THE ARCHIVE",
    title: "A few things",
    highlight: "worth keeping.",
    description:
      "Not everything needs a reason to be saved.",

    items: [
      {
        id: "archive-01",
        number: "01",
        title: "A SMALL MOMENT",
        text:
          "A small moment can become a surprisingly important memory. Save the ordinary days too.",
      },
      {
        id: "archive-02",
        number: "02",
        title: "ONE GOOD MOMENT",
        text:
          "Some days do not need to be perfect. They just need one good moment worth remembering.",
      },
      {
        id: "archive-03",
        number: "03",
        title: "KEEP THIS ONE",
        text:
          "This one is officially marked: KEEP. Some memories deserve their own little corner.",
      },
    ],
  },

  message: {
    eyebrow: "UNSENT MESSAGE",
    title: "A little birthday note.",
    description:
      "Some words were waiting for the right moment.",
    content:
      "I hope this year gives you countless little reasons to smile. I hope you find beautiful places, unexpected happiness and memories that stay with you for a very long time.",
    signature: "made just for you ♡",
    buttonText: "KEEP GOING",
  },

  core: {
    eyebrow: "THE LITTLE CORE",
    title: "One final thing",
    highlight: "before you go.",
    message:
      "Close your eyes for a second, make a little wish and keep it somewhere safe.",
    buttonText: "MAKE A WISH",
  },

  final: {
    eyebrow: "THE BOX IS OPEN",
    title: "HAPPY",
    highlight: "BIRTHDAY.",
    message:
      "May this new year of your life be filled with tiny happy moments, unexpected smiles, beautiful memories and everything good that you deserve.",
    cardLabel: "THIS LITTLE UNIVERSE",
    cardText: "WAS MADE JUST FOR TODAY.",
    restartText: "↻ EXPERIENCE AGAIN",
  },
};

const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

function getExtension(file: File) {
  return (
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() || "bin"
  );
}

async function uploadAudio(
  file: File,
  userId: string
) {
  if (!file.type.startsWith("audio/")) {
    throw new Error("Please select a valid audio file.");
  }

  if (file.size > MAX_AUDIO_SIZE) {
    throw new Error(
      `"${file.name}" is larger than 25 MB.`
    );
  }

  const supabase = createClient();

  const extension = getExtension(file);

  const storagePath =
    `universes/${userId}/surprise/${crypto.randomUUID()}-birthday-box-music.${extension}`;

  const { error } =
    await supabase.storage
      .from("universe-media")
      .upload(
        storagePath,
        file,
        {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        }
      );

  if (error) {
    throw new Error(
      `Upload failed: ${error.message}`
    );
  }

  const { data } =
    supabase.storage
      .from("universe-media")
      .getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
}

type Props = {
  initialData?: BirthdayBoxData;
  onContinue: (data: BirthdayBoxData) => void;
};

export default function BirthdayBoxCustomizer({
  initialData,
  onContinue,
}: Props) {
  const [data, setData] =
    useState<BirthdayBoxData>(
      initialData || DEFAULT_BIRTHDAY_BOX_DATA
    );

  const [uploading, setUploading] =
    useState(false);

  const [status, setStatus] =
    useState("");

  const [error, setError] =
    useState("");

  const update = <K extends keyof BirthdayBoxData>(
    key: K,
    value: BirthdayBoxData[K]
  ) => {
    setData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateFragment = (
    index: number,
    value: Partial<
      BirthdayBoxData["fragments"]["items"][number]
    >
  ) => {
    setData((current) => {
      const items = [
        ...current.fragments.items,
      ];

      items[index] = {
        ...items[index],
        ...value,
      };

      return {
        ...current,
        fragments: {
          ...current.fragments,
          items,
        },
      };
    });
  };

  const updateArchive = (
    index: number,
    value: Partial<
      BirthdayBoxData["archive"]["items"][number]
    >
  ) => {
    setData((current) => {
      const items = [
        ...current.archive.items,
      ];

      items[index] = {
        ...items[index],
        ...value,
      };

      return {
        ...current,
        archive: {
          ...current.archive,
          items,
        },
      };
    });
  };

  const handleMusic = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      setError("");
      setUploading(true);
      setStatus("Uploading THE BOX music...");

      const supabase = createClient();

      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.getUser();

      if (
        authError ||
        !authData.user
      ) {
        throw new Error(
          "Please login before uploading music."
        );
      }

      const uploaded =
        await uploadAudio(
          file,
          authData.user.id
        );

      setData((current) => ({
        ...current,
        frequency: {
          ...current.frequency,
          musicUrl:
            uploaded.publicUrl,
          musicPath:
            uploaded.storagePath,
        },
      }));

      setStatus(
        "THE BOX music uploaded ✓"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Music upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const continueToPreview = () => {
    setError("");

    const code =
      data.access.code.trim();

    if (!/^\d{4}$/.test(code)) {
      setError(
        "Please enter a 4-digit birthday access code."
      );
      return;
    }

    const finalData: BirthdayBoxData = {
      ...data,
      template: "birthday-02",
      access: {
        ...data.access,
        code,
      },
    };

    localStorage.setItem(
      "birthday-box-data",
      JSON.stringify(finalData)
    );

    localStorage.setItem(
      "birthday-template",
      "birthday-02"
    );

    onContinue(finalData);
  };

  return (
    <div className="birthday-box-customizer">

      {/* HEADER */}

      <div className="birthday-box-editor-header">
        <span>OPTION 02 · BIRTHDAY EDITION</span>

        <h1>
          THE BOX
          <span> — Birthday Edition</span>
        </h1>

        <p>
          Customize your secret birthday world.
          Every little message can be made yours.
        </p>
      </div>


      {/* INTRO */}

      <GlassCard className="birthday-box-editor-section">
        <span className="birthday-box-editor-label">
          00 · INTRO
        </span>

        <h2>A little birthday secret</h2>

        <div className="birthday-box-editor-grid">

          <GlassInput
            label="Eyebrow"
            value={data.intro.eyebrow}
            onChange={(value) =>
              update("intro", {
                ...data.intro,
                eyebrow: value,
              })
            }
          />

          <GlassInput
            label="Main title"
            value={data.intro.title}
            onChange={(value) =>
              update("intro", {
                ...data.intro,
                title: value,
              })
            }
          />

          <GlassInput
            label="Highlighted title"
            value={data.intro.highlight}
            onChange={(value) =>
              update("intro", {
                ...data.intro,
                highlight: value,
              })
            }
          />

          <GlassInput
            label="Button"
            value={data.intro.buttonText}
            onChange={(value) =>
              update("intro", {
                ...data.intro,
                buttonText: value,
              })
            }
          />

        </div>

        <label className="birthday-box-textarea">
          <span>Description</span>

          <textarea
            value={data.intro.description}
            onChange={(event) =>
              update("intro", {
                ...data.intro,
                description:
                  event.target.value,
              })
            }
          />
        </label>

      </GlassCard>


      {/* ACCESS */}

      <GlassCard className="birthday-box-editor-section">
        <span className="birthday-box-editor-label">
          01 · PRIVATE ACCESS
        </span>

        <h2>Secret birthday code 🔐</h2>

        <div className="birthday-box-editor-grid">

          <GlassInput
            label="Section label"
            value={data.access.eyebrow}
            onChange={(value) =>
              update("access", {
                ...data.access,
                eyebrow: value,
              })
            }
          />

          <GlassInput
            label="Panel label"
            value={data.access.panelLabel}
            onChange={(value) =>
              update("access", {
                ...data.access,
                panelLabel: value,
              })
            }
          />

          <GlassInput
            label="Title"
            value={data.access.title}
            onChange={(value) =>
              update("access", {
                ...data.access,
                title: value,
              })
            }
          />

          <GlassInput
            label="Highlighted title"
            value={data.access.highlight}
            onChange={(value) =>
              update("access", {
                ...data.access,
                highlight: value,
              })
            }
          />

          <GlassInput
            label="4-digit birthday code"
            type="password"
            value={data.access.code}
            placeholder="1234"
            onChange={(value) =>
              update("access", {
                ...data.access,
                code: value
                  .replace(/\D/g, "")
                  .slice(0, 4),
              })
            }
          />

          <GlassInput
            label="Code hint"
            value={data.access.hint}
            onChange={(value) =>
              update("access", {
                ...data.access,
                hint: value,
              })
            }
          />

        </div>

        <label className="birthday-box-textarea">
          <span>Description</span>

          <textarea
            value={data.access.description}
            onChange={(event) =>
              update("access", {
                ...data.access,
                description:
                  event.target.value,
              })
            }
          />
        </label>

        <label className="birthday-box-textarea">
          <span>Error message</span>

          <textarea
            value={data.access.error}
            onChange={(event) =>
              update("access", {
                ...data.access,
                error:
                  event.target.value,
              })
            }
          />
        </label>

      </GlassCard>


      {/* FRAGMENTS */}

      <GlassCard className="birthday-box-editor-section">

        <span className="birthday-box-editor-label">
          02 · LITTLE FRAGMENTS
        </span>

        <h2>Five tiny discoveries</h2>

        <label className="birthday-box-textarea">
          <span>Section description</span>

          <textarea
            value={data.fragments.description}
            onChange={(event) =>
              update("fragments", {
                ...data.fragments,
                description:
                  event.target.value,
              })
            }
          />
        </label>

        <div className="birthday-box-fragment-editors">

          {data.fragments.items.map(
            (item, index) => (
              <div
                key={item.id}
                className="birthday-box-item-editor"
              >

                <div className="birthday-box-item-top">
                  <span>
                    {item.number}
                  </span>

                  <strong>
                    {item.title}
                  </strong>
                </div>

                <div className="birthday-box-editor-grid">

                  <GlassInput
                    label="Title"
                    value={item.title}
                    onChange={(value) =>
                      updateFragment(
                        index,
                        {
                          title: value,
                        }
                      )
                    }
                  />

                  <GlassInput
                    label="Short text"
                    value={item.shortText}
                    onChange={(value) =>
                      updateFragment(
                        index,
                        {
                          shortText:
                            value,
                        }
                      )
                    }
                  />

                  <GlassInput
                    label="Icon"
                    value={item.icon}
                    onChange={(value) =>
                      updateFragment(
                        index,
                        {
                          icon: value,
                        }
                      )
                    }
                  />

                </div>

                <label className="birthday-box-textarea">
                  <span>
                    Fragment content
                  </span>

                  <textarea
                    value={item.content}
                    onChange={(event) =>
                      updateFragment(
                        index,
                        {
                          content:
                            event.target.value,
                        }
                      )
                    }
                  />
                </label>

              </div>
            )
          )}

        </div>

      </GlassCard>


      {/* MIRROR */}

      <GlassCard className="birthday-box-editor-section">

        <span className="birthday-box-editor-label">
          03 · LOOK CLOSER
        </span>

        <h2>The interactive mirror</h2>

        <div className="birthday-box-editor-grid">

          <GlassInput
            label="Section label"
            value={data.mirror.eyebrow}
            onChange={(value) =>
              update("mirror", {
                ...data.mirror,
                eyebrow: value,
              })
            }
          />

          <GlassInput
            label="Small text"
            value={data.mirror.smallText}
            onChange={(value) =>
              update("mirror", {
                ...data.mirror,
                smallText: value,
              })
            }
          />

          <GlassInput
            label="Main title"
            value={data.mirror.title}
            onChange={(value) =>
              update("mirror", {
                ...data.mirror,
                title: value,
              })
            }
          />

          <GlassInput
            label="Highlighted title"
            value={data.mirror.highlight}
            onChange={(value) =>
              update("mirror", {
                ...data.mirror,
                highlight: value,
              })
            }
          />

        </div>

        <label className="birthday-box-textarea">
          <span>Mirror message</span>

          <textarea
            value={data.mirror.message}
            onChange={(event) =>
              update("mirror", {
                ...data.mirror,
                message:
                  event.target.value,
              })
            }
          />
        </label>

      </GlassCard>


      {/* FREQUENCY */}

      <GlassCard className="birthday-box-editor-section">

        <span className="birthday-box-editor-label">
          04 · BIRTHDAY FREQUENCY
        </span>

        <h2>Give it a soundtrack ♫</h2>

        <div className="birthday-box-editor-grid">

          <GlassInput
            label="Section label"
            value={data.frequency.eyebrow}
            onChange={(value) =>
              update("frequency", {
                ...data.frequency,
                eyebrow: value,
              })
            }
          />

          <GlassInput
            label="Title"
            value={data.frequency.title}
            onChange={(value) =>
              update("frequency", {
                ...data.frequency,
                title: value,
              })
            }
          />

          <GlassInput
            label="Highlighted title"
            value={data.frequency.highlight}
            onChange={(value) =>
              update("frequency", {
                ...data.frequency,
                highlight: value,
              })
            }
          />

        </div>

        <label className="birthday-box-textarea">
          <span>Description</span>

          <textarea
            value={data.frequency.description}
            onChange={(event) =>
              update("frequency", {
                ...data.frequency,
                description:
                  event.target.value,
              })
            }
          />
        </label>

        <label className="birthday-box-upload">

  <span>🎵 Upload birthday music</span>

  <small>
    MP3, WAV or other supported audio · Max 25 MB
  </small>

  <input
    type="file"
    accept="audio/*"
    disabled={uploading}
    onChange={handleMusic}
  />

  {data.frequency.musicUrl && (
    <strong>
      ✓ Music uploaded
    </strong>
  )}

</label>

      </GlassCard>


      {/* ARCHIVE */}

      <GlassCard className="birthday-box-editor-section">

        <span className="birthday-box-editor-label">
          05 · ARCHIVE
        </span>

        <h2>Little things worth keeping</h2>

        <div className="birthday-box-fragment-editors">

          {data.archive.items.map(
            (item, index) => (
              <div
                key={item.id}
                className="birthday-box-item-editor"
              >

                <div className="birthday-box-item-top">
                  <span>
                    {item.number}
                  </span>

                  <strong>
                    {item.title}
                  </strong>
                </div>

                <GlassInput
                  label="Archive title"
                  value={item.title}
                  onChange={(value) =>
                    updateArchive(
                      index,
                      {
                        title: value,
                      }
                    )
                  }
                />

                <label className="birthday-box-textarea">
                  <span>
                    Archive message
                  </span>

                  <textarea
                    value={item.text}
                    onChange={(event) =>
                      updateArchive(
                        index,
                        {
                          text:
                            event.target.value,
                        }
                      )
                    }
                  />
                </label>

              </div>
            )
          )}

        </div>

      </GlassCard>


      {/* MESSAGE */}

      <GlassCard className="birthday-box-editor-section">

        <span className="birthday-box-editor-label">
          06 · UNSENT MESSAGE
        </span>

        <h2>A little note for them ♡</h2>

        <div className="birthday-box-editor-grid">

          <GlassInput
            label="Eyebrow"
            value={data.message.eyebrow}
            onChange={(value) =>
              update("message", {
                ...data.message,
                eyebrow: value,
              })
            }
          />

          <GlassInput
            label="Title"
            value={data.message.title}
            onChange={(value) =>
              update("message", {
                ...data.message,
                title: value,
              })
            }
          />

          <GlassInput
            label="Signature"
            value={data.message.signature}
            onChange={(value) =>
              update("message", {
                ...data.message,
                signature: value,
              })
            }
          />

        </div>

        <label className="birthday-box-textarea">
          <span>Birthday message</span>

          <textarea
            value={data.message.content}
            onChange={(event) =>
              update("message", {
                ...data.message,
                content:
                  event.target.value,
              })
            }
          />
        </label>

      </GlassCard>


      {/* CORE */}

      <GlassCard className="birthday-box-editor-section">

        <span className="birthday-box-editor-label">
          07 · THE CORE
        </span>

        <h2>The final little wish</h2>

        <div className="birthday-box-editor-grid">

          <GlassInput
            label="Eyebrow"
            value={data.core.eyebrow}
            onChange={(value) =>
              update("core", {
                ...data.core,
                eyebrow: value,
              })
            }
          />

          <GlassInput
            label="Title"
            value={data.core.title}
            onChange={(value) =>
              update("core", {
                ...data.core,
                title: value,
              })
            }
          />

          <GlassInput
            label="Highlighted title"
            value={data.core.highlight}
            onChange={(value) =>
              update("core", {
                ...data.core,
                highlight: value,
              })
            }
          />

        </div>

        <label className="birthday-box-textarea">
          <span>Wish message</span>

          <textarea
            value={data.core.message}
            onChange={(event) =>
              update("core", {
                ...data.core,
                message:
                  event.target.value,
              })
            }
          />
        </label>

      </GlassCard>


      {/* FINAL */}

      <GlassCard className="birthday-box-editor-section">

        <span className="birthday-box-editor-label">
          08 · FINAL REVEAL
        </span>

        <h2>Make the ending yours ✨</h2>

        <div className="birthday-box-editor-grid">

          <GlassInput
            label="Final eyebrow"
            value={data.final.eyebrow}
            onChange={(value) =>
              update("final", {
                ...data.final,
                eyebrow: value,
              })
            }
          />

          <GlassInput
            label="Main title"
            value={data.final.title}
            onChange={(value) =>
              update("final", {
                ...data.final,
                title: value,
              })
            }
          />

          <GlassInput
            label="Highlighted title"
            value={data.final.highlight}
            onChange={(value) =>
              update("final", {
                ...data.final,
                highlight: value,
              })
            }
          />

          <GlassInput
            label="Card label"
            value={data.final.cardLabel}
            onChange={(value) =>
              update("final", {
                ...data.final,
                cardLabel: value,
              })
            }
          />

          <GlassInput
            label="Card text"
            value={data.final.cardText}
            onChange={(value) =>
              update("final", {
                ...data.final,
                cardText: value,
              })
            }
          />

          <GlassInput
            label="Restart button"
            value={data.final.restartText}
            onChange={(value) =>
              update("final", {
                ...data.final,
                restartText: value,
              })
            }
          />

        </div>

        <label className="birthday-box-textarea">
          <span>Final birthday message</span>

          <textarea
            value={data.final.message}
            onChange={(event) =>
              update("final", {
                ...data.final,
                message:
                  event.target.value,
              })
            }
          />
        </label>

      </GlassCard>


      {/* STATUS */}

      {uploading && (
        <div className="birthday-box-status">
          ⏳ {status}
        </div>
      )}

      {!uploading && status && (
        <div className="birthday-box-status">
          ✓ {status}
        </div>
      )}

      {error && (
        <div className="birthday-box-error">
          {error}
        </div>
      )}


      {/* FOOTER */}

      <div className="birthday-box-editor-footer">

        <GlassButton
          disabled={uploading}
          onClick={() =>
            window.history.back()
          }
        >
          ← Back
        </GlassButton>

        <GlassButton
          active
          disabled={uploading}
          onClick={continueToPreview}
        >
          Preview THE BOX ✨
        </GlassButton>

      </div>

    </div>
  );
}