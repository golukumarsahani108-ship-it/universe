"use client";

import { useEffect, useMemo, useState } from "react";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassBadge from "@/component/glass/GlassBadge";

type HabitCategory =
  | "Study"
  | "Health"
  | "Personal"
  | "Creative"
  | "Other";

type HabitTime =
  | "Morning"
  | "Afternoon"
  | "Evening"
  | "Anytime";

type HabitGoal = "Daily" | "Weekly";

type Habit = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: HabitCategory;
  time: HabitTime;
  goal: HabitGoal;
  important: boolean;
  createdAt: number;
  completedDates: string[];
};

const STORAGE_KEY = "my-little-universe-habits-v2";

const icons = [
  "💧",
  "📚",
  "🏃",
  "🧘",
  "💻",
  "🎨",
  "🧹",
  "🌱",
  "✍️",
  "🎵",
  "🧠",
  "⭐",
];

const categories: HabitCategory[] = [
  "Study",
  "Health",
  "Personal",
  "Creative",
  "Other",
];

const times: HabitTime[] = [
  "Morning",
  "Afternoon",
  "Evening",
  "Anytime",
];

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date: string) => {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const getPreviousDate = (date: string) => {
  const value = new Date(`${date}T00:00:00`);

  value.setDate(value.getDate() - 1);

  return getDateKey(value);
};

const getNextDate = (date: string) => {
  const value = new Date(`${date}T00:00:00`);

  value.setDate(value.getDate() + 1);

  return getDateKey(value);
};

const calculateCurrentStreak = (
  completedDates: string[]
) => {
  const completed = new Set(completedDates);

  let current = getDateKey();
  let streak = 0;

  while (completed.has(current)) {
    streak++;
    current = getPreviousDate(current);
  }

  return streak;
};

const calculateBestStreak = (
  completedDates: string[]
) => {
  if (completedDates.length === 0) {
    return 0;
  }

  const uniqueDates = [
    ...new Set(completedDates),
  ].sort();

  let best = 1;
  let current = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const previous = uniqueDates[i - 1];
    const currentDate = uniqueDates[i];

    if (getNextDate(previous) === currentDate) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
};

const getLastSevenDays = () => {
  const days: string[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);

    date.setDate(today.getDate() - i);

    days.push(getDateKey(date));
  }

  return days;
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🌱");
  const [category, setCategory] =
    useState<HabitCategory>("Personal");
  const [time, setTime] =
    useState<HabitTime>("Anytime");
  const [goal, setGoal] =
    useState<HabitGoal>("Daily");
  const [important, setImportant] = useState(false);

  const [selectedDate, setSelectedDate] =
    useState(getDateKey());

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [showImportantOnly, setShowImportantOnly] =
    useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        STORAGE_KEY
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setHabits(parsed);
        }
      }
    } catch {
      console.log("Habits could not be loaded.");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(habits)
    );
  }, [habits, loaded]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setIcon("🌱");
    setCategory("Personal");
    setTime("Anytime");
    setGoal("Daily");
    setImportant(false);
    setEditingId(null);
  };

  const addOrUpdateHabit = () => {
    const cleanName = name.trim();

    if (!cleanName) {
      return;
    }

    if (editingId) {
      setHabits((current) =>
        current.map((habit) =>
          habit.id === editingId
            ? {
                ...habit,
                name: cleanName,
                description: description.trim(),
                icon,
                category,
                time,
                goal,
                important,
              }
            : habit
        )
      );
    } else {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        name: cleanName,
        description: description.trim(),
        icon,
        category,
        time,
        goal,
        important,
        createdAt: Date.now(),
        completedDates: [],
      };

      setHabits((current) => [
        newHabit,
        ...current,
      ]);
    }

    resetForm();
    setShowAddForm(false);
  };

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id);
    setName(habit.name);
    setDescription(habit.description);
    setIcon(habit.icon);
    setCategory(habit.category);
    setTime(habit.time);
    setGoal(habit.goal);
    setImportant(habit.important);

    setShowAddForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleHabit = (habitId: string) => {
    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }

        const completed =
          habit.completedDates.includes(
            selectedDate
          );

        return {
          ...habit,
          completedDates: completed
            ? habit.completedDates.filter(
                (date) =>
                  date !== selectedDate
              )
            : [
                ...habit.completedDates,
                selectedDate,
              ],
        };
      })
    );
  };

  const deleteHabit = (habitId: string) => {
    const confirmed = window.confirm(
      "Delete this habit?"
    );

    if (!confirmed) return;

    setHabits((current) =>
      current.filter(
        (habit) => habit.id !== habitId
      )
    );
  };

  const completedCount = habits.filter((habit) =>
    habit.completedDates.includes(selectedDate)
  ).length;

  const progress =
    habits.length === 0
      ? 0
      : Math.round(
          (completedCount / habits.length) * 100
        );

  const totalCompletions = habits.reduce(
    (total, habit) =>
      total + habit.completedDates.length,
    0
  );

  const bestHabit = useMemo(() => {
    if (!habits.length) return null;

    return [...habits].sort(
      (a, b) =>
        b.completedDates.length -
        a.completedDates.length
    )[0];
  }, [habits]);

  const visibleHabits = useMemo(() => {
    return habits.filter((habit) => {
      if (!showImportantOnly) {
        return true;
      }

      return habit.important;
    });
  }, [habits, showImportantOnly]);

  const lastSevenDays = useMemo(
    () => getLastSevenDays(),
    []
  );

  return (
    <PageShell
      eyebrow="HABITS"
      title="Build little routines. 🌱"
      description="Small actions repeated over time can become meaningful routines."
    >
      <div className="habits-v2-layout">

        {/* TOP ACTION */}
        <div className="habits-v2-topbar">
          <div>
            <span className="eyebrow">
              YOUR ROUTINES
            </span>

            <h2>
              {habits.length === 0
                ? "Start with one."
                : `${habits.length} routines in your universe`}
            </h2>
          </div>

          <GlassButton
            active={!showAddForm}
            onClick={() => {
              if (showAddForm) {
                resetForm();
              }

              setShowAddForm(
                (current) => !current
              );
            }}
          >
            {showAddForm
              ? "× Close"
              : "+ New Habit"}
          </GlassButton>
        </div>

        {/* ADD / EDIT FORM */}
        {showAddForm && (
          <GlassCard className="habit-v2-form-card">
            <div className="habit-v2-form-heading">
              <div>
                <span className="eyebrow">
                  {editingId
                    ? "EDIT HABIT"
                    : "NEW HABIT"}
                </span>

                <h2>
                  {editingId
                    ? "Update your routine."
                    : "Create a new routine."}
                </h2>
              </div>
            </div>

            <div className="habit-v2-form-grid">

              <label className="habit-v2-field habit-v2-full">
                <span>Habit name</span>

                <input
                  className="glass-input"
                  type="text"
                  placeholder="e.g. Read for 20 minutes"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                />
              </label>

              <label className="habit-v2-field habit-v2-full">
                <span>Description</span>

                <textarea
                  className="habit-v2-textarea"
                  placeholder="A small description..."
                  rows={3}
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                />
              </label>

              <div className="habit-v2-field habit-v2-full">
                <span>Choose icon</span>

                <div className="habit-v2-icons">
                  {icons.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`habit-v2-icon ${
                        icon === item
                          ? "habit-v2-icon-active"
                          : ""
                      }`}
                      onClick={() =>
                        setIcon(item)
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <label className="habit-v2-field">
                <span>Category</span>

                <select
                  className="habit-v2-select"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target
                        .value as HabitCategory
                    )
                  }
                >
                  {categories.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="habit-v2-field">
                <span>Preferred time</span>

                <select
                  className="habit-v2-select"
                  value={time}
                  onChange={(event) =>
                    setTime(
                      event.target
                        .value as HabitTime
                    )
                  }
                >
                  {times.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="habit-v2-field">
                <span>Goal</span>

                <select
                  className="habit-v2-select"
                  value={goal}
                  onChange={(event) =>
                    setGoal(
                      event.target
                        .value as HabitGoal
                    )
                  }
                >
                  <option value="Daily">
                    Every day
                  </option>

                  <option value="Weekly">
                    Weekly
                  </option>
                </select>
              </label>

              <div className="habit-v2-field">
                <span>Priority</span>

                <button
                  type="button"
                  className={`habit-important-toggle ${
                    important
                      ? "habit-important-active"
                      : ""
                  }`}
                  onClick={() =>
                    setImportant(
                      (current) => !current
                    )
                  }
                >
                  <span>
                    {important ? "⭐" : "☆"}
                  </span>

                  <span>
                    {important
                      ? "Important"
                      : "Normal"}
                  </span>
                </button>
              </div>
            </div>

            <div className="habit-v2-form-actions">
              <GlassButton
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
              >
                Cancel
              </GlassButton>

              <GlassButton
                active
                onClick={addOrUpdateHabit}
              >
                {editingId
                  ? "✓ Update Habit"
                  : "✦ Create Habit"}
              </GlassButton>
            </div>
          </GlassCard>
        )}

        {/* PROGRESS */}
        <GlassCard className="habit-v2-progress">
          <div className="habit-v2-progress-top">
            <div>
              <span className="eyebrow">
                DAILY PROGRESS
              </span>

              <h2>
                {completedCount} / {habits.length}
                {" "}completed
              </h2>

              <p>
                {formatDate(selectedDate)}
              </p>
            </div>

            <div className="habit-v2-progress-ring">
              <strong>{progress}%</strong>
            </div>
          </div>

          <div className="habit-v2-progress-track">
            <div
              className="habit-v2-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="habit-v2-date-row">
            <label className="habit-v2-date">
              <span>View date</span>

              <input
                className="glass-input"
                type="date"
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(
                    event.target.value
                  )
                }
              />
            </label>

            <button
              type="button"
              className="habit-today-button"
              onClick={() =>
                setSelectedDate(
                  getDateKey()
                )
              }
            >
              Today
            </button>
          </div>
        </GlassCard>

        {/* STATS */}
        <section className="habit-v2-stats">
          <GlassCard className="habit-v2-stat">
            <span>🌱</span>

            <div>
              <strong>
                {habits.length}
              </strong>

              <small>
                Total Habits
              </small>
            </div>
          </GlassCard>

          <GlassCard className="habit-v2-stat">
            <span>✓</span>

            <div>
              <strong>
                {completedCount}
              </strong>

              <small>
                Done Today
              </small>
            </div>
          </GlassCard>

          <GlassCard className="habit-v2-stat">
            <span>✨</span>

            <div>
              <strong>
                {totalCompletions}
              </strong>

              <small>
                Total Completions
              </small>
            </div>
          </GlassCard>

          <GlassCard className="habit-v2-stat">
            <span>🏆</span>

            <div>
              <strong>
                {bestHabit
                  ? bestHabit.name
                  : "—"}
              </strong>

              <small>
                Best Habit
              </small>
            </div>
          </GlassCard>
        </section>

        {/* FILTER */}
        {habits.length > 0 && (
          <div className="habit-v2-filter-row">
            <button
              type="button"
              className={`habit-v2-filter ${
                !showImportantOnly
                  ? "habit-v2-filter-active"
                  : ""
              }`}
              onClick={() =>
                setShowImportantOnly(false)
              }
            >
              All Habits
            </button>

            <button
              type="button"
              className={`habit-v2-filter ${
                showImportantOnly
                  ? "habit-v2-filter-active"
                  : ""
              }`}
              onClick={() =>
                setShowImportantOnly(true)
              }
            >
              ⭐ Important
            </button>
          </div>
        )}

        {/* HABITS */}
        <section className="habit-v2-list-section">
          <div className="habit-v2-section-heading">
            <div>
              <span className="eyebrow">
                HABIT BOARD
              </span>

              <h2>
                {selectedDate === getDateKey()
                  ? "Today's routines"
                  : `Routines for ${formatDate(
                      selectedDate
                    )}`}
              </h2>
            </div>

            <GlassBadge>
              {visibleHabits.length}
            </GlassBadge>
          </div>

          {visibleHabits.length === 0 ? (
            <GlassCard className="habit-v2-empty">
              <span>🌱</span>

              <h3>
                {habits.length === 0
                  ? "Your habit board is empty."
                  : "No important habits."}
              </h3>

              <p>
                {habits.length === 0
                  ? "Create a small routine above and start your journey."
                  : "You haven't marked any habits as important yet."}
              </p>

              {habits.length === 0 && (
                <GlassButton
                  active
                  onClick={() =>
                    setShowAddForm(true)
                  }
                >
                  + Create First Habit
                </GlassButton>
              )}
            </GlassCard>
          ) : (
            <div className="habit-v2-list">
              {visibleHabits.map((habit) => {
                const completed =
                  habit.completedDates.includes(
                    selectedDate
                  );

                const currentStreak =
                  calculateCurrentStreak(
                    habit.completedDates
                  );

                const bestStreak =
                  calculateBestStreak(
                    habit.completedDates
                  );

                const weekCompleted =
                  lastSevenDays.filter(
                    (day) =>
                      habit.completedDates.includes(
                        day
                      )
                  ).length;

                return (
                  <GlassCard
                    key={habit.id}
                    className={`habit-v2-item ${
                      completed
                        ? "habit-v2-item-completed"
                        : ""
                    }`}
                  >
                    <div className="habit-v2-main-row">

                      <button
                        type="button"
                        className={`habit-v2-check ${
                          completed
                            ? "habit-v2-check-active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleHabit(habit.id)
                        }
                      >
                        {completed ? "✓" : ""}
                      </button>

                      <div className="habit-v2-item-icon">
                        {habit.icon}
                      </div>

                      <div className="habit-v2-item-content">
                        <div className="habit-v2-title-row">
                          <strong>
                            {habit.name}
                          </strong>

                          {habit.important && (
                            <span className="habit-important-star">
                              ⭐
                            </span>
                          )}
                        </div>

                        {habit.description && (
                          <p>
                            {habit.description}
                          </p>
                        )}

                        <div className="habit-v2-meta">
                          <span>
                            🏷️ {habit.category}
                          </span>

                          <span>
                            ⏰ {habit.time}
                          </span>

                          <span>
                            🎯 {habit.goal}
                          </span>
                        </div>
                      </div>

                      <div className="habit-v2-actions">
                        <button
                          type="button"
                          onClick={() =>
                            startEditing(habit)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteHabit(habit.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* MINI 7 DAY HISTORY */}
                    <div className="habit-v2-bottom">
                      <div className="habit-week">
                        {lastSevenDays.map(
                          (day) => {
                            const done =
                              habit.completedDates.includes(
                                day
                              );

                            return (
                              <button
                                key={day}
                                type="button"
                                className={`habit-day ${
                                  done
                                    ? "habit-day-done"
                                    : ""
                                } ${
                                  day ===
                                  selectedDate
                                    ? "habit-day-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  setSelectedDate(
                                    day
                                  )
                                }
                                title={formatDate(
                                  day
                                )}
                              >
                                <span>
                                  {new Date(
                                    `${day}T00:00:00`
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      weekday:
                                        "narrow",
                                    }
                                  )}
                                </span>

                                <strong>
                                  {done
                                    ? "✓"
                                    : "·"}
                                </strong>
                              </button>
                            );
                          }
                        )}
                      </div>

                      <div className="habit-v2-streaks">
                        <span>
                          🔥 {currentStreak} current
                        </span>

                        <span>
                          🏆 {bestStreak} best
                        </span>

                        <span>
                          📊 {weekCompleted}/7 this week
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <GlassCard className="habit-v2-bottom-card">
          <span>✨</span>

          <div>
            <h2>
              Progress, not perfection.
            </h2>

            <p>
              A missed day doesn't erase what you
              already accomplished. Keep going.
            </p>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}