"use client";

import { useEffect, useMemo, useState } from "react";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassBadge from "@/component/glass/GlassBadge";
import GlassButton from "@/component/glass/GlassButton";

type Dream = {
  id: string;
  title: string;
  date: string;
  details: string;
  feeling: string;
  tags: string[];
  favorite: boolean;
  createdAt: number;
};

const STORAGE_KEY = "my-little-universe-dreams";

const feelings = [
  "✨ Magical",
  "😊 Happy",
  "😌 Peaceful",
  "😮 Strange",
  "😨 Scary",
  "💭 Confusing",
  "❤️ Emotional",
  "🌙 Other",
];

export default function DreamsPage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");
  const [feeling, setFeeling] = useState("✨ Magical");
  const [tags, setTags] = useState("");

  const [search, setSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setDreams(parsed);
        }
      }
    } catch {
      console.log("Dreams could not be loaded.");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dreams));
  }, [dreams, loaded]);

  const filteredDreams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...dreams]
      .filter((dream) => {
        if (showFavoritesOnly && !dream.favorite) {
          return false;
        }

        if (!query) {
          return true;
        }

        const searchableText = [
          dream.title,
          dream.details,
          dream.feeling,
          ...dream.tags,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [dreams, search, showFavoritesOnly]);

  const addDream = () => {
    const cleanTitle = title.trim();
    const cleanDetails = details.trim();

    if (!cleanTitle || !cleanDetails) {
      return;
    }

    const cleanTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const newDream: Dream = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      date:
        date || new Date().toISOString().split("T")[0],
      details: cleanDetails,
      feeling,
      tags: cleanTags,
      favorite: false,
      createdAt: Date.now(),
    };

    setDreams((current) => [newDream, ...current]);

    setTitle("");
    setDate("");
    setDetails("");
    setFeeling("✨ Magical");
    setTags("");
  };

  const toggleFavorite = (id: string) => {
    setDreams((current) =>
      current.map((dream) =>
        dream.id === id
          ? {
              ...dream,
              favorite: !dream.favorite,
            }
          : dream
      )
    );
  };

  const deleteDream = (id: string) => {
    setDreams((current) =>
      current.filter((dream) => dream.id !== id)
    );
  };

  return (
    <PageShell
      eyebrow="My Little Universe"
      title="Dreams"
      description="A little place for the dreams I want to remember."
    >
      <div className="dreams-layout">
        {/* CREATE DREAM */}
        <GlassCard className="dream-create-card">
          <div className="dream-heading">
            <div>
              <GlassBadge>NEW DREAM</GlassBadge>

              <h2 className="dream-section-title">
                Capture a dream 🌙
              </h2>
            </div>

            <span className="dream-total">
              {dreams.length} saved
            </span>
          </div>

          <div className="dream-form">
            <label className="dream-field">
              <span>Dream title</span>

              <input
                className="glass-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The dream I remember..."
              />
            </label>

            <label className="dream-field">
              <span>Date</span>

              <input
                className="glass-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <label className="dream-field dream-field-full">
              <span>What happened?</span>

              <textarea
                className="glass-input dream-textarea"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Write everything you remember..."
                rows={6}
              />
            </label>

            <label className="dream-field">
              <span>How did it feel?</span>

              <select
                className="glass-input dream-select"
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
              >
                {feelings.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="dream-field">
              <span>Tags</span>

              <input
                className="glass-input"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="school, adventure, sky"
              />
            </label>

            <GlassButton
              active
              onClick={addDream}
              className="dream-save-button"
            >
              🌙 Save Dream
            </GlassButton>
          </div>
        </GlassCard>

        {/* DREAM STATS */}
        <div className="dream-stats-grid">
          <GlassCard className="dream-stat">
            <span>🌙</span>
            <strong>{dreams.length}</strong>
            <small>Total Dreams</small>
          </GlassCard>

          <GlassCard className="dream-stat">
            <span>⭐</span>
            <strong>
              {dreams.filter((dream) => dream.favorite).length}
            </strong>
            <small>Favorites</small>
          </GlassCard>

          <GlassCard className="dream-stat">
            <span>✨</span>
            <strong>
              {new Set(
                dreams.flatMap((dream) => dream.tags)
              ).size}
            </strong>
            <small>Tags</small>
          </GlassCard>
        </div>

        {/* SEARCH + FILTER */}
        {dreams.length > 0 && (
          <GlassCard className="dream-tools">
            <div className="dream-search-wrap">
              <span>🔎</span>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your dreams..."
              />
            </div>

            <button
              type="button"
              className={`dream-favorite-filter ${
                showFavoritesOnly
                  ? "dream-favorite-filter-active"
                  : ""
              }`}
              onClick={() =>
                setShowFavoritesOnly((current) => !current)
              }
            >
              {showFavoritesOnly
                ? "★ Favorites"
                : "☆ Favorites"}
            </button>
          </GlassCard>
        )}

        {/* DREAM LIST */}
        <div className="dreams-list">
          {dreams.length === 0 ? (
            <GlassCard className="dream-empty">
              <div className="dream-empty-icon">🌙</div>

              <GlassBadge>DREAM JOURNAL</GlassBadge>

              <h2>No dreams saved yet</h2>

              <p>
                When you have a dream you want to remember,
                write it down above and keep it here.
              </p>
            </GlassCard>
          ) : filteredDreams.length === 0 ? (
            <GlassCard className="dream-empty">
              <div className="dream-empty-icon">🔎</div>

              <GlassBadge>NOT FOUND</GlassBadge>

              <h2>No matching dreams</h2>

              <p>
                Try another search or turn off the favorites
                filter.
              </p>
            </GlassCard>
          ) : (
            filteredDreams.map((dream) => (
              <GlassCard
                key={dream.id}
                className="dream-item"
              >
                <div className="dream-item-top">
                  <div className="dream-item-meta">
                    <GlassBadge>DREAM</GlassBadge>

                    <span className="dream-date">
                      {formatDreamDate(dream.date)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`dream-favorite-button ${
                      dream.favorite
                        ? "dream-favorite-button-active"
                        : ""
                    }`}
                    onClick={() =>
                      toggleFavorite(dream.id)
                    }
                    aria-label={
                      dream.favorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {dream.favorite ? "★" : "☆"}
                  </button>
                </div>

                <h2>{dream.title}</h2>

                <div className="dream-feeling">
                  {dream.feeling}
                </div>

                <p className="dream-details">
                  {dream.details}
                </p>

                {dream.tags.length > 0 && (
                  <div className="dream-tags">
                    {dream.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="dream-delete"
                  onClick={() => deleteDream(dream.id)}
                >
                  Delete dream
                </button>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}

function formatDreamDate(date: string) {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}