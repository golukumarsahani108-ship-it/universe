"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/component/layout/PageShell";

type RepeatType = "None" | "Daily" | "Weekly";

type Reminder = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  repeat: RepeatType;
  completed: boolean;
  createdAt: number;
};

const STORAGE_KEY = "my-little-universe-reminders";

const emptyForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  repeat: "None" as RepeatType,
};

function formatDate(date: string) {
  if (!date) return "No date";

  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isPast(reminder: Reminder) {
  if (!reminder.date) return false;

  const target = new Date(
    `${reminder.date}T${reminder.time || "23:59"}`
  );

  return target.getTime() < Date.now() && !reminder.completed;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [filter, setFilter] = useState<
    "All" | "Active" | "Completed"
  >("All");

  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setReminders(parsed);
        }
      } catch {
        console.log("Reminders could not be loaded.");
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(reminders)
    );
  }, [reminders, loaded]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    if (editingId) {
      setReminders((current) =>
        current.map((reminder) =>
          reminder.id === editingId
            ? {
                ...reminder,
                title: form.title.trim(),
                description: form.description.trim(),
                date: form.date,
                time: form.time,
                repeat: form.repeat,
              }
            : reminder
        )
      );
    } else {
      const newReminder: Reminder = {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        time: form.time,
        repeat: form.repeat,
        completed: false,
        createdAt: Date.now(),
      };

      setReminders((current) => [newReminder, ...current]);
    }

    resetForm();
  };

  const startEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);

    setForm({
      title: reminder.title,
      description: reminder.description,
      date: reminder.date,
      time: reminder.time,
      repeat: reminder.repeat,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteReminder = (id: string) => {
    const confirmed = window.confirm(
      "Delete this reminder?"
    );

    if (!confirmed) return;

    setReminders((current) =>
      current.filter((reminder) => reminder.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  };

  const toggleReminder = (id: string) => {
    setReminders((current) =>
      current.map((reminder) =>
        reminder.id === id
          ? {
              ...reminder,
              completed: !reminder.completed,
            }
          : reminder
      )
    );
  };

  const filteredReminders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reminders
      .filter((reminder) => {
        if (filter === "Active" && reminder.completed) {
          return false;
        }

        if (filter === "Completed" && !reminder.completed) {
          return false;
        }

        if (!query) return true;

        return (
          reminder.title.toLowerCase().includes(query) ||
          reminder.description
            .toLowerCase()
            .includes(query)
        );
      })
      .sort((a, b) => {
        const aDate = `${a.date} ${a.time}`;
        const bDate = `${b.date} ${b.time}`;

        return aDate.localeCompare(bDate);
      });
  }, [reminders, filter, search]);

  const activeCount = reminders.filter(
    (item) => !item.completed
  ).length;

  const completedCount = reminders.filter(
    (item) => item.completed
  ).length;

  const overdueCount = reminders.filter(isPast).length;

  return (
    <PageShell
      eyebrow="PERSONAL TIME"
      title="Reminders ⏰"
      description="Keep important things close and never miss what matters."
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="reminders-layout">

        {/* CREATE / EDIT */}
        <section className="glass reminder-create-card">
          <div className="reminder-heading">
            <div>
              <div className="reminder-section-title">
                {editingId
                  ? "Edit Reminder"
                  : "Create Reminder"}
              </div>

              <p>
                {editingId
                  ? "Update your reminder details."
                  : "Add something you want to remember."}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="reminder-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

          <form
            className="reminder-form"
            onSubmit={handleSubmit}
          >
            <label className="reminder-field">
              <span>Title</span>

              <input
                type="text"
                value={form.title}
                placeholder="e.g. Finish mathematics homework"
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                required
              />
            </label>

            <label className="reminder-field reminder-field-full">
              <span>Description</span>

              <textarea
                value={form.description}
                placeholder="Add some details..."
                rows={4}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />
            </label>

            <label className="reminder-field">
              <span>Date</span>

              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: e.target.value,
                  })
                }
              />
            </label>

            <label className="reminder-field">
              <span>Time</span>

              <input
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm({
                    ...form,
                    time: e.target.value,
                  })
                }
              />
            </label>

            <label className="reminder-field">
              <span>Repeat</span>

              <select
                value={form.repeat}
                onChange={(e) =>
                  setForm({
                    ...form,
                    repeat: e.target.value as RepeatType,
                  })
                }
              >
                <option value="None">No Repeat</option>
                <option value="Daily">Every Day</option>
                <option value="Weekly">Every Week</option>
              </select>
            </label>

            <button
              type="submit"
              className="reminder-save-button"
            >
              {editingId
                ? "✓ Update Reminder"
                : "+ Save Reminder"}
            </button>
          </form>
        </section>

        {/* STATS */}
        <section className="reminder-stats-grid">
          <div className="glass reminder-stat">
            <span>📌</span>
            <strong>{reminders.length}</strong>
            <small>Total</small>
          </div>

          <div className="glass reminder-stat">
            <span>⏰</span>
            <strong>{activeCount}</strong>
            <small>Active</small>
          </div>

          <div className="glass reminder-stat">
            <span>✓</span>
            <strong>{completedCount}</strong>
            <small>Completed</small>
          </div>

          <div className="glass reminder-stat">
            <span>⚠️</span>
            <strong>{overdueCount}</strong>
            <small>Overdue</small>
          </div>
        </section>

        {/* TOOLS */}
        <section className="glass reminder-tools">
          <div className="reminder-search-wrap">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search reminders..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="reminder-filters">
            {(["All", "Active", "Completed"] as const).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    filter === item
                      ? "reminder-filter reminder-filter-active"
                      : "reminder-filter"
                  }
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </section>

        {/* LIST */}
        <section className="reminders-list">
          {filteredReminders.length === 0 ? (
            <div className="glass reminder-empty">
              <div className="reminder-empty-icon">
                ⏰
              </div>

              <h2>No reminders yet</h2>

              <p>
                Create your first reminder and keep your
                day organized.
              </p>
            </div>
          ) : (
            filteredReminders.map((reminder) => (
              <article
                key={reminder.id}
                className={`glass reminder-item ${
                  reminder.completed
                    ? "reminder-item-completed"
                    : ""
                } ${
                  isPast(reminder)
                    ? "reminder-item-overdue"
                    : ""
                }`}
              >
                <button
                  type="button"
                  className={`reminder-check ${
                    reminder.completed
                      ? "reminder-check-active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleReminder(reminder.id)
                  }
                  aria-label="Toggle reminder"
                >
                  {reminder.completed ? "✓" : ""}
                </button>

                <div className="reminder-item-content">
                  <div className="reminder-item-top">
                    <div>
                      <h2>{reminder.title}</h2>

                      {reminder.description && (
                        <p className="reminder-description">
                          {reminder.description}
                        </p>
                      )}
                    </div>

                    <div className="reminder-actions">
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(reminder)
                        }
                        className="reminder-edit"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteReminder(reminder.id)
                        }
                        className="reminder-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="reminder-meta">
                    {reminder.date && (
                      <span>📅 {formatDate(reminder.date)}</span>
                    )}

                    {reminder.time && (
                      <span>⏰ {reminder.time}</span>
                    )}

                    {reminder.repeat !== "None" && (
                      <span>🔁 {reminder.repeat}</span>
                    )}

                    {isPast(reminder) && (
                      <span className="reminder-overdue">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </PageShell>
  );
}