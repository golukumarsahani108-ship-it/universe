"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassInput from "@/component/glass/GlassInput";
import GlassBadge from "@/component/glass/GlassBadge";

type CreativityCategory =
  | "Drawing"
  | "Writing"
  | "Music"
  | "Design"
  | "Photography"
  | "Craft"
  | "Other";

type CreativityStatus = "Idea" | "Working" | "Finished";

type CreativeItem = {
  id: string;
  title: string;
  description: string;
  category: CreativityCategory;
  status: CreativityStatus;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "my-little-universe-creativity";

const categories: CreativityCategory[] = [
  "Drawing",
  "Writing",
  "Music",
  "Design",
  "Photography",
  "Craft",
  "Other",
];

const statuses: CreativityStatus[] = [
  "Idea",
  "Working",
  "Finished",
];

const categoryIcons: Record<CreativityCategory, string> = {
  Drawing: "🎨",
  Writing: "✍️",
  Music: "🎵",
  Design: "✨",
  Photography: "📷",
  Craft: "🧵",
  Other: "💡",
};

const emptyForm = {
  title: "",
  description: "",
  category: "Drawing" as CreativityCategory,
  status: "Idea" as CreativityStatus,
  favorite: false,
};

export default function CreativityPage() {
  const [items, setItems] = useState<CreativeItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    CreativityCategory | "All"
  >("All");
  const [statusFilter, setStatusFilter] = useState<
    CreativityStatus | "All"
  >("All");
  const [favoriteOnly, setFavoriteOnly] = useState(false);

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
      console.log("Creativity data could not be loaded.");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = () => {
    const title = form.title.trim();

    if (!title) return;

    if (editingId) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title,
                description: form.description.trim(),
                category: form.category,
                status: form.status,
                favorite: form.favorite,
                updatedAt: Date.now(),
              }
            : item
        )
      );
    } else {
      const now = Date.now();

      const newItem: CreativeItem = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        description: form.description.trim(),
        category: form.category,
        status: form.status,
        favorite: form.favorite,
        createdAt: now,
        updatedAt: now,
      };

      setItems((current) => [newItem, ...current]);
    }

    resetForm();
  };

  const editItem = (item: CreativeItem) => {
    setEditingId(item.id);

    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      status: item.status,
      favorite: item.favorite,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteItem = (id: string) => {
    const confirmed = window.confirm(
      "Delete this creative project?"
    );

    if (!confirmed) return;

    setItems((current) =>
      current.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  };

  const toggleFavorite = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              favorite: !item.favorite,
              updatedAt: Date.now(),
            }
          : item
      )
    );
  };

  const changeStatus = (
    id: string,
    status: CreativityStatus
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              updatedAt: Date.now(),
            }
          : item
      )
    );
  };

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      const matchesFavorite =
        !favoriteOnly || item.favorite;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesFavorite
      );
    });
  }, [
    items,
    search,
    categoryFilter,
    statusFilter,
    favoriteOnly,
  ]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      ideas: items.filter((item) => item.status === "Idea")
        .length,
      working: items.filter(
        (item) => item.status === "Working"
      ).length,
      finished: items.filter(
        (item) => item.status === "Finished"
      ).length,
      favorites: items.filter((item) => item.favorite).length,
    };
  }, [items]);

  return (
    <PageShell
      eyebrow="CREATIVE SPACE"
      title="Creativity 🎨"
      description="Capture your creative ideas, projects and little experiments."
    >
      <div className="creativity-layout">
        <GlassCard className="creativity-form-card">
          <div className="creativity-form-header">
            <div>
              <span className="creativity-form-eyebrow">
                {editingId ? "EDIT PROJECT" : "NEW PROJECT"}
              </span>

              <h2>
                {editingId
                  ? "Keep creating ✨"
                  : "What are you creating?"}
              </h2>

              <p>
                Save an idea before it disappears from your
                mind.
              </p>
            </div>

            <div className="creativity-big-icon">
              {categoryIcons[form.category]}
            </div>
          </div>

          <div className="creativity-form-grid">
            <GlassInput
              label="Title"
              placeholder="e.g. New sketch idea"
              value={form.title}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  title: value,
                }))
              }
              className="creativity-full"
            />

            <label className="creativity-field creativity-full">
              <span>Description</span>

              <textarea
                className="creativity-textarea"
                placeholder="Describe your idea or project..."
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={5}
              />
            </label>

            <label className="creativity-field">
              <span>Category</span>

              <select
                className="creativity-select"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category:
                      event.target.value as CreativityCategory,
                  }))
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {categoryIcons[category]} {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="creativity-field">
              <span>Status</span>

              <select
                className="creativity-select"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status:
                      event.target.value as CreativityStatus,
                  }))
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="creativity-favorite-check">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  favorite: event.target.checked,
                }))
              }
            />

            <span>⭐ Mark as favorite</span>
          </label>

          <div className="creativity-form-actions">
            <GlassButton
              active
              onClick={handleSubmit}
            >
              {editingId ? "Update Project" : "Save Project"}
            </GlassButton>

            {editingId && (
              <GlassButton onClick={resetForm}>
                Cancel
              </GlassButton>
            )}
          </div>
        </GlassCard>

        <div className="creativity-stats-grid">
          <GlassCard>
            <span className="creativity-stat-icon">🎨</span>
            <strong>{stats.total}</strong>
            <span>Total Projects</span>
          </GlassCard>

          <GlassCard>
            <span className="creativity-stat-icon">💡</span>
            <strong>{stats.ideas}</strong>
            <span>Ideas</span>
          </GlassCard>

          <GlassCard>
            <span className="creativity-stat-icon">⚡</span>
            <strong>{stats.working}</strong>
            <span>Working</span>
          </GlassCard>

          <GlassCard>
            <span className="creativity-stat-icon">🏆</span>
            <strong>{stats.finished}</strong>
            <span>Finished</span>
          </GlassCard>

          <GlassCard>
            <span className="creativity-stat-icon">⭐</span>
            <strong>{stats.favorites}</strong>
            <span>Favorites</span>
          </GlassCard>
        </div>

        <GlassCard className="creativity-tools-card">
          <div className="creativity-tools">
            <GlassInput
              placeholder="Search creative projects..."
              value={search}
              onChange={setSearch}
            />

            <select
              className="creativity-filter"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value as
                    | CreativityCategory
                    | "All"
                )
              }
            >
              <option value="All">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {categoryIcons[category]} {category}
                </option>
              ))}
            </select>

            <select
              className="creativity-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | CreativityStatus
                    | "All"
                )
              }
            >
              <option value="All">All Status</option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <GlassButton
              active={favoriteOnly}
              onClick={() =>
                setFavoriteOnly((current) => !current)
              }
            >
              ⭐ Favorites
            </GlassButton>
          </div>
        </GlassCard>

        <div className="creativity-section-heading">
          <div>
            <span>YOUR CREATIVE UNIVERSE</span>
            <h2>
              {filteredItems.length}{" "}
              {filteredItems.length === 1
                ? "project"
                : "projects"}
            </h2>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <GlassCard className="creativity-empty">
            <div>🎨</div>

            <h3>
              {items.length === 0
                ? "Your creative space is empty"
                : "No projects found"}
            </h3>

            <p>
              {items.length === 0
                ? "Start with one small idea. You never know where it can lead."
                : "Try changing your search or filters."}
            </p>
          </GlassCard>
        ) : (
          <div className="creativity-grid">
            {filteredItems.map((item) => (
              <GlassCard
                key={item.id}
                className="creativity-project-card"
              >
                <div className="creativity-project-top">
                  <div className="creativity-project-icon">
                    {categoryIcons[item.category]}
                  </div>

                  <button
                    className={`creativity-star ${
                      item.favorite ? "active" : ""
                    }`}
                    onClick={() =>
                      toggleFavorite(item.id)
                    }
                    aria-label="Toggle favorite"
                  >
                    {item.favorite ? "★" : "☆"}
                  </button>
                </div>

                <div className="creativity-project-content">
                  <div className="creativity-project-tags">
                    <GlassBadge>
                      {item.category}
                    </GlassBadge>

                    <GlassBadge>
                      {item.status}
                    </GlassBadge>
                  </div>

                  <h3>{item.title}</h3>

                  {item.description && (
                    <p>{item.description}</p>
                  )}
                </div>

                <div className="creativity-status-row">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      className={
                        item.status === status
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        changeStatus(item.id, status)
                      }
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="creativity-project-actions">
                  <GlassButton
                    onClick={() => editItem(item)}
                  >
                    Edit
                  </GlassButton>

                  <button
                    className="creativity-delete"
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}