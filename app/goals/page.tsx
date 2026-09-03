"use client";

import { useEffect, useMemo, useState } from "react";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassBadge from "@/component/glass/GlassBadge";

type GoalCategory =
  | "Study"
  | "Personal"
  | "Health"
  | "Creative"
  | "Future"
  | "Other";

type GoalPriority = "Low" | "Medium" | "High";

type Goal = {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  deadline: string;
  progress: number;
  milestones: string[];
  completedMilestones: string[];
  completed: boolean;
  createdAt: number;
};

const STORAGE_KEY = "my-little-universe-goals-v1";

const categories: GoalCategory[] = [
  "Study",
  "Personal",
  "Health",
  "Creative",
  "Future",
  "Other",
];

const priorities: GoalPriority[] = [
  "Low",
  "Medium",
  "High",
];

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date: string) => {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const calculateDaysLeft = (deadline: string) => {
  if (!deadline) return null;

  const today = new Date(`${getToday()}T00:00:00`);
  const target = new Date(`${deadline}T00:00:00`);

  const difference =
    target.getTime() - today.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<GoalCategory>("Personal");
  const [priority, setPriority] =
    useState<GoalPriority>("Medium");
  const [deadline, setDeadline] = useState("");

  const [milestoneInput, setMilestoneInput] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [filter, setFilter] = useState<
    "all" | "active" | "completed"
  >("all");

  const [categoryFilter, setCategoryFilter] =
    useState<GoalCategory | "all">("all");

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setGoals(parsed);
        }
      }
    } catch {
      console.log("Goals could not be loaded.");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(goals)
    );
  }, [goals, loaded]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Personal");
    setPriority("Medium");
    setDeadline("");
    setMilestoneInput("");
    setEditingId(null);
  };

  const addMilestone = () => {
    const clean = milestoneInput.trim();

    if (!clean) return;

    const target = goals.find(
      (goal) => goal.id === editingId
    );

    if (!target) {
      setMilestoneInput("");

      return;
    }

    if (target.milestones.includes(clean)) {
      setMilestoneInput("");

      return;
    }

    setGoals((current) =>
      current.map((goal) =>
        goal.id === editingId
          ? {
              ...goal,
              milestones: [
                ...goal.milestones,
                clean,
              ],
            }
          : goal
      )
    );

    setMilestoneInput("");
  };

  const createGoal = () => {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      description: description.trim(),
      category,
      priority,
      deadline,
      progress: 0,
      milestones: [],
      completedMilestones: [],
      completed: false,
      createdAt: Date.now(),
    };

    setGoals((current) => [
      newGoal,
      ...current,
    ]);

    resetForm();
    setShowForm(false);
  };

  const startEditing = (goal: Goal) => {
    setEditingId(goal.id);
    setTitle(goal.title);
    setDescription(goal.description);
    setCategory(goal.category);
    setPriority(goal.priority);
    setDeadline(goal.deadline);

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const updateGoal = () => {
    if (!editingId) return;

    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    setGoals((current) =>
      current.map((goal) =>
        goal.id === editingId
          ? {
              ...goal,
              title: cleanTitle,
              description: description.trim(),
              category,
              priority,
              deadline,
            }
          : goal
      )
    );

    resetForm();
    setShowForm(false);
  };

  const deleteGoal = (id: string) => {
    const confirmed = window.confirm(
      "Delete this goal?"
    );

    if (!confirmed) return;

    setGoals((current) =>
      current.filter(
        (goal) => goal.id !== id
      )
    );
  };

  const toggleComplete = (id: string) => {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              completed: !goal.completed,
              progress: !goal.completed
                ? 100
                : goal.progress === 100
                  ? 0
                  : goal.progress,
            }
          : goal
      )
    );
  };

  const updateProgress = (
    id: string,
    progress: number
  ) => {
    const safeProgress = Math.min(
      100,
      Math.max(0, progress)
    );

    setGoals((current) =>
      current.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              progress: safeProgress,
              completed:
                safeProgress === 100,
            }
          : goal
      )
    );
  };

  const toggleMilestone = (
    goalId: string,
    milestone: string
  ) => {
    setGoals((current) =>
      current.map((goal) => {
        if (goal.id !== goalId) {
          return goal;
        }

        const completed =
          goal.completedMilestones.includes(
            milestone
          );

        const completedMilestones = completed
          ? goal.completedMilestones.filter(
              (item) => item !== milestone
            )
          : [
              ...goal.completedMilestones,
              milestone,
            ];

        const progress =
          goal.milestones.length === 0
            ? goal.progress
            : Math.round(
                (completedMilestones.length /
                  goal.milestones.length) *
                  100
              );

        return {
          ...goal,
          completedMilestones,
          progress,
          completed: progress === 100,
        };
      })
    );
  };

  const deleteMilestone = (
    goalId: string,
    milestone: string
  ) => {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              milestones:
                goal.milestones.filter(
                  (item) => item !== milestone
                ),
              completedMilestones:
                goal.completedMilestones.filter(
                  (item) => item !== milestone
                ),
            }
          : goal
      )
    );
  };

  const filteredGoals = useMemo(() => {
    return goals
      .filter((goal) => {
        if (
          filter === "active" &&
          goal.completed
        ) {
          return false;
        }

        if (
          filter === "completed" &&
          !goal.completed
        ) {
          return false;
        }

        if (
          categoryFilter !== "all" &&
          goal.category !== categoryFilter
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        return b.createdAt - a.createdAt;
      });
  }, [goals, filter, categoryFilter]);

  const completedGoals = goals.filter(
    (goal) => goal.completed
  ).length;

  const activeGoals =
    goals.length - completedGoals;

  const averageProgress =
    goals.length === 0
      ? 0
      : Math.round(
          goals.reduce(
            (total, goal) =>
              total + goal.progress,
            0
          ) / goals.length
        );

  const upcomingGoal = useMemo(() => {
    return goals
      .filter(
        (goal) =>
          !goal.completed &&
          goal.deadline
      )
      .sort(
        (a, b) =>
          new Date(
            `${a.deadline}T00:00:00`
          ).getTime() -
          new Date(
            `${b.deadline}T00:00:00`
          ).getTime()
      )[0];
  }, [goals]);

  return (
    <PageShell
      eyebrow="GOALS"
      title="Turn ideas into progress. 🎯"
      description="Choose something you want to accomplish, break it into small steps, and keep moving."
    >
      <div className="goals-v1-layout">

        {/* TOP */}
        <div className="goals-v1-topbar">
          <div>
            <span className="eyebrow">
              YOUR GOALS
            </span>

            <h2>
              {goals.length === 0
                ? "What's next?"
                : `${activeGoals} active goals`}
            </h2>
          </div>

          <GlassButton
            active={!showForm}
            onClick={() => {
              if (showForm) {
                resetForm();
              }

              setShowForm(
                (current) => !current
              );
            }}
          >
            {showForm
              ? "× Close"
              : "+ New Goal"}
          </GlassButton>
        </div>

        {/* FORM */}
        {showForm && (
          <GlassCard className="goal-form-card">
            <div className="goal-form-heading">
              <span className="eyebrow">
                {editingId
                  ? "EDIT GOAL"
                  : "NEW GOAL"}
              </span>

              <h2>
                {editingId
                  ? "Update your goal."
                  : "Create something to work toward."}
              </h2>
            </div>

            <div className="goal-form-grid">
              <label className="goal-field goal-full">
                <span>Goal title</span>

                <input
                  className="glass-input"
                  type="text"
                  placeholder="e.g. Finish my science project"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                />
              </label>

              <label className="goal-field goal-full">
                <span>Description</span>

                <textarea
                  className="goal-textarea"
                  rows={3}
                  placeholder="What do you want to achieve?"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="goal-field">
                <span>Category</span>

                <select
                  className="goal-select"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target
                        .value as GoalCategory
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

              <label className="goal-field">
                <span>Priority</span>

                <select
                  className="goal-select"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as GoalPriority
                    )
                  }
                >
                  {priorities.map(
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

              <label className="goal-field">
                <span>Deadline</span>

                <input
                  className="glass-input"
                  type="date"
                  min={getToday()}
                  value={deadline}
                  onChange={(event) =>
                    setDeadline(
                      event.target.value
                    )
                  }
                />
              </label>
            </div>

            <div className="goal-form-actions">
              <GlassButton
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </GlassButton>

              <GlassButton
                active
                onClick={
                  editingId
                    ? updateGoal
                    : createGoal
                }
              >
                {editingId
                  ? "✓ Update Goal"
                  : "✦ Create Goal"}
              </GlassButton>
            </div>
          </GlassCard>
        )}

        {/* STATS */}
        <section className="goals-v1-stats">
          <GlassCard className="goal-stat">
            <span>🎯</span>

            <div>
              <strong>
                {goals.length}
              </strong>

              <small>
                Total Goals
              </small>
            </div>
          </GlassCard>

          <GlassCard className="goal-stat">
            <span>🚀</span>

            <div>
              <strong>
                {activeGoals}
              </strong>

              <small>
                In Progress
              </small>
            </div>
          </GlassCard>

          <GlassCard className="goal-stat">
            <span>🏆</span>

            <div>
              <strong>
                {completedGoals}
              </strong>

              <small>
                Completed
              </small>
            </div>
          </GlassCard>

          <GlassCard className="goal-stat">
            <span>📊</span>

            <div>
              <strong>
                {averageProgress}%
              </strong>

              <small>
                Average Progress
              </small>
            </div>
          </GlassCard>
        </section>

        {/* UPCOMING */}
        {upcomingGoal && (
          <GlassCard className="goal-upcoming">
            <div className="goal-upcoming-icon">
              ⏳
            </div>

            <div className="goal-upcoming-content">
              <span className="eyebrow">
                NEXT DEADLINE
              </span>

              <h2>
                {upcomingGoal.title}
              </h2>

              <p>
                {upcomingGoal.deadline
                  ? formatDate(
                      upcomingGoal.deadline
                    )
                  : ""}
              </p>
            </div>

            <div className="goal-days-left">
              <strong>
                {calculateDaysLeft(
                  upcomingGoal.deadline
                ) ?? "—"}
              </strong>

              <span>days left</span>
            </div>
          </GlassCard>
        )}

        {/* FILTERS */}
        <section className="goal-filter-section">
          <div className="goal-filter-row">
            <button
              type="button"
              className={`goal-filter ${
                filter === "all"
                  ? "goal-filter-active"
                  : ""
              }`}
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </button>

            <button
              type="button"
              className={`goal-filter ${
                filter === "active"
                  ? "goal-filter-active"
                  : ""
              }`}
              onClick={() =>
                setFilter("active")
              }
            >
              🚀 Active
            </button>

            <button
              type="button"
              className={`goal-filter ${
                filter === "completed"
                  ? "goal-filter-active"
                  : ""
              }`}
              onClick={() =>
                setFilter("completed")
              }
            >
              🏆 Completed
            </button>
          </div>

          <div className="goal-category-row">
            <button
              type="button"
              className={`goal-category ${
                categoryFilter === "all"
                  ? "goal-category-active"
                  : ""
              }`}
              onClick={() =>
                setCategoryFilter("all")
              }
            >
              All Categories
            </button>

            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`goal-category ${
                  categoryFilter === item
                    ? "goal-category-active"
                    : ""
                }`}
                onClick={() =>
                  setCategoryFilter(item)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* GOALS */}
        <section className="goal-list-section">
          <div className="goal-section-heading">
            <div>
              <span className="eyebrow">
                GOAL BOARD
              </span>

              <h2>
                Your journey
              </h2>
            </div>

            <GlassBadge>
              {filteredGoals.length} goals
            </GlassBadge>
          </div>

          {filteredGoals.length === 0 ? (
            <GlassCard className="goal-empty">
              <span>🎯</span>

              <h3>
                No goals here yet.
              </h3>

              <p>
                Create a goal and give yourself
                something exciting to work toward.
              </p>

              <GlassButton
                active
                onClick={() =>
                  setShowForm(true)
                }
              >
                + Create Goal
              </GlassButton>
            </GlassCard>
          ) : (
            <div className="goal-list">
              {filteredGoals.map(
                (goal) => {
                  const daysLeft =
                    calculateDaysLeft(
                      goal.deadline
                    );

                  return (
                    <GlassCard
                      key={goal.id}
                      className={`goal-item ${
                        goal.completed
                          ? "goal-item-completed"
                          : ""
                      }`}
                    >
                      <div className="goal-main">

                        <button
                          type="button"
                          className={`goal-check ${
                            goal.completed
                              ? "goal-check-active"
                              : ""
                          }`}
                          onClick={() =>
                            toggleComplete(
                              goal.id
                            )
                          }
                        >
                          {goal.completed
                            ? "✓"
                            : ""}
                        </button>

                        <div className="goal-item-content">
                          <div className="goal-title-row">
                            <h3>
                              {goal.title}
                            </h3>

                            <span
                              className={`goal-priority goal-priority-${goal.priority.toLowerCase()}`}
                            >
                              {goal.priority}
                            </span>
                          </div>

                          {goal.description && (
                            <p>
                              {goal.description}
                            </p>
                          )}

                          <div className="goal-meta">
                            <span>
                              🏷️ {goal.category}
                            </span>

                            {goal.deadline && (
                              <span>
                                📅{" "}
                                {formatDate(
                                  goal.deadline
                                )}
                              </span>
                            )}

                            {daysLeft !== null &&
                              !goal.completed && (
                                <span>
                                  ⏳{" "}
                                  {daysLeft < 0
                                    ? "Overdue"
                                    : `${daysLeft} days left`}
                                </span>
                              )}
                          </div>
                        </div>

                        <div className="goal-actions">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                goal
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteGoal(
                                goal.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* PROGRESS */}
                      <div className="goal-progress-area">
                        <div className="goal-progress-header">
                          <span>
                            Progress
                          </span>

                          <strong>
                            {goal.progress}%
                          </strong>
                        </div>

                        <div className="goal-progress-track">
                          <div
                            className="goal-progress-fill"
                            style={{
                              width: `${goal.progress}%`,
                            }}
                          />
                        </div>

                        <input
                          className="goal-range"
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={
                            goal.progress
                          }
                          onChange={(event) =>
                            updateProgress(
                              goal.id,
                              Number(
                                event.target
                                  .value
                              )
                            )
                          }
                        />
                      </div>

                      {/* MILESTONES */}
                      <div className="goal-milestones">
                        <div className="goal-milestone-heading">
                          <span>
                            ✦ Milestones
                          </span>

                          <small>
                            {
                              goal.completedMilestones
                                .length
                            }
                            /
                            {
                              goal.milestones
                                .length
                            }
                          </small>
                        </div>

                        {goal.milestones.length >
                        0 ? (
                          <div className="goal-milestone-list">
                            {goal.milestones.map(
                              (
                                milestone
                              ) => {
                                const done =
                                  goal.completedMilestones.includes(
                                    milestone
                                  );

                                return (
                                  <div
                                    key={
                                      milestone
                                    }
                                    className={`goal-milestone ${
                                      done
                                        ? "goal-milestone-done"
                                        : ""
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleMilestone(
                                          goal.id,
                                          milestone
                                        )
                                      }
                                    >
                                      {done
                                        ? "✓"
                                        : ""}
                                    </button>

                                    <span>
                                      {
                                        milestone
                                      }
                                    </span>

                                    <button
                                      type="button"
                                      className="goal-milestone-delete"
                                      onClick={() =>
                                        deleteMilestone(
                                          goal.id,
                                          milestone
                                        )
                                      }
                                    >
                                      ×
                                    </button>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <p className="goal-no-milestones">
                            No milestones yet.
                          </p>
                        )}

                        {/* Add milestone works when editing */}
                        {editingId ===
                          goal.id && (
                          <div className="goal-milestone-add">
                            <input
                              className="glass-input"
                              type="text"
                              placeholder="Add milestone..."
                              value={
                                milestoneInput
                              }
                              onChange={(
                                event
                              ) =>
                                setMilestoneInput(
                                  event.target
                                    .value
                                )
                              }
                              onKeyDown={(
                                event
                              ) => {
                                if (
                                  event.key ===
                                  "Enter"
                                ) {
                                  addMilestone();
                                }
                              }}
                            />

                            <GlassButton
                              onClick={
                                addMilestone
                              }
                            >
                              + Add
                            </GlassButton>
                          </div>
                        )}

                        {editingId !==
                          goal.id && (
                          <button
                            type="button"
                            className="goal-add-milestone-button"
                            onClick={() => {
                              setEditingId(
                                goal.id
                              );
                              setMilestoneInput(
                                ""
                              );
                            }}
                          >
                            + Add milestone
                          </button>
                        )}
                      </div>
                    </GlassCard>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <GlassCard className="goal-bottom-card">
          <span>🌱</span>

          <div>
            <h2>
              Big goals are built from small steps.
            </h2>

            <p>
              Keep your next step small enough to
              actually do. Progress will follow.
            </p>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}