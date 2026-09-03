"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassBadge from "@/component/glass/GlassBadge";

type FavoriteItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  link: string;
  image: string;
  createdAt: number;
};

const STORAGE_KEY = "my-little-universe-favorites-v2";

const categories = [
  "Website",
  "Image",
  "Idea",
  "Study",
  "Inspiration",
  "Personal",
  "Other",
];

const icons = [
  "⭐",
  "🔗",
  "🖼️",
  "💡",
  "📚",
  "🎨",
  "❤️",
  "🌌",
  "🧭",
  "✨",
  "🔥",
  "📌",
];

const emptyForm = {
  title: "",
  description: "",
  icon: "⭐",
  category: "Other",
  link: "",
  image: "",
};

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loaded, setLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      console.log("Favorites could not be loaded.");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );
  }, [items, loaded]);

  const updateForm = (
    field: keyof typeof emptyForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert("Image 4MB se chhoti honi chahiye.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateForm("image", reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const saveFavorite = () => {
    if (!form.title.trim()) {
      alert("Title add karo.");
      return;
    }

    if (editingId) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: form.title.trim(),
                description: form.description.trim(),
                icon: form.icon,
                category: form.category,
                link: form.link.trim(),
                image: form.image,
              }
            : item
        )
      );
    } else {
      const newItem: FavoriteItem = {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        description: form.description.trim(),
        icon: form.icon,
        category: form.category,
        link: form.link.trim(),
        image: form.image,
        createdAt: Date.now(),
      };

      setItems((current) => [
        newItem,
        ...current,
      ]);
    }

    resetForm();
  };

  const editFavorite = (item: FavoriteItem) => {
    setEditingId(item.id);

    setForm({
      title: item.title,
      description: item.description,
      icon: item.icon,
      category: item.category,
      link: item.link,
      image: item.image,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteFavorite = (id: string) => {
    const confirmed = window.confirm(
      "Is favorite ko delete karna hai?"
    );

    if (!confirmed) return;

    setItems((current) =>
      current.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  };

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description
          .toLowerCase()
          .includes(query) ||
        item.category
          .toLowerCase()
          .includes(query) ||
        item.link.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [items, search, categoryFilter]);

  const imageCount = items.filter(
    (item) => item.image
  ).length;

  const linkCount = items.filter(
    (item) => item.link
  ).length;

  const categoryCount = new Set(
    items.map((item) => item.category)
  ).size;

  if (!loaded) {
    return (
      <PageShell
        eyebrow="FAVORITES"
        title="Favorites ⭐"
        description="Your personal collection."
      >
        <GlassCard className="favorites-loading">
          Loading your collection...
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="FAVORITES"
      title="Favorites ⭐"
      description="Save anything you want to keep close — links, images, ideas, references and more."
    >
      <div className="favorites-layout">

        {/* CREATE BOX */}

        <GlassCard className="favorites-create-card">
          <div className="favorites-create-header">
            <div>
              <GlassBadge>
                {editingId
                  ? "EDIT FAVORITE"
                  : "ANYTHING BOX"}
              </GlassBadge>

              <h2>
                {editingId
                  ? "Update your favorite"
                  : "Save anything you like"}
              </h2>

              <p>
                Add a title, note, link, image or simply
                something you never want to forget.
              </p>
            </div>

            <div className="favorites-create-icon">
              ⭐
            </div>
          </div>

          <div className="favorites-form-grid">

            <div className="favorites-field">
              <label>Title</label>

              <input
                value={form.title}
                onChange={(e) =>
                  updateForm(
                    "title",
                    e.target.value
                  )
                }
                placeholder="What do you want to save?"
              />
            </div>

            <div className="favorites-field">
              <label>Category</label>

              <select
                value={form.category}
                onChange={(e) =>
                  updateForm(
                    "category",
                    e.target.value
                  )
                }
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="favorites-field favorites-full">
              <label>Link</label>

              <input
                type="url"
                value={form.link}
                onChange={(e) =>
                  updateForm(
                    "link",
                    e.target.value
                  )
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="favorites-field favorites-full">
              <label>Description / Notes</label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  updateForm(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Why did you save this? Add any notes..."
              />
            </div>

          </div>

          {/* ICON PICKER */}

          <div className="favorites-picker">
            <span>Choose Icon</span>

            <div className="favorites-icon-list">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={
                    form.icon === icon
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    updateForm("icon", icon)
                  }
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* IMAGE */}

          <div className="favorites-image-box">

            <div className="favorites-image-heading">
              <div>
                <strong>🖼️ Add Image</strong>
                <small>
                  Optional · Max 4MB
                </small>
              </div>

              {form.image && (
                <button
                  type="button"
                  onClick={() =>
                    updateForm("image", "")
                  }
                >
                  Remove
                </button>
              )}
            </div>

            {form.image ? (
              <div className="favorites-image-preview">
                <img
                  src={form.image}
                  alt="Favorite preview"
                />
              </div>
            ) : (
              <button
                type="button"
                className="favorites-upload"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <span>📷</span>
                <strong>Choose an image</strong>
                <small>
                  JPG, PNG, WEBP
                </small>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              hidden
            />
          </div>

          <div className="favorites-form-actions">
            <GlassButton
              active
              onClick={saveFavorite}
            >
              {editingId
                ? "Update Favorite"
                : "Save Favorite"}
            </GlassButton>

            {editingId && (
              <GlassButton onClick={resetForm}>
                Cancel
              </GlassButton>
            )}
          </div>
        </GlassCard>

        {/* STATS */}

        <div className="favorites-stats-grid">

          <GlassCard className="favorites-stat">
            <span>⭐</span>
            <strong>{items.length}</strong>
            <small>Total Saved</small>
          </GlassCard>

          <GlassCard className="favorites-stat">
            <span>🔗</span>
            <strong>{linkCount}</strong>
            <small>Links</small>
          </GlassCard>

          <GlassCard className="favorites-stat">
            <span>🖼️</span>
            <strong>{imageCount}</strong>
            <small>Images</small>
          </GlassCard>

          <GlassCard className="favorites-stat">
            <span>🗂️</span>
            <strong>{categoryCount}</strong>
            <small>Categories</small>
          </GlassCard>

        </div>

        {/* SEARCH */}

        <GlassCard className="favorites-tools">

          <input
            className="favorites-search"
            placeholder="Search your collection..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <div className="favorites-filters">

            <button
              className={
                categoryFilter === "All"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategoryFilter("All")
              }
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category}
                className={
                  categoryFilter === category
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setCategoryFilter(category)
                }
              >
                {category}
              </button>
            ))}

          </div>
        </GlassCard>

        {/* COLLECTION */}

        {filteredItems.length === 0 ? (
          <GlassCard className="favorites-empty">

            <div className="favorites-empty-icon">
              {items.length === 0
                ? "⭐"
                : "🔎"}
            </div>

            <h3>
              {items.length === 0
                ? "Your collection is empty"
                : "Nothing found"}
            </h3>

            <p>
              {items.length === 0
                ? "Save your first link, image, idea or anything else you want to keep."
                : "Try another search or category."}
            </p>

          </GlassCard>
        ) : (
          <div className="favorites-grid">

            {filteredItems.map((item) => (
              <GlassCard
                key={item.id}
                className="favorite-card"
              >

                {item.image && (
                  <div className="favorite-image">
                    <img
                      src={item.image}
                      alt={item.title}
                    />
                  </div>
                )}

                <div className="favorite-card-top">

                  <div className="favorite-card-icon">
                    {item.icon}
                  </div>

                  <div className="favorite-card-actions">

                    <button
                      onClick={() =>
                        editFavorite(item)
                      }
                      title="Edit"
                    >
                      ✎
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        deleteFavorite(item.id)
                      }
                      title="Delete"
                    >
                      ×
                    </button>

                  </div>

                </div>

                <GlassBadge>
                  {item.category}
                </GlassBadge>

                <h3>{item.title}</h3>

                {item.description && (
                  <p className="favorite-description">
                    {item.description}
                  </p>
                )}

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="favorite-link-button"
                  >
                    🔗 Open Link
                    <span>↗</span>
                  </a>
                )}

                <div className="favorite-card-footer">
                  <span>
                    {new Date(
                      item.createdAt
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>

                  <span>⭐ Saved</span>
                </div>

              </GlassCard>
            ))}

          </div>
        )}

      </div>
    </PageShell>
  );
}