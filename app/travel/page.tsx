"use client";

import { useMemo, useState } from "react";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassInput from "@/component/glass/GlassInput";
import GlassBadge from "@/component/glass/GlassBadge";

type TripCategory =
  | "Travel"
  | "Adventure"
  | "Family"
  | "Study"
  | "Nature"
  | "Other";

type TripStatus =
  | "Planning"
  | "Upcoming"
  | "In Progress"
  | "Completed";

type Trip = {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  category: TripCategory;
  status: TripStatus;
  description: string;
  notes: string;
  icon: string;
  favorite: boolean;
  createdAt: number;
};

const STORAGE_KEY = "my-little-universe-travel";

const categories: TripCategory[] = [
  "Travel",
  "Adventure",
  "Family",
  "Study",
  "Nature",
  "Other",
];

const statuses: TripStatus[] = [
  "Planning",
  "Upcoming",
  "In Progress",
  "Completed",
];

const icons = [
  "✈️",
  "🌍",
  "🏔️",
  "🏖️",
  "🚗",
  "🚆",
  "🗺️",
  "🏕️",
  "🌲",
  "📸",
  "🎒",
  "🌌",
];

type Filter = "all" | "upcoming" | "completed" | "favorites";

function getTodayString() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDaysUntil(dateString: string) {
  if (!dateString) return null;

  const today = new Date();
  const target = new Date(`${dateString}T00:00:00`);

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const targetStart = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );

  return Math.round(
    (targetStart.getTime() - todayStart.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function formatDate(date: string) {
  if (!date) return "No date";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function calculateDuration(
  startDate: string,
  endDate: string
) {
  if (!startDate || !endDate) return null;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const diff =
    end.getTime() - start.getTime();

  const days =
    Math.round(
      diff / (1000 * 60 * 60 * 24)
    ) + 1;

  return days > 0 ? days : null;
}

function readTrips(): Trip[] {
  if (typeof window === "undefined") return [];

  try {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function saveTrips(trips: Trip[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(trips)
  );
}

export default function TravelPage() {
  const [trips, setTrips] = useState<Trip[]>(() =>
    readTrips()
  );

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState<Filter>("all");

  const [categoryFilter, setCategoryFilter] =
    useState<"All" | TripCategory>("All");

  const [title, setTitle] = useState("");
  const [destination, setDestination] =
    useState("");
  const [startDate, setStartDate] =
    useState("");
  const [endDate, setEndDate] =
    useState("");
  const [category, setCategory] =
    useState<TripCategory>("Travel");
  const [status, setStatus] =
    useState<TripStatus>("Planning");
  const [description, setDescription] =
    useState("");
  const [notes, setNotes] =
    useState("");
  const [icon, setIcon] =
    useState("✈️");
  const [favorite, setFavorite] =
    useState(false);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDestination("");
    setStartDate("");
    setEndDate("");
    setCategory("Travel");
    setStatus("Planning");
    setDescription("");
    setNotes("");
    setIcon("✈️");
    setFavorite(false);
    setShowForm(false);
  };

  const saveTrip = () => {
    if (!title.trim() || !destination.trim()) {
      return;
    }

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      alert(
        "End date cannot be before start date."
      );
      return;
    }

    if (editingId) {
      const updated = trips.map((trip) =>
        trip.id === editingId
          ? {
              ...trip,
              title: title.trim(),
              destination:
                destination.trim(),
              startDate,
              endDate,
              category,
              status,
              description:
                description.trim(),
              notes: notes.trim(),
              icon,
              favorite,
            }
          : trip
      );

      setTrips(updated);
      saveTrips(updated);
    } else {
      const newTrip: Trip = {
        id: crypto.randomUUID(),
        title: title.trim(),
        destination:
          destination.trim(),
        startDate,
        endDate,
        category,
        status,
        description:
          description.trim(),
        notes: notes.trim(),
        icon,
        favorite,
        createdAt: Date.now(),
      };

      const updated = [
        newTrip,
        ...trips,
      ];

      setTrips(updated);
      saveTrips(updated);
    }

    resetForm();
  };

  const editTrip = (trip: Trip) => {
    setEditingId(trip.id);
    setTitle(trip.title);
    setDestination(trip.destination);
    setStartDate(trip.startDate);
    setEndDate(trip.endDate);
    setCategory(trip.category);
    setStatus(trip.status);
    setDescription(trip.description);
    setNotes(trip.notes);
    setIcon(trip.icon);
    setFavorite(trip.favorite);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteTrip = (id: string) => {
    const confirmed =
      window.confirm(
        "Delete this trip?"
      );

    if (!confirmed) return;

    const updated = trips.filter(
      (trip) => trip.id !== id
    );

    setTrips(updated);
    saveTrips(updated);
  };

  const toggleFavorite = (id: string) => {
    const updated = trips.map((trip) =>
      trip.id === id
        ? {
            ...trip,
            favorite: !trip.favorite,
          }
        : trip
    );

    setTrips(updated);
    saveTrips(updated);
  };

  const filteredTrips = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return [...trips]
      .filter((trip) => {
        const matchesSearch =
          !query ||
          trip.title
            .toLowerCase()
            .includes(query) ||
          trip.destination
            .toLowerCase()
            .includes(query) ||
          trip.category
            .toLowerCase()
            .includes(query) ||
          trip.description
            .toLowerCase()
            .includes(query) ||
          trip.notes
            .toLowerCase()
            .includes(query);

        if (!matchesSearch) {
          return false;
        }

        if (
          categoryFilter !== "All" &&
          trip.category !== categoryFilter
        ) {
          return false;
        }

        if (
          filter === "completed" &&
          trip.status !== "Completed"
        ) {
          return false;
        }

        if (
          filter === "favorites" &&
          !trip.favorite
        ) {
          return false;
        }

        if (filter === "upcoming") {
          const days =
            getDaysUntil(
              trip.startDate
            );

          if (
            days === null ||
            days < 0 ||
            trip.status === "Completed"
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;

        return (
          a.startDate.localeCompare(
            b.startDate
          )
        );
      });
  }, [
    trips,
    search,
    filter,
    categoryFilter,
  ]);

  const upcomingTrips =
    trips.filter((trip) => {
      const days =
        getDaysUntil(
          trip.startDate
        );

      return (
        days !== null &&
        days >= 0 &&
        trip.status !== "Completed"
      );
    });

  const completedTrips =
    trips.filter(
      (trip) =>
        trip.status === "Completed"
    );

  const favoriteTrips =
    trips.filter(
      (trip) => trip.favorite
    );

  const nextTrip =
    [...upcomingTrips].sort(
      (a, b) =>
        (getDaysUntil(
          a.startDate
        ) ?? 99999) -
        (getDaysUntil(
          b.startDate
        ) ?? 99999)
    )[0] ?? null;

  const resetAndOpenForm = () => {
    resetForm();
    setShowForm(true);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  return (
    <PageShell
      eyebrow="TRAVEL"
      title="Travel Space ✈️"
      description="Keep your trips, places, plans and travel memories organized in one beautiful space."
    >
      <div className="travel-layout">

        {/* ================================
            HERO ACTION
        ================================= */}

        <GlassCard className="travel-hero-card">

          <div className="travel-hero-icon">
            ✈️
          </div>

          <div className="travel-hero-content">

            <div className="eyebrow">
              YOUR JOURNEYS
            </div>

            <h2>
              Where will you go next?
            </h2>

            <p>
              Plan your next adventure and keep
              every journey organized.
            </p>

          </div>

          <button
            type="button"
            className="travel-add-button"
            onClick={
              showForm
                ? resetForm
                : resetAndOpenForm
            }
          >
            {showForm
              ? "Close"
              : "+ Add Trip"}
          </button>

        </GlassCard>

        {/* ================================
            FORM
        ================================= */}

        {showForm && (
          <GlassCard className="travel-form-card">

            <div className="travel-form-header">

              <div>
                <div className="eyebrow">
                  {editingId
                    ? "EDIT TRIP"
                    : "NEW JOURNEY"}
                </div>

                <h2>
                  {editingId
                    ? "Update your trip"
                    : "Create a trip"}
                </h2>
              </div>

              <button
                type="button"
                className="travel-close-button"
                onClick={resetForm}
              >
                ×
              </button>

            </div>

            <div className="travel-form-grid">

              <GlassInput
                label="Trip title"
                placeholder="e.g. Summer Vacation"
                value={title}
                onChange={setTitle}
              />

              <GlassInput
                label="Destination"
                placeholder="e.g. Manali"
                value={destination}
                onChange={setDestination}
              />

              <label className="travel-field">
                <span>Start date</span>
                <input
                  type="date"
                  value={startDate}
                  min={getTodayString()}
                  onChange={(e) =>
                    setStartDate(
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="travel-field">
                <span>End date</span>
                <input
                  type="date"
                  value={endDate}
                  min={
                    startDate ||
                    getTodayString()
                  }
                  onChange={(e) =>
                    setEndDate(
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="travel-field">
                <span>Category</span>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as TripCategory
                    )
                  }
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="travel-field">
                <span>Status</span>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as TripStatus
                    )
                  }
                >
                  {statuses.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

            </div>

            <label className="travel-textarea-field">
              <span>Description</span>

              <textarea
                placeholder="What is this trip about?"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />
            </label>

            <label className="travel-textarea-field">
              <span>Notes</span>

              <textarea
                placeholder="Places to visit, things to remember..."
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
              />
            </label>

            <div className="travel-icon-section">

              <span>
                Choose an icon
              </span>

              <div className="travel-icon-picker">
                {icons.map(
                  (item) => (
                    <button
                      type="button"
                      key={item}
                      className={
                        icon === item
                          ? "travel-icon active"
                          : "travel-icon"
                      }
                      onClick={() =>
                        setIcon(item)
                      }
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

            </div>

            <label className="travel-favorite-toggle">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) =>
                  setFavorite(
                    e.target.checked
                  )
                }
              />

              <span>
                ⭐ Save as favorite
              </span>
            </label>

            <div className="travel-form-actions">

              <button
                type="button"
                className="travel-secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="button"
                className="travel-save-button"
                onClick={saveTrip}
              >
                {editingId
                  ? "Update Trip"
                  : "Save Trip"}
              </button>

            </div>

          </GlassCard>
        )}

        {/* ================================
            NEXT TRIP
        ================================= */}

        {nextTrip && (
          <GlassCard className="travel-next-card">

            <div className="travel-next-icon">
              {nextTrip.icon}
            </div>

            <div className="travel-next-content">

              <div className="eyebrow">
                NEXT JOURNEY
              </div>

              <h2>
                {nextTrip.title}
              </h2>

              <p>
                📍 {nextTrip.destination}
              </p>

              <div className="travel-next-date">
                📅{" "}
                {formatDate(
                  nextTrip.startDate
                )}
              </div>

            </div>

            <div className="travel-next-countdown">

              <span>
                {getDaysUntil(
                  nextTrip.startDate
                ) === 0
                  ? "Today"
                  : "Starts in"}
              </span>

              <strong>
                {getDaysUntil(
                  nextTrip.startDate
                ) === 0
                  ? "🎉"
                  : `${getDaysUntil(
                      nextTrip.startDate
                    )} days`}
              </strong>

            </div>

          </GlassCard>
        )}

        {/* ================================
            STATS
        ================================= */}

        <div className="travel-stats-grid">

          <GlassCard className="travel-stat-card">
            <span>🗺️</span>
            <strong>
              {trips.length}
            </strong>
            <small>
              Total Trips
            </small>
          </GlassCard>

          <GlassCard className="travel-stat-card">
            <span>✈️</span>
            <strong>
              {upcomingTrips.length}
            </strong>
            <small>
              Upcoming
            </small>
          </GlassCard>

          <GlassCard className="travel-stat-card">
            <span>🏁</span>
            <strong>
              {completedTrips.length}
            </strong>
            <small>
              Completed
            </small>
          </GlassCard>

          <GlassCard className="travel-stat-card">
            <span>⭐</span>
            <strong>
              {favoriteTrips.length}
            </strong>
            <small>
              Favorites
            </small>
          </GlassCard>

        </div>

        {/* ================================
            SEARCH FILTERS
        ================================= */}

        <GlassCard className="travel-tools">

          <GlassInput
            placeholder="Search trips or destinations..."
            value={search}
            onChange={setSearch}
            className="travel-search"
          />

          <div className="travel-filter-row">

            <div className="travel-filters">

              <button
                type="button"
                className={
                  filter === "all"
                    ? "travel-filter active"
                    : "travel-filter"
                }
                onClick={() =>
                  setFilter("all")
                }
              >
                All
              </button>

              <button
                type="button"
                className={
                  filter === "upcoming"
                    ? "travel-filter active"
                    : "travel-filter"
                }
                onClick={() =>
                  setFilter("upcoming")
                }
              >
                ✈️ Upcoming
              </button>

              <button
                type="button"
                className={
                  filter === "completed"
                    ? "travel-filter active"
                    : "travel-filter"
                }
                onClick={() =>
                  setFilter("completed")
                }
              >
                🏁 Completed
              </button>

              <button
                type="button"
                className={
                  filter === "favorites"
                    ? "travel-filter active"
                    : "travel-filter"
                }
                onClick={() =>
                  setFilter("favorites")
                }
              >
                ⭐ Favorites
              </button>

            </div>

            <select
              className="travel-category-filter"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value as
                    | "All"
                    | TripCategory
                )
              }
            >
              <option value="All">
                All Categories
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

          </div>

        </GlassCard>

        {/* ================================
            TRIP GRID
        ================================= */}

        {filteredTrips.length === 0 ? (
          <GlassCard className="travel-empty">

            <div>
              🧭
            </div>

            <h3>
              {trips.length === 0
                ? "No trips yet"
                : "No trips found"}
            </h3>

            <p>
              {trips.length === 0
                ? "Create your first journey and start planning."
                : "Try another search or filter."}
            </p>

            {trips.length === 0 && (
              <button
                type="button"
                className="travel-empty-button"
                onClick={
                  resetAndOpenForm
                }
              >
                + Create First Trip
              </button>
            )}

          </GlassCard>
        ) : (
          <div className="travel-grid">

            {filteredTrips.map(
              (trip) => {
                const days =
                  getDaysUntil(
                    trip.startDate
                  );

                const duration =
                  calculateDuration(
                    trip.startDate,
                    trip.endDate
                  );

                return (
                  <GlassCard
                    key={trip.id}
                    className={
                      trip.favorite
                        ? "travel-card favorite"
                        : "travel-card"
                    }
                  >

                    <div className="travel-card-top">

                      <div className="travel-card-icon">
                        {trip.icon}
                      </div>

                      <div className="travel-card-actions">

                        <button
                          type="button"
                          className={
                            trip.favorite
                              ? "travel-star active"
                              : "travel-star"
                          }
                          onClick={() =>
                            toggleFavorite(
                              trip.id
                            )
                          }
                          title="Favorite"
                        >
                          ★
                        </button>

                        <button
                          type="button"
                          className="travel-edit"
                          onClick={() =>
                            editTrip(
                              trip
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="travel-delete"
                          onClick={() =>
                            deleteTrip(
                              trip.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                    <div className="travel-card-body">

                      <div className="travel-card-title-row">

                        <div>
                          <h3>
                            {trip.title}
                          </h3>

                          <p>
                            📍{" "}
                            {trip.destination}
                          </p>
                        </div>

                        <GlassBadge>
                          {trip.category}
                        </GlassBadge>

                      </div>

                      {trip.description && (
                        <p className="travel-description">
                          {trip.description}
                        </p>
                      )}

                      <div className="travel-date-box">

                        <div>
                          <span>
                            START
                          </span>

                          <strong>
                            {formatDate(
                              trip.startDate
                            )}
                          </strong>
                        </div>

                        <div className="travel-date-arrow">
                          →
                        </div>

                        <div>
                          <span>
                            END
                          </span>

                          <strong>
                            {formatDate(
                              trip.endDate
                            )}
                          </strong>
                        </div>

                      </div>

                      <div className="travel-card-meta">

                        <span className="travel-status">
                          {trip.status}
                        </span>

                        {duration && (
                          <span>
                            🕒 {duration}{" "}
                            {duration === 1
                              ? "day"
                              : "days"}
                          </span>
                        )}

                      </div>

                      {trip.startDate && (
                        <div
                          className={
                            days !== null &&
                            days >= 0 &&
                            days <= 7 &&
                            trip.status !==
                              "Completed"
                              ? "travel-countdown soon"
                              : trip.status ===
                                "Completed"
                              ? "travel-countdown completed"
                              : "travel-countdown"
                          }
                        >
                          {trip.status ===
                          "Completed"
                            ? "🏁 Journey completed"
                            : days === 0
                            ? "🎉 Trip starts today!"
                            : days !== null &&
                              days > 0
                            ? `✈️ Starts in ${days} days`
                            : "📍 Trip date passed"}
                        </div>
                      )}

                      {trip.notes && (
                        <div className="travel-notes">
                          <span>
                            📝
                          </span>

                          <p>
                            {trip.notes}
                          </p>
                        </div>
                      )}

                    </div>

                  </GlassCard>
                );
              }
            )}

          </div>
        )}

        {/* ================================
            FOOTNOTE
        ================================= */}

        <div className="travel-footer-note">
          <span>🌍</span>
          <p>
            Your journeys are saved locally in
            this browser.
          </p>
        </div>

      </div>
    </PageShell>
  );
}