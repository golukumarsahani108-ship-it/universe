"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassInput from "@/component/glass/GlassInput";
import GlassBadge from "@/component/glass/GlassBadge";

type EventType =
  | "Task"
  | "Goal"
  | "Habit"
  | "Study"
  | "Journal"
  | "Mood";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: EventType;
  description?: string;
  icon: string;
  completed?: boolean;
  time?: string;
  notify?: boolean;
};

type ReminderTask = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  notify: boolean;
  completed: boolean;
  createdAt: number;
};

type Goal = {
  id?: string;
  title?: string;
  deadline?: string;
  description?: string;
  completed?: boolean;
};

type Habit = {
  id?: string;
  name?: string;
  completedDates?: string[];
};

type StudyItem = {
  id?: string;
  title?: string;
  name?: string;
  date?: string;
  createdAt?: string;
  completed?: boolean;
};

type JournalItem = {
  id?: string;
  title?: string;
  date?: string;
  createdAt?: string;
};

type MoodItem = {
  id?: string;
  date?: string;
  mood?: string;
  label?: string;
};

const REMINDER_STORAGE_KEY = "my-little-universe-calendar-reminders";

const EVENT_COLORS: Record<EventType, string> = {
  Task: "📌",
  Goal: "🎯",
  Habit: "🔥",
  Study: "📚",
  Journal: "📖",
  Mood: "🌈",
};

function readStorage(key: string): unknown {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    for (const key of [
      "items",
      "records",
      "data",
      "activities",
      "entries",
      "goals",
      "habits",
      "tasks",
    ]) {
      if (Array.isArray(obj[key])) {
        return obj[key];
      }
    }
  }

  return [];
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatReadableDate(dateString: string) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "";

  const [hourString, minute] = time.split(":");
  const hour = Number(hourString);

  if (Number.isNaN(hour)) return time;

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthStartDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function dateFromOffset(
  year: number,
  month: number,
  offset: number
) {
  return new Date(year, month, 1 + offset);
}

function getReminderDateTime(task: ReminderTask) {
  return new Date(`${task.date}T${task.time}:00`);
}

function isReminderPast(task: ReminderTask) {
  if (task.completed) return false;

  return getReminderDateTime(task).getTime() < Date.now();
}

function getUpcomingDateTime(task: ReminderTask) {
  const dateTime = getReminderDateTime(task);

  if (Number.isNaN(dateTime.getTime())) return Infinity;

  return dateTime.getTime();
}

export default function CalendarPage() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    today.getMonth()
  );

  const [currentYear, setCurrentYear] = useState(
    today.getFullYear()
  );

  const [selectedDate, setSelectedDate] = useState(
    formatDate(today)
  );

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<ReminderTask[]>([]);

  const [activeFilter, setActiveFilter] =
    useState<"All" | EventType>("All");

  const [search, setSearch] = useState("");

  const [loaded, setLoaded] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState(formatDate(today));
  const [taskTime, setTaskTime] = useState("09:00");
  const [taskNotify, setTaskNotify] = useState(true);

  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null);

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadData = () => {
      const nextEvents: CalendarEvent[] = [];

      // -----------------------------
      // GOALS
      // -----------------------------

      const goals = normalizeArray(
        readStorage("my-little-universe-goals-v1")
      ) as Goal[];

      goals.forEach((goal) => {
        if (!goal.deadline || !goal.title) return;

        nextEvents.push({
          id: `goal-${goal.id ?? goal.title}-${goal.deadline}`,
          title: goal.title,
          date: goal.deadline,
          type: "Goal",
          description:
            goal.description || "Goal deadline",
          icon: "🎯",
          completed: goal.completed,
        });
      });

      // -----------------------------
      // HABITS
      // -----------------------------

      const habits = normalizeArray(
        readStorage("my-little-universe-habits-v2")
      ) as Habit[];

      habits.forEach((habit) => {
        if (!habit.name || !Array.isArray(habit.completedDates)) {
          return;
        }

        habit.completedDates.forEach((date) => {
          if (!date || !habit.name) return;

          nextEvents.push({
            id: `habit-${habit.id ?? habit.name}-${date}`,
            title: habit.name,
            date,
            type: "Habit",
            description: "Habit completed",
            icon: "🔥",
            completed: true,
          });
        });
      });

      // -----------------------------
      // STUDY
      // -----------------------------

      const study = normalizeArray(
        readStorage("my-little-universe-study")
      ) as StudyItem[];

      study.forEach((item) => {
        const date =
          item.date ||
          (item.createdAt
            ? item.createdAt.slice(0, 10)
            : "");

        const title = item.title || item.name;

        if (!date || !title) return;

        nextEvents.push({
          id: `study-${item.id ?? title}-${date}`,
          title,
          date,
          type: "Study",
          description: "Study activity",
          icon: "📚",
          completed: item.completed,
        });
      });

      // -----------------------------
      // JOURNAL
      // -----------------------------

      const journal = normalizeArray(
        readStorage("my-little-universe-journal")
      ) as JournalItem[];

      journal.forEach((item) => {
        const date =
          item.date ||
          (item.createdAt
            ? item.createdAt.slice(0, 10)
            : "");

        if (!date) return;

        nextEvents.push({
          id: `journal-${item.id ?? item.title ?? "entry"}-${date}`,
          title: item.title || "Journal entry",
          date,
          type: "Journal",
          description: "Journal entry created",
          icon: "📖",
        });
      });

      // -----------------------------
      // MOOD
      // -----------------------------

      const mood = normalizeArray(
        readStorage("my-little-universe-mood")
      ) as MoodItem[];

      mood.forEach((item) => {
        if (!item.date) return;

        nextEvents.push({
          id: `mood-${item.id ?? item.date}-${item.date}`,
          title:
            item.mood ||
            item.label ||
            "Mood check-in",
          date: item.date,
          type: "Mood",
          description: "Mood check-in",
          icon: "🌈",
        });
      });

      setEvents(nextEvents);

      // -----------------------------
      // CALENDAR TASKS
      // -----------------------------

      const savedTasks = normalizeArray(
        readStorage(REMINDER_STORAGE_KEY)
      ) as ReminderTask[];

      setTasks(
        savedTasks.filter(
          (task) =>
            task &&
            typeof task.title === "string" &&
            typeof task.date === "string"
        )
      );

      setLoaded(true);
    };

    loadData();

    const handleFocus = () => {
      loadData();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // -----------------------------
  // NOTIFICATION PERMISSION
  // -----------------------------

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }

    setNotificationPermission(Notification.permission);
  }, []);

  // -----------------------------
  // SAVE TASKS
  // -----------------------------

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      REMINDER_STORAGE_KEY,
      JSON.stringify(tasks)
    );
  }, [tasks, loaded]);

  // -----------------------------
  // REQUEST NOTIFICATION
  // -----------------------------

  const requestNotificationPermission = async () => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    try {
      const permission =
        await Notification.requestPermission();

      setNotificationPermission(permission);
    } catch {
      setNotificationPermission("default");
    }
  };

  // -----------------------------
  // CREATE / UPDATE TASK
  // -----------------------------

  const saveTask = () => {
    const title = taskTitle.trim();

    if (!title || !taskDate || !taskTime) {
      return;
    }

    if (editingTaskId) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title,
                description: taskDescription.trim(),
                date: taskDate,
                time: taskTime,
                notify: taskNotify,
                completed: false,
              }
            : task
        )
      );
    } else {
      const newTask: ReminderTask = {
        id: crypto.randomUUID(),
        title,
        description: taskDescription.trim(),
        date: taskDate,
        time: taskTime,
        notify: taskNotify,
        completed: false,
        createdAt: Date.now(),
      };

      setTasks((current) => [newTask, ...current]);
    }

    setSelectedDate(taskDate);

    const selected = new Date(
      `${taskDate}T00:00:00`
    );

    setCurrentMonth(selected.getMonth());
    setCurrentYear(selected.getFullYear());

    resetTaskForm();

    if (
      taskNotify &&
      notificationPermission === "default"
    ) {
      void requestNotificationPermission();
    }
  };

  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDate(selectedDate);
    setTaskTime("09:00");
    setTaskNotify(true);
    setEditingTaskId(null);
  };

  const editTask = (task: ReminderTask) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskDate(task.date);
    setTaskTime(task.time);
    setTaskNotify(task.notify);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteTask = (id: string) => {
    setTasks((current) =>
      current.filter((task) => task.id !== id)
    );

    if (editingTaskId === id) {
      resetTaskForm();
    }
  };

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  };

  const toggleTaskNotification = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              notify: !task.notify,
            }
          : task
      )
    );
  };

  // -----------------------------
  // TEST NOTIFICATION
  // -----------------------------

  const sendTestNotification = () => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    if (Notification.permission !== "granted") {
      void requestNotificationPermission();
      return;
    }

    new Notification("Calendar Reminder 📌", {
      body: "Your notification system is working!",
    });
  };

  // -----------------------------
  // MONTH NAVIGATION
  // -----------------------------

  const goPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }
  };

  const goNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }
  };

  const goToday = () => {
    const now = new Date();
    const todayDate = formatDate(now);

    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDate(todayDate);
    setTaskDate(todayDate);
  };

  // -----------------------------
  // CALENDAR DAYS
  // -----------------------------

  const calendarDays = useMemo(() => {
    const startDay = getMonthStartDay(
      currentYear,
      currentMonth
    );

    const totalDays = getDaysInMonth(
      currentYear,
      currentMonth
    );

    const cells: Date[] = [];

    for (let i = 0; i < 42; i++) {
      cells.push(
        dateFromOffset(
          currentYear,
          currentMonth,
          i - startDay
        )
      );
    }

    return {
      cells,
      totalDays,
    };
  }, [currentMonth, currentYear]);

  // -----------------------------
  // FILTERED EVENTS
  // -----------------------------

  const allCalendarEvents = useMemo(() => {
    return [
      ...events,
      ...tasks.map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        date: task.date,
        type: "Task" as EventType,
        description:
          task.description ||
          `Reminder at ${formatTime(task.time)}`,
        icon: "📌",
        completed: task.completed,
        time: task.time,
        notify: task.notify,
      })),
    ];
  }, [events, tasks]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allCalendarEvents.filter((event) => {
      const matchesFilter =
        activeFilter === "All" ||
        event.type === activeFilter;

      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.description
          ?.toLowerCase()
          .includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [allCalendarEvents, activeFilter, search]);

  const getEventsForDate = (date: string) => {
    return filteredEvents
      .filter((event) => event.date === date)
      .sort((a, b) => {
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }

        if (a.time) return -1;
        if (b.time) return 1;

        return a.title.localeCompare(b.title);
      });
  };

  const selectedEvents = getEventsForDate(selectedDate);

  // -----------------------------
  // MONTH STATS
  // -----------------------------

  const monthEvents = useMemo(() => {
    return filteredEvents.filter((event) => {
      const date = new Date(
        `${event.date}T00:00:00`
      );

      return (
        date.getFullYear() === currentYear &&
        date.getMonth() === currentMonth
      );
    });
  }, [
    filteredEvents,
    currentMonth,
    currentYear,
  ]);

  const monthTasks = monthEvents.filter(
    (event) => event.type === "Task"
  ).length;

  const monthGoals = monthEvents.filter(
    (event) => event.type === "Goal"
  ).length;

  const monthHabits = monthEvents.filter(
    (event) => event.type === "Habit"
  ).length;

  const completedMonthTasks = monthEvents.filter(
    (event) =>
      event.type === "Task" && event.completed
  ).length;

  // -----------------------------
  // UPCOMING TASKS
  // -----------------------------

  const upcomingTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => !task.completed)
      .sort(
        (a, b) =>
          getUpcomingDateTime(a) -
          getUpcomingDateTime(b)
      )
      .slice(0, 8);
  }, [tasks]);

  // -----------------------------
  // TODAY TASKS
  // -----------------------------

  const todayDate = formatDate(new Date());

  const todayTasks = tasks
    .filter((task) => task.date === todayDate)
    .sort((a, b) =>
      a.time.localeCompare(b.time)
    );

  const overdueTasks = tasks.filter(
    (task) => isReminderPast(task)
  );

  // -----------------------------
  // SELECT DATE
  // -----------------------------

  const selectDate = (date: Date) => {
    const dateString = formatDate(date);

    setSelectedDate(dateString);
    setTaskDate(dateString);

    if (date.getMonth() !== currentMonth) {
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  };

  // -----------------------------
  // RENDER
  // -----------------------------

  return (
    <PageShell
      eyebrow="CALENDAR"
      title="My Calendar 📅"
      description="See your important days, goals, habits, study activity and personal reminders in one place."
    >
      <div className="calendar-page">
        {/* REMINDER CREATOR */}

        <GlassCard className="calendar-reminder-card">
          <div className="calendar-section-heading">
            <div>
              <div className="eyebrow">
                {editingTaskId
                  ? "EDIT REMINDER"
                  : "NEW REMINDER"}
              </div>

              <h2>
                {editingTaskId
                  ? "Update your task ✏️"
                  : "What do you need to do? 📌"}
              </h2>

              <p>
                Set an exact date and time for something
                you don't want to forget.
              </p>
            </div>

            <GlassBadge>
              {taskDate
                ? formatReadableDate(taskDate)
                : "Choose a date"}
            </GlassBadge>
          </div>

          <div className="calendar-task-form">
            <GlassInput
              label="Task"
              placeholder="e.g. Complete maths assignment"
              value={taskTitle}
              onChange={setTaskTitle}
            />

            <label className="calendar-field">
              <span>Description</span>

              <textarea
                value={taskDescription}
                onChange={(event) =>
                  setTaskDescription(
                    event.target.value
                  )
                }
                placeholder="Add extra details..."
              />
            </label>

            <label className="calendar-field">
              <span>Date</span>

              <input
                type="date"
                value={taskDate}
                onChange={(event) =>
                  setTaskDate(event.target.value)
                }
              />
            </label>

            <label className="calendar-field">
              <span>Time</span>

              <input
                type="time"
                value={taskTime}
                onChange={(event) =>
                  setTaskTime(event.target.value)
                }
              />
            </label>

            <label className="calendar-notify-toggle">
              <input
                type="checkbox"
                checked={taskNotify}
                onChange={(event) =>
                  setTaskNotify(
                    event.target.checked
                  )
                }
              />

              <span className="calendar-checkbox-ui">
                🔔
              </span>

              <span>
                <strong>Notify me</strong>
                <small>
                  Get a browser notification for this
                  reminder.
                </small>
              </span>
            </label>

            <div className="calendar-form-actions">
              <GlassButton
                active
                onClick={saveTask}
              >
                {editingTaskId
                  ? "Update Reminder"
                  : "Add Reminder"}
              </GlassButton>

              {editingTaskId && (
                <GlassButton
                  onClick={resetTaskForm}
                >
                  Cancel
                </GlassButton>
              )}
            </div>
          </div>

          <div className="calendar-notification-panel">
            <div>
              <strong>
                🔔 Browser Notifications
              </strong>

              <span>
                {notificationPermission ===
                  "granted" &&
                  "Notifications are enabled."}

                {notificationPermission ===
                  "denied" &&
                  "Notifications are blocked in this browser."}

                {notificationPermission ===
                  "default" &&
                  "Permission has not been requested yet."}

                {notificationPermission ===
                  "unsupported" &&
                  "This browser does not support notifications."}
              </span>
            </div>

            <div className="calendar-notification-actions">
              {notificationPermission !==
                "granted" &&
                notificationPermission !==
                  "unsupported" && (
                  <GlassButton
                    onClick={
                      requestNotificationPermission
                    }
                  >
                    Enable Notifications
                  </GlassButton>
                )}

              {notificationPermission ===
                "granted" && (
                <GlassButton
                  onClick={sendTestNotification}
                >
                  Test Notification
                </GlassButton>
              )}
            </div>
          </div>
        </GlassCard>

        {/* HEADER CONTROLS */}

        <GlassCard className="calendar-main-card">
          <div className="calendar-topbar">
            <div>
              <div className="eyebrow">
                YOUR SPACE
              </div>

              <h2>
                {new Date(
                  currentYear,
                  currentMonth
                ).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
            </div>

            <div className="calendar-navigation">
              <GlassButton
                onClick={goPreviousMonth}
              >
                ←
              </GlassButton>

              <GlassButton onClick={goToday}>
                Today
              </GlassButton>

              <GlassButton
                onClick={goNextMonth}
              >
                →
              </GlassButton>
            </div>
          </div>

          <div className="calendar-search">
            <GlassInput
              placeholder="Search calendar..."
              value={search}
              onChange={setSearch}
            />
          </div>

          <div className="calendar-filters">
            {(
              [
                "All",
                "Task",
                "Goal",
                "Habit",
                "Study",
                "Journal",
                "Mood",
              ] as const
            ).map((filter) => (
              <button
                key={filter}
                type="button"
                className={
                  activeFilter === filter
                    ? "calendar-filter active"
                    : "calendar-filter"
                }
                onClick={() =>
                  setActiveFilter(filter)
                }
              >
                {filter === "All"
                  ? "✨"
                  : EVENT_COLORS[filter]}
                <span>{filter}</span>
              </button>
            ))}
          </div>

          {/* CALENDAR */}

          <div className="calendar-weekdays">
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.cells.map((date) => {
              const dateString = formatDate(date);

              const isCurrentMonth =
                date.getMonth() === currentMonth;

              const isToday =
                dateString === todayDate;

              const isSelected =
                dateString === selectedDate;

              const dayEvents =
                getEventsForDate(dateString);

              return (
                <button
                  key={dateString}
                  type="button"
                  className={[
                    "calendar-day",
                    !isCurrentMonth
                      ? "outside"
                      : "",
                    isToday ? "today" : "",
                    isSelected ? "selected" : "",
                  ].join(" ")}
                  onClick={() =>
                    selectDate(date)
                  }
                >
                  <span className="calendar-day-number">
                    {date.getDate()}
                  </span>

                  {dayEvents.length > 0 && (
                    <div className="calendar-day-dots">
                      {dayEvents
                        .slice(0, 4)
                        .map((event) => (
                          <span
                            key={event.id}
                            title={event.title}
                          >
                            {event.icon}
                          </span>
                        ))}

                      {dayEvents.length > 4 && (
                        <small>
                          +{dayEvents.length - 4}
                        </small>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* STATS */}

        <div className="calendar-stats-grid">
          <GlassCard className="calendar-stat-card">
            <span>📌</span>
            <strong>{monthTasks}</strong>
            <small>Tasks this month</small>
          </GlassCard>

          <GlassCard className="calendar-stat-card">
            <span>🎯</span>
            <strong>{monthGoals}</strong>
            <small>Goal dates</small>
          </GlassCard>

          <GlassCard className="calendar-stat-card">
            <span>🔥</span>
            <strong>{monthHabits}</strong>
            <small>Habit completions</small>
          </GlassCard>

          <GlassCard className="calendar-stat-card">
            <span>✅</span>
            <strong>
              {completedMonthTasks}
            </strong>
            <small>Tasks completed</small>
          </GlassCard>
        </div>

        {/* SELECTED DAY */}

        <GlassCard className="calendar-selected-card">
          <div className="calendar-section-heading">
            <div>
              <div className="eyebrow">
                SELECTED DAY
              </div>

              <h2>
                {formatReadableDate(
                  selectedDate
                )}
              </h2>

              <p>
                Everything saved for this date.
              </p>
            </div>

            <GlassBadge>
              {selectedEvents.length}{" "}
              {selectedEvents.length === 1
                ? "item"
                : "items"}
            </GlassBadge>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="calendar-empty">
              <div>🌤️</div>

              <h3>Nothing here yet</h3>

              <p>
                Add a reminder above or use another
                part of your Universe.
              </p>
            </div>
          ) : (
            <div className="calendar-event-list">
              {selectedEvents.map((event) => {
                const relatedTask =
                  event.type === "Task"
                    ? tasks.find(
                        (task) =>
                          task.id ===
                          event.id.replace(
                            "task-",
                            ""
                          )
                      )
                    : null;

                return (
                  <div
                    className="calendar-event-row"
                    key={event.id}
                  >
                    <div className="calendar-event-icon">
                      {event.icon}
                    </div>

                    <div className="calendar-event-info">
                      <div className="calendar-event-top">
                        <strong>
                          {event.title}
                        </strong>

                        <GlassBadge>
                          {event.type}
                        </GlassBadge>
                      </div>

                      {event.time && (
                        <span className="calendar-event-time">
                          ⏰ {formatTime(event.time)}
                        </span>
                      )}

                      {event.description && (
                        <p>
                          {event.description}
                        </p>
                      )}
                    </div>

                    {relatedTask && (
                      <div className="calendar-event-actions">
                        <button
                          type="button"
                          className={
                            relatedTask.completed
                              ? "calendar-mini-btn done"
                              : "calendar-mini-btn"
                          }
                          onClick={() =>
                            toggleTask(
                              relatedTask.id
                            )
                          }
                        >
                          {relatedTask.completed
                            ? "✓ Done"
                            : "Mark Done"}
                        </button>

                        <button
                          type="button"
                          className="calendar-mini-btn"
                          onClick={() =>
                            toggleTaskNotification(
                              relatedTask.id
                            )
                          }
                        >
                          {relatedTask.notify
                            ? "🔔 ON"
                            : "🔕 OFF"}
                        </button>

                        <button
                          type="button"
                          className="calendar-mini-btn"
                          onClick={() =>
                            editTask(relatedTask)
                          }
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="calendar-mini-btn danger"
                          onClick={() =>
                            deleteTask(
                              relatedTask.id
                            )
                          }
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* TODAY */}

        <GlassCard className="calendar-today-card">
          <div className="calendar-section-heading compact">
            <div>
              <div className="eyebrow">
                TODAY
              </div>

              <h2>Today's reminders 🔔</h2>
            </div>

            <GlassBadge>
              {todayTasks.length}
            </GlassBadge>
          </div>

          {todayTasks.length === 0 ? (
            <div className="calendar-small-empty">
              No reminders for today.
            </div>
          ) : (
            <div className="calendar-today-list">
              {todayTasks.map((task) => (
                <div
                  className="calendar-today-item"
                  key={task.id}
                >
                  <div>
                    <span className="calendar-today-time">
                      {formatTime(task.time)}
                    </span>

                    <strong
                      className={
                        task.completed
                          ? "completed-text"
                          : ""
                      }
                    >
                      {task.title}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className={
                      task.completed
                        ? "calendar-check done"
                        : "calendar-check"
                    }
                    onClick={() =>
                      toggleTask(task.id)
                    }
                  >
                    {task.completed ? "✓" : "○"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* UPCOMING */}

        <GlassCard className="calendar-upcoming-card">
          <div className="calendar-section-heading">
            <div>
              <div className="eyebrow">
                UPCOMING
              </div>

              <h2>
                Next reminders ⏳
              </h2>

              <p>
                Your next scheduled tasks.
              </p>
            </div>

            <GlassBadge>
              {upcomingTasks.length}
            </GlassBadge>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="calendar-empty">
              <div>✨</div>

              <h3>No upcoming reminders</h3>

              <p>
                Add something above and it will appear
                here.
              </p>
            </div>
          ) : (
            <div className="calendar-upcoming-list">
              {upcomingTasks.map((task) => (
                <div
                  className="calendar-upcoming-item"
                  key={task.id}
                >
                  <div className="calendar-upcoming-icon">
                    📌
                  </div>

                  <div className="calendar-upcoming-info">
                    <strong>{task.title}</strong>

                    <span>
                      📅{" "}
                      {formatReadableDate(
                        task.date
                      )}{" "}
                      • ⏰ {formatTime(task.time)}
                    </span>

                    {task.description && (
                      <p>
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="calendar-upcoming-actions">
                    {task.notify && (
                      <GlassBadge>
                        🔔
                      </GlassBadge>
                    )}

                    <button
                      type="button"
                      className="calendar-mini-btn"
                      onClick={() =>
                        editTask(task)
                      }
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      className="calendar-mini-btn danger"
                      onClick={() =>
                        deleteTask(task.id)
                      }
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* OVERDUE */}

        {overdueTasks.length > 0 && (
          <GlassCard className="calendar-overdue-card">
            <div className="calendar-section-heading compact">
              <div>
                <div className="eyebrow">
                  ATTENTION
                </div>

                <h2>
                  Missed reminders ⚠️
                </h2>
              </div>

              <GlassBadge>
                {overdueTasks.length}
              </GlassBadge>
            </div>

            <div className="calendar-overdue-list">
              {overdueTasks.map((task) => (
                <div
                  className="calendar-overdue-item"
                  key={task.id}
                >
                  <div>
                    <strong>
                      {task.title}
                    </strong>

                    <span>
                      {formatReadableDate(
                        task.date
                      )}{" "}
                      • {formatTime(task.time)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="calendar-mini-btn"
                    onClick={() =>
                      toggleTask(task.id)
                    }
                  >
                    Mark Done
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* QUICK LINKS */}

        <GlassCard className="calendar-links-card">
          <div className="calendar-section-heading compact">
            <div>
              <div className="eyebrow">
                QUICK ACCESS
              </div>

              <h2>
                Your Universe
              </h2>
            </div>
          </div>

          <div className="calendar-quick-links">
            <Link href="/goals">
              <span>🎯</span>
              <strong>Goals</strong>
            </Link>

            <Link href="/habits">
              <span>🔥</span>
              <strong>Habits</strong>
            </Link>

            <Link href="/study">
              <span>📚</span>
              <strong>Study</strong>
            </Link>

            <Link href="/journal">
              <span>📖</span>
              <strong>Journal</strong>
            </Link>

            <Link href="/mood">
              <span>🌈</span>
              <strong>Mood</strong>
            </Link>

            <Link href="/reminders">
              <span>🔔</span>
              <strong>Reminders</strong>
            </Link>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}