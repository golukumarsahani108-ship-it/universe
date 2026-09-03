"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassInput from "@/component/glass/GlassInput";
import GlassBadge from "@/component/glass/GlassBadge";

type FutureCategory =
  | "Dream"
  | "Career"
  | "Study"
  | "Life"
  | "Travel"
  | "Project"
  | "Other";

type FutureStatus =
  | "Someday"
  | "Planning"
  | "In Progress"
  | "Achieved";

type FuturePlan = {
  id: string;
  title: string;
  description: string;
  category: FutureCategory;
  status: FutureStatus;
  targetDate: string;
  favorite: boolean;
  createdAt: number;
};

type SupportType =
  | "Feature Request"
  | "Bug Report"
  | "Support"
  | "Other";

const STORAGE_KEY = "my-little-universe-future";

const categories: FutureCategory[] = [
  "Dream",
  "Career",
  "Study",
  "Life",
  "Travel",
  "Project",
  "Other",
];

const statuses: FutureStatus[] = [
  "Someday",
  "Planning",
  "In Progress",
  "Achieved",
];

const icons: Record<FutureCategory, string> = {
  Dream: "🌙",
  Career: "🚀",
  Study: "📚",
  Life: "🌱",
  Travel: "✈️",
  Project: "💡",
  Other: "✨",
};

function daysUntil(date: string) {
  if (!date) return null;

  const target = new Date(`${date}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target.getTime() - today.getTime()) / 86400000
  );
}

function formatDate(date: string) {
  if (!date) return "No target date";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function getCountdown(
  date: string,
  status: FutureStatus
) {
  if (status === "Achieved") return "Achieved ✨";

  const days = daysUntil(date);

  if (days === null) return "No target date";
  if (days === 0) return "Today 🎯";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)} days ago`;

  return `${days} days left`;
}

export default function FuturePage() {
  const [plans, setPlans] = useState<FuturePlan[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<FutureCategory>("Dream");
  const [status, setStatus] =
    useState<FutureStatus>("Someday");
  const [targetDate, setTargetDate] = useState("");
  const [favorite, setFavorite] = useState(false);

  /* SEARCH */
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | FutureStatus>("All");

  const [categoryFilter, setCategoryFilter] =
    useState<"All" | FutureCategory>("All");

  const [favoriteOnly, setFavoriteOnly] =
    useState(false);

  /* SUPPORT */
  const [supportOpen, setSupportOpen] =
    useState(false);

  const [supportType, setSupportType] =
    useState<SupportType>("Feature Request");

  const [supportMessage, setSupportMessage] =
    useState("");

  const [supportEmail, setSupportEmail] =
    useState("");

  const [supportSending, setSupportSending] =
    useState(false);

  const [supportSuccess, setSupportSuccess] =
    useState("");

  const [supportError, setSupportError] =
    useState("");

  /* LOAD */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        STORAGE_KEY
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setPlans(parsed);
        }
      }
    } catch {
      console.log(
        "Future data could not be loaded."
      );
    }

    setLoaded(true);
  }, []);

  /* SAVE */
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(plans)
    );
  }, [plans, loaded]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Dream");
    setStatus("Someday");
    setTargetDate("");
    setFavorite(false);
    setEditingId(null);
  };

  const savePlan = () => {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      alert("Please enter a title.");
      return;
    }

    if (editingId) {
      setPlans((current) =>
        current.map((plan) =>
          plan.id === editingId
            ? {
                ...plan,
                title: cleanTitle,
                description:
                  description.trim(),
                category,
                status,
                targetDate,
                favorite,
              }
            : plan
        )
      );
    } else {
      const newPlan: FuturePlan = {
        id: crypto.randomUUID(),
        title: cleanTitle,
        description:
          description.trim(),
        category,
        status,
        targetDate,
        favorite,
        createdAt: Date.now(),
      };

      setPlans((current) => [
        newPlan,
        ...current,
      ]);
    }

    resetForm();
  };

  const editPlan = (plan: FuturePlan) => {
    setEditingId(plan.id);
    setTitle(plan.title);
    setDescription(plan.description);
    setCategory(plan.category);
    setStatus(plan.status);
    setTargetDate(plan.targetDate);
    setFavorite(plan.favorite);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deletePlan = (id: string) => {
    if (
      !window.confirm(
        "Delete this future plan?"
      )
    ) {
      return;
    }

    setPlans((current) =>
      current.filter(
        (plan) => plan.id !== id
      )
    );

    if (editingId === id) {
      resetForm();
    }
  };

  const toggleFavorite = (id: string) => {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === id
          ? {
              ...plan,
              favorite: !plan.favorite,
            }
          : plan
      )
    );
  };

  const changeStatus = (
    id: string,
    nextStatus: FutureStatus
  ) => {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === id
          ? {
              ...plan,
              status: nextStatus,
            }
          : plan
      )
    );
  };

  /*
    SEARCH FIX

    Search now checks:
    - title
    - description
    - category
    - status
    - target date
  */
  const filteredPlans = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return plans
      .filter((plan) => {
        if (!query) return true;

        const searchableText = [
          plan.title,
          plan.description,
          plan.category,
          plan.status,
          plan.targetDate,
          formatDate(plan.targetDate),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .filter((plan) => {
        if (statusFilter === "All") {
          return true;
        }

        return plan.status === statusFilter;
      })
      .filter((plan) => {
        if (categoryFilter === "All") {
          return true;
        }

        return plan.category === categoryFilter;
      })
      .filter((plan) => {
        if (!favoriteOnly) return true;

        return plan.favorite;
      })
      .sort((a, b) => {
        if (a.favorite !== b.favorite) {
          return (
            Number(b.favorite) -
            Number(a.favorite)
          );
        }

        if (
          a.targetDate &&
          b.targetDate
        ) {
          return (
            new Date(
              a.targetDate
            ).getTime() -
            new Date(
              b.targetDate
            ).getTime()
          );
        }

        if (a.targetDate) return -1;
        if (b.targetDate) return 1;

        return (
          b.createdAt -
          a.createdAt
        );
      });
  }, [
    plans,
    search,
    statusFilter,
    categoryFilter,
    favoriteOnly,
  ]);

  const stats = useMemo(() => {
    const achieved = plans.filter(
      (plan) =>
        plan.status === "Achieved"
    ).length;

    const active = plans.filter(
      (plan) =>
        plan.status !== "Achieved"
    ).length;

    const favorites = plans.filter(
      (plan) => plan.favorite
    ).length;

    const dated = plans
      .filter(
        (plan) =>
          plan.targetDate &&
          plan.status !== "Achieved"
      )
      .sort(
        (a, b) =>
          new Date(
            a.targetDate
          ).getTime() -
          new Date(
            b.targetDate
          ).getTime()
      );

    return {
      total: plans.length,
      active,
      achieved,
      favorites,
      next: dated[0] ?? null,
    };
  }, [plans]);

  const sendSupportMessage = async () => {
    const cleanMessage =
      supportMessage.trim();

    if (!cleanMessage) {
      setSupportError(
        "Please write a message first."
      );
      return;
    }

    setSupportSending(true);
    setSupportError("");
    setSupportSuccess("");

    try {
      const response = await fetch(
        "/api/support",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            type: supportType,
            message: cleanMessage,
            email:
              supportEmail.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Could not send message."
        );
      }

      setSupportSuccess(
        "Message sent successfully. Thank you! 💙"
      );

      setSupportMessage("");
      setSupportEmail("");

      setTimeout(() => {
        setSupportOpen(false);
        setSupportSuccess("");
      }, 2500);
    } catch (error) {
      setSupportError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSupportSending(false);
    }
  };

  return (
    <PageShell
      eyebrow="FUTURE"
      title="Future Space 🌌"
      description="A place for the things you want to become, build, explore and experience."
    >
      <div className="future-layout">

        {/* HERO */}
        <GlassCard className="future-hero">
          <div className="future-hero-content">
            <div>
              <GlassBadge>
                YOUR FUTURE
              </GlassBadge>

              <h2>
                Imagine it.
                <br />
                Plan it.
                <br />
                Make it real. ✨
              </h2>

              <p>
                Keep your dreams, plans and
                future ideas together in one
                peaceful space.
              </p>
            </div>

            <div className="future-orbit">
              <div className="future-orbit-ring ring-one" />
              <div className="future-orbit-ring ring-two" />

              <div className="future-orbit-core">
                🌌
              </div>
            </div>
          </div>

          {stats.next && (
            <div className="future-next">
              <span>
                Next target
              </span>

              <strong>
                {stats.next.title}
              </strong>

              <small>
                {formatDate(
                  stats.next.targetDate
                )}
                {" • "}
                {getCountdown(
                  stats.next.targetDate,
                  stats.next.status
                )}
              </small>
            </div>
          )}
        </GlassCard>

        {/* STATS */}
        <div className="future-stats">
          <GlassCard>
            <span>Plans</span>
            <strong>
              {stats.total}
            </strong>
          </GlassCard>

          <GlassCard>
            <span>Active</span>
            <strong>
              {stats.active}
            </strong>
          </GlassCard>

          <GlassCard>
            <span>Achieved</span>
            <strong>
              {stats.achieved}
            </strong>
          </GlassCard>

          <GlassCard>
            <span>Favorites</span>
            <strong>
              {stats.favorites}
            </strong>
          </GlassCard>
        </div>

        {/* FORM */}
        <GlassCard className="future-form-card">
          <div className="future-section-heading">
            <GlassBadge>
              {editingId
                ? "EDIT PLAN"
                : "NEW PLAN"}
            </GlassBadge>

            <h2>
              {editingId
                ? "Update your future ✏️"
                : "Add something for your future ✨"}
            </h2>
          </div>

          <div className="future-form">
            <GlassInput
              label="Title"
              placeholder="e.g. Learn web development"
              value={title}
              onChange={setTitle}
            />

            <label className="future-field">
              <span>
                Description
              </span>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="What do you want to achieve or experience?"
                rows={4}
              />
            </label>

            <div className="future-form-grid">
              <label className="future-field">
                <span>
                  Category
                </span>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target
                        .value as FutureCategory
                    )
                  }
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {icons[item]}{" "}
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="future-field">
                <span>
                  Status
                </span>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target
                        .value as FutureStatus
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

              <label className="future-field">
                <span>
                  Target date
                </span>

                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) =>
                    setTargetDate(
                      e.target.value
                    )
                  }
                />
              </label>
            </div>

            <label className="future-checkbox">
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
                ⭐ Keep this as a favorite
              </span>
            </label>

            <div className="future-form-actions">
              <GlassButton
                active
                onClick={savePlan}
              >
                {editingId
                  ? "Update Future Plan"
                  : "Save Future Plan"}
              </GlassButton>

              {editingId && (
                <GlassButton
                  onClick={resetForm}
                >
                  Cancel
                </GlassButton>
              )}
            </div>
          </div>
        </GlassCard>

        {/* SEARCH + FILTER */}
        <GlassCard className="future-tools">
          <div className="future-search">
            <GlassInput
              label="Search"
              placeholder="Search title, description, category, status..."
              value={search}
              onChange={setSearch}
            />

            {search && (
              <button
                type="button"
                className="future-clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                Clear ×
              </button>
            )}
          </div>

          <div className="future-search-result">
            {search ? (
              <>
                Showing{" "}
                <strong>
                  {filteredPlans.length}
                </strong>{" "}
                result
                {filteredPlans.length !== 1
                  ? "s"
                  : ""}{" "}
                for{" "}
                <strong>
                  “{search}”
                </strong>
              </>
            ) : (
              <>
                Showing{" "}
                <strong>
                  {filteredPlans.length}
                </strong>{" "}
                plans
              </>
            )}
          </div>

          <div className="future-filter-row">
            <div className="future-filter-group">
              <span>
                Status
              </span>

              <div className="future-filter-buttons">
                <GlassButton
                  active={
                    statusFilter === "All"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "All"
                    )
                  }
                >
                  All
                </GlassButton>

                {statuses.map(
                  (item) => (
                    <GlassButton
                      key={item}
                      active={
                        statusFilter ===
                        item
                      }
                      onClick={() =>
                        setStatusFilter(
                          item
                        )
                      }
                    >
                      {item}
                    </GlassButton>
                  )
                )}
              </div>
            </div>

            <div className="future-filter-group">
              <span>
                Category
              </span>

              <select
                value={
                  categoryFilter
                }
                onChange={(e) =>
                  setCategoryFilter(
                    e.target
                      .value as
                      | "All"
                      | FutureCategory
                  )
                }
              >
                <option value="All">
                  All categories
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {icons[item]}{" "}
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            <label className="future-favorite-filter">
              <input
                type="checkbox"
                checked={
                  favoriteOnly
                }
                onChange={(e) =>
                  setFavoriteOnly(
                    e.target.checked
                  )
                }
              />

              ⭐ Favorites only
            </label>
          </div>
        </GlassCard>

        {/* PLANS */}
        <section className="future-plans-section">
          <div className="future-section-title">
            <div>
              <GlassBadge>
                YOUR PLANS
              </GlassBadge>

              <h2>
                Your future collection
              </h2>
            </div>

            <span>
              {filteredPlans.length}{" "}
              shown
            </span>
          </div>

          {filteredPlans.length === 0 ? (
            <GlassCard className="future-empty">
              <div>
                {search
                  ? "🔎"
                  : "🌌"}
              </div>

              <h3>
                {search
                  ? "No matching plans"
                  : "No future plans yet"}
              </h3>

              <p>
                {search
                  ? "Try another search word or clear the search."
                  : "Add something you want to achieve, explore or experience."}
              </p>

              {search && (
                <div className="future-empty-action">
                  <GlassButton
                    active
                    onClick={() =>
                      setSearch("")
                    }
                  >
                    Clear Search
                  </GlassButton>
                </div>
              )}
            </GlassCard>
          ) : (
            <div className="future-plans-grid">
              {filteredPlans.map(
                (plan) => (
                  <GlassCard
                    key={plan.id}
                    className="future-plan-card"
                  >
                    <div className="future-card-top">
                      <div className="future-plan-icon">
                        {
                          icons[
                            plan.category
                          ]
                        }
                      </div>

                      <button
                        type="button"
                        className={`future-star ${
                          plan.favorite
                            ? "is-favorite"
                            : ""
                        }`}
                        onClick={() =>
                          toggleFavorite(
                            plan.id
                          )
                        }
                        aria-label="Toggle favorite"
                      >
                        {plan.favorite
                          ? "★"
                          : "☆"}
                      </button>
                    </div>

                    <div className="future-plan-meta">
                      <GlassBadge>
                        {
                          plan.category
                        }
                      </GlassBadge>

                      <GlassBadge>
                        {plan.status}
                      </GlassBadge>
                    </div>

                    <h3>
                      {plan.title}
                    </h3>

                    {plan.description && (
                      <p>
                        {
                          plan.description
                        }
                      </p>
                    )}

                    <div className="future-date-box">
                      <span>
                        🎯 Target
                      </span>

                      <strong>
                        {formatDate(
                          plan.targetDate
                        )}
                      </strong>

                      <small>
                        {getCountdown(
                          plan.targetDate,
                          plan.status
                        )}
                      </small>
                    </div>

                    <div className="future-card-status">
                      <select
                        value={
                          plan.status
                        }
                        onChange={(e) =>
                          changeStatus(
                            plan.id,
                            e.target
                              .value as FutureStatus
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
                    </div>

                    <div className="future-card-actions">
                      <GlassButton
                        onClick={() =>
                          editPlan(
                            plan
                          )
                        }
                      >
                        ✏️ Edit
                      </GlassButton>

                      <GlassButton
                        onClick={() =>
                          deletePlan(
                            plan.id
                          )
                        }
                      >
                        🗑️ Delete
                      </GlassButton>
                    </div>
                  </GlassCard>
                )
              )}
            </div>
          )}
        </section>

        {/* =================================================
            SUPPORT / FEATURE REQUEST / BUG REPORT
        ================================================= */}
        <GlassCard className="future-support-card">
          <div className="future-support-icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.8 9.8 0 0 1-4.1-.9L3 20.5l1.5-4A8.2 8.2 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 11.5h.01M12 11.5h.01M16 11.5h.01"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="future-support-content">
            <GlassBadge>
              SUPPORT
            </GlassBadge>

            <h2>
              Have an idea or found a bug? 💬
            </h2>

            <p>
              Agar tumhe koi new page,
              feature ya improvement chahiye,
              ya koi bug mile, yahin message
              kar do.
            </p>

            <div className="future-support-actions">
              <GlassButton
                active
                onClick={() => {
                  setSupportOpen(
                    !supportOpen
                  );
                  setSupportError("");
                  setSupportSuccess("");
                }}
              >
                {supportOpen
                  ? "Close Support"
                  : "Send a Message"}
              </GlassButton>
            </div>
          </div>
        </GlassCard>

        {supportOpen && (
          <GlassCard className="future-support-form-card">
            <div className="future-support-form-heading">
              <GlassBadge>
                MESSAGE
              </GlassBadge>

              <h2>
                What would you like to tell us?
              </h2>

              <p>
                Feature request, bug report,
                support — anything related to
                this app.
              </p>
            </div>

            <div className="future-support-form">
              <label className="future-field">
                <span>
                  Message type
                </span>

                <select
                  value={supportType}
                  onChange={(e) =>
                    setSupportType(
                      e.target
                        .value as SupportType
                    )
                  }
                >
                  <option>
                    Feature Request
                  </option>
                  <option>
                    Bug Report
                  </option>
                  <option>
                    Support
                  </option>
                  <option>
                    Other
                  </option>
                </select>
              </label>

              <label className="future-field">
                <span>
                  Message
                </span>

                <textarea
                  value={
                    supportMessage
                  }
                  onChange={(e) =>
                    setSupportMessage(
                      e.target.value
                    )
                  }
                  placeholder="Example: Please add a new page for..."
                  rows={6}
                  maxLength={3000}
                />

                <small className="future-message-count">
                  {
                    supportMessage.length
                  }{" "}
                  / 3000
                </small>
              </label>

              <GlassInput
                label="Your email (optional)"
                type="email"
                placeholder="your@email.com"
                value={supportEmail}
                onChange={setSupportEmail}
              />

              <div className="future-support-send">
                <GlassButton
                  active
                  onClick={
                    sendSupportMessage
                  }
                >
                  {supportSending
                    ? "Sending..."
                    : "📩 Send Message"}
                </GlassButton>
              </div>

              {supportSuccess && (
                <div className="future-support-success">
                  ✓ {supportSuccess}
                </div>
              )}

              {supportError && (
                <div className="future-support-error">
                  ⚠ {supportError}
                </div>
              )}
            </div>
          </GlassCard>
        )}

        <div className="future-bottom-note">
          <span>🌌</span>
          <p>
            This is your space. Keep building
            the future you imagine.
          </p>
        </div>
      </div>
    </PageShell>
  );
}