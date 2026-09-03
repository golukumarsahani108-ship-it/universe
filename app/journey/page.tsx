"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassInput from "@/component/glass/GlassInput";
import GlassBadge from "@/component/glass/GlassBadge";

type JourneyCategory =
  | "Travel"
  | "Life"
  | "Study"
  | "Personal"
  | "Adventure"
  | "Other";

type Journey = {
  id: string;
  title: string;
  from: string;
  to: string;
  date: string;
  description: string;
  category: JourneyCategory;
  favorite: boolean;
  createdAt: number;
};

const STORAGE_KEY = "my-little-universe-journey";

const categories: JourneyCategory[] = [
  "Travel",
  "Life",
  "Study",
  "Personal",
  "Adventure",
  "Other",
];

const categoryIcons: Record<JourneyCategory, string> = {
  Travel: "✈️",
  Life: "🌱",
  Study: "📚",
  Personal: "💫",
  Adventure: "🧭",
  Other: "🌌",
};

const emptyForm = {
  title: "",
  from: "",
  to: "",
  date: "",
  description: "",
  category: "Travel" as JourneyCategory,
  favorite: false,
};

export default function JourneyPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setJourneys(parsed);
        }
      }
    } catch {
      console.log("Journey data could not be loaded.");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(journeys));
  }, [journeys, loaded]);

  const updateForm = (
    field: keyof typeof emptyForm,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const saveJourney = () => {
    if (!form.title.trim()) {
      alert("Journey title add karo.");
      return;
    }

    if (!form.date) {
      alert("Journey date select karo.");
      return;
    }

    if (editingId) {
      setJourneys((current) =>
        current.map((journey) =>
          journey.id === editingId
            ? {
                ...journey,
                ...form,
                title: form.title.trim(),
                from: form.from.trim(),
                to: form.to.trim(),
                description: form.description.trim(),
              }
            : journey
        )
      );
    } else {
      const newJourney: Journey = {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        from: form.from.trim(),
        to: form.to.trim(),
        date: form.date,
        description: form.description.trim(),
        category: form.category,
        favorite: form.favorite,
        createdAt: Date.now(),
      };

      setJourneys((current) => [newJourney, ...current]);
    }

    resetForm();
  };

  const editJourney = (journey: Journey) => {
    setEditingId(journey.id);

    setForm({
      title: journey.title,
      from: journey.from,
      to: journey.to,
      date: journey.date,
      description: journey.description,
      category: journey.category,
      favorite: journey.favorite,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteJourney = (id: string) => {
    const confirmed = window.confirm(
      "Is journey ko delete karna hai?"
    );

    if (!confirmed) return;

    setJourneys((current) =>
      current.filter((journey) => journey.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  };

  const toggleFavorite = (id: string) => {
    setJourneys((current) =>
      current.map((journey) =>
        journey.id === id
          ? {
              ...journey,
              favorite: !journey.favorite,
            }
          : journey
      )
    );
  };

  const filteredJourneys = useMemo(() => {
    const query = search.trim().toLowerCase();

    return journeys
      .filter((journey) => {
        if (!query) return true;

        return (
          journey.title.toLowerCase().includes(query) ||
          journey.from.toLowerCase().includes(query) ||
          journey.to.toLowerCase().includes(query) ||
          journey.description.toLowerCase().includes(query) ||
          journey.category.toLowerCase().includes(query)
        );
      })
      .filter((journey) => {
        if (categoryFilter === "All") return true;
        return journey.category === categoryFilter;
      })
      .filter((journey) => {
        if (!favoriteOnly) return true;
        return journey.favorite;
      })
      .sort((a, b) => {
        return (
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
        );
      });
  }, [journeys, search, categoryFilter, favoriteOnly]);

  const totalJourneys = journeys.length;

  const favoriteJourneys = journeys.filter(
    (journey) => journey.favorite
  ).length;

  const categoriesUsed = new Set(
    journeys.map((journey) => journey.category)
  ).size;

  const latestJourney = journeys.length
    ? [...journeys].sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )[0]
    : null;

  const formatDate = (date: string) => {
    if (!date) return "";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <PageShell
      eyebrow="MY JOURNEY"
      title="Journey 🧭"
      description="Keep track of the places, moments and paths that became part of your story."
    >
      <div className="journey-layout">
        <GlassCard className="journey-form-card">
          <div className="journey-form-heading">
            <div>
              <GlassBadge>
                {editingId ? "EDIT JOURNEY" : "NEW JOURNEY"}
              </GlassBadge>

              <h2>
                {editingId
                  ? "Update your journey"
                  : "Save a journey"}
              </h2>

              <p>
                Every journey can become a memory worth keeping.
              </p>
            </div>

            <div className="journey-form-icon">🧭</div>
          </div>

          <div className="journey-form-grid">
            <GlassInput
              label="Journey Title"
              placeholder="e.g. My first trip..."
              value={form.title}
              onChange={(value) =>
                updateForm("title", value)
              }
            />

            <GlassInput
              label="Date"
              type="date"
              value={form.date}
              onChange={(value) =>
                updateForm("date", value)
              }
            />

            <GlassInput
              label="From"
              placeholder="Starting point"
              value={form.from}
              onChange={(value) =>
                updateForm("from", value)
              }
            />

            <GlassInput
              label="To"
              placeholder="Destination"
              value={form.to}
              onChange={(value) =>
                updateForm("to", value)
              }
            />

            <label className="journey-field journey-category-field">
              <span>Category</span>

              <select
                value={form.category}
                onChange={(e) =>
                  updateForm(
                    "category",
                    e.target.value as JourneyCategory
                  )
                }
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {categoryIcons[category]} {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="journey-field">
            <span>Journey Story / Notes</span>

            <textarea
              placeholder="What happened on this journey?"
              value={form.description}
              onChange={(e) =>
                updateForm("description", e.target.value)
              }
            />
          </label>

          <label className="journey-favorite-check">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(e) =>
                updateForm("favorite", e.target.checked)
              }
            />

            <span>⭐ Keep this as a favorite journey</span>
          </label>

          <div className="journey-form-actions">
            <GlassButton
              active
              onClick={saveJourney}
            >
              {editingId ? "Update Journey" : "Save Journey"}
            </GlassButton>

            {editingId && (
              <GlassButton onClick={resetForm}>
                Cancel
              </GlassButton>
            )}
          </div>
        </GlassCard>

        <div className="journey-stats-grid">
          <GlassCard className="journey-stat-card">
            <span>🧭</span>
            <strong>{totalJourneys}</strong>
            <small>Total Journeys</small>
          </GlassCard>

          <GlassCard className="journey-stat-card">
            <span>⭐</span>
            <strong>{favoriteJourneys}</strong>
            <small>Favorites</small>
          </GlassCard>

          <GlassCard className="journey-stat-card">
            <span>🗺️</span>
            <strong>{categoriesUsed}</strong>
            <small>Categories</small>
          </GlassCard>

          <GlassCard className="journey-stat-card">
            <span>📅</span>
            <strong>
              {latestJourney
                ? formatDate(latestJourney.date)
                : "—"}
            </strong>
            <small>Latest Journey</small>
          </GlassCard>
        </div>

        <GlassCard className="journey-tools-card">
          <div className="journey-search">
            <GlassInput
              placeholder="Search journeys..."
              value={search}
              onChange={setSearch}
            />
          </div>

          <div className="journey-filter-row">
            <button
              className={`journey-filter ${
                categoryFilter === "All"
                  ? "active"
                  : ""
              }`}
              onClick={() => setCategoryFilter("All")}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category}
                className={`journey-filter ${
                  categoryFilter === category
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setCategoryFilter(category)
                }
              >
                {categoryIcons[category]} {category}
              </button>
            ))}

            <button
              className={`journey-filter ${
                favoriteOnly ? "active" : ""
              }`}
              onClick={() =>
                setFavoriteOnly((current) => !current)
              }
            >
              ⭐ Favorites
            </button>
          </div>
        </GlassCard>

        {filteredJourneys.length === 0 ? (
          <GlassCard className="journey-empty">
            <div>🧭</div>

            <h3>
              {journeys.length === 0
                ? "Your journey starts here"
                : "No journeys found"}
            </h3>

            <p>
              {journeys.length === 0
                ? "Add your first journey above and start building your personal map."
                : "Try changing your search or filters."}
            </p>
          </GlassCard>
        ) : (
          <div className="journey-grid">
            {filteredJourneys.map((journey) => (
              <GlassCard
                key={journey.id}
                className="journey-card"
              >
                <div className="journey-card-top">
                  <div className="journey-card-icon">
                    {categoryIcons[journey.category]}
                  </div>

                  <div className="journey-card-actions">
                    <button
                      className={`journey-icon-button ${
                        journey.favorite
                          ? "favorite"
                          : ""
                      }`}
                      onClick={() =>
                        toggleFavorite(journey.id)
                      }
                      title="Favorite"
                    >
                      {journey.favorite ? "★" : "☆"}
                    </button>

                    <button
                      className="journey-icon-button"
                      onClick={() =>
                        editJourney(journey)
                      }
                      title="Edit"
                    >
                      ✎
                    </button>

                    <button
                      className="journey-icon-button danger"
                      onClick={() =>
                        deleteJourney(journey.id)
                      }
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <GlassBadge>
                  {journey.category}
                </GlassBadge>

                <h3>{journey.title}</h3>

                <div className="journey-route">
                  <div>
                    <span>FROM</span>
                    <strong>
                      {journey.from || "Unknown"}
                    </strong>
                  </div>

                  <div className="journey-route-line">
                    <span>→</span>
                  </div>

                  <div>
                    <span>TO</span>
                    <strong>
                      {journey.to || "Unknown"}
                    </strong>
                  </div>
                </div>

                <div className="journey-date">
                  📅 {formatDate(journey.date)}
                </div>

                {journey.description && (
                  <p className="journey-description">
                    {journey.description}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}