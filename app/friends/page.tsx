"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassInput from "@/component/glass/GlassInput";
import GlassBadge from "@/component/glass/GlassBadge";

type Friend = {
  id: string;
  name: string;
  nickname: string;
  birthday: string;
  category: string;
  about: string;
  icon: string;
  image: string;
  favorite: boolean;
  notifyBirthday: boolean;
  createdAt: number;
};

const STORAGE_KEY = "my-little-universe-friends-v2";

const categories = [
  "Friend",
  "Best Friend",
  "School",
  "Online",
  "Family",
  "Other",
];

const icons = [
  "👤",
  "👥",
  "😊",
  "🌟",
  "💙",
  "✨",
  "🎮",
  "📚",
  "🎨",
  "🌌",
];

const emptyForm = {
  name: "",
  nickname: "",
  birthday: "",
  category: "Friend",
  about: "",
  icon: "👤",
  image: "",
  favorite: false,
  notifyBirthday: false,
};

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setFriends(parsed);
      }
    } catch {
      console.log("Friends could not be loaded.");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(friends));
  }, [friends]);

  const updateForm = (
    key: keyof typeof emptyForm,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert("Image should be smaller than 4MB.");
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

  const removeImage = () => {
    updateForm("image", "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveFriend = () => {
    if (!form.name.trim()) {
      alert("Please enter friend's name.");
      return;
    }

    if (editingId) {
      setFriends((current) =>
        current.map((friend) =>
          friend.id === editingId
            ? {
                ...friend,
                ...form,
              }
            : friend
        )
      );
    } else {
      const newFriend: Friend = {
        id: crypto.randomUUID(),
        ...form,
        createdAt: Date.now(),
      };

      setFriends((current) => [
        newFriend,
        ...current,
      ]);
    }

    resetForm();
  };

  const editFriend = (friend: Friend) => {
    setForm({
      name: friend.name,
      nickname: friend.nickname,
      birthday: friend.birthday,
      category: friend.category,
      about: friend.about,
      icon: friend.icon,
      image: friend.image,
      favorite: friend.favorite,
      notifyBirthday: friend.notifyBirthday,
    });

    setEditingId(friend.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteFriend = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this friend?"
    );

    if (!confirmed) return;

    setFriends((current) =>
      current.filter((friend) => friend.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  };

  const toggleFavorite = (id: string) => {
    setFriends((current) =>
      current.map((friend) =>
        friend.id === id
          ? {
              ...friend,
              favorite: !friend.favorite,
            }
          : friend
      )
    );
  };

  const toggleBirthdayNotify = (id: string) => {
    setFriends((current) =>
      current.map((friend) =>
        friend.id === id
          ? {
              ...friend,
              notifyBirthday: !friend.notifyBirthday,
            }
          : friend
      )
    );
  };

  const filteredFriends = useMemo(() => {
    const query = search.trim().toLowerCase();

    return friends.filter((friend) => {
      const matchesSearch =
        !query ||
        friend.name.toLowerCase().includes(query) ||
        friend.nickname.toLowerCase().includes(query) ||
        friend.about.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        friend.category === categoryFilter;

      const matchesFavorite =
        !favoriteOnly || friend.favorite;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesFavorite
      );
    });
  }, [
    friends,
    search,
    categoryFilter,
    favoriteOnly,
  ]);

  const favoriteCount = friends.filter(
    (friend) => friend.favorite
  ).length;

  const birthdayCount = friends.filter(
    (friend) => friend.birthday
  ).length;

  const notifyCount = friends.filter(
    (friend) =>
      friend.birthday &&
      friend.notifyBirthday
  ).length;

  return (
    <PageShell
      eyebrow="FRIENDS"
      title="My People 👥"
      description="Keep the people who matter to you in your little universe."
    >
      <div className="friends-layout">

        {/* =========================
            ADD / EDIT FORM
        ========================= */}

        <GlassCard className="friends-form-card">

          <div className="friends-section-heading">
            <div>
              <div className="eyebrow">
                {editingId
                  ? "EDIT FRIEND"
                  : "ADD SOMEONE"}
              </div>

              <h2>
                {editingId
                  ? "Update Friend"
                  : "Add a Friend"}
              </h2>
            </div>

            <div className="friends-big-icon">
              {form.icon}
            </div>
          </div>

          {/* PHOTO */}

          <div className="friends-photo-section">

            <div className="friends-photo-preview">

              {form.image ? (
                <img
                  src={form.image}
                  alt="Friend preview"
                />
              ) : (
                <div className="friends-photo-placeholder">
                  {form.icon}
                </div>
              )}

            </div>

            <div className="friends-photo-controls">

              <div>
                <strong>Friend Photo</strong>

                <p>
                  Add a photo so you can easily
                  recognize this person.
                </p>
              </div>

              <div className="friends-photo-buttons">

                <label className="friends-upload-button">
                  📸 Upload Photo

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>

                {form.image && (
                  <button
                    type="button"
                    className="friends-remove-photo"
                    onClick={removeImage}
                  >
                    Remove
                  </button>
                )}

              </div>

              <small>
                JPG, PNG, WEBP · Max 4MB
              </small>

            </div>
          </div>

          {/* BASIC INFO */}

          <div className="friends-form-grid">

            <GlassInput
              label="Name"
              placeholder="Friend's name"
              value={form.name}
              onChange={(value) =>
                updateForm("name", value)
              }
            />

            <GlassInput
              label="Nickname"
              placeholder="Optional nickname"
              value={form.nickname}
              onChange={(value) =>
                updateForm("nickname", value)
              }
            />

            <GlassInput
              label="Birthday"
              type="date"
              value={form.birthday}
              onChange={(value) =>
                updateForm("birthday", value)
              }
            />

            <label className="friends-select-wrap">
              <span>Category</span>

              <select
                value={form.category}
                onChange={(event) =>
                  updateForm(
                    "category",
                    event.target.value
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
            </label>

          </div>

          {/* ABOUT */}

          <label className="friends-textarea-wrap">

            <span>
              About this person
            </span>

            <textarea
              placeholder="Write something about your friend, your memories, what they like, how you met, or anything you want to remember..."
              value={form.about}
              onChange={(event) =>
                updateForm(
                  "about",
                  event.target.value
                )
              }
            />

          </label>

          {/* ICON */}

          <div className="friends-icon-picker">

            <span>Choose an icon</span>

            <div className="friends-icons">

              {icons.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  className={
                    form.icon === icon
                      ? "friends-icon active"
                      : "friends-icon"
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

          {/* OPTIONS */}

          <div className="friends-options">

            <label className="friends-option">

              <input
                type="checkbox"
                checked={form.favorite}
                onChange={(event) =>
                  updateForm(
                    "favorite",
                    event.target.checked
                  )
                }
              />

              <div>
                <strong>⭐ Favorite Friend</strong>
                <span>
                  Keep this person highlighted.
                </span>
              </div>

            </label>

            <label className="friends-option">

              <input
                type="checkbox"
                checked={form.notifyBirthday}
                onChange={(event) =>
                  updateForm(
                    "notifyBirthday",
                    event.target.checked
                  )
                }
              />

              <div>
                <strong>
                  🔔 Birthday Notification
                </strong>

                <span>
                  Remind me when their birthday comes.
                </span>
              </div>

            </label>

          </div>

          {/* ACTIONS */}

          <div className="friends-form-actions">

            <GlassButton
              onClick={saveFriend}
              active
            >
              {editingId
                ? "Update Friend"
                : "Add Friend"}
            </GlassButton>

            {editingId && (
              <GlassButton onClick={resetForm}>
                Cancel
              </GlassButton>
            )}

          </div>

        </GlassCard>

        {/* =========================
            STATS
        ========================= */}

        <div className="friends-stats-grid">

          <GlassCard className="friends-stat-card">
            <span>👥</span>
            <strong>{friends.length}</strong>
            <small>Total People</small>
          </GlassCard>

          <GlassCard className="friends-stat-card">
            <span>⭐</span>
            <strong>{favoriteCount}</strong>
            <small>Favorites</small>
          </GlassCard>

          <GlassCard className="friends-stat-card">
            <span>🎂</span>
            <strong>{birthdayCount}</strong>
            <small>Birthdays</small>
          </GlassCard>

          <GlassCard className="friends-stat-card">
            <span>🔔</span>
            <strong>{notifyCount}</strong>
            <small>Notifications On</small>
          </GlassCard>

        </div>

        {/* =========================
            SEARCH / FILTERS
        ========================= */}

        <GlassCard className="friends-tools">

          <GlassInput
            placeholder="Search friends..."
            value={search}
            onChange={setSearch}
            className="friends-search"
          />

          <div className="friends-filters">

            <button
              type="button"
              className={
                categoryFilter === "All"
                  ? "friends-filter active"
                  : "friends-filter"
              }
              onClick={() =>
                setCategoryFilter("All")
              }
            >
              All
            </button>

            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  categoryFilter === category
                    ? "friends-filter active"
                    : "friends-filter"
                }
                onClick={() =>
                  setCategoryFilter(category)
                }
              >
                {category}
              </button>
            ))}

            <button
              type="button"
              className={
                favoriteOnly
                  ? "friends-filter active"
                  : "friends-filter"
              }
              onClick={() =>
                setFavoriteOnly(
                  (current) => !current
                )
              }
            >
              ⭐ Favorites
            </button>

          </div>

        </GlassCard>

        {/* =========================
            FRIEND CARDS
        ========================= */}

        {filteredFriends.length === 0 ? (
          <GlassCard className="friends-empty">

            <div>👥</div>

            <h3>
              {friends.length === 0
                ? "No friends added yet"
                : "No friends found"}
            </h3>

            <p>
              {friends.length === 0
                ? "Add someone special to start your little people space."
                : "Try changing your search or filters."}
            </p>

          </GlassCard>
        ) : (
          <div className="friends-grid">

            {filteredFriends.map((friend) => (
              <GlassCard
                key={friend.id}
                className="friend-card"
              >

                {/* PHOTO */}

                <div className="friend-photo">

                  {friend.image ? (
                    <img
                      src={friend.image}
                      alt={friend.name}
                    />
                  ) : (
                    <div className="friend-photo-fallback">
                      {friend.icon}
                    </div>
                  )}

                  <button
                    type="button"
                    className={
                      friend.favorite
                        ? "friend-star active"
                        : "friend-star"
                    }
                    onClick={() =>
                      toggleFavorite(friend.id)
                    }
                    aria-label="Toggle favorite"
                  >
                    {friend.favorite
                      ? "★"
                      : "☆"}
                  </button>

                </div>

                {/* INFO */}

                <div className="friend-info">

                  <h3>{friend.name}</h3>

                  {friend.nickname && (
                    <p className="friend-nickname">
                      “{friend.nickname}”
                    </p>
                  )}

                  <GlassBadge>
                    {friend.category}
                  </GlassBadge>

                  {/* BIRTHDAY */}

                  {friend.birthday && (
                    <div className="friend-birthday-row">

                      <span>
                        🎂{" "}
                        {new Date(
                          `${friend.birthday}T00:00:00`
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>

                      <button
                        type="button"
                        className={
                          friend.notifyBirthday
                            ? "friend-notify active"
                            : "friend-notify"
                        }
                        onClick={() =>
                          toggleBirthdayNotify(
                            friend.id
                          )
                        }
                      >
                        {friend.notifyBirthday
                          ? "🔔 ON"
                          : "🔕 OFF"}
                      </button>

                    </div>
                  )}

                  {/* ABOUT */}

                  {friend.about && (
                    <div className="friend-about">

                      <span>About</span>

                      <p>
                        {friend.about}
                      </p>

                    </div>
                  )}

                </div>

                {/* ACTIONS */}

                <div className="friend-actions">

                  <button
                    type="button"
                    onClick={() =>
                      editFriend(friend)
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteFriend(friend.id)
                    }
                  >
                    🗑️ Delete
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