"use client";

import { useEffect, useMemo, useState } from "react";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassBadge from "@/component/glass/GlassBadge";

type MoodType =
  | "amazing"
  | "happy"
  | "calm"
  | "okay"
  | "tired"
  | "sad"
  | "angry";

type MoodEntry = {
  id: string;
  mood: MoodType;
  note: string;
  date: string;
  createdAt: number;
};

const STORAGE_KEY = "my-little-universe-mood";

const moods: {
  id: MoodType;
  emoji: string;
  label: string;
}[] = [
  {
    id: "amazing",
    emoji: "🤩",
    label: "Amazing",
  },
  {
    id: "happy",
    emoji: "😊",
    label: "Happy",
  },
  {
    id: "calm",
    emoji: "😌",
    label: "Calm",
  },
  {
    id: "okay",
    emoji: "🙂",
    label: "Okay",
  },
  {
    id: "tired",
    emoji: "😴",
    label: "Tired",
  },
  {
    id: "sad",
    emoji: "😔",
    label: "Sad",
  },
  {
    id: "angry",
    emoji: "😤",
    label: "Frustrated",
  },
];

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const formatDate = (date: string) => {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

export default function MoodPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  const [selectedMood, setSelectedMood] =
    useState<MoodType>("happy");

  const [note, setNote] = useState("");
  const [date, setDate] = useState(getToday());

  const [filter, setFilter] = useState<MoodType | "all">(
    "all"
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setEntries(parsed);
      }
    } catch {
      console.log("Mood data could not be loaded.");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries)
    );
  }, [entries]);

  const saveMood = () => {
    const existingToday = entries.find(
      (entry) => entry.date === date
    );

    if (existingToday) {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === existingToday.id
            ? {
                ...entry,
                mood: selectedMood,
                note: note.trim(),
                createdAt: Date.now(),
              }
            : entry
        )
      );
    } else {
      const newEntry: MoodEntry = {
        id: crypto.randomUUID(),
        mood: selectedMood,
        note: note.trim(),
        date,
        createdAt: Date.now(),
      };

      setEntries((current) => [newEntry, ...current]);
    }

    setNote("");
  };

  const deleteMood = (id: string) => {
    const confirmed = window.confirm(
      "Delete this mood entry?"
    );

    if (!confirmed) return;

    setEntries((current) =>
      current.filter((entry) => entry.id !== id)
    );
  };

  const todayEntry = entries.find(
    (entry) => entry.date === getToday()
  );

  const filteredEntries = useMemo(() => {
    return [...entries]
      .filter((entry) => {
        if (filter === "all") return true;
        return entry.mood === filter;
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  }, [entries, filter]);

  const favoriteMood = useMemo(() => {
    if (!entries.length) return null;

    const counts: Record<string, number> = {};

    entries.forEach((entry) => {
      counts[entry.mood] =
        (counts[entry.mood] || 0) + 1;
    });

    const best = Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return moods.find((mood) => mood.id === best?.[0]);
  }, [entries]);

  const moodInfo = moods.find(
    (mood) => mood.id === selectedMood
  );

  return (
    <PageShell
      eyebrow="MOOD"
      title="How are you feeling today? 🌈"
      description="A tiny check-in for your little universe. No pressure, just notice how you feel."
    >
      <div className="mood-layout">
        {/* TODAY CHECK-IN */}
        <GlassCard className="mood-checkin-card">
          <div className="mood-heading">
            <div>
              <span className="eyebrow">TODAY'S CHECK-IN</span>
              <h2>
                {todayEntry
                  ? "Update your mood."
                  : "Choose what feels right."}
              </h2>
            </div>

            {todayEntry && (
              <GlassBadge>✓ Checked in</GlassBadge>
            )}
          </div>

          <div className="mood-picker">
            {moods.map((mood) => (
              <button
                key={mood.id}
                type="button"
                className={`mood-option ${
                  selectedMood === mood.id
                    ? "mood-option-active"
                    : ""
                }`}
                onClick={() => setSelectedMood(mood.id)}
              >
                <span>{mood.emoji}</span>
                <strong>{mood.label}</strong>
              </button>
            ))}
          </div>

          <div className="mood-selected-preview">
            <span>{moodInfo?.emoji}</span>

            <div>
              <strong>
                Feeling {moodInfo?.label.toLowerCase()}
              </strong>

              <small>
                You can add a little note if you want.
              </small>
            </div>
          </div>

          <label className="mood-note-field">
            <span>Optional note</span>

            <textarea
              className="mood-textarea"
              placeholder="What happened today?"
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              rows={4}
            />
          </label>

          <div className="mood-form-bottom">
            <label className="mood-date-field">
              <span>Date</span>

              <input
                className="glass-input"
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
              />
            </label>

            <GlassButton
              active
              onClick={saveMood}
              className="mood-save-button"
            >
              {todayEntry
                ? "✓ Update Mood"
                : "✦ Save Mood"}
            </GlassButton>
          </div>
        </GlassCard>

        {/* STATS */}
        <section className="mood-stats-grid">
          <GlassCard className="mood-stat">
            <span className="mood-stat-icon">🌈</span>

            <div>
              <strong>{entries.length}</strong>
              <span>Check-ins</span>
            </div>
          </GlassCard>

          <GlassCard className="mood-stat">
            <span className="mood-stat-icon">
              {favoriteMood?.emoji ?? "✨"}
            </span>

            <div>
              <strong>
                {favoriteMood?.label ?? "—"}
              </strong>
              <span>Most Common</span>
            </div>
          </GlassCard>

          <GlassCard className="mood-stat">
            <span className="mood-stat-icon">
              {todayEntry
                ? moods.find(
                    (mood) => mood.id === todayEntry.mood
                  )?.emoji
                : "⏳"}
            </span>

            <div>
              <strong>
                {todayEntry ? "Done" : "Not Yet"}
              </strong>
              <span>Today</span>
            </div>
          </GlassCard>
        </section>

        {/* FILTER */}
        <section className="mood-history-section">
          <div className="mood-section-heading">
            <div>
              <span className="eyebrow">MOOD HISTORY</span>
              <h2>Your recent check-ins</h2>
            </div>

            <GlassBadge>
              {filteredEntries.length} entries
            </GlassBadge>
          </div>

          <div className="mood-filters">
            <button
              type="button"
              className={`mood-filter ${
                filter === "all"
                  ? "mood-filter-active"
                  : ""
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </button>

            {moods.map((mood) => (
              <button
                key={mood.id}
                type="button"
                className={`mood-filter ${
                  filter === mood.id
                    ? "mood-filter-active"
                    : ""
                }`}
                onClick={() => setFilter(mood.id)}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </section>

        {/* HISTORY */}
        {filteredEntries.length === 0 ? (
          <GlassCard className="mood-empty">
            <span>🌱</span>

            <h3>No mood history yet.</h3>

            <p>
              Your first check-in will appear here. Just
              choose a mood above.
            </p>
          </GlassCard>
        ) : (
          <div className="mood-history-list">
            {filteredEntries.map((entry) => {
              const mood = moods.find(
                (item) => item.id === entry.mood
              );

              return (
                <GlassCard
                  key={entry.id}
                  className="mood-history-item"
                >
                  <div className="mood-history-emoji">
                    {mood?.emoji}
                  </div>

                  <div className="mood-history-content">
                    <div className="mood-history-top">
                      <div>
                        <strong>
                          {mood?.label}
                        </strong>

                        <span>
                          📅 {formatDate(entry.date)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="mood-delete"
                        onClick={() =>
                          deleteMood(entry.id)
                        }
                      >
                        Delete
                      </button>
                    </div>

                    {entry.note && (
                      <p>{entry.note}</p>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* FOOTER CARD */}
        <GlassCard className="mood-bottom-card">
          <span>💭</span>

          <div>
            <h2>Small check-ins matter.</h2>

            <p>
              You don't have to explain everything. Sometimes
              simply noticing how you feel is enough.
            </p>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}