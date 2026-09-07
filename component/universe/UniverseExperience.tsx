"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type UniverseMedia = {
  id: string;
  universe_id: string;
  page_id: string | null;
  media_type: "image" | "background_music" | "surprise_music" | string;
  storage_path: string;
  public_url: string | null;
  media_order: number;
  metadata: Record<string, unknown>;
};

type UniversePage = {
  id: string;
  universe_id: string;
  page_order: number;
  page_type: string;
  title: string;
  content: string | null;
  settings: Record<string, unknown> | null;
};

type Universe = {
  id: string;
  slug: string;
  title: string;
  person_name: string;
  relationship: string | null;
  opening_message: string | null;
  description: string | null;
  theme: string;
  design: unknown;
  music: unknown;
  password_enabled: boolean;
  password_screen: unknown;
  published?: boolean;
};

type UniverseDesign = {
  theme?: string;
  accentColor?: string;
  glassStyle?: "soft" | "clear" | "frosted";
  glowIntensity?: number;
  backgroundStyle?:
    | "spatial"
    | "aurora"
    | "soft"
    | "custom";
  fontStyle?:
    | "modern"
    | "soft"
    | "elegant"
    | "playful";
  animationIntensity?: number;
  particlesEnabled?: boolean;
  cursorEffectEnabled?: boolean;
  galleryStyle?:
    | "grid"
    | "polaroid"
    | "cards"
    | "cinematic";
  buttonStyle?:
    | "glass"
    | "solid"
    | "outline"
    | "pill";
};

type UniverseExperienceProps = {
  universe: Universe;
  pages: UniversePage[];
  media: UniverseMedia[];
  design?: UniverseDesign;
};

type ExperienceStep =
  | "welcome"
  | "memories"
  | "birthday"
  | "reasons"
  | "favourite"
  | "quotes"
  | "timeline"
  | "letter"
  | "password"
  | "unlock"
  | "surprises"
  | "final";

type ReasonItem = {
  title?: string;
  text?: string;
  description?: string;
};

type CollectionModal =
  | "memories"
  | "letter"
  | "flowers"
  | "surprise"
  | "secret"
  | "music"
  | null;

type FavouriteThing = {
  title?: string;
  text?: string;
  value?: string;
  description?: string;
};

type QuoteItem = {
  quote?: string;
  text?: string;
  author?: string;
};

type TimelineItem = {
  title?: string;
  text?: string;
  date?: string;
  description?: string;
};

const [collectionModal, setCollectionModal] = useState<
  "memories" | "letter" | "flowers" | "surprise" | "secret" | "music" | null
>(null);

const [catOpened, setCatOpened] = useState(false);
const [secretRevealed, setSecretRevealed] = useState(false);

const DEFAULT_REASONS: ReasonItem[] = [
  {
    title: "Your presence",
    text: "Some people simply make everything feel a little better.",
  },
  {
    title: "Your smile",
    text: "A tiny moment that can completely change the mood.",
  },
  {
    title: "The memories",
    text: "The little moments are often the ones worth keeping forever.",
  },
  {
    title: "Just you",
    text: "Because being yourself is already something special.",
  },
];

const openCollectionItem = (
  item: "memories" | "letter" | "flowers" | "surprise" | "secret" | "music"
) => {
  setCollectionModal(item);

  if (item !== "surprise") {
    setCatOpened(false);
  }

  if (item !== "secret") {
    setSecretRevealed(false);
  }
};

const closeCollectionItem = () => {
  setCollectionModal(null);
  setCatOpened(false);
  setSecretRevealed(false);
};

function getSetting<T = unknown>(
  page: UniversePage | undefined,
  key: string
): T | null {
  const settings = page?.settings;

  if (!settings) {
    return null;
  }

  const value = settings[key];

  return value !== undefined
    ? (value as T)
    : null;
}

function getSettingArray<T = unknown>(
  page: UniversePage | undefined,
  key: string
): T[] {
  const value = getSetting<unknown[]>(
    page,
    key
  );

  return Array.isArray(value)
    ? (value as T[])
    : [];
}

function getStringSetting(
  page: UniversePage | undefined,
  key: string
) {
  const value = getSetting<unknown>(
    page,
    key
  );

  return typeof value === "string"
    ? value
    : "";
}

function findPage(
  pages: UniversePage[],
  ...types: string[]
) {
  return pages.find((page) =>
    types.some(
      (type) =>
        page.page_type
          ?.toLowerCase()
          .trim() ===
        type.toLowerCase()
    )
  );
}

function findAllPages(
  pages: UniversePage[],
  ...types: string[]
) {
  return pages.filter((page) =>
    types.some(
      (type) =>
        page.page_type
          ?.toLowerCase()
          .trim() ===
        type.toLowerCase()
    )
  );
}

export default function UniverseExperience({
  universe,
  pages,
  media,
  design,
}: UniverseExperienceProps) {
  const [step, setStep] =
    useState<ExperienceStep>("welcome");


  const [passwordError, setPasswordError] =
    useState("");

  

  const [showMusicPanel, setShowMusicPanel] =
    useState(false);

  const [musicPlaying, setMusicPlaying] =
    useState(false);

  const [surpriseModal, setSurpriseModal] =
    useState<string | null>(null);

  const backgroundAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const surpriseAudioRef =
    useRef<HTMLAudioElement | null>(null);

    const passwordInputRef =
  useRef<HTMLInputElement | null>(null);


    const [passwordInput, setPasswordInput] = useState("");

const [passwordChecking, setPasswordChecking] = useState(false);

const [collectionModal, setCollectionModal] =
  useState<CollectionModal>(null);

const [secretRevealed, setSecretRevealed] =
  useState(false);

const [catOpened, setCatOpened] =
  useState(false);


const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);


  /*
   * -----------------------------------------
   * Sort pages
   * -----------------------------------------
   */

  const sortedPages = useMemo(
    () =>
      [...pages].sort(
        (a, b) =>
          a.page_order -
          b.page_order
      ),
    [pages]
  );

  /*
   * -----------------------------------------
   * Find creator pages
   * -----------------------------------------
   */

  const welcomePage =
    findPage(
      sortedPages,
      "Welcome"
    );

  const memoryPages =
    findAllPages(
      sortedPages,
      "Memories",
      "Photo Gallery"
    );

  const birthdayPage =
    findPage(
      sortedPages,
      "Birthday"
    );

  const reasonsPage =
    findPage(
      sortedPages,
      "Reasons"
    );

  const favouritePage =
    findPage(
      sortedPages,
      "Favourite Things"
    );

  const letterPage =
    findPage(
      sortedPages,
      "Letter"
    );

  const quotePages =
    findAllPages(
      sortedPages,
      "Quotes"
    );

  const timelinePages =
    findAllPages(
      sortedPages,
      "Timeline"
    );

  const surprisePage =
    findPage(
      sortedPages,
      "Surprise"
    );

  const secretPage =
    findPage(
      sortedPages,
      "Secret"
    );

  const musicPage =
    findPage(
      sortedPages,
      "Music"
    );

  const finalPage =
    findPage(
      sortedPages,
      "Final Reveal"
    );

  const customPages =
    findAllPages(
      sortedPages,
      "Custom"
    );

  /*
   * -----------------------------------------
   * Dynamic creator data
   * -----------------------------------------
   */

  const dynamicReasons =
    getSettingArray<ReasonItem>(
      reasonsPage,
      "reasons"
    );

  const reasons =
    dynamicReasons.length > 0
      ? dynamicReasons
      : DEFAULT_REASONS;

  const favouriteThings =
    getSettingArray<FavouriteThing>(
      favouritePage,
      "favouriteThings"
    );

  const quotes =
    quotePages.flatMap(
      (page) =>
        getSettingArray<QuoteItem>(
          page,
          "quotes"
        )
    );

  const timeline =
    timelinePages.flatMap(
      (page) =>
        getSettingArray<TimelineItem>(
          page,
          "timeline"
        )
    );

  /*
   * -----------------------------------------
   * Letter
   * -----------------------------------------
   */

  const creatorLetter =
    getStringSetting(
      letterPage,
      "letter"
    ) ||
    letterPage?.content ||
    "";

  /*
   * -----------------------------------------
   * Surprise
   * -----------------------------------------
   */

  const creatorSurprise =
    getStringSetting(
      surprisePage,
      "surprise"
    ) ||
    surprisePage?.content ||
    "";

  /*
   * -----------------------------------------
   * Secret
   * -----------------------------------------
   */

  const creatorSecret =
    getStringSetting(
      secretPage,
      "secret"
    ) ||
    secretPage?.content ||
    "";

  /*
   * -----------------------------------------
   * Final reveal
   * -----------------------------------------
   */

  const creatorFinalMessage =
    getStringSetting(
      finalPage,
      "finalMessage"
    ) ||
    finalPage?.content ||
    "";

  /*
   * -----------------------------------------
   * Music URLs
   * -----------------------------------------
   */

  const backgroundMusic = useMemo(
    () =>
      media.find(
        (item) =>
          item.media_type ===
          "background_music"
      ),
    [media]
  );

  const surpriseMusic = useMemo(
    () =>
      media.find(
        (item) =>
          item.media_type ===
          "surprise_music"
      ),
    [media]
  );

  /*
   * -----------------------------------------
   * Page images
   * -----------------------------------------
   */

  function getPageImages(
    page: UniversePage | undefined
  ) {
    if (!page) {
      return [];
    }

    return media
      .filter(
        (item) =>
          item.media_type ===
            "image" &&
          item.page_id === page.id
      )
      .sort(
        (a, b) =>
          a.media_order -
          b.media_order
      );
  }

  /*
   * -----------------------------------------
   * All memory/gallery images
   * -----------------------------------------
   */

  const memoryImages =
    memoryPages.flatMap(
      (page) =>
        getPageImages(page)
    );

  /*
   * -----------------------------------------
   * Password screen
   * -----------------------------------------
   */

 const passwordScreen =
  universe.password_screen &&
  typeof universe.password_screen === "object" &&
  !Array.isArray(universe.password_screen)
    ? (universe.password_screen as {
        title?: unknown;
        message?: unknown;
        buttonText?: unknown;
      })
    : {};

const passwordTitle =
  typeof passwordScreen.title === "string"
    ? passwordScreen.title
    : "A little secret awaits ♡";

const passwordMessage =
  typeof passwordScreen.message === "string"
    ? passwordScreen.message
    : "Only someone special knows the magic needed to enter this universe.";

const passwordButtonText =
  typeof passwordScreen.buttonText === "string"
    ? passwordScreen.buttonText
    : "Enter Universe";
    /*
   * -----------------------------------------
   * Surprise modal
   * -----------------------------------------
   */
async function playSurpriseMusic() {
  if (!surpriseMusic?.public_url) return;

  const background = backgroundAudioRef.current;

  // Stop background music while surprise music plays
  if (background) {
    background.pause();
    setMusicPlaying(false);
  }

  // Stop any already-playing surprise music
  const oldSurprise = surpriseAudioRef.current;

  if (oldSurprise) {
    oldSurprise.pause();
    oldSurprise.currentTime = 0;
    oldSurprise.src = "";
    surpriseAudioRef.current = null;
  }

  const audio = new Audio(surpriseMusic.public_url);

  audio.volume = 0.8;
  audio.preload = "auto";

  surpriseAudioRef.current = audio;

  const resumeBackground = () => {
    surpriseAudioRef.current = null;

    if (background) {
      background
        .play()
        .then(() => {
          setMusicPlaying(true);
        })
        .catch(() => {
          setMusicPlaying(false);
        });
    }
  };

  audio.onended = resumeBackground;
  audio.onerror = resumeBackground;

  try {
    await audio.play();
  } catch {
    surpriseAudioRef.current = null;

    if (background) {
      background
        .play()
        .then(() => {
          setMusicPlaying(true);
        })
        .catch(() => {
          setMusicPlaying(false);
        });
    }
  }
}

function openSurprise(type: string) {
  setSurpriseModal(type);

  if (type === "music") {
    void playSurpriseMusic();
  }
}

async function toggleMusic() {
  const audio = backgroundAudioRef.current;

  if (!audio) return;

  try {
    if (audio.paused) {
      await audio.play();
      setMusicPlaying(true);
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  } catch {
    setMusicPlaying(false);
  }
}


function closeSurprise() {
  // Stop surprise music
  const surprise = surpriseAudioRef.current;

  if (surprise) {
    surprise.pause();
    surprise.currentTime = 0;
    surprise.src = "";
    surpriseAudioRef.current = null;
  }

  setSurpriseModal(null);

  // Resume background music
  const background = backgroundAudioRef.current;

  if (background) {
    background
      .play()
      .then(() => {
        setMusicPlaying(true);
      })
      .catch(() => {
        setMusicPlaying(false);
      });
  }
} 

function changeScene(nextStep: ExperienceStep) {
  setIsSceneTransitioning(true);

  window.setTimeout(() => {
    setStep(nextStep);

    window.setTimeout(() => {
      setIsSceneTransitioning(false);
    }, 50);
  }, 600);
}

/*
   * -----------------------------------------
   * Continue from Welcome
   * -----------------------------------------
   */

async function verifyPassword() {
  if (passwordInput.length !== 4) {
    setPasswordError("Please enter all 4 digits.");
    return;
  }

  setPasswordChecking(true);
  setPasswordError("");

  try {
    const response = await fetch(
      "/api/universes/access",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: universe.slug,
          password: passwordInput,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result?.success) {
      setPasswordError(
        result?.error ||
          "That isn't the right magic. Try again ♡"
      );

      setPasswordInput("");
      return;
    }

    /*
     * Password verified successfully.
     * Continue with the normal cinematic flow.
     */
    setPasswordInput("");
    setPasswordError("");

    window.setTimeout(() => {
      setStep("unlock");
    }, 450);

  } catch (error) {
    console.error(
      "Password verification error:",
      error
    );

    setPasswordError(
      "Something went wrong. Please try again."
    );
  } finally {
    setPasswordChecking(false);
  }
}

function startUniverse() {
  const background = backgroundAudioRef.current;

  if (
    background &&
    universe.music &&
    typeof universe.music === "object"
  ) {
    background
      .play()
      .then(() => {
        setMusicPlaying(true);
      })
      .catch(() => {});
  }

  window.setTimeout(() => {
    if (universe.password_enabled) {
      setStep("password");
      return;
    }

    goToFirstContentStep();
  }, 600);
}
  /*
   * -----------------------------------------
   * First content step
   * -----------------------------------------
   */

 function goToFirstContentStep() {
  if (memoryPages.length > 0) {
    setStep("memories");
    return;
  }

  if (birthdayPage) {
    setStep("birthday");
    return;
  }

  if (reasonsPage) {
    setStep("reasons");
    return;
  }

  if (favouritePage && favouriteThings.length > 0) {
    setStep("favourite");
    return;
  }

  if (quotePages.length > 0) {
    setStep("quotes");
    return;
  }

  if (timelinePages.length > 0) {
    setStep("timeline");
    return;
  }

  if (letterPage) {
    setStep("letter");
    return;
  }

  setStep("surprises");
}

  /*
   * -----------------------------------------
   * Password verification
   * -----------------------------------------
   */

 

  /*
   * -----------------------------------------
   * Password → universe
   * -----------------------------------------
   */
function continueAfterUnlock() {
  setStep("surprises");
}
  /*
   * -----------------------------------------
   * Sequential navigation
   * -----------------------------------------
   */

 function continueFromMemories() {
  if (birthdayPage) {
    setStep("birthday");
    return;
  }

  if (reasonsPage) {
    setStep("reasons");
    return;
  }

  if (
    favouritePage &&
    favouriteThings.length > 0
  ) {
    setStep("favourite");
    return;
  }

  if (letterPage) {
    setStep("letter");
    return;
  }

  setStep("surprises");
}



function continueFromBirthday() {
  if (reasonsPage) {
    setStep("reasons");
    return;
  }

  if (favouritePage && favouriteThings.length > 0) {
    setStep("favourite");
    return;
  }

  if (quotePages.length > 0) {
    setStep("quotes");
    return;
  }

  if (timelinePages.length > 0) {
    setStep("timeline");
    return;
  }

  if (letterPage) {
    setStep("letter");
    return;
  }

  setStep("surprises");
}

function continueFromReasons() {
  if (favouritePage && favouriteThings.length > 0) {
    setStep("favourite");
    return;
  }

  if (quotePages.length > 0) {
    setStep("quotes");
    return;
  }

  if (timelinePages.length > 0) {
    setStep("timeline");
    return;
  }

  if (letterPage) {
    setStep("letter");
    return;
  }

  setStep("surprises");
}

function continueFromFavourite() {
  if (quotePages.length > 0) {
    setStep("quotes");
    return;
  }

  if (timelinePages.length > 0) {
    setStep("timeline");
    return;
  }

  if (letterPage) {
    setStep("letter");
    return;
  }

  setStep("surprises");
}

function continueFromLetter() {
  if (universe.password_enabled) {
    setPasswordInput("");
    setPasswordError("");
    setStep("password");
    return;
  }

  setStep("surprises");
}

function openCollectionItem(
  item:
    | "memories"
    | "letter"
    | "flowers"
    | "surprise"
    | "secret"
    | "music"
) {
  setCollectionModal(item);

  if (item === "secret") {
    setSecretRevealed(false);
  }

  if (item === "surprise") {
    setCatOpened(false);
  }
}

function closeCollectionItem() {
  setCollectionModal(null);
  setCatOpened(false);
}
  /*
   * -----------------------------------------
   * Dynamic surprise image
   * -----------------------------------------
   */

  const surpriseImages =
    surprisePage
      ? getPageImages(
          surprisePage
        )
      : [];

  const secretImages =
    secretPage
      ? getPageImages(
          secretPage
        )
      : [];

  /*
   * -----------------------------------------
   * Render
   * -----------------------------------------
   */

  return (
      <main className="reference-universe">
      <div className="reference-universe-glow glow-one" />
      <div className="reference-universe-glow glow-two" />
      <div className="reference-universe-particle particle-one" />
      <div className="reference-universe-particle particle-two" />
      <div className="reference-universe-particle particle-three" />

      {/* -----------------------------------
          MUSIC CONTROL
      ----------------------------------- */}

          {backgroundMusic?.public_url && (
          <button
            type="button"
            className={`reference-music-button ${
              musicPlaying
                ? "is-playing"
                : ""
            }`}
            onClick={() => {
              void toggleMusic();
            }}
            aria-label={
              musicPlaying
                ? "Pause background music"
                : "Play background music"
            }
            title={
              musicPlaying
                ? "Pause music"
                : "Play music"
            }
          >
            <span className="reference-music-button-icon">
              {musicPlaying ? "♫" : "♪"}
            </span>

            <span className="reference-music-button-pulse" />
          </button>
        )}

      {/* -----------------------------------
          WELCOME
      ----------------------------------- */}

     {step === "welcome" && (
  <section className="reference-opening-scene">

    {/* Ambient glow */}
    <div className="reference-opening-glow glow-one" />
    <div className="reference-opening-glow glow-two" />
    <div className="reference-opening-glow glow-three" />

    {/* Floating glass objects */}
    <div className="reference-opening-orb orb-one" />
    <div className="reference-opening-orb orb-two" />
    <div className="reference-opening-orb orb-three" />

    {/* Floating hearts / stars */}
    <div className="reference-floating-symbols">
      <span>♡</span>
      <span>✦</span>
      <span>✧</span>
      <span>♡</span>
      <span>✦</span>
      <span>·</span>
      <span>♡</span>
      <span>✧</span>
    </div>

    {/* Main opening content */}
    <div className="reference-opening-content">

      <div className="reference-glass-card reference-opening-card">

        <span className="reference-eyebrow">
          A LITTLE SOMETHING
        </span>

        <h1>
          FOR{" "}
          {universe.person_name || "YOU"}{" "}
          ♡
        </h1>

        <span className="reference-just-for-you">
          just for you
        </span>

        {universe.relationship && (
          <span className="reference-private-badge">
            {universe.relationship}
          </span>
        )}

        <p className="reference-opening-text">
          {universe.opening_message ||
            universe.description ||
            "There’s a little surprise waiting for you."}
        </p>

        {/* Glass Heart */}
        <div className="reference-glass-heart">
          <div className="reference-heart-shine" />

          <div className="reference-heart-shape">
            ♡
          </div>

          <span className="reference-heart-label">
            MADE FOR YOU
          </span>
        </div>

        <button
          type="button"
          className="reference-primary-button reference-opening-button"
          onClick={startUniverse}
        >
          open your surprise ♡
        </button>

        <div className="reference-opening-footer">
          <span>
            scroll slowly...
          </span>

          <span>
            ✦
          </span>

          <span>
            chapter 01
          </span>
        </div>

      </div>

    </div>

  </section>
)}{
  
  /* =========================================
    PASSWORD — SECRET CHAPTER
========================================= */}

{step === "password" && (
  <section className="reference-secret-scene">

    {/* Ambient glow */}
    <div className="reference-secret-glow secret-glow-one" />
    <div className="reference-secret-glow secret-glow-two" />
    <div className="reference-secret-glow secret-glow-three" />

    {/* Glass objects */}
    <div className="reference-secret-orb secret-orb-one" />
    <div className="reference-secret-orb secret-orb-two" />
    <div className="reference-secret-orb secret-orb-three" />

    {/* Floating symbols */}
    <div className="reference-secret-symbols">
      <span>♡</span>
      <span>✦</span>
      <span>✧</span>
      <span>♡</span>
      <span>·</span>
      <span>✦</span>
      <span>♡</span>
    </div>

    <div className="reference-secret-content">

      <span className="reference-secret-chapter">
        CHAPTER 08
      </span>

      <div className="reference-secret-lock">
        🔐
      </div>

      <span className="reference-secret-eyebrow">
        ✦ ONE LITTLE SECRET ✦
      </span>

      <h1 className="reference-secret-title">
        A secret is
        <br />
        waiting for you ♡
      </h1>

      <p className="reference-secret-intro">
        There is one little door left to open.
        <br />
        Only someone special knows the way in.
      </p>

      <div className="reference-password-card">

        <div className="reference-password-card-shine" />

        <div className="reference-password-heading">
          <span>♡</span>
          <strong>
            {(() => {
              const screen =
                passwordScreen &&
                typeof passwordScreen === "object"
                  ? (passwordScreen as Record<string, unknown>)
                  : {};

              return String(
                screen.title ||
                  "A little secret awaits ♡"
              );
            })()}
          </strong>
          <span>♡</span>
        </div>

        <p className="reference-password-message">
          {(() => {
            const screen =
              passwordScreen &&
              typeof passwordScreen === "object"
                ? (passwordScreen as Record<string, unknown>)
                : {};

            return String(
              screen.message ||
                "Enter the secret password to continue."
            );
          })()}
        </p>

        <div className="reference-password-dots">

          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={
                passwordInput.length > index
                  ? "filled"
                  : ""
              }
            />
          ))}

        </div>

        <input
          ref={passwordInputRef}
          type="password"
          value={passwordInput}
          onChange={(event) => {
            const value =
              event.target.value
                .replace(/\D/g, "")
                .slice(0, 4);

            setPasswordInput(value);
            setPasswordError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void verifyPassword();
            }
          }}
          inputMode="numeric"
          maxLength={4}
          autoComplete="off"
          aria-label="Universe password"
          className="reference-password-hidden-input"
        />

        <div className="reference-password-keypad">

          {[1, 2, 3, 4, 5, 6, 7, 8, 9]
            .map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => {
                  if (passwordInput.length >= 4) {
                    return;
                  }

                  setPasswordInput(
                    (current) =>
                      `${current}${number}`.slice(0, 4)
                  );

                  setPasswordError("");
                }}
              >
                {number}
              </button>
            ))}

          <button
            type="button"
            className="reference-password-clear"
            onClick={() => {
              setPasswordInput("");
              setPasswordError("");
            }}
          >
            clear
          </button>

          <button
            type="button"
            onClick={() => {
              if (passwordInput.length >= 4) {
                return;
              }

              setPasswordInput(
                (current) =>
                  `${current}0`.slice(0, 4)
              );

              setPasswordError("");
            }}
          >
            0
          </button>

          <button
            type="button"
            className="reference-password-delete"
            onClick={() => {
              setPasswordInput(
                (current) => current.slice(0, -1)
              );

              setPasswordError("");
            }}
          >
            ←
          </button>

        </div>

        {passwordError && (
          <p className="reference-password-error">
            ♡ {passwordError}
          </p>
        )}

        <button
          type="button"
          className="reference-primary-button reference-password-button"
          disabled={
            passwordChecking ||
            passwordInput.length < 4
          }
          onClick={() => {
            void verifyPassword();
          }}
        >
          {passwordChecking
            ? "checking the little secret..."
            : "unlock the secret ♡"}
        </button>

        <p className="reference-password-hint">
          a little hint ✦ enter the four-digit secret
        </p>

      </div>

      <div className="reference-secret-footer">
        <span>♡</span>
        <span>chapter 08</span>
        <span>♡</span>
      </div>

    </div>

  </section>
)}


{/* =========================================
    UNLOCK — SECRET REVEALED
========================================= */}

{step === "unlock" && (
  <section className="reference-unlock-scene">

    {/* Ambient glow */}
    <div className="reference-unlock-glow unlock-glow-one" />
    <div className="reference-unlock-glow unlock-glow-two" />
    <div className="reference-unlock-glow unlock-glow-three" />

    {/* Glass objects */}
    <div className="reference-unlock-orb unlock-orb-one" />
    <div className="reference-unlock-orb unlock-orb-two" />

    {/* Floating symbols */}
    <div className="reference-unlock-symbols">
      <span>♡</span>
      <span>✦</span>
      <span>✧</span>
      <span>♡</span>
      <span>✦</span>
    </div>

    <div className="reference-unlock-content">

      <span className="reference-unlock-eyebrow">
        SECRET UNLOCKED
      </span>

      <div className="reference-unlock-icon">
        🐥
      </div>

      <h1 className="reference-unlock-title">
        ✦ YOU GOT IT ✦
      </h1>

      <p className="reference-unlock-message">
        You found the secret ♡
        <br />
        And there is still a little more waiting for you.
      </p>

      <div className="reference-unlock-card">

        <div className="reference-unlock-card-glow" />

        <div className="reference-unlock-box">
          🎁
        </div>

        <span>
          A LITTLE SOMETHING
        </span>

        <strong>
          just for you ♡
        </strong>

        <p>
          The little surprises are waiting.
        </p>

      </div>

      <button
        type="button"
        className="reference-primary-button reference-unlock-button"
        onClick={continueAfterUnlock}
      >
        open my little surprises →
      </button>

      <div className="reference-unlock-footer">
        <span>♡</span>
        <span>secret found</span>
        <span>♡</span>
      </div>

    </div>

  </section>
)}

      {/* -----------------------------------
          MEMORIES
      ----------------------------------- */}

     {step === "memories" && (
  <section className="reference-memory-scene">

    <div className="reference-memory-glow memory-glow-one" />
    <div className="reference-memory-glow memory-glow-two" />

    <div className="reference-memory-floating-symbols">
      <span>♡</span>
      <span>✦</span>
      <span>✧</span>
      <span>♡</span>
      <span>·</span>
    </div>

    <div className="reference-memory-content">

      <span className="reference-memory-chapter">
        CHAPTER 01
      </span>

      <h1>
        Our little
        <br />
        memories ♡
      </h1>

      <p className="reference-memory-intro">
        The smallest moments often become
        the ones we remember the longest.
      </p>

      {memoryImages.length > 0 ? (
        <div className="reference-memory-gallery">
          {memoryImages.map((image, index) => (
            <div
              key={image.id}
              className={`reference-memory-photo memory-photo-${index + 1}`}
            >
              <div className="reference-memory-photo-inner">
                <img
                  src={image.public_url || ""}
                  alt={
                    image.metadata?.alt
                      ? String(image.metadata.alt)
                      : `Memory ${index + 1}`
                  }
                />
              </div>

              <span className="reference-memory-number">
                0{index + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="reference-memory-empty">
          <span>♡</span>
          <p>
            Every little memory has a place
            here.
          </p>
        </div>
      )}

      <div className="reference-memory-caption">
        <span>♡</span>
        <p>
          made of tiny moments
        </p>
        <span>♡</span>
      </div>

      <button
        type="button"
        className="reference-primary-button reference-memory-button"
        onClick={continueFromMemories}
      >
        continue →
      </button>

    </div>
  </section>
)}

      {/* -----------------------------------
          BIRTHDAY
      ----------------------------------- */}

      {step === "birthday" && (
  <section className="reference-birthday-scene">

    {/* Ambient background */}
    <div className="reference-birthday-glow birthday-glow-one" />
    <div className="reference-birthday-glow birthday-glow-two" />
    <div className="reference-birthday-glow birthday-glow-three" />

    {/* Floating glass objects */}
    <div className="reference-birthday-orb birthday-orb-one" />
    <div className="reference-birthday-orb birthday-orb-two" />

    {/* Floating symbols */}
    <div className="reference-birthday-symbols">
      <span>♡</span>
      <span>✦</span>
      <span>✧</span>
      <span>♡</span>
      <span>·</span>
      <span>✦</span>
    </div>

    <div className="reference-birthday-content">

      {/* Chapter label */}
      <span className="reference-birthday-eyebrow">
        ✦ A LITTLE CELEBRATION ✦
      </span>

      {/* Cake */}
      <div className="reference-birthday-cake">
        🎂
      </div>

      {/* Main heading */}
      <h1 className="reference-birthday-title">
        TODAY IS
        <br />
        YOUR DAY
      </h1>

      {/* Personalized heading */}
      <p className="reference-birthday-name">
        {birthdayPage?.title ||
          `Happy Birthday ${universe.person_name || "beautiful"} ♡`}
      </p>

      {/* Birthday image */}
      {birthdayPage &&
        getPageImages(birthdayPage).length > 0 && (
          <div className="reference-birthday-photo">

            <div className="reference-birthday-photo-inner">

              <img
                src={
                  getPageImages(birthdayPage)[0]
                    .public_url || ""
                }
                alt={
                  universe.person_name
                    ? `Birthday for ${universe.person_name}`
                    : "Birthday"
                }
              />

              <div className="reference-birthday-photo-shine" />

            </div>

          </div>
        )}

      {/* Birthday message card */}
      <div className="reference-birthday-card">

        <span className="reference-birthday-card-label">
          A LITTLE NOTE ♡
        </span>

        <p>
          {birthdayPage?.content ||
            universe.description ||
            `Today is a little celebration of you and all the wonderful moments that make you special.`}
        </p>

      </div>

      {/* Continue */}
      <button
        type="button"
        className="reference-primary-button reference-birthday-button"
        onClick={continueFromBirthday}
      >
        keep going →
      </button>

      {/* Footer */}
      <div className="reference-birthday-footer">
        <span>♡</span>
        <span>chapter 02</span>
        <span>♡</span>
      </div>

    </div>

  </section>
)}

      {/* -----------------------------------
          REASONS
      ----------------------------------- */}

   {step === "reasons" && (
  <section className="reference-reasons-scene">

    {/* Ambient glow */}
    <div className="reference-reasons-glow reasons-glow-one" />
    <div className="reference-reasons-glow reasons-glow-two" />

    {/* Floating glass objects */}
    <div className="reference-reasons-orb reasons-orb-one" />
    <div className="reference-reasons-orb reasons-orb-two" />

    {/* Floating symbols */}
    <div className="reference-reasons-symbols">
      <span>♡</span>
      <span>✦</span>
      <span>✧</span>
      <span>♡</span>
      <span>·</span>
      <span>✦</span>
      <span>♡</span>
    </div>

    <div className="reference-reasons-content">

      {/* Chapter */}
      <span className="reference-reasons-chapter">
        CHAPTER 03
      </span>

      {/* Heading */}
      <h1 className="reference-reasons-title">
        Everything I love
        <br />
        about You ♡
      </h1>

      <p className="reference-reasons-intro">
        Some things are too special to fit
        into just a few words.
      </p>

      {/* Reasons */}
      <div className="reference-reasons-grid">

        <article className="reference-reason-card">
          <span className="reference-reason-number">
            01
          </span>

          <div className="reference-reason-icon">
            ♡
          </div>

          <h2>Your heart</h2>

          <p>
            The little things you do,
            the way you care, and the
            kindness you carry with you.
          </p>
        </article>

        <article className="reference-reason-card">
          <span className="reference-reason-number">
            02
          </span>

          <div className="reference-reason-icon">
            ✦
          </div>

          <h2>Your laugh</h2>

          <p>
            Those tiny moments of happiness
            that somehow make everything
            around you feel brighter.
          </p>
        </article>

        <article className="reference-reason-card">
          <span className="reference-reason-number">
            03
          </span>

          <div className="reference-reason-icon">
            ✧
          </div>

          <h2>Your kindness</h2>

          <p>
            The warmth you give to people
            without even realizing how
            meaningful it can be.
          </p>
        </article>

        <article className="reference-reason-card">
          <span className="reference-reason-number">
            04
          </span>

          <div className="reference-reason-icon">
            ♡
          </div>

          <h2>Simply you</h2>

          <p>
            No big reason needed.
            Being exactly who you are
            is already something special.
          </p>
        </article>

      </div>

      {/* Caption */}
      <div className="reference-reasons-caption">
        <span>♡</span>

        <p>
          and these are only a few...
        </p>

        <span>♡</span>
      </div>

      {/* Continue */}
      <button
        type="button"
        className="reference-primary-button reference-reasons-button"
        onClick={continueFromReasons}
      >
        there's more →
      </button>

      {/* Footer */}
      <div className="reference-reasons-footer">
        <span>♡</span>
        <span>chapter 03</span>
        <span>♡</span>
      </div>

    </div>

  </section>
)}

     {/* -----------------------------------
    FAVOURITE THINGS
----------------------------------- */}

{step === "favourite" &&
  favouritePage &&
  favouriteThings.length > 0 && (
    <section className="reference-favourite-scene">

      {/* Ambient glow */}
      <div className="reference-favourite-glow favourite-glow-one" />
      <div className="reference-favourite-glow favourite-glow-two" />
      <div className="reference-favourite-glow favourite-glow-three" />

      {/* Floating glass objects */}
      <div className="reference-favourite-orb favourite-orb-one" />
      <div className="reference-favourite-orb favourite-orb-two" />

      {/* Floating symbols */}
      <div className="reference-favourite-symbols">
        <span>♡</span>
        <span>✦</span>
        <span>✧</span>
        <span>♡</span>
        <span>·</span>
        <span>✦</span>
        <span>♡</span>
      </div>

      <div className="reference-favourite-content">

        {/* Chapter */}
        <span className="reference-favourite-chapter">
          CHAPTER 04
        </span>

        {/* Heading */}
        <h1 className="reference-favourite-title">
          A few things
          <br />
          that feel like you ♡
        </h1>

        <p className="reference-favourite-intro">
          Little favourites,
          <br />
          tiny details, and things worth remembering.
        </p>

        {/* Favourite cards */}
        <div className="reference-favourite-grid">

          {favouriteThings.map(
            (item, index) => (
              <article
                key={`${item.title || "favourite"}-${index}`}
                className="reference-favourite-card"
              >

                <span className="reference-favourite-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="reference-favourite-icon">
                  {index % 3 === 0
                    ? "♡"
                    : index % 3 === 1
                    ? "✦"
                    : "✧"}
                </div>

                <h2>
                  {item.title ||
                    `Favourite ${index + 1}`}
                </h2>

                <p>
                  {item.value ||
                    item.text ||
                    item.description ||
                    ""}
                </p>

              </article>
            )
          )}

        </div>

        {/* Caption */}
        <div className="reference-favourite-caption">
          <span>♡</span>

          <p>
            little things make the story special
          </p>

          <span>♡</span>
        </div>

        {/* Continue */}
        <button
          type="button"
          className="reference-primary-button reference-favourite-button"
         onClick={continueFromFavourite}
        >
          one more thing → 
        </button>

        {/* Footer */}
        <div className="reference-favourite-footer">
          <span>♡</span>
        <span>chapter 06</span>
          <span>♡</span>
        </div>

      </div>

    </section>
  )}

  {/* -----------------------------------
    QUOTES
----------------------------------- */}

{step === "quotes" &&
  quotePages.length > 0 && (
    <section className="reference-quotes-scene">

      <div className="reference-quotes-glow quotes-glow-one" />
      <div className="reference-quotes-glow quotes-glow-two" />
      <div className="reference-quotes-glow quotes-glow-three" />

      <div className="reference-quotes-orb quotes-orb-one" />
      <div className="reference-quotes-orb quotes-orb-two" />

      <div className="reference-quotes-symbols">
        <span>“</span>
        <span>♡</span>
        <span>✦</span>
        <span>”</span>
        <span>✧</span>
      </div>

      <div className="reference-quotes-content">

        <span className="reference-quotes-chapter">
          CHAPTER 07
        </span>

        <h1 className="reference-quotes-title">
          little words
          <br />
          worth keeping ♡
        </h1>

        <p className="reference-quotes-intro">
          Some things are too lovely
          <br />
          to say only once.
        </p>

        <div className="reference-quotes-list">

          {quotePages.map((page, index) => (
            <article
              key={page.id}
              className="reference-quote-card"
            >

              <span className="reference-quote-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="reference-quote-mark">
                “
              </div>

              <h2>
                {page.title || "A little thought ♡"}
              </h2>

              <p>
                {page.content || ""}
              </p>

              <div className="reference-quote-bottom">
                <span>♡</span>
                <span>✦</span>
                <span>♡</span>
              </div>

            </article>
          ))}

        </div>

        <button
          type="button"
          className="reference-primary-button reference-quotes-button"
          onClick={() => {
            if (timelinePages.length > 0) {
              setStep("timeline");
              return;
            }

            if (letterPage) {
              setStep("letter");
              return;
            }

            setStep("surprises");
          }}
        >
          keep the story going →
        </button>

        <div className="reference-quotes-footer">
          <span>♡</span>
          <span>chapter 05</span>
          <span>♡</span>
        </div>

      </div>

    </section>
  )}
      {/* -----------------------------------
          LETTER
      ----------------------------------- */}

   {/* -----------------------------------
    LETTER — CINEMATIC SCENE
----------------------------------- */}

{step === "letter" && letterPage && (
  <section className="reference-letter-scene">

    {/* Ambient pink light */}
    <div className="reference-letter-glow letter-glow-one" />
    <div className="reference-letter-glow letter-glow-two" />
    <div className="reference-letter-glow letter-glow-three" />

    {/* Floating glass objects */}
    <div className="reference-letter-orb letter-orb-one" />
    <div className="reference-letter-orb letter-orb-two" />
    <div className="reference-letter-orb letter-orb-three" />

    {/* Floating symbols */}
    <div className="reference-letter-symbols">
      <span>♡</span>
      <span>✦</span>
      <span>✧</span>
      <span>♡</span>
      <span>·</span>
      <span>✦</span>
    </div>

    <div className="reference-letter-content">

      {/* Chapter */}
      <span className="reference-letter-chapter">
        CHAPTER 07
      </span>

      {/* Main heading */}
      <h1 className="reference-letter-title">
        a little letter
        <br />
        just for you ♡
      </h1>

      <p className="reference-letter-intro">
        Some things are easier to write
        <br />
        than they are to say.
      </p>

      {/* Letter paper */}
      <article className="reference-letter-paper">

        <div className="reference-letter-paper-shine" />

        <div className="reference-letter-paper-top">
          <span>♡</span>
          <span>A LITTLE NOTE</span>
          <span>♡</span>
        </div>

        <div className="reference-letter-paper-body">

          <p className="reference-letter-greeting">
            Dear {universe.person_name || "you"} ♡
          </p>

          <div className="reference-letter-text">
            {creatorLetter ? (
              creatorLetter
                .split(/\n\s*\n/)
                .map((paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                ))
            ) : (
              <>
                <p>
                  I wanted to leave you a little
                  something here.
                </p>

                <p>
                  A tiny reminder of all the
                  beautiful moments, little laughs,
                  and memories that make this story
                  special.
                </p>

                <p>
                  I hope whenever you come back to
                  this little universe, it makes you
                  smile. ♡
                </p>
              </>
            )}
          </div>

          <div className="reference-letter-signature">
            with a little love ♡
          </div>

        </div>

        <div className="reference-letter-paper-bottom">
          <span>✦</span>
          <span>made especially for you</span>
          <span>✦</span>
        </div>

      </article>

      {/* Continue */}
      <button
        type="button"
        className="reference-primary-button reference-letter-button"
        onClick={continueFromLetter}
      >
        one more thing →
      </button>

      {/* Footer */}
      <div className="reference-letter-footer">
        <span>♡</span>
        <span>chapter 07</span>
        <span>♡</span>
      </div>

    </div>

  </section>
)}

   {/* ----------------------------------- 
    SURPRISES 
----------------------------------- */}

<div className="surprise-collection-grid">

  <button
    type="button"
    className="surprise-collection-item"
    onClick={() => openSurprise("memories")}
  >
    <img
      src="/surprise/icons/memories.png"
      alt="Memories"
    />

    <span>Memories</span>
  </button>


  <button
    type="button"
    className="surprise-collection-item"
    onClick={() => openSurprise("letter")}
  >
    <img
      src="/surprise/icons/letter.png"
      alt="Letter"
    />

    <span>Letter</span>
  </button>


  <button
    type="button"
    className="surprise-collection-item"
    onClick={() => openSurprise("flowers")}
  >
    <img
      src="/surprise/icons/flowers.png"
      alt="Flowers"
    />

    <span>Flowers</span>
  </button>


  <button
    type="button"
    className="surprise-collection-item"
    onClick={() => openSurprise("surprise")}
  >
    <img
      src="/surprise/icons/surprise.png"
      alt="Surprise"
    />

    <span>Surprise</span>
  </button>


  <button
    type="button"
    className="surprise-collection-item"
    onClick={() => openSurprise("secret")}
  >
    <img
      src="/surprise/icons/secret.png"
      alt="Secret"
    />

    <span>Secret</span>
  </button>


  <button
    type="button"
    className="surprise-collection-item"
    onClick={() => openSurprise("music")}
  >
    <img
      src="/surprise/icons/music.png"
      alt="Music"
    />

    <span>Music</span>
  </button>

</div>

{/* -----------------------------------
    FINAL
----------------------------------- */}

{step === "final" && (
  <section className="reference-final-scene">

    {/* Ambient glow */}
    <div className="reference-final-glow final-glow-one" />
    <div className="reference-final-glow final-glow-two" />
    <div className="reference-final-glow final-glow-three" />

    {/* Floating glass objects */}
    <div className="reference-final-orb final-orb-one" />
    <div className="reference-final-orb final-orb-two" />

    {/* Floating symbols */}
    <div className="reference-final-symbols">
      <span>♡</span>
      <span>✦</span>
      <span>✧</span>
      <span>♡</span>
      <span>✦</span>
      <span>·</span>
      <span>♡</span>
      <span>✧</span>
    </div>

    <div className="reference-final-content">

      <span className="reference-final-eyebrow">
        ✦ ONE LAST THING ✦
      </span>

      <div className="reference-final-cake">
        🎂
      </div>

      <h1 className="reference-final-title">
        before you
        <br />
        go... ♡
      </h1>

      <p className="reference-final-intro">
        There&apos;s one more little surprise.
        <br />
        So take a tiny moment for yourself.
      </p>

      {/* Wish card */}
      <div className="reference-final-card">

        <div className="reference-final-card-shine" />

        <span className="reference-final-card-label">
          A LITTLE WISH
        </span>

        <div className="reference-final-wish-icon">
          ✦
        </div>

        <h2>
          Make a little wish
        </h2>

        <p>
          Close your eyes for a moment,
          <br />
          think of something wonderful,
          <br />
          and make your wish. ♡
        </p>

        <button
          type="button"
          className="reference-primary-button reference-final-wish-button"
          onClick={() => {
            setShowMusicPanel(false);

            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("universe-wish")
              );
            }
          }}
        >
          make a wish ✦
        </button>

      </div>

      {/* Reveal */}
      <div className="reference-final-reveal">

        <span className="reference-final-reveal-label">
          BIRTHDAY REVEAL
        </span>

        <div className="reference-final-reveal-icon">
          🎂
        </div>

        <h2>
          {finalPage?.title ||
            `Happy Birthday ${universe.person_name || "beautiful"} ♡`}
        </h2>

        <p>
          {creatorFinalMessage ||
            finalPage?.content ||
            universe.description ||
            "May this little universe leave you with a happy little memory. ♡"}
        </p>

        {finalPage &&
          getPageImages(finalPage).length > 0 && (
            <div className="reference-final-image">
              <img
                src={
                  getPageImages(finalPage)[0]
                    .public_url || ""
                }
                alt="Final reveal"
              />
            </div>
          )}

        <div className="reference-final-confetti">
          <span>✦</span>
          <span>✧</span>
          <span>♡</span>
          <span>✦</span>
          <span>✧</span>
          <span>♡</span>
          <span>✦</span>
        </div>

        <p className="reference-final-signature">
          Made with a little bit of
          <br />
          happiness & lots of memories. ♡
        </p>

      </div>

      <div className="reference-final-footer">
        <span>♡</span>
        <span>the end... or maybe not</span>
        <span>♡</span>
      </div>

    </div>

  </section>
)}

      {/* -----------------------------------
          SURPRISE MODAL
      ----------------------------------- */}

     {surpriseModal && (
  <div
    className="reference-surprise-overlay"
    onClick={(event) => {
      if (event.target === event.currentTarget) {
        closeSurprise();
      }
    }}
  >
    <div className="reference-surprise-modal">

      {/* ambient background */}
      <div className="reference-modal-glow modal-glow-one" />
      <div className="reference-modal-glow modal-glow-two" />

      <button
        type="button"
        className="reference-modal-close"
        onClick={closeSurprise}
        aria-label="Close surprise"
      >
        ×
      </button>

      {/* ================= MEMORIES ================= */}

      {surpriseModal === "memories" && (
        <div className="reference-modal-content">

          <span className="reference-modal-eyebrow">
            ✦ LITTLE MEMORIES ✦
          </span>

          <div className="reference-modal-icon">
            ♡
          </div>

          <h2>
            Our little memories ♡
          </h2>

          <p className="reference-modal-intro">
            Tiny moments that became
            <br />
            some of the sweetest memories.
          </p>

          {memoryImages.length > 0 ? (
            <div className="reference-memory-modal-grid">
              {memoryImages.map((image, index) => (
                <div
                  className="reference-memory-modal-card"
                  key={image.id || `${image.public_url}-${index}`}
                >
                  <div className="reference-memory-modal-image">
                    <img
                      src={image.public_url || ""}
                      alt={`Memory ${index + 1}`}
                    />
                  </div>

                  <span>
                    memory {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="reference-empty-modal">
              <span>♡</span>
              <p>
                A few little memories
                <br />
                are waiting to be added.
              </p>
            </div>
          )}

          <div className="reference-modal-caption">
            <span>♡</span>
            <span>made of tiny moments</span>
            <span>♡</span>
          </div>

        </div>
      )}

      {/* ================= LETTER ================= */}

      {surpriseModal === "letter" && (
        <div className="reference-modal-content">

          <span className="reference-modal-eyebrow">
            ✦ A LITTLE LETTER ✦
          </span>

          <div className="reference-modal-icon">
            💌
          </div>

          <h2>
            A little letter ♡
          </h2>

          <p className="reference-modal-intro">
            Something small,
            <br />
            written just for you.
          </p>

          <div className="reference-letter-modal-paper">

            <div className="reference-letter-modal-shine" />

            <p className="reference-letter-greeting">
              Dear {universe.person_name || "you"} ♡
            </p>

            <div className="reference-letter-modal-text">
              {(creatorLetter ||
                letterPage?.content ||
                universe.opening_message ||
                "Some words are meant to be kept close.") 
                .split(/\n+/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                ))}
            </div>

            <p className="reference-letter-signature">
              With lots of little happiness ♡
            </p>

          </div>

        </div>
      )}

      {/* ================= FLOWERS ================= */}

      {surpriseModal === "flowers" && (
        <div className="reference-modal-content">

          <span className="reference-modal-eyebrow">
            ✦ A LITTLE SOMETHING ✦
          </span>

          <div className="reference-modal-icon">
            🌷
          </div>

          <h2>
            A few flowers ♡
          </h2>

          <p className="reference-modal-intro">
            Because sometimes a tiny bouquet
            <br />
            is all a moment needs.
          </p>

          <div className="reference-flower-modal">

            <div className="reference-flower">
              🌷
            </div>

            <div className="reference-flower">
              🌸
            </div>

            <div className="reference-flower">
              🌹
            </div>

            <div className="reference-flower">
              🌼
            </div>

            <div className="reference-flower">
              🌷
            </div>

          </div>

          <div className="reference-flower-message">
            <span>♡</span>
            <p>
              A little happiness,
              <br />
              wrapped up just for you.
            </p>
            <span>♡</span>
          </div>

        </div>
      )}

      {/* ================= SURPRISE ================= */}

      {surpriseModal === "surprise" && (
        <div className="reference-modal-content">

          <span className="reference-modal-eyebrow">
            ✦ A LITTLE SURPRISE ✦
          </span>

          <div className="reference-modal-icon">
            🐥
          </div>

          <h2>
            Look what I found ♡
          </h2>

          <p className="reference-modal-intro">
            One tiny unexpected thing
            <br />
            just to make you smile.
          </p>

          {surprisePage &&
          getPageImages(surprisePage).length > 0 ? (
            <div className="reference-surprise-media">

              <img
                src={
                  getPageImages(surprisePage)[0]
                    .public_url || ""
                }
                alt="Little surprise"
              />

            </div>
          ) : (
            <div className="reference-surprise-box">

              <div className="reference-surprise-box-ribbon">
                ♡
              </div>

              <div className="reference-surprise-box-icon">
                🎁
              </div>

              <span>
                A LITTLE SOMETHING
              </span>

            </div>
          )}

          {creatorSurprise && (
            <p className="reference-surprise-message">
              {creatorSurprise}
            </p>
          )}

        </div>
      )}

      {/* ================= SECRET ================= */}

      {surpriseModal === "secret" && (
        <div className="reference-modal-content">

          <span className="reference-modal-eyebrow">
            ✦ ONE LITTLE SECRET ✦
          </span>

          <div className="reference-modal-icon">
            🔐
          </div>

          <h2>
            You found it ♡
          </h2>

          <p className="reference-modal-intro">
            Some little things are better
            <br />
            when they stay between two hearts.
          </p>

          {secretPage &&
          getPageImages(secretPage).length > 0 ? (
            <div className="reference-secret-media">

              <img
                src={
                  getPageImages(secretPage)[0]
                    .public_url || ""
                }
                alt="Secret"
              />

            </div>
          ) : (
            <div className="reference-secret-card">

              <span>
                ✦
              </span>

              <p>
                This little secret
                <br />
                belongs here. ♡
              </p>

            </div>
          )}

          {creatorSecret && (
            <p className="reference-secret-message">
              {creatorSecret}
            </p>
          )}

        </div>
      )}

      {/* ================= MUSIC ================= */}

      {surpriseModal === "music" && (
        <div className="reference-modal-content">

          <span className="reference-modal-eyebrow">
            ✦ A LITTLE SONG ✦
          </span>

          <div className="reference-modal-icon">
            🎵
          </div>

          <h2>
            A song for you ♡
          </h2>

          <p className="reference-modal-intro">
            Press play and let this little
            <br />
            moment stay for a while.
          </p>

         {surpriseMusic ? (
  <div className="reference-music-card">

    <div className="reference-music-disc">
      ♪
    </div>

    <div className="reference-music-info">
      <span>
        LITTLE SURPRISE
      </span>

      <strong>
  {surpriseMusic.metadata &&
  typeof surpriseMusic.metadata === "object" &&
  "name" in surpriseMusic.metadata
    ? String(surpriseMusic.metadata.name)
    : "A little song for you ♡"}
</strong>
</div>

{surpriseMusic.public_url ? (
  <audio
    controls
    autoPlay
    src={surpriseMusic.public_url}
    className="reference-music-player"
  />
) : (
  <p className="reference-music-unavailable">
    Music file is not available.
  </p>
)}

  </div>
) : (    
          <div className="reference-empty-modal">

              <span>
                🎵
              </span>

              <p>
                No surprise music was added
                <br />
                to this universe.
              </p>

            </div>
          )}

        </div>
      )}

    </div>
  </div>
)}

      {/* -----------------------------------
          EXTRA CONTENT
          Quotes / Timeline / Custom
          are displayed after the main
          surprise flow when applicable.
      ----------------------------------- */}

     
        {/* -----------------------------------
    TIMELINE
----------------------------------- */}

{step === "timeline" &&
  timelinePages.length > 0 && (
    <section className="reference-timeline-scene">

      <div className="reference-timeline-glow timeline-glow-one" />
      <div className="reference-timeline-glow timeline-glow-two" />
      <div className="reference-timeline-glow timeline-glow-three" />

      <div className="reference-timeline-orb timeline-orb-one" />
      <div className="reference-timeline-orb timeline-orb-two" />

      <div className="reference-timeline-symbols">
        <span>♡</span>
        <span>✦</span>
        <span>·</span>
        <span>✧</span>
        <span>♡</span>
      </div>

      <div className="reference-timeline-content">

        <span className="reference-timeline-chapter">
          CHAPTER 06
        </span>

        <h1 className="reference-timeline-title">
          little moments
          <br />
          along the way ♡
        </h1>

        <p className="reference-timeline-intro">
          Every little moment
          <br />
          became part of the story.
        </p>

        <div className="reference-timeline-list">

          {timelinePages.map((page, index) => (
            <article
              key={page.id}
              className="reference-timeline-item"
            >

              <div className="reference-timeline-dot">
                <span />
              </div>

              <div className="reference-timeline-card">

                <span className="reference-timeline-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h2>
                  {page.title || `Moment ${index + 1}`}
                </h2>

                <p>
                  {page.content || ""}
                </p>

              </div>

            </article>
          ))}

        </div>

        <button
          type="button"
          className="reference-primary-button reference-timeline-button"
          onClick={() => {
            if (letterPage) {
              setStep("letter");
              return;
            }

            setStep("surprises");
          }}
        >
          one more thing →
        </button>

        <div className="reference-timeline-footer">
          <span>♡</span>
          <span>chapter 06</span>
          <span>♡</span>
        </div>

      </div>

    </section>
  )}

     
      {/* -----------------------------------
          MUSIC PANEL
      ----------------------------------- */}

      {showMusicPanel && (
        <div
          className="reference-modal-backdrop"
          onClick={() =>
            setShowMusicPanel(
              false
            )
          }
        >
          <div
            className="reference-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="reference-modal-close"
              onClick={() =>
                setShowMusicPanel(
                  false
                )
              }
            >
              ×
            </button>

            <span className="reference-eyebrow">
              MUSIC
            </span>

            <h2>
              Your universe
              soundtrack ♫
            </h2>

            <button
              type="button"
              className="reference-primary-button"
              onClick={
                toggleMusic
              }
            >
              {musicPlaying
                ? "Pause Music"
                : "Play Music"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}