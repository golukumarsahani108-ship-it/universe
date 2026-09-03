"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/component/layout/PageShell";

type AchievementCategory =
  | "Personal"
  | "School"
  | "Study"
  | "Goals"
  | "Habits"
  | "Creative"
  | "Friends"
  | "Other";

type PersonalAchievement = {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  category: AchievementCategory;
  favorite: boolean;
  createdAt: number;
};

const STORAGE_KEY =
  "my-little-universe-personal-achievements";

const ICONS = [
  "🏆",
  "🥇",
  "🥈",
  "🥉",
  "⭐",
  "🌟",
  "🎯",
  "🔥",
  "💪",
  "🧠",
  "📚",
  "🎓",
  "💻",
  "🎨",
  "🎵",
  "⚽",
  "🏏",
  "🎮",
  "💡",
  "🚀",
  "❤️",
  "✨",
  "🌈",
  "🏅",
];

const CATEGORIES: AchievementCategory[] = [
  "Personal",
  "School",
  "Study",
  "Goals",
  "Habits",
  "Creative",
  "Friends",
  "Other",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  icon: "🏆",
  category: "Personal" as AchievementCategory,
  favorite: false,
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) return fallback;

    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<
    PersonalAchievement[]
  >([]);

  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [filter, setFilter] = useState<
    "All" | "Favorites"
  >("All");

  const [category, setCategory] = useState<
    "All" | AchievementCategory
  >("All");

  const [form, setForm] = useState(EMPTY_FORM);

  /* LOAD */

  useEffect(() => {
    const saved = readStorage<PersonalAchievement[]>(
      STORAGE_KEY,
      []
    );

    setAchievements(saved);
    setLoaded(true);
  }, []);

  /* SAVE */

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(achievements)
    );
  }, [achievements, loaded]);

  /* FORM RESET */

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  /* CREATE / UPDATE */

  const saveAchievement = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const title = form.title.trim();

    if (!title) return;

    if (editingId) {
      setAchievements((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title,
                description:
                  form.description.trim(),
                date: form.date,
                icon: form.icon,
                category: form.category,
                favorite: form.favorite,
              }
            : item
        )
      );
    } else {
      const newAchievement: PersonalAchievement = {
        id: crypto.randomUUID(),
        title,
        description: form.description.trim(),
        date: form.date,
        icon: form.icon,
        category: form.category,
        favorite: form.favorite,
        createdAt: Date.now(),
      };

      setAchievements((current) => [
        newAchievement,
        ...current,
      ]);
    }

    resetForm();
  };

  /* EDIT */

  const editAchievement = (
    achievement: PersonalAchievement
  ) => {
    setEditingId(achievement.id);

    setForm({
      title: achievement.title,
      description: achievement.description,
      date: achievement.date,
      icon: achievement.icon,
      category: achievement.category,
      favorite: achievement.favorite,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* DELETE */

  const deleteAchievement = (id: string) => {
    const confirmed = window.confirm(
      "Delete this achievement?"
    );

    if (!confirmed) return;

    setAchievements((current) =>
      current.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  };

  /* FAVORITE */

  const toggleFavorite = (id: string) => {
    setAchievements((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              favorite: !item.favorite,
            }
          : item
      )
    );
  };

  /* FILTER */

  const filteredAchievements = useMemo(() => {
    return achievements
      .filter((item) => {
        if (
          filter === "Favorites" &&
          !item.favorite
        ) {
          return false;
        }

        if (
          category !== "All" &&
          item.category !== category
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.date && b.date) {
          return b.date.localeCompare(a.date);
        }

        return b.createdAt - a.createdAt;
      });
  }, [achievements, filter, category]);

  const favoriteCount = achievements.filter(
    (item) => item.favorite
  ).length;

  return (
    <PageShell
      eyebrow="YOUR JOURNEY"
      title="Achievements 🏆"
      description="Every achievement deserves a place in your universe."
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="achievements-layout">

        {/* HERO */}

        <section className="glass achievements-hero">
          <div className="achievements-hero-icon">
            🏆
          </div>

          <div className="achievements-hero-content">
            <span>YOUR ACHIEVEMENT WALL</span>

            <strong>
              {achievements.length}
            </strong>

            <p>
              {achievements.length === 1
                ? "One achievement saved"
                : `${achievements.length} achievements saved`}
            </p>
          </div>

          <button
            type="button"
            className="achievement-add-button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm
              ? "× Close"
              : "+ Add Achievement"}
          </button>
        </section>

        {/* FORM */}

        {showForm && (
          <section className="glass personal-achievement-form-card">
            <div className="personal-form-heading">
              <span>
                {editingId
                  ? "EDIT ACHIEVEMENT"
                  : "NEW ACHIEVEMENT"}
              </span>

              <h2>
                {editingId
                  ? "Update your achievement"
                  : "Record something you're proud of"}
              </h2>
            </div>

            <form
              className="personal-achievement-form"
              onSubmit={saveAchievement}
            >
              <label>
                <span>Achievement Title</span>

                <input
                  type="text"
                  placeholder="e.g. Won my first competition"
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                <span>Date</span>

                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      date: event.target.value,
                    })
                  }
                />
              </label>

              <label className="personal-form-full">
                <span>Your Story</span>

                <textarea
                  rows={4}
                  placeholder="Write what you achieved and why it matters to you..."
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description:
                        event.target.value,
                    })
                  }
                />
              </label>

              <div className="personal-form-full">
                <span className="form-label">
                  Choose Icon
                </span>

                <div className="achievement-icon-picker">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={
                        form.icon === icon
                          ? "achievement-icon-choice achievement-icon-choice-active"
                          : "achievement-icon-choice"
                      }
                      onClick={() =>
                        setForm({
                          ...form,
                          icon,
                        })
                      }
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <label>
                <span>Category</span>

                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category:
                        event.target
                          .value as AchievementCategory,
                    })
                  }
                >
                  {CATEGORIES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="achievement-favorite-check">
                <input
                  type="checkbox"
                  checked={form.favorite}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      favorite:
                        event.target.checked,
                    })
                  }
                />

                <span>
                  ⭐ Highlight this achievement
                </span>
              </label>

              <div className="personal-form-actions">
                <button
                  type="button"
                  className="achievement-secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="achievement-save-button"
                >
                  {editingId
                    ? "✓ Update Achievement"
                    : "+ Save Achievement"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* STATS */}

        <section className="achievement-stats-grid">
          <div className="glass achievement-stat">
            <span>🏆</span>
            <strong>
              {achievements.length}
            </strong>
            <small>Total Achievements</small>
          </div>

          <div className="glass achievement-stat">
            <span>⭐</span>
            <strong>{favoriteCount}</strong>
            <small>Highlights</small>
          </div>

          <div className="glass achievement-stat">
            <span>✨</span>
            <strong>
              {achievements.length > 0
                ? "100%"
                : "0%"}
            </strong>
            <small>Recorded</small>
          </div>
        </section>

        {/* FILTERS */}

        <section className="glass achievement-tools">
          <div className="achievement-filters">
            <button
              type="button"
              className={
                filter === "All"
                  ? "achievement-filter achievement-filter-active"
                  : "achievement-filter"
              }
              onClick={() => setFilter("All")}
            >
              All
            </button>

            <button
              type="button"
              className={
                filter === "Favorites"
                  ? "achievement-filter achievement-filter-active"
                  : "achievement-filter"
              }
              onClick={() =>
                setFilter("Favorites")
              }
            >
              ⭐ Favorites
            </button>
          </div>

          <select
            className="achievement-category-select"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value as
                  | "All"
                  | AchievementCategory
              )
            }
          >
            <option value="All">
              All Categories
            </option>

            {CATEGORIES.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </section>

        {/* ACHIEVEMENT LIST */}

        {filteredAchievements.length > 0 ? (
          <section>
            <div className="achievement-list-heading">
              <div>
                <span>YOUR COLLECTION</span>
                <h2>
                  My Achievements
                </h2>
              </div>

              <small>
                {filteredAchievements.length} shown
              </small>
            </div>

            <div className="personal-achievements-grid">
              {filteredAchievements.map(
                (achievement) => (
                  <article
                    key={achievement.id}
                    className="glass personal-achievement-card"
                  >
                    <div className="personal-achievement-top">
                      <div className="personal-achievement-icon">
                        {achievement.icon}
                      </div>

                      <button
                        type="button"
                        className={
                          achievement.favorite
                            ? "personal-star personal-star-active"
                            : "personal-star"
                        }
                        onClick={() =>
                          toggleFavorite(
                            achievement.id
                          )
                        }
                        aria-label="Toggle favorite"
                      >
                        {achievement.favorite
                          ? "★"
                          : "☆"}
                      </button>
                    </div>

                    <span className="personal-achievement-category">
                      {achievement.category}
                    </span>

                    <h2>
                      {achievement.title}
                    </h2>

                    {achievement.description && (
                      <p>
                        {achievement.description}
                      </p>
                    )}

                    {achievement.date && (
                      <div className="personal-achievement-date">
                        📅{" "}
                        {new Date(
                          `${achievement.date}T00:00:00`
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </div>
                    )}

                    <div className="personal-achievement-actions">
                      <button
                        type="button"
                        onClick={() =>
                          editAchievement(
                            achievement
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteAchievement(
                            achievement.id
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>
        ) : (
          <div className="glass achievement-empty">
            <div>🏆</div>

            <h2>
              No achievements yet
            </h2>

            <p>
              Record your first achievement and
              start building your personal
              achievement wall.
            </p>

            <button
              type="button"
              className="achievement-empty-button"
              onClick={() => setShowForm(true)}
            >
              + Add Achievement
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}