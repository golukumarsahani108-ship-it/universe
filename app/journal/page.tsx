"use client";

import { useEffect, useMemo, useState } from "react";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassBadge from "@/component/glass/GlassBadge";

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: number;
  updatedAt: number;
  favorite: boolean;
};

const STORAGE_KEY = "my-little-universe-journal";

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const formatDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(getToday());

  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setEntries(parsed);
      }
    } catch {
      console.log("Journal entries could not be loaded.");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setDate(getToday());
    setEditingId(null);
  };

  const saveEntry = () => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanContent) {
      return;
    }

    if (editingId) {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === editingId
            ? {
                ...entry,
                title: cleanTitle,
                content: cleanContent,
                date,
                updatedAt: Date.now(),
              }
            : entry
        )
      );
    } else {
      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        title: cleanTitle,
        content: cleanContent,
        date,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        favorite: false,
      };

      setEntries((current) => [newEntry, ...current]);
    }

    resetForm();
  };

  const editEntry = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setDate(entry.date);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteEntry = (id: string) => {
    const confirmed = window.confirm(
      "Delete this journal entry?"
    );

    if (!confirmed) return;

    setEntries((current) =>
      current.filter((entry) => entry.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  };

  const toggleFavorite = (id: string) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              favorite: !entry.favorite,
            }
          : entry
      )
    );
  };

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...entries]
      .filter((entry) => {
        if (!favoritesOnly) return true;
        return entry.favorite;
      })
      .filter((entry) => {
        if (!query) return true;

        return (
          entry.title.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  }, [entries, search, favoritesOnly]);

  const totalWords = useMemo(() => {
    return entries.reduce((total, entry) => {
      return (
        total +
        entry.content
          .trim()
          .split(/\s+/)
          .filter(Boolean).length
      );
    }, 0);
  }, [entries]);

  const favoriteCount = entries.filter(
    (entry) => entry.favorite
  ).length;

  const isEditing = editingId !== null;

  return (
    <PageShell
      eyebrow="JOURNAL"
      title="Your little corner of thoughts. ✍️"
      description="Write anything you want to remember, explore, or simply get out of your head."
    >
      <div className="journal-layout">
        {/* CREATE / EDIT */}
        <GlassCard className="journal-create-card">
          <div className="journal-heading">
            <div>
              <span className="eyebrow">
                {isEditing ? "EDIT ENTRY" : "NEW ENTRY"}
              </span>

              <h2>
                {isEditing
                  ? "Continue your thought."
                  : "What is on your mind?"}
              </h2>
            </div>

            {isEditing && (
              <button
                type="button"
                className="journal-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

          <div className="journal-form">
            <label className="journal-field journal-field-full">
              <span>Title</span>

              <input
                className="glass-input"
                type="text"
                placeholder="Give this thought a name..."
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                maxLength={100}
              />
            </label>

            <label className="journal-field">
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

            <label className="journal-field journal-field-full">
              <span>Your thoughts</span>

              <textarea
                className="journal-textarea"
                placeholder="Start writing..."
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                rows={8}
              />
            </label>

            <div className="journal-form-bottom">
              <span className="journal-word-count">
                {content.trim()
                  ? content
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length
                  : 0}{" "}
                words
              </span>

              <GlassButton
                active
                onClick={saveEntry}
                className="journal-save-button"
              >
                {isEditing
                  ? "✓ Update Entry"
                  : "✦ Save Entry"}
              </GlassButton>
            </div>
          </div>
        </GlassCard>

        {/* STATS */}
        <section className="journal-stats-grid">
          <GlassCard className="journal-stat">
            <span className="journal-stat-icon">📖</span>

            <div>
              <strong>{entries.length}</strong>
              <span>Total Entries</span>
            </div>
          </GlassCard>

          <GlassCard className="journal-stat">
            <span className="journal-stat-icon">⭐</span>

            <div>
              <strong>{favoriteCount}</strong>
              <span>Favorites</span>
            </div>
          </GlassCard>

          <GlassCard className="journal-stat">
            <span className="journal-stat-icon">✍️</span>

            <div>
              <strong>{totalWords}</strong>
              <span>Words Written</span>
            </div>
          </GlassCard>
        </section>

        {/* SEARCH / FILTER */}
        <section className="journal-tools">
          <div className="journal-search-wrap">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search your journal..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <button
            type="button"
            className={`journal-favorite-filter ${
              favoritesOnly
                ? "journal-favorite-filter-active"
                : ""
            }`}
            onClick={() =>
              setFavoritesOnly((current) => !current)
            }
          >
            ⭐ Favorites
          </button>
        </section>

        {/* ENTRIES */}
        <section className="journal-list-section">
          <div className="journal-list-heading">
            <div>
              <span className="eyebrow">YOUR JOURNAL</span>

              <h2>
                {favoritesOnly
                  ? "Favorite thoughts"
                  : "Your entries"}
              </h2>
            </div>

            <GlassBadge>
              {filteredEntries.length}{" "}
              {filteredEntries.length === 1
                ? "entry"
                : "entries"}
            </GlassBadge>
          </div>

          {filteredEntries.length === 0 ? (
            <GlassCard className="journal-empty">
              <span className="journal-empty-icon">
                {search || favoritesOnly ? "🔎" : "📖"}
              </span>

              <h3>
                {search || favoritesOnly
                  ? "Nothing found"
                  : "Your journal is waiting."}
              </h3>

              <p>
                {search || favoritesOnly
                  ? "Try another search or turn off the favorite filter."
                  : "Write your first entry above and start building your little collection of memories and thoughts."}
              </p>
            </GlassCard>
          ) : (
            <div className="journal-list">
              {filteredEntries.map((entry) => (
                <GlassCard
                  key={entry.id}
                  className="journal-entry"
                >
                  <div className="journal-entry-top">
                    <div className="journal-entry-date">
                      <span>📅</span>
                      {formatDate(entry.date)}
                    </div>

                    <button
                      type="button"
                      className={`journal-favorite ${
                        entry.favorite
                          ? "journal-favorite-active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleFavorite(entry.id)
                      }
                      aria-label={
                        entry.favorite
                          ? "Remove favorite"
                          : "Add favorite"
                      }
                    >
                      {entry.favorite ? "★" : "☆"}
                    </button>
                  </div>

                  <h3>{entry.title}</h3>

                  <p className="journal-entry-content">
                    {entry.content}
                  </p>

                  <div className="journal-entry-bottom">
                    <span>
                      {
                        entry.content
                          .trim()
                          .split(/\s+/)
                          .filter(Boolean).length
                      }{" "}
                      words
                    </span>

                    <div className="journal-entry-actions">
                      <button
                        type="button"
                        onClick={() => editEntry(entry)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteEntry(entry.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}