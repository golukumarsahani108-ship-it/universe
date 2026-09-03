"use client";

import { useEffect, useMemo, useState } from "react";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassBadge from "@/component/glass/GlassBadge";
import GlassButton from "@/component/glass/GlassButton";

type VibeType = "music" | "book" | "movie";

type VibeItem = {
  id: string;
  type: VibeType;
  title: string;
  creator: string;
  note: string;
  favorite: boolean;
  createdAt: number;
};

const STORAGE_KEY = "my-little-universe-vibes";

const vibeTypes: {
  id: VibeType;
  label: string;
  icon: string;
}[] = [
  {
    id: "music",
    label: "Music",
    icon: "🎵",
  },
  {
    id: "book",
    label: "Books",
    icon: "📚",
  },
  {
    id: "movie",
    label: "Movies",
    icon: "🎬",
  },
];

export default function VibesPage() {
  const [items, setItems] = useState<VibeItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [type, setType] = useState<VibeType>("music");
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [note, setNote] = useState("");

  const [filter, setFilter] = useState<"all" | VibeType | "favorites">(
    "all"
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      console.log("Vibes could not be loaded.");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const filteredItems = useMemo(() => {
    return [...items]
      .filter((item) => {
        if (filter === "all") return true;
        if (filter === "favorites") return item.favorite;

        return item.type === filter;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [items, filter]);

  const addVibe = () => {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    const newItem: VibeItem = {
      id: crypto.randomUUID(),
      type,
      title: cleanTitle,
      creator: creator.trim(),
      note: note.trim(),
      favorite: false,
      createdAt: Date.now(),
    };

    setItems((current) => [newItem, ...current]);

    setTitle("");
    setCreator("");
    setNote("");
  };

  const toggleFavorite = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, favorite: !item.favorite }
          : item
      )
    );
  };

  const deleteVibe = (id: string) => {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const musicCount = items.filter(
    (item) => item.type === "music"
  ).length;

  const bookCount = items.filter(
    (item) => item.type === "book"
  ).length;

  const movieCount = items.filter(
    (item) => item.type === "movie"
  ).length;

  return (
    <PageShell
      eyebrow="My Little Universe"
      title="Vibes"
      description="Music, books, movies and everything I enjoy."
    >
      <div className="vibes-layout">
        {/* CREATE */}
        <GlassCard className="vibe-create-card">
          <div className="vibe-heading">
            <div>
              <GlassBadge>ADD TO MY VIBES</GlassBadge>

              <h2 className="vibe-section-title">
                Save something I love ✨
              </h2>
            </div>

            <span className="vibe-total">
              {items.length} saved
            </span>
          </div>

          <div className="vibe-type-selector">
            {vibeTypes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`vibe-type-button ${
                  type === item.id
                    ? "vibe-type-button-active"
                    : ""
                }`}
                onClick={() => setType(item.id)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="vibe-form">
            <label className="vibe-field">
              <span>
                {type === "music"
                  ? "Song / Playlist"
                  : type === "book"
                    ? "Book"
                    : "Movie / Show"}
              </span>

              <input
                className="glass-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === "music"
                    ? "Something I can't stop listening to..."
                    : type === "book"
                      ? "A book I want to remember..."
                      : "Something I enjoyed watching..."
                }
              />
            </label>

            <label className="vibe-field">
              <span>
                {type === "music"
                  ? "Artist"
                  : type === "book"
                    ? "Author"
                    : "Director / Creator"}
              </span>

              <input
                className="glass-input"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="Optional"
              />
            </label>

            <label className="vibe-field vibe-field-full">
              <span>Note</span>

              <textarea
                className="glass-input vibe-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why do I like it?"
                rows={3}
              />
            </label>

            <GlassButton
              active
              onClick={addVibe}
              className="vibe-save-button"
            >
              ✨ Save
            </GlassButton>
          </div>
        </GlassCard>

        {/* STATS */}
        <div className="vibe-stats-grid">
          <GlassCard className="vibe-stat">
            <span>🎵</span>
            <strong>{musicCount}</strong>
            <small>Music</small>
          </GlassCard>

          <GlassCard className="vibe-stat">
            <span>📚</span>
            <strong>{bookCount}</strong>
            <small>Books</small>
          </GlassCard>

          <GlassCard className="vibe-stat">
            <span>🎬</span>
            <strong>{movieCount}</strong>
            <small>Movies</small>
          </GlassCard>
        </div>

        {/* FILTERS */}
        <div className="vibe-filters">
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            type="button"
            className={filter === "music" ? "active" : ""}
            onClick={() => setFilter("music")}
          >
            🎵 Music
          </button>

          <button
            type="button"
            className={filter === "book" ? "active" : ""}
            onClick={() => setFilter("book")}
          >
            📚 Books
          </button>

          <button
            type="button"
            className={filter === "movie" ? "active" : ""}
            onClick={() => setFilter("movie")}
          >
            🎬 Movies
          </button>

          <button
            type="button"
            className={
              filter === "favorites" ? "active" : ""
            }
            onClick={() => setFilter("favorites")}
          >
            ⭐ Favorites
          </button>
        </div>

        {/* LIST */}
        <div className="vibes-list">
          {filteredItems.length === 0 ? (
            <GlassCard className="vibe-empty">
              <div className="vibe-empty-icon">🎧</div>

              <GlassBadge>YOUR VIBES</GlassBadge>

              <h2>Nothing here yet</h2>

              <p>
                Add something you love and your personal collection
                will appear here.
              </p>
            </GlassCard>
          ) : (
            filteredItems.map((item) => {
              const typeInfo = vibeTypes.find(
                (vibe) => vibe.id === item.type
              );

              return (
                <GlassCard
                  key={item.id}
                  className="vibe-item"
                >
                  <div className="vibe-item-icon">
                    {typeInfo?.icon}
                  </div>

                  <div className="vibe-item-content">
                    <div className="vibe-item-top">
                      <GlassBadge>
                        {typeInfo?.label.toUpperCase()}
                      </GlassBadge>

                      <button
                        type="button"
                        className={`vibe-favorite ${
                          item.favorite
                            ? "vibe-favorite-active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleFavorite(item.id)
                        }
                        aria-label="Toggle favorite"
                      >
                        {item.favorite ? "★" : "☆"}
                      </button>
                    </div>

                    <h2>{item.title}</h2>

                    {item.creator && (
                      <div className="vibe-creator">
                        {item.creator}
                      </div>
                    )}

                    {item.note && (
                      <p>{item.note}</p>
                    )}

                    <button
                      type="button"
                      className="vibe-delete"
                      onClick={() => deleteVibe(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>
    </PageShell>
  );
}