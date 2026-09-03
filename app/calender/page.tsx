"use client";

import { useEffect, useMemo, useState } from "react";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassBadge from "@/component/glass/GlassBadge";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "Goal" | "Habit" | "Study" | "Journal" | "Mood";
  description?: string;
};

type ActivityDay = {
  date: string;
  goal: number;
  habit: number;
  study: number;
  journal: number;
  mood: number;
};

const GOALS_KEY = "my-little-universe-goals-v1";
const HABITS_KEY = "my-little-universe-habits-v2";
const STUDY_KEY = "my-little-universe-study";
const JOURNAL_KEY = "my-little-universe-journal";
const MOOD_KEY = "my-little-universe-mood";

const pad = (value: number) =>
  String(value).padStart(2, "0");

const getDateKey = (date: Date) => {
  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
};

const getMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}`;
};

const formatLongDate = (dateKey: string) => {
  return parseDateKey(dateKey).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const eventIcons: Record<
  CalendarEvent["type"],
  string
> = {
  Goal: "🎯",
  Habit: "✓",
  Study: "📚",
  Journal: "📝",
  Mood: "😊",
};

const eventLabels: Record<
  CalendarEvent["type"],
  string
> = {
  Goal: "Goal",
  Habit: "Habit",
  Study: "Study",
  Journal: "Journal",
  Mood: "Mood",
};

const eventClass: Record<
  CalendarEvent["type"],
  string
> = {
  Goal: "calendar-event-goal",
  Habit: "calendar-event-habit",
  Study: "calendar-event-study",
  Journal: "calendar-event-journal",
  Mood: "calendar-event-mood",
};

export default function CalendarPage() {
  const todayKey = getDateKey(new Date());

  const [currentMonth, setCurrentMonth] =
    useState(() => {
      const now = new Date();

      return new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    });

  const [selectedDate, setSelectedDate] =
    useState(todayKey);

  const [events, setEvents] = useState<
    CalendarEvent[]
  >([]);

  const [activity, setActivity] = useState<
    ActivityDay[]
  >([]);

  const [loaded, setLoaded] = useState(false);

  /* --------------------------------------------------
     LOAD DATA FROM EXISTING FEATURES
     -------------------------------------------------- */

  useEffect(() => {
    const nextEvents: CalendarEvent[] = [];
    const activityMap = new Map<
      string,
      ActivityDay
    >();

    const getActivity = (
      date: string
    ): ActivityDay => {
      const existing =
        activityMap.get(date);

      if (existing) return existing;

      const fresh: ActivityDay = {
        date,
        goal: 0,
        habit: 0,
        study: 0,
        journal: 0,
        mood: 0,
      };

      activityMap.set(date, fresh);

      return fresh;
    };

    const safeParse = (
      key: string
    ): unknown => {
      try {
        const value =
          localStorage.getItem(key);

        if (!value) return null;

        return JSON.parse(value);
      } catch {
        return null;
      }
    };

    /* GOALS */

    const goalsData = safeParse(
      GOALS_KEY
    );

    if (Array.isArray(goalsData)) {
      goalsData.forEach((goal) => {
        if (
          goal &&
          typeof goal === "object"
        ) {
          const item =
            goal as {
              id?: string;
              title?: string;
              deadline?: string;
              completed?: boolean;
            };

          if (
            item.deadline &&
            item.title
          ) {
            nextEvents.push({
              id: `goal-${item.id ?? item.title}`,
              title: item.title,
              date: item.deadline,
              type: "Goal",
              description:
                item.completed
                  ? "Completed goal"
                  : "Goal deadline",
            });

            getActivity(
              item.deadline
            ).goal += 1;
          }
        }
      });
    }

    /* HABITS */

    const habitsData = safeParse(
      HABITS_KEY
    );

    if (Array.isArray(habitsData)) {
      habitsData.forEach((habit) => {
        if (
          !habit ||
          typeof habit !== "object"
        ) {
          return;
        }

        const item =
          habit as {
            id?: string;
            name?: string;
            completedDates?: string[];
          };

        if (
          !item.name ||
          !Array.isArray(
            item.completedDates
          )
        ) {
          return;
        }

        item.completedDates.forEach(
          (date) => {
            if (!date) return;

           if (item.name && typeof item.name === "string") {
  nextEvents.push({
    id: `habit-${item.id ?? item.name}-${date}`,
    title: item.name,
    date,
    type: "Habit",
    description: "Habit completed",
  });
}

            getActivity(date).habit += 1;
          }
        );
      });
    }

    /* JOURNAL */

    const journalData = safeParse(
      JOURNAL_KEY
    );

    if (Array.isArray(journalData)) {
      journalData.forEach((entry) => {
        if (
          !entry ||
          typeof entry !== "object"
        ) {
          return;
        }

        const item =
          entry as {
            id?: string;
            title?: string;
            date?: string;
          };

        if (
          item.date &&
          item.title
        ) {
          nextEvents.push({
            id: `journal-${item.id ?? item.title}`,
            title: item.title,
            date: item.date,
            type: "Journal",
            description:
              "Journal entry",
          });

          getActivity(
            item.date
          ).journal += 1;
        }
      });
    }

    /* MOOD */

    const moodData = safeParse(
      MOOD_KEY
    );

    if (Array.isArray(moodData)) {
      moodData.forEach((entry) => {
        if (
          !entry ||
          typeof entry !== "object"
        ) {
          return;
        }

        const item =
          entry as {
            id?: string;
            date?: string;
            mood?: string;
            emoji?: string;
          };

        if (item.date) {
          nextEvents.push({
            id: `mood-${item.id ?? item.date}`,
            title:
              item.mood ??
              "Mood check-in",
            date: item.date,
            type: "Mood",
            description:
              item.emoji ??
              "Mood check-in",
          });

          getActivity(
            item.date
          ).mood += 1;
        }
      });
    }

    /* STUDY */

    const studyData = safeParse(
      STUDY_KEY
    );

    if (
      studyData &&
      typeof studyData === "object"
    ) {
      const data =
        studyData as {
          activities?: string[];
          activityDates?: string[];
          completedDates?: string[];
        };

      const dates = [
        ...(Array.isArray(
          data.activities
        )
          ? data.activities
          : []),
        ...(Array.isArray(
          data.activityDates
        )
          ? data.activityDates
          : []),
        ...(Array.isArray(
          data.completedDates
        )
          ? data.completedDates
          : []),
      ];

      Array.from(new Set(dates)).forEach(
        (date) => {
          if (
            typeof date !== "string"
          ) {
            return;
          }

          nextEvents.push({
            id: `study-${date}`,
            title: "Study activity",
            date,
            type: "Study",
            description:
              "Study activity recorded",
          });

          getActivity(date).study += 1;
        }
      );
    }

    /*
      Also support study data stored as an array
      in case an earlier Study implementation
      used that format.
    */

    if (Array.isArray(studyData)) {
      studyData.forEach((entry) => {
        if (
          typeof entry === "string"
        ) {
          nextEvents.push({
            id: `study-${entry}`,
            title: "Study activity",
            date: entry,
            type: "Study",
          });

          getActivity(entry).study += 1;
        }
      });
    }

    setEvents(nextEvents);
    setActivity(
      Array.from(activityMap.values())
    );

    setLoaded(true);
  }, []);

  /*
    Re-read existing feature data when the
    browser window becomes active.
  */

  useEffect(() => {
    if (!loaded) return;

    const refresh = () => {
      window.location.reload();
    };

    window.addEventListener(
      "focus",
      refresh
    );

    return () => {
      window.removeEventListener(
        "focus",
        refresh
      );
    };
  }, [loaded]);

  /* --------------------------------------------------
     CALENDAR DAYS
     -------------------------------------------------- */

  const calendarDays = useMemo(() => {
    const year =
      currentMonth.getFullYear();

    const month =
      currentMonth.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    ).getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const previousMonthDays =
      new Date(
        year,
        month,
        0
      ).getDate();

    const cells: {
      date: Date;
      currentMonth: boolean;
    }[] = [];

    for (
      let i = firstDay - 1;
      i >= 0;
      i--
    ) {
      cells.push({
        date: new Date(
          year,
          month - 1,
          previousMonthDays - i
        ),
        currentMonth: false,
      });
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      cells.push({
        date: new Date(
          year,
          month,
          day
        ),
        currentMonth: true,
      });
    }

    let nextDay = 1;

    while (cells.length < 42) {
      cells.push({
        date: new Date(
          year,
          month + 1,
          nextDay
        ),
        currentMonth: false,
      });

      nextDay++;
    }

    return cells;
  }, [currentMonth]);

  /* --------------------------------------------------
     SELECTED DAY
     -------------------------------------------------- */

  const selectedEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.date === selectedDate
    );
  }, [events, selectedDate]);

  const selectedActivity = useMemo(() => {
    return (
      activity.find(
        (item) =>
          item.date === selectedDate
      ) ?? {
        date: selectedDate,
        goal: 0,
        habit: 0,
        study: 0,
        journal: 0,
        mood: 0,
      }
    );
  }, [activity, selectedDate]);

  const selectedTotal =
    selectedActivity.goal +
    selectedActivity.habit +
    selectedActivity.study +
    selectedActivity.journal +
    selectedActivity.mood;

  /* --------------------------------------------------
     MONTH STATS
     -------------------------------------------------- */

  const monthKey =
    getMonthKey(currentMonth);

  const monthEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.date.startsWith(monthKey)
    );
  }, [events, monthKey]);

  const activeDays = useMemo(() => {
    return new Set(
      monthEvents.map(
        (event) => event.date
      )
    ).size;
  }, [monthEvents]);

  const monthGoals = monthEvents.filter(
    (event) =>
      event.type === "Goal"
  ).length;

  const monthHabits = monthEvents.filter(
    (event) =>
      event.type === "Habit"
  ).length;

  const monthStudy = monthEvents.filter(
    (event) =>
      event.type === "Study"
  ).length;

  /* --------------------------------------------------
     NAVIGATION
     -------------------------------------------------- */

  const previousMonth = () => {
    setCurrentMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1
        )
    );
  };

  const goToday = () => {
    const now = new Date();

    setCurrentMonth(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )
    );

    setSelectedDate(
      getDateKey(now)
    );
  };

  const selectDay = (date: Date) => {
    const key = getDateKey(date);

    setSelectedDate(key);

    if (
      date.getMonth() !==
      currentMonth.getMonth()
    ) {
      setCurrentMonth(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        )
      );
    }
  };

  return (
    <PageShell
      eyebrow="CALENDAR"
      title="See your days come together. 📅"
      description="A simple view of your goals, habits, study, journal and mood activity."
    >
      <div className="calendar-v1-layout">

        {/* HEADER */}

        <div className="calendar-v1-header">
          <div>
            <span className="eyebrow">
              YOUR MONTH
            </span>

            <h2>
              {monthNames[
                currentMonth.getMonth()
              ]}{" "}
              {currentMonth.getFullYear()}
            </h2>
          </div>

          <div className="calendar-header-actions">
            <GlassButton
              onClick={goToday}
            >
              Today
            </GlassButton>

            <div className="calendar-nav">
              <button
                type="button"
                onClick={previousMonth}
                aria-label="Previous month"
              >
                ←
              </button>

              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}

        <section className="calendar-stats">
          <GlassCard className="calendar-stat">
            <span>✨</span>

            <div>
              <strong>
                {activeDays}
              </strong>

              <small>
                Active Days
              </small>
            </div>
          </GlassCard>

          <GlassCard className="calendar-stat">
            <span>🎯</span>

            <div>
              <strong>
                {monthGoals}
              </strong>

              <small>
                Goal Dates
              </small>
            </div>
          </GlassCard>

          <GlassCard className="calendar-stat">
            <span>✓</span>

            <div>
              <strong>
                {monthHabits}
              </strong>

              <small>
                Habit Days
              </small>
            </div>
          </GlassCard>

          <GlassCard className="calendar-stat">
            <span>📚</span>

            <div>
              <strong>
                {monthStudy}
              </strong>

              <small>
                Study Activity
              </small>
            </div>
          </GlassCard>
        </section>

        {/* MAIN */}

        <div className="calendar-main-grid">

          {/* CALENDAR */}

          <GlassCard className="calendar-card">
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
                <span key={day}>
                  {day}
                </span>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarDays.map(
                ({
                  date,
                  currentMonth:
                    isCurrentMonth,
                }) => {
                  const dateKey =
                    getDateKey(date);

                  const dayEvents =
                    events.filter(
                      (event) =>
                        event.date ===
                        dateKey
                    );

                  const uniqueTypes =
                    Array.from(
                      new Set(
                        dayEvents.map(
                          (event) =>
                            event.type
                        )
                      )
                    );

                  const isToday =
                    dateKey === todayKey;

                  const isSelected =
                    dateKey ===
                    selectedDate;

                  return (
                    <button
                      type="button"
                      key={dateKey}
                      className={`calendar-day ${
                        isCurrentMonth
                          ? ""
                          : "calendar-day-muted"
                      } ${
                        isToday
                          ? "calendar-day-today"
                          : ""
                      } ${
                        isSelected
                          ? "calendar-day-selected"
                          : ""
                      }`}
                      onClick={() =>
                        selectDay(date)
                      }
                    >
                      <span className="calendar-day-number">
                        {date.getDate()}
                      </span>

                      {dayEvents.length >
                        0 && (
                        <div className="calendar-day-events">
                          {uniqueTypes
                            .slice(0, 4)
                            .map(
                              (type) => (
                                <span
                                  key={
                                    type
                                  }
                                  className={`calendar-dot ${eventClass[type]}`}
                                  title={
                                    eventLabels[
                                      type
                                    ]
                                  }
                                />
                              )
                            )}
                        </div>
                      )}

                      {dayEvents.length >
                        0 && (
                        <span className="calendar-event-count">
                          {dayEvents.length}
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>

            {/* LEGEND */}

            <div className="calendar-legend">
              {(
                Object.keys(
                  eventIcons
                ) as CalendarEvent["type"][]
              ).map((type) => (
                <span key={type}>
                  <i
                    className={`calendar-dot ${eventClass[type]}`}
                  />
                  {eventIcons[type]}{" "}
                  {type}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* DAY DETAILS */}

          <GlassCard className="calendar-day-card">
            <div className="calendar-day-card-heading">
              <div>
                <span className="eyebrow">
                  SELECTED DAY
                </span>

                <h2>
                  {formatLongDate(
                    selectedDate
                  )}
                </h2>
              </div>

              <GlassBadge>
                {selectedTotal}{" "}
                activities
              </GlassBadge>
            </div>

            {/* ACTIVITY SUMMARY */}

            <div className="selected-day-summary">
              <div>
                <span>🎯</span>
                <strong>
                  {selectedActivity.goal}
                </strong>
                <small>Goals</small>
              </div>

              <div>
                <span>✓</span>
                <strong>
                  {selectedActivity.habit}
                </strong>
                <small>Habits</small>
              </div>

              <div>
                <span>📚</span>
                <strong>
                  {selectedActivity.study}
                </strong>
                <small>Study</small>
              </div>

              <div>
                <span>📝</span>
                <strong>
                  {selectedActivity.journal}
                </strong>
                <small>Journal</small>
              </div>

              <div>
                <span>😊</span>
                <strong>
                  {selectedActivity.mood}
                </strong>
                <small>Mood</small>
              </div>
            </div>

            {/* EVENTS */}

            <div className="calendar-events-heading">
              <span className="eyebrow">
                DAY ACTIVITY
              </span>

              <small>
                {selectedEvents.length} items
              </small>
            </div>

            {selectedEvents.length ===
            0 ? (
              <div className="calendar-empty-day">
                <span>🌤️</span>

                <h3>
                  Nothing recorded here.
                </h3>

                <p>
                  This day is currently
                  quiet. Add something in
                  your Goals, Habits, Study,
                  Journal or Mood sections.
                </p>
              </div>
            ) : (
              <div className="calendar-events-list">
                {selectedEvents.map(
                  (event) => (
                    <div
                      key={event.id}
                      className="calendar-event-item"
                    >
                      <div
                        className={`calendar-event-icon ${eventClass[event.type]}`}
                      >
                        {
                          eventIcons[
                            event.type
                          ]
                        }
                      </div>

                      <div className="calendar-event-content">
                        <div>
                          <span>
                            {
                              eventLabels[
                                event.type
                              ]
                            }
                          </span>

                          <h3>
                            {event.title}
                          </h3>
                        </div>

                        {event.description && (
                          <p>
                            {
                              event.description
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </GlassCard>
        </div>

        {/* MONTH OVERVIEW */}

        <GlassCard className="calendar-overview">
          <div className="calendar-overview-heading">
            <div>
              <span className="eyebrow">
                MONTH OVERVIEW
              </span>

              <h2>
                Your activity rhythm
              </h2>
            </div>

            <GlassBadge>
              {monthEvents.length} events
            </GlassBadge>
          </div>

          <div className="calendar-overview-bars">

            <div className="calendar-overview-row">
              <div>
                <span>
                  🎯 Goals
                </span>

                <strong>
                  {monthGoals}
                </strong>
              </div>

              <div className="calendar-overview-track">
                <div
                  style={{
                    width: `${
                      monthEvents.length
                        ? Math.min(
                            100,
                            (monthGoals /
                              monthEvents.length) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="calendar-overview-row">
              <div>
                <span>
                  ✓ Habits
                </span>

                <strong>
                  {monthHabits}
                </strong>
              </div>

              <div className="calendar-overview-track">
                <div
                  style={{
                    width: `${
                      monthEvents.length
                        ? Math.min(
                            100,
                            (monthHabits /
                              monthEvents.length) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="calendar-overview-row">
              <div>
                <span>
                  📚 Study
                </span>

                <strong>
                  {monthStudy}
                </strong>
              </div>

              <div className="calendar-overview-track">
                <div
                  style={{
                    width: `${
                      monthEvents.length
                        ? Math.min(
                            100,
                            (monthStudy /
                              monthEvents.length) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* FOOTER */}

        <GlassCard className="calendar-bottom-card">
          <span>🌱</span>

          <div>
            <h2>
              Every day leaves a little
              footprint.
            </h2>

            <p>
              Your calendar brings the
              different parts of My Little
              Universe together in one place.
            </p>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}