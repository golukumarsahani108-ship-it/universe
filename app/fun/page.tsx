"use client";

import { useEffect, useMemo, useState } from "react";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassBadge from "@/component/glass/GlassBadge";

type Mode =
  | "quick"
  | "think"
  | "create"
  | "laugh"
  | "play"
  | "random";

type Activity = {
  id: string;
  title: string;
  description: string;
  icon: string;
  mode: Mode;
  duration: string;
  points: number;
};

type SavedActivity = Activity & {
  savedAt: number;
};

const STORAGE_KEY = "my-little-universe-fun-v3";
const SCORE_KEY = "my-little-universe-fun-score-v3";

const activities: Activity[] = [
  {
    id: "quick-1",
    title: "30 Second Reset",
    description:
      "Look around and find 3 things you like about your surroundings.",
    icon: "⚡",
    mode: "quick",
    duration: "30 sec",
    points: 5,
  },
  {
    id: "quick-2",
    title: "Tiny Adventure",
    description:
      "Walk to another room and find something you have not noticed before.",
    icon: "🗺️",
    mode: "quick",
    duration: "1 min",
    points: 5,
  },
  {
    id: "quick-3",
    title: "Speed Sketch",
    description:
      "Draw the first object you see. You only get 60 seconds.",
    icon: "✏️",
    mode: "quick",
    duration: "1 min",
    points: 8,
  },
  {
    id: "quick-4",
    title: "Music Moment",
    description:
      "Put on one favorite song and simply enjoy it without multitasking.",
    icon: "🎧",
    mode: "quick",
    duration: "3 min",
    points: 8,
  },

  {
    id: "think-1",
    title: "Impossible Choice",
    description:
      "Would you rather explore the deepest ocean or the farthest space?",
    icon: "🧠",
    mode: "think",
    duration: "2 min",
    points: 10,
  },
  {
    id: "think-2",
    title: "Invent Something",
    description:
      "Imagine a gadget that would make one annoying daily task easier.",
    icon: "💡",
    mode: "think",
    duration: "5 min",
    points: 12,
  },
  {
    id: "think-3",
    title: "Future You",
    description:
      "Imagine your perfect ordinary day five years from now.",
    icon: "🔮",
    mode: "think",
    duration: "5 min",
    points: 12,
  },
  {
    id: "think-4",
    title: "Mystery Question",
    description:
      "If you could instantly become amazing at one skill, what would it be?",
    icon: "❓",
    mode: "think",
    duration: "2 min",
    points: 8,
  },

  {
    id: "create-1",
    title: "Make a Mini Story",
    description:
      "Start with: “The door opened, but nobody was there...”",
    icon: "📖",
    mode: "create",
    duration: "5 min",
    points: 15,
  },
  {
    id: "create-2",
    title: "Design a World",
    description:
      "Create a tiny imaginary world. Give it a name, rule and secret.",
    icon: "🌍",
    mode: "create",
    duration: "5 min",
    points: 15,
  },
  {
    id: "create-3",
    title: "Logo Challenge",
    description:
      "Invent a logo for a completely imaginary company.",
    icon: "🎨",
    mode: "create",
    duration: "5 min",
    points: 15,
  },
  {
    id: "create-4",
    title: "Random Character",
    description:
      "Create a character using three random traits: curious, funny and brave.",
    icon: "🧑‍🎨",
    mode: "create",
    duration: "5 min",
    points: 12,
  },

  {
    id: "laugh-1",
    title: "Dad Joke Mode",
    description:
      "Why did the computer go to the doctor? Because it had a byte problem. 😄",
    icon: "😂",
    mode: "laugh",
    duration: "30 sec",
    points: 5,
  },
  {
    id: "laugh-2",
    title: "Make Yourself Laugh",
    description:
      "Invent the most ridiculous superhero name you can think of.",
    icon: "🤣",
    mode: "laugh",
    duration: "1 min",
    points: 7,
  },
  {
    id: "laugh-3",
    title: "Funny Caption",
    description:
      "Imagine a cat sitting at a laptop. Write its caption.",
    icon: "🐱",
    mode: "laugh",
    duration: "2 min",
    points: 8,
  },

  {
    id: "play-1",
    title: "This or That",
    description:
      "Choose one: unlimited books 📚 or unlimited games 🎮?",
    icon: "🎮",
    mode: "play",
    duration: "1 min",
    points: 5,
  },
  {
    id: "play-2",
    title: "Number Mystery",
    description:
      "Think of a number from 1–20. Can you guess it before your brain changes its mind?",
    icon: "🔢",
    mode: "play",
    duration: "2 min",
    points: 8,
  },
  {
    id: "play-3",
    title: "Object Hunt",
    description:
      "Find something nearby that starts with the letter “S”.",
    icon: "🔎",
    mode: "play",
    duration: "1 min",
    points: 6,
  },
  {
    id: "play-4",
    title: "Emoji Movie",
    description:
      "Describe your favorite movie using only 5 emojis.",
    icon: "🎬",
    mode: "play",
    duration: "2 min",
    points: 10,
  },
];

const modeOptions: {
  id: Mode;
  label: string;
  icon: string;
}[] = [
  { id: "random", label: "Random", icon: "🌈" },
  { id: "quick", label: "Quick", icon: "⚡" },
  { id: "think", label: "Think", icon: "🧠" },
  { id: "create", label: "Create", icon: "🎨" },
  { id: "laugh", label: "Laugh", icon: "😂" },
  { id: "play", label: "Play", icon: "🎮" },
];

const modeLabels: Record<Mode, string> = {
  random: "Random",
  quick: "Quick",
  think: "Think",
  create: "Create",
  laugh: "Laugh",
  play: "Play",
};

export default function FunPage() {
  const [selectedMode, setSelectedMode] = useState<Mode>("random");
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(
    null
  );
  const [saved, setSaved] = useState<SavedActivity[]>([]);
  const [score, setScore] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed.saved)) {
          setSaved(parsed.saved);
        }

        if (Array.isArray(parsed.completedIds)) {
          setCompletedIds(parsed.completedIds);
        }
      }

      const storedScore = localStorage.getItem(SCORE_KEY);

      if (storedScore) {
        setScore(Number(storedScore) || 0);
      }
    } catch {
      console.log("Fun settings could not be loaded.");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        saved,
        completedIds,
      })
    );
  }, [saved, completedIds]);

  useEffect(() => {
    localStorage.setItem(SCORE_KEY, String(score));
  }, [score]);

  const availableActivities = useMemo(() => {
    if (selectedMode === "random") {
      return activities;
    }

    return activities.filter(
      (activity) => activity.mode === selectedMode
    );
  }, [selectedMode]);

  const savedIds = useMemo(
    () => new Set(saved.map((item) => item.id)),
    [saved]
  );

  const completedCount = completedIds.length;

  const pickActivity = () => {
    if (!availableActivities.length) {
      return;
    }

    let candidates = availableActivities.filter(
      (activity) => activity.id !== currentActivity?.id
    );

    if (!candidates.length) {
      candidates = availableActivities;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);

    setCurrentActivity(candidates[randomIndex]);
    setCopied(false);
  };

  const completeActivity = () => {
    if (!currentActivity) {
      return;
    }

    if (!completedIds.includes(currentActivity.id)) {
      setCompletedIds((current) => [...current, currentActivity.id]);
      setScore((current) => current + currentActivity!.points);
    }

    pickActivity();
  };

  const toggleSave = () => {
    if (!currentActivity) {
      return;
    }

    const exists = saved.some(
      (item) => item.id === currentActivity.id
    );

    if (exists) {
      setSaved((current) =>
        current.filter((item) => item.id !== currentActivity.id)
      );
      return;
    }

    setSaved((current) => [
      {
        ...currentActivity,
        savedAt: Date.now(),
      },
      ...current,
    ]);
  };

  const removeSaved = (id: string) => {
    setSaved((current) => current.filter((item) => item.id !== id));
  };

  const useSavedActivity = (activity: Activity) => {
    setCurrentActivity(activity);
    setShowSaved(false);
    setCopied(false);
  };

  const shareActivity = async () => {
    if (!currentActivity) {
      return;
    }

    const text = `${currentActivity.icon} ${currentActivity.title}\n${currentActivity.description}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: currentActivity.title,
          text,
        });
        return;
      }

      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setCopied(false);
    }
  };

  const modeTitle =
    selectedMode === "random"
      ? "Something Fun"
      : `${modeLabels[selectedMode]} Mode`;

  return (
    <PageShell
      eyebrow="FUN ZONE"
      title="Bored? Let's fix that. ✨"
      description="Pick a vibe and let your little universe give you something fun to do."
    >
      <div className="fun-layout">
        {/* HERO / RANDOMIZER */}
        <GlassCard className="fun-hero">
          <div className="fun-hero-glow" />

          <div className="fun-hero-content">
            <div className="fun-hero-top">
              <GlassBadge>✨ Boredom Killer</GlassBadge>

              <button
                type="button"
                className="fun-saved-button"
                onClick={() => setShowSaved((current) => !current)}
              >
                ⭐ Saved
                {saved.length > 0 && (
                  <span>{saved.length}</span>
                )}
              </button>
            </div>

            <div className="fun-hero-title">
              <span className="fun-big-emoji">
                {currentActivity?.icon ?? "😴"}
              </span>

              <div>
                <p className="fun-mini-label">
                  {currentActivity ? "YOUR NEXT THING" : "NOTHING TO DO?"}
                </p>

                <h2>
                  {currentActivity
                    ? currentActivity.title
                    : "Give Me Something To Do"}
                </h2>
              </div>
            </div>

            <p className="fun-hero-description">
              {currentActivity
                ? currentActivity.description
                : "No scrolling. No overthinking. Just press the button and discover a tiny adventure."}
            </p>

            {currentActivity && (
              <div className="fun-activity-meta">
                <GlassBadge>
                  {currentActivity.duration}
                </GlassBadge>

                <GlassBadge>
                  +{currentActivity.points} points
                </GlassBadge>

                <GlassBadge>
                  {modeLabels[currentActivity.mode]}
                </GlassBadge>
              </div>
            )}

            <div className="fun-hero-actions">
              <GlassButton
                active
                onClick={pickActivity}
                className="fun-main-button"
              >
                {currentActivity
                  ? "🎲 Give Me Another"
                  : "✨ Give Me Something To Do"}
              </GlassButton>

              {currentActivity && (
                <>
                  <GlassButton
                    onClick={completeActivity}
                    className="fun-complete-button"
                  >
                    ✓ Done
                  </GlassButton>

                  <button
                    type="button"
                    className={`fun-icon-button ${
                      currentActivity &&
                      savedIds.has(currentActivity.id)
                        ? "fun-icon-button-active"
                        : ""
                    }`}
                    onClick={toggleSave}
                    title="Save for later"
                    aria-label="Save for later"
                  >
                    {savedIds.has(currentActivity.id) ? "⭐" : "☆"}
                  </button>

                  <button
                    type="button"
                    className="fun-icon-button"
                    onClick={shareActivity}
                    title="Share"
                    aria-label="Share activity"
                  >
                    {copied ? "✓" : "↗"}
                  </button>
                </>
              )}
            </div>
          </div>
        </GlassCard>

        {/* MODE SELECTOR */}
        <section className="fun-section">
          <div className="fun-section-heading">
            <div>
              <span className="eyebrow">CHOOSE YOUR VIBE</span>
              <h2>What do you feel like doing?</h2>
            </div>

            <span className="fun-section-count">
              {availableActivities.length} ideas
            </span>
          </div>

          <div className="fun-mode-grid">
            {modeOptions.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`fun-mode-card ${
                  selectedMode === mode.id
                    ? "fun-mode-card-active"
                    : ""
                }`}
                onClick={() => {
                  setSelectedMode(mode.id);
                  setCurrentActivity(null);
                  setCopied(false);
                }}
              >
                <span className="fun-mode-icon">{mode.icon}</span>
                <strong>{mode.label}</strong>

                {mode.id === "random" && (
                  <small>Surprise me</small>
                )}

                {mode.id === "quick" && (
                  <small>Under 3 min</small>
                )}

                {mode.id === "think" && (
                  <small>Use your brain</small>
                )}

                {mode.id === "create" && (
                  <small>Make something</small>
                )}

                {mode.id === "laugh" && (
                  <small>Have a laugh</small>
                )}

                {mode.id === "play" && (
                  <small>Let's play</small>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="fun-section">
          <div className="fun-section-heading">
            <div>
              <span className="eyebrow">QUICK PICKS</span>
              <h2>Pick one and go 🚀</h2>
            </div>
          </div>

          <div className="fun-quick-grid">
            {activities.slice(0, 4).map((activity) => (
              <button
                key={activity.id}
                type="button"
                className="fun-quick-card"
                onClick={() => useSavedActivity(activity)}
              >
                <span>{activity.icon}</span>

                <div>
                  <strong>{activity.title}</strong>
                  <small>{activity.duration}</small>
                </div>

                <span className="fun-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="fun-stats-grid">
          <GlassCard className="fun-stat-card">
            <span className="fun-stat-icon">🔥</span>
            <div>
              <strong>{score}</strong>
              <span>Fun Points</span>
            </div>
          </GlassCard>

          <GlassCard className="fun-stat-card">
            <span className="fun-stat-icon">🎯</span>
            <div>
              <strong>{completedCount}</strong>
              <span>Activities Done</span>
            </div>
          </GlassCard>

          <GlassCard className="fun-stat-card">
            <span className="fun-stat-icon">⭐</span>
            <div>
              <strong>{saved.length}</strong>
              <span>Saved Ideas</span>
            </div>
          </GlassCard>
        </section>

        {/* SAVED */}
        {showSaved && (
          <GlassCard className="fun-saved-panel">
            <div className="fun-section-heading">
              <div>
                <span className="eyebrow">YOUR COLLECTION</span>
                <h2>Saved for later ⭐</h2>
              </div>

              <button
                type="button"
                className="fun-close-button"
                onClick={() => setShowSaved(false)}
              >
                ×
              </button>
            </div>

            {saved.length === 0 ? (
              <div className="fun-empty">
                <span>⭐</span>
                <strong>Nothing saved yet</strong>
                <p>
                  When you find something you want to do later,
                  save it here.
                </p>
              </div>
            ) : (
              <div className="fun-saved-list">
                {saved.map((activity) => (
                  <div
                    key={`${activity.id}-${activity.savedAt}`}
                    className="fun-saved-item"
                  >
                    <button
                      type="button"
                      className="fun-saved-main"
                      onClick={() => useSavedActivity(activity)}
                    >
                      <span>{activity.icon}</span>

                      <div>
                        <strong>{activity.title}</strong>
                        <small>{activity.duration}</small>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="fun-remove-saved"
                      onClick={() => removeSaved(activity.id)}
                      aria-label={`Remove ${activity.title}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* BOTTOM CTA */}
        <GlassCard className="fun-bottom-card">
          <span className="fun-bottom-icon">🪐</span>

          <div>
            <h2>Still bored?</h2>
            <p>
              Don't think. Just hit the button and let your
              universe choose.
            </p>
          </div>

          <GlassButton
            active
            onClick={() => {
              setSelectedMode("random");
              setShowSaved(false);

              setTimeout(() => {
                pickActivity();
              }, 0);
            }}
          >
            🎲 Surprise Me
          </GlassButton>
        </GlassCard>
      </div>
    </PageShell>
  );
}