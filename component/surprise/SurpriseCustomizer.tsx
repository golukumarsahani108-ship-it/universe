"use client";

import {
  ChangeEvent,
  useState,
} from "react";

import GlassCard from "@/component/glass/GlassCard";
import GlassInput from "@/component/glass/GlassInput";
import GlassButton from "@/component/glass/GlassButton";

import {
  DEFAULT_SURPRISE_DATA,
  SurpriseData,
} from "./surprise-types";

import { createClient } from "@/lib/supabase/client";

type Props = {
  onContinue: (
    data: SurpriseData
  ) => void;
};

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const MAX_AUDIO_SIZE =
  25 * 1024 * 1024;

function getExtension(file: File) {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase();

  return extension || "bin";
}

async function uploadFile(
  file: File,
  userId: string,
  kind: "image" | "audio",
  name: string
) {
  if (
    kind === "image" &&
    !file.type.startsWith("image/")
  ) {
    throw new Error(
      "Please select a valid image file."
    );
  }

  if (
    kind === "audio" &&
    !file.type.startsWith("audio/")
  ) {
    throw new Error(
      "Please select a valid audio file."
    );
  }

  if (
    kind === "image" &&
    file.size > MAX_IMAGE_SIZE
  ) {
    throw new Error(
      `"${file.name}" is larger than 10 MB.`
    );
  }

  if (
    kind === "audio" &&
    file.size > MAX_AUDIO_SIZE
  ) {
    throw new Error(
      `"${file.name}" is larger than 25 MB.`
    );
  }

  const supabase =
    createClient();

  const safeName = name
    .replace(
      /[^a-zA-Z0-9_-]/g,
      "-"
    )
    .slice(0, 60);

  const extension =
    getExtension(file);

  const storagePath =
    `universes/${userId}/surprise/${crypto.randomUUID()}-${safeName}.${extension}`;

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

  const {
    data: publicData,
  } =
    supabase.storage
      .from("universe-media")
      .getPublicUrl(
        storagePath
      );

  return {
    storagePath,
    publicUrl:
      publicData.publicUrl,
  };
}

function updateMemory(
  data: SurpriseData,
  index: number,
  value: Partial<
    SurpriseData["memories"]["items"][number]
  >
) {
  const items = [
    ...data.memories.items,
  ];

  items[index] = {
    ...items[index],
    ...value,
  };

  return {
    ...data,
    memories: {
      ...data.memories,
      items,
    },
  };
}

export default function SurpriseCustomizer({
  onContinue,
}: Props) {
  const [data, setData] =
    useState<SurpriseData>(() => ({
      ...DEFAULT_SURPRISE_DATA,

      memories: {
        ...DEFAULT_SURPRISE_DATA.memories,
        items:
          DEFAULT_SURPRISE_DATA.memories.items
            .slice(0, 3),
      },

      collection: {
        ...DEFAULT_SURPRISE_DATA.collection,

        items:
          DEFAULT_SURPRISE_DATA.collection.items.map(
            (item) => ({
              ...item,
            })
          ),
      },
    }));

  const [uploading, setUploading] =
    useState(false);

  const [uploadStatus, setUploadStatus] =
    useState("");

  const [error, setError] =
    useState("");

  const updateData = <
    K extends keyof SurpriseData
  >(
    key: K,
    value: SurpriseData[K]
  ) => {
    setData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  /* ================================
     COLLECTION ITEM UPDATE
  ================================= */

  const updateCollectionItem = (
    index: number,
    value: Partial<
      SurpriseData["collection"]["items"][number]
    >
  ) => {
    setData((current) => {
      const items = [
        ...current.collection.items,
      ];

      items[index] = {
        ...items[index],
        ...value,
      };

      return {
        ...current,
        collection: {
          ...current.collection,
          items,
        },
      };
    });
  };

  /* ================================
     MEMORY IMAGE UPLOAD
     SHARED BY BOTH MEMORY SECTIONS
  ================================= */

  const handleMemoryImage = async (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      setError("");
      setUploading(true);

      setUploadStatus(
        `Uploading image ${index + 1} of 3...`
      );

      const supabase =
        createClient();

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        throw new Error(
          "Please login before uploading files."
        );
      }

      const uploaded =
        await uploadFile(
          file,
          user.id,
          "image",
          `memory-${index + 1}`
        );

      setData((current) =>
        updateMemory(
          current,
          index,
          {
            image:
              uploaded.publicUrl,
            storagePath:
              uploaded.storagePath,
          }
        )
      );

      setUploadStatus(
        `Image ${index + 1} uploaded ✓`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  /* ================================
     BACKGROUND MUSIC
  ================================= */

  const handleBackgroundMusic =
    async (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      try {
        setError("");
        setUploading(true);

        setUploadStatus(
          "Uploading background music..."
        );

        const supabase =
          createClient();

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (
          userError ||
          !user
        ) {
          throw new Error(
            "Please login before uploading music."
          );
        }

        const uploaded =
          await uploadFile(
            file,
            user.id,
            "audio",
            "background-music"
          );

        setData((current) => ({
          ...current,

          music: {
            ...current.music,

            backgroundMusic:
              uploaded.publicUrl,

            backgroundMusicPath:
              uploaded.storagePath,
          },
        }));

        setUploadStatus(
          "Background music uploaded ✓"
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

  /* ================================
     SURPRISE MUSIC
  ================================= */

  const handleSurpriseMusic =
    async (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      try {
        setError("");
        setUploading(true);

        setUploadStatus(
          "Uploading surprise music..."
        );

        const supabase =
          createClient();

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (
          userError ||
          !user
        ) {
          throw new Error(
            "Please login before uploading music."
          );
        }

        const uploaded =
          await uploadFile(
            file,
            user.id,
            "audio",
            "surprise-music"
          );

        setData((current) => ({
          ...current,

          music: {
            ...current.music,

            surpriseMusic:
              uploaded.publicUrl,

            surpriseMusicPath:
              uploaded.storagePath,
          },
        }));

        setUploadStatus(
          "Surprise music uploaded ✓"
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

  /* ================================
     CONTINUE
  ================================= */

  const continueToPreview = () => {
    setError("");

    const memories =
      data.memories.items.slice(0, 3);

    const missingImage =
      memories.some(
        (memory) =>
          !memory.image ||
          !memory.storagePath
      );

    if (missingImage) {
      setError(
        "Please upload all 3 images before continuing."
      );

      return;
    }

    if (
      data.password.enabled
    ) {
      const code =
        data.password.code.trim();

      if (
        !/^\d{4}$/.test(code)
      ) {
        setError(
          "Password must contain exactly 4 digits."
        );

        return;
      }
    }

    const finalData: SurpriseData = {
      ...data,

      memories: {
        ...data.memories,
        items: memories,
      },
    };

    localStorage.setItem(
      "my-universe-surprise",
      JSON.stringify(finalData)
    );

    onContinue(finalData);
  };

  return (
    <div className="surprise-customizer">

      {/* =================================
          BASIC
      ================================== */}

      <GlassCard className="surprise-editor-section">

        <span className="surprise-editor-label">
          BASIC CONTENT
        </span>

        <h2>
          Start your little surprise ♡
        </h2>

        <div className="surprise-editor-fields">

          <GlassInput
            label="Surprise title"
            value={data.title}
            placeholder="A Little Surprise For You ♡"
            onChange={(value) =>
              updateData(
                "title",
                value
              )
            }
          />

          <GlassInput
            label="Person name"
            value={data.personName}
            placeholder="Enter their name"
            onChange={(value) =>
              updateData(
                "personName",
                value
              )
            }
          />

          <label className="surprise-textarea-wrap">

            <span>
              Opening message
            </span>

            <textarea
              value={
                data.openingMessage
              }
              onChange={(event) =>
                updateData(
                  "openingMessage",
                  event.target.value
                )
              }
            />

          </label>

        </div>

      </GlassCard>


      {/* =================================
          MEMORIES
      ================================== */}

      <GlassCard className="surprise-editor-section">

        <span className="surprise-editor-label">
          CHAPTER 01
        </span>

        <h2>
          Our little memories ♡
        </h2>

        <div className="surprise-editor-fields">

          <GlassInput
            label="Chapter label"
            value={
              data.memories.eyebrow
            }
            onChange={(value) =>
              setData((current) => ({
                ...current,
                memories: {
                  ...current.memories,
                  eyebrow: value,
                },
              }))
            }
          />

          <GlassInput
            label="Title"
            value={
              data.memories.title
            }
            onChange={(value) =>
              setData((current) => ({
                ...current,
                memories: {
                  ...current.memories,
                  title: value,
                },
              }))
            }
          />

          <label className="surprise-textarea-wrap">

            <span>
              Intro
            </span>

            <textarea
              value={
                data.memories.intro
              }
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  memories: {
                    ...current.memories,
                    intro:
                      event.target.value,
                  },
                }))
              }
            />

          </label>

        </div>


        <div className="surprise-memory-editor-grid">

          {data.memories.items
            .slice(0, 3)
            .map(
              (memory, index) => (
                <div
                  key={memory.id}
                  className="surprise-memory-editor glass"
                >

                  <div className="surprise-memory-number">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </div>

                  <div className="surprise-memory-upload">

                    {memory.image ? (
                      <img
                        src={
                          memory.image
                        }
                        alt=""
                      />
                    ) : (
                      <span>＋</span>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(event) =>
                        handleMemoryImage(
                          event,
                          index
                        )
                      }
                    />

                  </div>

                  <GlassInput
                    label="Caption"
                    value={
                      memory.caption
                    }
                    onChange={(value) =>
                      setData((current) =>
                        updateMemory(
                          current,
                          index,
                          {
                            caption:
                              value,
                          }
                        )
                      )
                    }
                  />

                </div>
              )
            )}

        </div>


        <GlassInput
          label="Bottom text"
          value={
            data.memories.bottomText
          }
          onChange={(value) =>
            setData((current) => ({
              ...current,
              memories: {
                ...current.memories,
                bottomText: value,
              },
            }))
          }
        />

      </GlassCard>


      {/* =================================
          BIRTHDAY
      ================================== */}

      <GlassCard className="surprise-editor-section">

        <span className="surprise-editor-label">
          BIRTHDAY
        </span>

        <h2>
          Little celebration
        </h2>

        <div className="surprise-editor-fields">

          <GlassInput
            label="Celebration heading"
            value={
              data.birthday.eyebrow
            }
            onChange={(value) =>
              setData((current) => ({
                ...current,
                birthday: {
                  ...current.birthday,
                  eyebrow: value,
                },
              }))
            }
          />

          <GlassInput
            label="Main title"
            value={
              data.birthday.title
            }
            onChange={(value) =>
              setData((current) => ({
                ...current,
                birthday: {
                  ...current.birthday,
                  title: value,
                },
              }))
            }
          />

          <label className="surprise-textarea-wrap">

            <span>
              Birthday message
            </span>

            <textarea
              value={
                data.birthday.message
              }
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  birthday: {
                    ...current.birthday,
                    message:
                      event.target.value,
                  },
                }))
              }
            />

          </label>

          <GlassInput
            label="Card text"
            value={
              data.birthday.forYouText
            }
            onChange={(value) =>
              setData((current) => ({
                ...current,
                birthday: {
                  ...current.birthday,
                  forYouText:
                    value,
                },
              }))
            }
          />

        </div>

      </GlassCard>


      {/* =================================
          REASONS
      ================================== */}

      <GlassCard className="surprise-editor-section">

        <span className="surprise-editor-label">
          CHAPTER 03
        </span>

        <h2>
          Everything about them
        </h2>

        <div className="surprise-editor-fields">

          <GlassInput
            label="Chapter label"
            value={
              data.reasons.eyebrow
            }
            onChange={(value) =>
              setData((current) => ({
                ...current,
                reasons: {
                  ...current.reasons,
                  eyebrow: value,
                },
              }))
            }
          />

          <GlassInput
            label="Title"
            value={
              data.reasons.title
            }
            onChange={(value) =>
              setData((current) => ({
                ...current,
                reasons: {
                  ...current.reasons,
                  title: value,
                },
              }))
            }
          />

          <label className="surprise-textarea-wrap">

            <span>
              Subtitle
            </span>

            <textarea
              value={
                data.reasons.subtitle
              }
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  reasons: {
                    ...current.reasons,
                    subtitle:
                      event.target.value,
                  },
                }))
              }
            />

          </label>

        </div>


        <div className="surprise-reasons-editor">

          {data.reasons.items.map(
            (reason, index) => (
              <div
                key={reason.id}
                className="surprise-reason-editor glass"
              >

                <span className="surprise-reason-index">
                  {index + 1}
                </span>

                <GlassInput
                  label={`Reason ${index + 1} title`}
                  value={reason.title}
                  onChange={(value) =>
                    setData((current) => {
                      const items = [
                        ...current.reasons.items,
                      ];

                      items[index] = {
                        ...items[index],
                        title: value,
                      };

                      return {
                        ...current,
                        reasons: {
                          ...current.reasons,
                          items,
                        },
                      };
                    })
                  }
                />

                <label className="surprise-textarea-wrap">

                  <span>
                    Reason {index + 1} text
                  </span>

                  <textarea
                    value={reason.text}
                    onChange={(event) =>
                      setData((current) => {
                        const items = [
                          ...current.reasons.items,
                        ];

                        items[index] = {
                          ...items[index],
                          text:
                            event.target.value,
                        };

                        return {
                          ...current,
                          reasons: {
                            ...current.reasons,
                            items,
                          },
                        };
                      })
                    }
                  />

                </label>

              </div>
            )
          )}

        </div>

      </GlassCard>


      {/* =================================
          LETTER
      ================================== */}

      <GlassCard className="surprise-editor-section">

        <span className="surprise-editor-label">
          CHAPTER 04
        </span>

        <h2>
          A little letter
        </h2>

        <div className="surprise-editor-fields">

          <GlassInput
            label="Chapter label"
            value={
              data.letter.eyebrow
            }
            onChange={(value) =>
              setData((current) => ({
                ...current,
                letter: {
                  ...current.letter,
                  eyebrow: value,
                },
              }))
            }
          />

          <GlassInput
            label="Letter title"
            value={
              data.letter.title
            }
            onChange={(value) =>
              setData((current) => ({
                ...current,
                letter: {
                  ...current.letter,
                  title: value,
                },
              }))
            }
          />

          <label className="surprise-textarea-wrap">

            <span>
              Letter
            </span>

            <textarea
              value={
                data.letter.content
              }
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  letter: {
                    ...current.letter,
                    content:
                      event.target.value,
                  },
                }))
              }
            />

          </label>

          <GlassInput
            label="Signature"
            value={
              data.letter.signature
            }
            onChange={(value) =>
              setData((current) => ({
                ...current,
                letter: {
                  ...current.letter,
                  signature: value,
                },
              }))
            }
          />

        </div>

      </GlassCard>


      {/* =================================
          LITTLE COLLECTION
      ================================== */}

      <GlassCard className="surprise-editor-section">

        <span className="surprise-editor-label">
          LITTLE COLLECTION
        </span>

        <h2>
          Six little surprises ✨
        </h2>

        <p
          style={{
            marginBottom: "1.5rem",
            opacity: 0.75,
          }}
        >
          These six items will appear inside
          the original Little Collection.
          Their original icons and interactions
          stay part of the surprise experience.
        </p>

        <div className="surprise-editor-fields">

          <GlassInput
            label="Collection label"
            value={
              data.collection.eyebrow
            }
            onChange={(value) =>
              setData((current) => ({
                ...current,
                collection: {
                  ...current.collection,
                  eyebrow: value,
                },
              }))
            }
          />

          <GlassInput
            label="Collection title"
            value={
              data.collection.title
            }
            onChange={(value) =>
              setData((current) => ({
                ...current,
                collection: {
                  ...current.collection,
                  title: value,
                },
              }))
            }
          />

          <label className="surprise-textarea-wrap">

            <span>
              Collection subtitle
            </span>

            <textarea
              value={
                data.collection.subtitle
              }
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  collection: {
                    ...current.collection,
                    subtitle:
                      event.target.value,
                  },
                }))
              }
            />

          </label>

        </div>


        {/* =================================
            COLLECTION ITEMS
        ================================== */}

        <div className="surprise-reasons-editor">

          {data.collection.items
            .slice(0, 6)
            .map(
              (item, index) => (
                <div
                  key={item.id}
                  className="surprise-reason-editor glass"
                >

                  <span className="surprise-reason-index">
                    {index + 1}
                  </span>

                  <GlassInput
                    label={`Item ${index + 1} title`}
                    value={
                      item.title
                    }
                    onChange={(value) =>
                      updateCollectionItem(
                        index,
                        {
                          title: value,
                        }
                      )
                    }
                  />

                  <GlassInput
                    label={`Item ${index + 1} subtitle`}
                    value={
                      item.subtitle
                    }
                    onChange={(value) =>
                      updateCollectionItem(
                        index,
                        {
                          subtitle:
                            value,
                        }
                      )
                    }
                  />

                  {/* =============================
                      MEMORIES IMAGE OPTION
                  ============================== */}

                  {index === 0 && (
                    <div
                      style={{
                        marginTop: "1rem",
                        width: "100%",
                      }}
                    >

                      <span className="surprise-editor-label">
                        MEMORIES PHOTOS
                      </span>

                      <p
                        style={{
                          marginTop: "0.5rem",
                          marginBottom: "1rem",
                          opacity: 0.7,
                          fontSize: "0.9rem",
                        }}
                      >
                        Add the 3 photos that will open
                        when the Memories icon is selected.
                      </p>

                      <div
                        className="surprise-memory-editor-grid"
                      >

                        {data.memories.items
                          .slice(0, 3)
                          .map(
                            (
                              memory,
                              memoryIndex
                            ) => (
                              <div
                                key={
                                  memory.id
                                }
                                className="surprise-memory-editor glass"
                              >

                                <div className="surprise-memory-number">
                                  {String(
                                    memoryIndex + 1
                                  ).padStart(
                                    2,
                                    "0"
                                  )}
                                </div>

                                <div className="surprise-memory-upload">

                                  {memory.image ? (
                                    <img
                                      src={
                                        memory.image
                                      }
                                      alt=""
                                    />
                                  ) : (
                                    <span>
                                      ＋
                                    </span>
                                  )}

                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={
                                      uploading
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      handleMemoryImage(
                                        event,
                                        memoryIndex
                                      )
                                    }
                                  />

                                </div>

                                <GlassInput
                                  label="Caption"
                                  value={
                                    memory.caption
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    setData(
                                      (
                                        current
                                      ) =>
                                        updateMemory(
                                          current,
                                          memoryIndex,
                                          {
                                            caption:
                                              value,
                                          }
                                        )
                                    )
                                  }
                                />

                              </div>
                            )
                          )}

                      </div>

                    </div>
                  )}

                </div>
              )
            )}

        </div>


        {/* =================================
            MINI SURPRISE TEXT
        ================================== */}

        <div
          style={{
            marginTop: "1.5rem",
          }}
        >

          <span className="surprise-editor-label">
            MINI-SURPRISE TEXT
          </span>

          <div className="surprise-editor-fields">

            <GlassInput
              label="Memories text"
              value={
                data.collection.memoriesText
              }
              onChange={(value) =>
                setData((current) => ({
                  ...current,
                  collection: {
                    ...current.collection,
                    memoriesText:
                      value,
                  },
                }))
              }
            />

            <GlassInput
              label="Letter text"
              value={
                data.collection.letterText
              }
              onChange={(value) =>
                setData((current) => ({
                  ...current,
                  collection: {
                    ...current.collection,
                    letterText:
                      value,
                  },
                }))
              }
            />

            <GlassInput
              label="Flowers text"
              value={
                data.collection.flowersText
              }
              onChange={(value) =>
                setData((current) => ({
                  ...current,
                  collection: {
                    ...current.collection,
                    flowersText:
                      value,
                  },
                }))
              }
            />

            <GlassInput
              label="Surprise text"
              value={
                data.collection.surpriseText
              }
              onChange={(value) =>
                setData((current) => ({
                  ...current,
                  collection: {
                    ...current.collection,
                    surpriseText:
                      value,
                  },
                }))
              }
            />

            <GlassInput
              label="Secret text"
              value={
                data.collection.secretText
              }
              onChange={(value) =>
                setData((current) => ({
                  ...current,
                  collection: {
                    ...current.collection,
                    secretText:
                      value,
                  },
                }))
              }
            />

            <GlassInput
              label="Music text"
              value={
                data.collection.musicText
              }
              onChange={(value) =>
                setData((current) => ({
                  ...current,
                  collection: {
                    ...current.collection,
                    musicText:
                      value,
                  },
                }))
              }
            />

          </div>

        </div>

      </GlassCard>


      {/* =================================
          PASSWORD
      ================================== */}

      <GlassCard className="surprise-editor-section">

        <span className="surprise-editor-label">
          CHAPTER 05 · SECURITY
        </span>

        <h2>
          Private surprise 🔐
        </h2>

        <div className="surprise-password-toggle">

          <label>

            <input
              type="checkbox"
              checked={
                data.password.enabled
              }
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  password: {
                    ...current.password,
                    enabled:
                      event.target.checked,
                  },
                }))
              }
            />

            <span>
              Enable password protection
            </span>

          </label>

        </div>


        {data.password.enabled && (
          <div className="surprise-editor-fields">

            <GlassInput
              label="4-digit password"
              type="password"
              value={
                data.password.code
              }
              placeholder="1234"
              onChange={(value) =>
                updateData(
                  "password",
                  {
                    ...data.password,
                    code:
                      value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          4
                        ),
                  }
                )
              }
            />

            <GlassInput
              label="Password hint"
              value={
                data.password.hint
              }
              placeholder="Optional hint..."
              onChange={(value) =>
                updateData(
                  "password",
                  {
                    ...data.password,
                    hint: value,
                  }
                )
              }
            />

          </div>
        )}

      </GlassCard>


      {/* =================================
          MUSIC
      ================================== */}

      <GlassCard className="surprise-editor-section">

        <span className="surprise-editor-label">
          MUSIC
        </span>

        <h2>
          Set the atmosphere ♫
        </h2>

        <div className="surprise-music-editor">

          <label className="surprise-upload-box">

            <span>
              🎵 Background music
            </span>

            <small>
              Optional
            </small>

            <input
              type="file"
              accept="audio/*"
              disabled={uploading}
              onChange={
                handleBackgroundMusic
              }
            />

            {data.music.backgroundMusic && (
              <strong>
                ✓ Uploaded to Storage
              </strong>
            )}

          </label>


          <label className="surprise-upload-box">

            <span>
              ✨ Surprise music
            </span>

            <small>
              Optional
            </small>

            <input
              type="file"
              accept="audio/*"
              disabled={uploading}
              onChange={
                handleSurpriseMusic
              }
            />

            {data.music.surpriseMusic && (
              <strong>
                ✓ Uploaded to Storage
              </strong>
            )}

          </label>

        </div>


        <label className="surprise-music-switch">

          <input
            type="checkbox"
            checked={
              data.music.backgroundEnabled
            }
            onChange={(event) =>
              updateData(
                "music",
                {
                  ...data.music,
                  backgroundEnabled:
                    event.target.checked,
                }
              )
            }
          />

          <span>
            Enable background music
          </span>

        </label>

      </GlassCard>


      {/* =================================
          STATUS
      ================================== */}

      {uploading && (
        <div className="surprise-upload-status glass">
          ⏳ {uploadStatus}
        </div>
      )}

      {!uploading &&
        uploadStatus && (
          <div className="surprise-upload-status glass">
            ✓ {uploadStatus}
          </div>
        )}

      {error && (
        <div className="surprise-upload-error glass">
          {error}
        </div>
      )}


      {/* =================================
          FOOTER
      ================================== */}

      <div className="surprise-builder-footer">

        <GlassButton
          onClick={() =>
            window.history.back()
          }
          disabled={uploading}
        >
          ← Back
        </GlassButton>

        <GlassButton
          active
          disabled={uploading}
          onClick={
            continueToPreview
          }
        >
          Preview Surprise ✨
        </GlassButton>

      </div>

    </div>
  );
}