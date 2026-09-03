"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassInput from "@/component/glass/GlassInput";
import GlassBadge from "@/component/glass/GlassBadge";

type ListCategory =
  | "Personal"
  | "Study"
  | "Shopping"
  | "Projects"
  | "Ideas"
  | "Travel"
  | "Other";

type ListItem = {
  id: string;
  text: string;
  completed: boolean;
};

type MyList = {
  id: string;
  title: string;
  description: string;
  category: ListCategory;
  favorite: boolean;
  items: ListItem[];
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "my-little-universe-lists";

const categories: ListCategory[] = [
  "Personal",
  "Study",
  "Shopping",
  "Projects",
  "Ideas",
  "Travel",
  "Other",
];

const categoryIcons: Record<ListCategory, string> = {
  Personal: "👤",
  Study: "📚",
  Shopping: "🛒",
  Projects: "🚀",
  Ideas: "💡",
  Travel: "✈️",
  Other: "📝",
};

const emptyForm = {
  title: "",
  description: "",
  category: "Personal" as ListCategory,
  favorite: false,
};

export default function ListsPage() {
  const [lists, setLists] = useState<MyList[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [itemText, setItemText] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    ListCategory | "All"
  >("All");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Completed"
  >("All");
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setLists(parsed);
        }
      }
    } catch {
      console.log("Lists could not be loaded.");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists, loaded]);

  const resetForm = () => {
    setForm(emptyForm);
    setItemText("");
    setEditingId(null);
  };

  const addItemToForm = () => {
    const text = itemText.trim();

    if (!text) return;

    if (editingId) {
      const newItem: ListItem = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        text,
        completed: false,
      };

      setLists((current) =>
        current.map((list) =>
          list.id === editingId
            ? {
                ...list,
                items: [...list.items, newItem],
                updatedAt: Date.now(),
              }
            : list
        )
      );
    }

    setItemText("");
  };

  const removeItem = (itemId: string) => {
    if (!editingId) return;

    setLists((current) =>
      current.map((list) =>
        list.id === editingId
          ? {
              ...list,
              items: list.items.filter(
                (item) => item.id !== itemId
              ),
              updatedAt: Date.now(),
            }
          : list
      )
    );
  };

  const toggleFormItem = (itemId: string) => {
    if (!editingId) return;

    setLists((current) =>
      current.map((list) =>
        list.id === editingId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      completed: !item.completed,
                    }
                  : item
              ),
              updatedAt: Date.now(),
            }
          : list
      )
    );
  };

  const handleSubmit = () => {
    const title = form.title.trim();

    if (!title) return;

    if (editingId) {
      setLists((current) =>
        current.map((list) =>
          list.id === editingId
            ? {
                ...list,
                title,
                description: form.description.trim(),
                category: form.category,
                favorite: form.favorite,
                updatedAt: Date.now(),
              }
            : list
        )
      );
    } else {
      const now = Date.now();

      const newList: MyList = {
        id: `${now}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        title,
        description: form.description.trim(),
        category: form.category,
        favorite: form.favorite,
        items: [],
        createdAt: now,
        updatedAt: now,
      };

      setLists((current) => [newList, ...current]);
    }

    resetForm();
  };

  const editList = (list: MyList) => {
    setEditingId(list.id);

    setForm({
      title: list.title,
      description: list.description,
      category: list.category,
      favorite: list.favorite,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteList = (id: string) => {
    const confirmed = window.confirm(
      "Delete this list?"
    );

    if (!confirmed) return;

    setLists((current) =>
      current.filter((list) => list.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  };

  const toggleFavorite = (id: string) => {
    setLists((current) =>
      current.map((list) =>
        list.id === id
          ? {
              ...list,
              favorite: !list.favorite,
              updatedAt: Date.now(),
            }
          : list
      )
    );
  };

  const toggleItem = (
    listId: string,
    itemId: string
  ) => {
    setLists((current) =>
      current.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      completed: !item.completed,
                    }
                  : item
              ),
              updatedAt: Date.now(),
            }
          : list
      )
    );
  };

  const deleteItem = (
    listId: string,
    itemId: string
  ) => {
    setLists((current) =>
      current.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.filter(
                (item) => item.id !== itemId
              ),
              updatedAt: Date.now(),
            }
          : list
      )
    );
  };

  const filteredLists = useMemo(() => {
    const query = search.trim().toLowerCase();

    return lists.filter((list) => {
      const matchesSearch =
        !query ||
        list.title.toLowerCase().includes(query) ||
        list.description
          .toLowerCase()
          .includes(query) ||
        list.items.some((item) =>
          item.text.toLowerCase().includes(query)
        );

      const matchesCategory =
        categoryFilter === "All" ||
        list.category === categoryFilter;

      const completedItems = list.items.filter(
        (item) => item.completed
      ).length;

      const isCompleted =
        list.items.length > 0 &&
        completedItems === list.items.length;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Completed" && isCompleted) ||
        (statusFilter === "Active" && !isCompleted);

      const matchesFavorite =
        !favoriteOnly || list.favorite;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesFavorite
      );
    });
  }, [
    lists,
    search,
    categoryFilter,
    statusFilter,
    favoriteOnly,
  ]);

  const stats = useMemo(() => {
    const totalItems = lists.reduce(
      (sum, list) => sum + list.items.length,
      0
    );

    const completedItems = lists.reduce(
      (sum, list) =>
        sum +
        list.items.filter((item) => item.completed).length,
      0
    );

    const completedLists = lists.filter(
      (list) =>
        list.items.length > 0 &&
        list.items.every((item) => item.completed)
    ).length;

    return {
      total: lists.length,
      active: lists.filter(
        (list) =>
          !(
            list.items.length > 0 &&
            list.items.every((item) => item.completed)
          )
      ).length,
      completed: completedLists,
      favorites: lists.filter((list) => list.favorite)
        .length,
      totalItems,
      completedItems,
    };
  }, [lists]);

  const editingList = editingId
    ? lists.find((list) => list.id === editingId)
    : null;

  const editingItems = editingList?.items ?? [];

  return (
    <PageShell
      eyebrow="YOUR LISTS"
      title="Lists 📝"
      description="Keep your tasks, plans and little lists organized in one calm space."
    >
      <div className="lists-layout">
        <GlassCard className="lists-form-card">
          <div className="lists-form-header">
            <div>
              <span className="lists-form-eyebrow">
                {editingId ? "EDIT LIST" : "NEW LIST"}
              </span>

              <h2>
                {editingId
                  ? "Update your list ✨"
                  : "Create a new list"}
              </h2>

              <p>
                Turn scattered thoughts into something
                organized.
              </p>
            </div>

            <div className="lists-big-icon">
              {categoryIcons[form.category]}
            </div>
          </div>

          <div className="lists-form-grid">
            <GlassInput
              label="List Title"
              placeholder="e.g. Things to learn"
              value={form.title}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  title: value,
                }))
              }
              className="lists-full"
            />

            <GlassInput
              label="Description"
              placeholder="Optional description..."
              value={form.description}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  description: value,
                }))
              }
              className="lists-full"
            />

            <label className="lists-field">
              <span>Category</span>

              <select
                className="lists-select"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category:
                      event.target.value as ListCategory,
                  }))
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

            <label className="lists-favorite-check">
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
          </div>

          {editingId && (
            <div className="lists-items-editor">
              <div className="lists-editor-title">
                <span>LIST ITEMS</span>
                <small>
                  {editingItems.length}{" "}
                  {editingItems.length === 1
                    ? "item"
                    : "items"}
                </small>
              </div>

              <div className="lists-add-item">
                <input
                  className="lists-item-input"
                  placeholder="Add an item..."
                  value={itemText}
                  onChange={(event) =>
                    setItemText(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addItemToForm();
                    }
                  }}
                />

                <GlassButton
                  active
                  onClick={addItemToForm}
                >
                  + Add
                </GlassButton>
              </div>

              {editingItems.length > 0 && (
                <div className="lists-editor-items">
                  {editingItems.map((item) => (
                    <div
                      key={item.id}
                      className="lists-editor-item"
                    >
                      <button
                        className={`lists-check ${
                          item.completed
                            ? "completed"
                            : ""
                        }`}
                        onClick={() =>
                          toggleFormItem(item.id)
                        }
                      >
                        {item.completed ? "✓" : ""}
                      </button>

                      <span
                        className={
                          item.completed
                            ? "item-done"
                            : ""
                        }
                      >
                        {item.text}
                      </span>

                      <button
                        className="lists-remove-item"
                        onClick={() =>
                          removeItem(item.id)
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="lists-form-actions">
            <GlassButton
              active
              onClick={handleSubmit}
            >
              {editingId ? "Update List" : "Create List"}
            </GlassButton>

            {editingId && (
              <GlassButton onClick={resetForm}>
                Cancel
              </GlassButton>
            )}
          </div>
        </GlassCard>

        <div className="lists-stats-grid">
          <GlassCard>
            <span className="lists-stat-icon">📝</span>
            <strong>{stats.total}</strong>
            <span>Total Lists</span>
          </GlassCard>

          <GlassCard>
            <span className="lists-stat-icon">⚡</span>
            <strong>{stats.active}</strong>
            <span>Active</span>
          </GlassCard>

          <GlassCard>
            <span className="lists-stat-icon">✅</span>
            <strong>{stats.completed}</strong>
            <span>Completed</span>
          </GlassCard>

          <GlassCard>
            <span className="lists-stat-icon">⭐</span>
            <strong>{stats.favorites}</strong>
            <span>Favorites</span>
          </GlassCard>

          <GlassCard>
            <span className="lists-stat-icon">☑️</span>
            <strong>
              {stats.completedItems}/{stats.totalItems}
            </strong>
            <span>Items Done</span>
          </GlassCard>
        </div>

        <GlassCard className="lists-tools-card">
          <div className="lists-tools">
            <GlassInput
              placeholder="Search lists..."
              value={search}
              onChange={setSearch}
            />

            <select
              className="lists-filter"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value as
                    | ListCategory
                    | "All"
                )
              }
            >
              <option value="All">All Categories</option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {categoryIcons[category]} {category}
                </option>
              ))}
            </select>

            <select
              className="lists-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "All"
                    | "Active"
                    | "Completed"
                )
              }
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
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

        <div className="lists-section-heading">
          <div>
            <span>YOUR COLLECTION</span>
            <h2>
              {filteredLists.length}{" "}
              {filteredLists.length === 1
                ? "list"
                : "lists"}
            </h2>
          </div>
        </div>

        {filteredLists.length === 0 ? (
          <GlassCard className="lists-empty">
            <div>📝</div>

            <h3>
              {lists.length === 0
                ? "Your list space is empty"
                : "No lists found"}
            </h3>

            <p>
              {lists.length === 0
                ? "Create your first list and start organizing your universe."
                : "Try changing your search or filters."}
            </p>
          </GlassCard>
        ) : (
          <div className="lists-grid">
            {filteredLists.map((list) => {
              const completedCount = list.items.filter(
                (item) => item.completed
              ).length;

              const progress =
                list.items.length > 0
                  ? Math.round(
                      (completedCount /
                        list.items.length) *
                        100
                    )
                  : 0;

              const isCompleted =
                list.items.length > 0 &&
                completedCount === list.items.length;

              return (
                <GlassCard
                  key={list.id}
                  className="list-card"
                >
                  <div className="list-card-top">
                    <div className="list-icon">
                      {categoryIcons[list.category]}
                    </div>

                    <button
                      className={`list-star ${
                        list.favorite ? "active" : ""
                      }`}
                      onClick={() =>
                        toggleFavorite(list.id)
                      }
                    >
                      {list.favorite ? "★" : "☆"}
                    </button>
                  </div>

                  <div className="list-card-content">
                    <div className="list-tags">
                      <GlassBadge>
                        {list.category}
                      </GlassBadge>

                      <GlassBadge>
                        {isCompleted
                          ? "Completed"
                          : "Active"}
                      </GlassBadge>
                    </div>

                    <h3>{list.title}</h3>

                    {list.description && (
                      <p>{list.description}</p>
                    )}
                  </div>

                  <div className="list-progress-area">
                    <div className="list-progress-info">
                      <span>Progress</span>

                      <strong>
                        {completedCount}/{list.items.length}
                      </strong>
                    </div>

                    <div className="list-progress">
                      <div
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <small>{progress}% complete</small>
                  </div>

                  {list.items.length > 0 && (
                    <div className="list-items">
                      {list.items.map((item) => (
                        <div
                          key={item.id}
                          className="list-item"
                        >
                          <button
                            className={`lists-check ${
                              item.completed
                                ? "completed"
                                : ""
                            }`}
                            onClick={() =>
                              toggleItem(
                                list.id,
                                item.id
                              )
                            }
                          >
                            {item.completed ? "✓" : ""}
                          </button>

                          <span
                            className={
                              item.completed
                                ? "item-done"
                                : ""
                            }
                          >
                            {item.text}
                          </span>

                          <button
                            className="list-item-delete"
                            onClick={() =>
                              deleteItem(
                                list.id,
                                item.id
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="list-card-actions">
                    <GlassButton
                      onClick={() => editList(list)}
                    >
                      Edit
                    </GlassButton>

                    <button
                      className="list-delete"
                      onClick={() =>
                        deleteList(list.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}