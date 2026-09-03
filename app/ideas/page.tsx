"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/component/layout/PageShell";

type IdeaCategory =
  | "Personal"
  | "Study"
  | "Creative"
  | "Project"
  | "Future"
  | "Fun"
  | "Other";

type IdeaStatus = "New" | "Exploring" | "Done";

type Idea = {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  status: IdeaStatus;
  favorite: boolean;
  createdAt: number;
};

const STORAGE_KEY = "my-little-universe-ideas";

const CATEGORIES: IdeaCategory[] = [
  "Personal",
  "Study",
  "Creative",
  "Project",
  "Future",
  "Fun",
  "Other",
];

const STATUSES: IdeaStatus[] = [
  "New",
  "Exploring",
  "Done",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "Personal" as IdeaCategory,
  status: "New" as IdeaStatus,
  favorite: false,
};

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | IdeaStatus
  >("All");

  const [categoryFilter, setCategoryFilter] = useState<
    "All" | IdeaCategory
  >("All");

  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  /* LOAD */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setIdeas(parsed);
        }
      }
    } catch {
      console.log("Ideas could not be loaded.");
    }

    setLoaded(true);
  }, []);

  /* SAVE */

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(ideas)
    );
  }, [ideas, loaded]);

  /* RESET */

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  /* SAVE IDEA */

  const saveIdea = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const title = form.title.trim();

    if (!title) return;

    if (editingId) {
      setIdeas((current) =>
        current.map((idea) =>
          idea.id === editingId
            ? {
                ...idea,
                title,
                description: form.description.trim(),
                category: form.category,
                status: form.status,
                favorite: form.favorite,
              }
            : idea
        )
      );
    } else {
      const newIdea: Idea = {
        id: crypto.randomUUID(),
        title,
        description: form.description.trim(),
        category: form.category,
        status: form.status,
        favorite: form.favorite,
        createdAt: Date.now(),
      };

      setIdeas((current) => [
        newIdea,
        ...current,
      ]);
    }

    resetForm();
  };

  /* EDIT */

  const editIdea = (idea: Idea) => {
    setEditingId(idea.id);

    setForm({
      title: idea.title,
      description: idea.description,
      category: idea.category,
      status: idea.status,
      favorite: idea.favorite,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* DELETE */

  const deleteIdea = (id: string) => {
    const confirmed = window.confirm(
      "Delete this idea?"
    );

    if (!confirmed) return;

    setIdeas((current) =>
      current.filter((idea) => idea.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  };

  /* FAVORITE */

  const toggleFavorite = (id: string) => {
    setIdeas((current) =>
      current.map((idea) =>
        idea.id === id
          ? {
              ...idea,
              favorite: !idea.favorite,
            }
          : idea
      )
    );
  };

  /* STATUS */

  const changeStatus = (
    id: string,
    status: IdeaStatus
  ) => {
    setIdeas((current) =>
      current.map((idea) =>
        idea.id === id
          ? {
              ...idea,
              status,
            }
          : idea
      )
    );
  };

  /* FILTER */

  const filteredIdeas = useMemo(() => {
    const query = search.trim().toLowerCase();

    return ideas
      .filter((idea) => {
        if (
          query &&
          !idea.title.toLowerCase().includes(query) &&
          !idea.description
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }

        if (
          statusFilter !== "All" &&
          idea.status !== statusFilter
        ) {
          return false;
        }

        if (
          categoryFilter !== "All" &&
          idea.category !== categoryFilter
        ) {
          return false;
        }

        if (
          favoriteOnly &&
          !idea.favorite
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) => b.createdAt - a.createdAt
      );
  }, [
    ideas,
    search,
    statusFilter,
    categoryFilter,
    favoriteOnly,
  ]);

  /* STATS */

  const favoriteCount = ideas.filter(
    (idea) => idea.favorite
  ).length;

  const exploringCount = ideas.filter(
    (idea) => idea.status === "Exploring"
  ).length;

  const doneCount = ideas.filter(
    (idea) => idea.status === "Done"
  ).length;

  return (
    <PageShell
      eyebrow="YOUR IMAGINATION"
      title="Ideas 💡"
      description="Capture the little sparks before they disappear."
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="ideas-layout">

        {/* HERO */}

        <section className="glass ideas-hero">
          <div className="ideas-hero-icon">
            💡
          </div>

          <div className="ideas-hero-content">
            <span>YOUR IDEA SPACE</span>

            <strong>
              {ideas.length}
            </strong>

            <p>
              {ideas.length === 1
                ? "idea captured"
                : "ideas captured"}
            </p>
          </div>

          <button
            type="button"
            className="idea-add-button"
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
              : "+ New Idea"}
          </button>
        </section>

        {/* FORM */}

        {showForm && (
          <section className="glass idea-form-card">
            <div className="idea-form-heading">
              <span>
                {editingId
                  ? "EDIT IDEA"
                  : "NEW IDEA"}
              </span>

              <h2>
                {editingId
                  ? "Update your idea"
                  : "What are you thinking about?"}
              </h2>
            </div>

            <form
              className="idea-form"
              onSubmit={saveIdea}
            >
              <label>
                <span>Idea Title</span>

                <input
                  type="text"
                  placeholder="e.g. Build a personal study app"
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
                <span>Category</span>

                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category:
                        event.target
                          .value as IdeaCategory,
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

              <label className="idea-form-full">
                <span>Description</span>

                <textarea
                  rows={4}
                  placeholder="Describe your idea, why you like it, or what you might do with it..."
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

              <label>
                <span>Status</span>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status:
                        event.target
                          .value as IdeaStatus,
                    })
                  }
                >
                  {STATUSES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="idea-favorite-check">
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
                  ⭐ Mark as favorite
                </span>
              </label>

              <div className="idea-form-actions">
                <button
                  type="button"
                  className="idea-secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="idea-save-button"
                >
                  {editingId
                    ? "✓ Update Idea"
                    : "+ Save Idea"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* STATS */}

        <section className="idea-stats-grid">
          <div className="glass idea-stat">
            <span>💡</span>
            <strong>{ideas.length}</strong>
            <small>Total Ideas</small>
          </div>

          <div className="glass idea-stat">
            <span>🔎</span>
            <strong>{exploringCount}</strong>
            <small>Exploring</small>
          </div>

          <div className="glass idea-stat">
            <span>⭐</span>
            <strong>{favoriteCount}</strong>
            <small>Favorites</small>
          </div>

          <div className="glass idea-stat">
            <span>✓</span>
            <strong>{doneCount}</strong>
            <small>Completed</small>
          </div>
        </section>

        {/* TOOLS */}

        <section className="glass idea-tools">

          <div className="idea-search-wrap">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search ideas..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="idea-filter-row">

            <button
              type="button"
              className={
                !favoriteOnly
                  ? "idea-filter idea-filter-active"
                  : "idea-filter"
              }
              onClick={() =>
                setFavoriteOnly(false)
              }
            >
              All
            </button>

            <button
              type="button"
              className={
                favoriteOnly
                  ? "idea-filter idea-filter-active"
                  : "idea-filter"
              }
              onClick={() =>
                setFavoriteOnly(true)
              }
            >
              ⭐ Favorites
            </button>

            <select
              className="idea-filter-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "All"
                    | IdeaStatus
                )
              }
            >
              <option value="All">
                All Status
              </option>

              {STATUSES.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            <select
              className="idea-filter-select"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value as
                    | "All"
                    | IdeaCategory
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

          </div>
        </section>

        {/* LIST */}

        {filteredIdeas.length > 0 ? (
          <section>
            <div className="idea-list-heading">
              <div>
                <span>YOUR COLLECTION</span>

                <h2>
                  My Ideas
                </h2>
              </div>

              <small>
                {filteredIdeas.length} shown
              </small>
            </div>

            <div className="ideas-grid">
              {filteredIdeas.map((idea) => (
                <article
                  key={idea.id}
                  className="glass idea-card"
                >
                  <div className="idea-card-top">

                    <div className="idea-card-icon">
                      💡
                    </div>

                    <button
                      type="button"
                      className={
                        idea.favorite
                          ? "idea-star idea-star-active"
                          : "idea-star"
                      }
                      onClick={() =>
                        toggleFavorite(
                          idea.id
                        )
                      }
                      aria-label="Toggle favorite"
                    >
                      {idea.favorite
                        ? "★"
                        : "☆"}
                    </button>

                  </div>

                  <div className="idea-card-meta">
                    <span>
                      {idea.category}
                    </span>

                    <span
                      className={`idea-status idea-status-${idea.status
                        .toLowerCase()
                        .replace(
                          " ",
                          "-"
                        )}`}
                    >
                      {idea.status}
                    </span>
                  </div>

                  <h2>
                    {idea.title}
                  </h2>

                  {idea.description && (
                    <p>
                      {idea.description}
                    </p>
                  )}

                  <div className="idea-status-control">
                    <span>
                      Status
                    </span>

                    <select
                      value={idea.status}
                      onChange={(event) =>
                        changeStatus(
                          idea.id,
                          event.target
                            .value as IdeaStatus
                        )
                      }
                    >
                      {STATUSES.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="idea-card-actions">
                    <button
                      type="button"
                      onClick={() =>
                        editIdea(idea)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteIdea(idea.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <div className="glass idea-empty">
            <div>💡</div>

            <h2>
              {ideas.length === 0
                ? "No ideas yet"
                : "No matching ideas"}
            </h2>

            <p>
              {ideas.length === 0
                ? "Save your first spark of imagination here."
                : "Try changing your search or filters."}
            </p>

            {ideas.length === 0 && (
              <button
                type="button"
                className="idea-empty-button"
                onClick={() =>
                  setShowForm(true)
                }
              >
                + Create First Idea
              </button>
            )}
          </div>
        )}

      </div>
    </PageShell>
  );
}