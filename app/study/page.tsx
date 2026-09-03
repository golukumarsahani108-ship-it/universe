"use client";

import { useEffect, useMemo, useState } from "react";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassBadge from "@/component/glass/GlassBadge";
import { useFeatures } from "@/component/settings/feature-store";

type StudyTask = {
  id: string;
  title: string;
  completed: boolean;
};

type StudyNote = {
  id: string;
  content: string;
  createdAt: string;
};

const TASKS_STORAGE_KEY = "my-little-universe-study-tasks";
const NOTES_STORAGE_KEY = "my-little-universe-study-notes";
const ACTIVITY_STORAGE_KEY = "my-little-universe-study-activity";

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateFromKey(dateKey: string) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
}

function getPreviousDateKey(dateKey: string) {
  const date = getDateFromKey(dateKey);

  date.setDate(date.getDate() - 1);

  return getLocalDateKey(date);
}

function calculateCurrentStreak(activityDates: string[]) {
  if (activityDates.length === 0) {
    return 0;
  }

  const uniqueDates = Array.from(
    new Set(activityDates)
  ).sort((a, b) => b.localeCompare(a));

  const today = getLocalDateKey();
  const yesterday = getPreviousDateKey(today);

  /*
   * A streak is active only if the latest study activity
   * happened today or yesterday.
   */
  if (
    uniqueDates[0] !== today &&
    uniqueDates[0] !== yesterday
  ) {
    return 0;
  }

  let streak = 0;
  let expectedDate = uniqueDates[0];

  for (const date of uniqueDates) {
    if (date !== expectedDate) {
      break;
    }

    streak += 1;
    expectedDate = getPreviousDateKey(expectedDate);
  }

  return streak;
}

export default function StudyPage() {
  const {
    getFeature,
    isFeatureEnabled,
  } = useFeatures();

  const studyFeature = getFeature("study");

  const sections = studyFeature?.sections ?? [];

  const isSectionEnabled = (id: string) => {
    /*
     * Streak is always visible.
     */
    if (id === "streak") {
      return true;
    }

    const section = sections.find(
      (item) => item.id === id
    );

    return section?.enabled ?? true;
  };

  const studyItems = studyFeature?.items ?? [];

  /* =========================
     TASK STATE
  ========================== */

  const [tasks, setTasks] = useState<StudyTask[]>([]);

  const completedTasks = tasks.filter(
  (task) => task.completed
).length;

const progress =
  tasks.length === 0
    ? 0
    : Math.round(
        (completedTasks / tasks.length) * 100
      );

  const [taskInput, setTaskInput] = useState("");
  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null);
  const [editingTaskInput, setEditingTaskInput] =
    useState("");
  const [taskLoaded, setTaskLoaded] =
    useState(false);

  /* =========================
     NOTES STATE
  ========================== */

  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [editingNoteId, setEditingNoteId] =
    useState<string | null>(null);
  const [editingNoteInput, setEditingNoteInput] =
    useState("");
  const [notesLoaded, setNotesLoaded] =
    useState(false);

  /* =========================
     STREAK STATE
  ========================== */

  const [activityDates, setActivityDates] =
    useState<string[]>([]);
  const [activityLoaded, setActivityLoaded] =
    useState(false);

  /* =========================
     LOAD TASKS
  ========================== */

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem(
        TASKS_STORAGE_KEY
      );

      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);

        if (Array.isArray(parsed)) {
          setTasks(parsed);
        }
      }
    } catch {
      console.log(
        "Study tasks could not be loaded."
      );
    }

    setTaskLoaded(true);
  }, []);

  /* =========================
     SAVE TASKS
  ========================== */

  useEffect(() => {
    if (!taskLoaded) {
      return;
    }

    localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify(tasks)
    );
  }, [tasks, taskLoaded]);

  /* =========================
     LOAD NOTES
  ========================== */

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(
        NOTES_STORAGE_KEY
      );

      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);

        /*
         * New format
         */
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      }
    } catch {
      console.log(
        "Study notes could not be loaded."
      );
    }

    setNotesLoaded(true);
  }, []);

  /* =========================
     SAVE NOTES
  ========================== */

  useEffect(() => {
    if (!notesLoaded) {
      return;
    }

    localStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify(notes)
    );
  }, [notes, notesLoaded]);

  /* =========================
     LOAD STREAK ACTIVITY
  ========================== */

  useEffect(() => {
    try {
      const savedActivity = localStorage.getItem(
        ACTIVITY_STORAGE_KEY
      );

      if (savedActivity) {
        const parsed = JSON.parse(savedActivity);

        if (Array.isArray(parsed)) {
          setActivityDates(parsed);
        }
      }
    } catch {
      console.log(
        "Study streak could not be loaded."
      );
    }

    setActivityLoaded(true);
  }, []);

  /* =========================
     SAVE STREAK ACTIVITY
  ========================== */

  useEffect(() => {
    if (!activityLoaded) {
      return;
    }

    localStorage.setItem(
      ACTIVITY_STORAGE_KEY,
      JSON.stringify(activityDates)
    );
  }, [activityDates, activityLoaded]);

  /* =========================
     RECORD STUDY ACTIVITY
  ========================== */

  const recordStudyActivity = () => {
    const today = getLocalDateKey();

    setActivityDates((current) => {
      if (current.includes(today)) {
        return current;
      }

      return [...current, today];
    });
  };

  /* =========================
     ADD TASK
  ========================== */

  const addTask = () => {
    const title = taskInput.trim();

    if (!title) {
      return;
    }

    const newTask: StudyTask = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      completed: false,
    };

    setTasks((current) => [
      ...current,
      newTask,
    ]);

    setTaskInput("");
  };

  /* =========================
     TOGGLE TASK
  ========================== */

  const toggleTask = (id: string) => {
    setTasks((current) => {
      const task = current.find(
        (item) => item.id === id
      );

      if (!task) {
        return current;
      }

      /*
       * Completing a task counts as study activity.
       */
      if (!task.completed) {
        recordStudyActivity();
      }

      return current.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
            }
          : item
      );
    });
  };

  /* =========================
     DELETE TASK
  ========================== */

  const deleteTask = (id: string) => {
    setTasks((current) =>
      current.filter(
        (task) => task.id !== id
      )
    );

    if (editingTaskId === id) {
      setEditingTaskId(null);
      setEditingTaskInput("");
    }
  };

  /* =========================
     START EDIT TASK
  ========================== */

  const startEditTask = (
    task: StudyTask
  ) => {
    setEditingTaskId(task.id);
    setEditingTaskInput(task.title);
  };

  /* =========================
     SAVE EDITED TASK
  ========================== */

  const saveEditedTask = () => {
    if (!editingTaskId) {
      return;
    }

    const title = editingTaskInput.trim();

    if (!title) {
      return;
    }

    setTasks((current) =>
      current.map((task) =>
        task.id === editingTaskId
          ? {
              ...task,
              title,
            }
          : task
      )
    );

    setEditingTaskId(null);
    setEditingTaskInput("");
  };

  /* =========================
     SAVE NEW NOTE
  ========================== */

  const saveNewNote = () => {
    const content = noteInput.trim();

    if (!content) {
      return;
    }

    const newNote: StudyNote = {
      id: `${Date.now()}-${Math.random()}`,
      content,
      createdAt: new Date().toISOString(),
    };

    setNotes((current) => [
      newNote,
      ...current,
    ]);

    /*
     * Automatically clear editor so user
     * can immediately write another note.
     */
    setNoteInput("");
  };

  /* =========================
     START EDIT NOTE
  ========================== */

  const startEditNote = (
    note: StudyNote
  ) => {
    setEditingNoteId(note.id);
    setEditingNoteInput(note.content);
  };

  /* =========================
     SAVE EDITED NOTE
  ========================== */

  const saveEditedNote = () => {
    if (!editingNoteId) {
      return;
    }

    const content =
      editingNoteInput.trim();

    if (!content) {
      return;
    }

    setNotes((current) =>
      current.map((note) =>
        note.id === editingNoteId
          ? {
              ...note,
              content,
            }
          : note
      )
    );

    setEditingNoteId(null);
    setEditingNoteInput("");
  };

  /* =========================
     DELETE NOTE
  ========================== */

  const deleteNote = (id: string) => {
    setNotes((current) =>
      current.filter(
        (note) => note.id !== id
      )
    );

    if (editingNoteId === id) {
      setEditingNoteId(null);
      setEditingNoteInput("");
    }
  };

  /* =========================
     TASK PROGRESS
  ========================== */

  const completedCount = useMemo(() => {
    return tasks.filter(
      (task) => task.completed
    ).length;
  }, [tasks]);

  const totalTasks = tasks.length;

  const progressPercentage =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedCount / totalTasks) * 100
        );

  /* =========================
     CURRENT STREAK
  ========================== */

  const currentStreak = useMemo(() => {
    return calculateCurrentStreak(
      activityDates
    );
  }, [activityDates]);

  /* =========================
     STUDY OFF
  ========================== */

  if (!isFeatureEnabled("study")) {
    return (
      <PageShell
        eyebrow="My Little Universe"
        title="Study"
        description="Your study space is currently turned off."
      >
        <GlassCard>
          <div className="settings-coming">
            📚 Study is currently disabled.
            <br />
            <br />
            Go to Settings → My Universe →
            Study to turn it back on.
          </div>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="MY LITTLE UNIVERSE"
      title="Study Space"
      description="A calm little space to learn, focus and keep moving forward."
    >
      <div className="study-grid">

        {/* =========================
            OVERVIEW
        ========================== */}

       <GlassCard className="main-study-progress">
  <div className="main-study-progress-content">
    <div>
      <GlassBadge>STUDY</GlassBadge>

      <h2>Today&apos;s Progress</h2>

      <p>
        Keep your focus gentle and consistent.
        Small progress still counts.
      </p>
    </div>

    <div className="main-study-progress-circle">
      <strong>{progress}%</strong>
      <span>DONE</span>
    </div>
  </div>

  <div className="main-study-progress-track">
    <div
      className="main-study-progress-fill"
      style={{
        width: `${progress}%`,
      }}
    />
  </div>

  <div className="main-study-progress-info">
    <span>{completedTasks} completed</span>
    <span>{tasks.length} total tasks</span>
  </div>
</GlassCard>
        {/* =========================
            SUBJECTS
        ========================== */}

        {isSectionEnabled(
          "subjects"
        ) && (
          <GlassCard>
            <GlassBadge>
              SUBJECTS
            </GlassBadge>

            <div className="study-heading">
              <h2>
                My Subjects
              </h2>

              <p>
                Choose something you
                want to study today.
              </p>
            </div>

            <div className="subject-grid">



             {studyItems
  .filter((item) => item.enabled)
  .map((item) => {
    const subjectHref = `/study/${encodeURIComponent(
      item.id
    )}`;

    return (
      <a
        key={item.id}
        href={subjectHref}
        className="subject-card"
      >
        <span>{item.icon}</span>

        <strong>{item.name}</strong>

        {item.description && (
          <small>{item.description}</small>
        )}
      </a>
    );
  })}
            </div>
          </GlassCard>
        )}

        {/* =========================
            TO-DO
        ========================== */}

        {isSectionEnabled(
          "todo"
        ) && (
          <GlassCard>
            <GlassBadge>
              TO-DO
            </GlassBadge>

            <div className="study-heading">
              <h2>
                Today's Tasks
              </h2>

              <p>
                Add your own tasks
                and complete them
                one by one.
              </p>
            </div>

            {/* ADD TASK */}

            <div className="study-add-row">
              <input
                className="glass-input"
                value={taskInput}
                onChange={(event) =>
                  setTaskInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    addTask();
                  }
                }}
                placeholder="Add a new task..."
              />

              <button
                type="button"
                className="settings-action"
                onClick={addTask}
              >
                + Add
              </button>
            </div>

            {/* TASK LIST */}

            <div className="study-tasks">
              {tasks.length === 0 ? (
                <div className="settings-coming">
                  📝 No tasks yet.
                  <br />
                  Add your first study
                  task above.
                </div>
              ) : (
                tasks.map((task) => {
                  const isEditing =
                    editingTaskId ===
                    task.id;

                  if (isEditing) {
                    return (
                      <div
                        key={task.id}
                        className="study-task study-task-editing"
                      >
                        <input
                          className="glass-input"
                          value={
                            editingTaskInput
                          }
                          onChange={(
                            event
                          ) =>
                            setEditingTaskInput(
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
                              saveEditedTask();
                            }

                            if (
                              event.key ===
                              "Escape"
                            ) {
                              setEditingTaskId(
                                null
                              );

                              setEditingTaskInput(
                                ""
                              );
                            }
                          }}
                          autoFocus
                        />

                        <button
                          type="button"
                          className="mini-action"
                          onClick={
                            saveEditedTask
                          }
                        >
                          ✓
                        </button>

                        <button
                          type="button"
                          className="mini-action"
                          onClick={() => {
                            setEditingTaskId(
                              null
                            );

                            setEditingTaskInput(
                              ""
                            );
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={task.id}
                      className={`study-task ${
                        task.completed
                          ? "study-task-done"
                          : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="study-check"
                        onClick={() =>
                          toggleTask(
                            task.id
                          )
                        }
                        aria-label={
                          task.completed
                            ? "Mark task incomplete"
                            : "Mark task complete"
                        }
                      >
                        {task.completed
                          ? "✓"
                          : ""}
                      </button>

                      <span
                        className="study-task-title"
                        onClick={() =>
                          toggleTask(
                            task.id
                          )
                        }
                      >
                        {task.title}
                      </span>

                      <button
                        type="button"
                        className="mini-action"
                        onClick={() =>
                          startEditTask(
                            task
                          )
                        }
                        aria-label="Edit task"
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        className="mini-action delete-action"
                        onClick={() =>
                          deleteTask(
                            task.id
                          )
                        }
                        aria-label="Delete task"
                      >
                        🗑
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        )}

        {/* =========================
            GOALS
        ========================== */}

        {isSectionEnabled(
          "goals"
        ) && (
          <GlassCard>
            <GlassBadge>
              GOALS
            </GlassBadge>

            <div className="study-heading">
              <h2>
                Study Goal
              </h2>

              <p>
                Keep your goal simple
                and achievable.
              </p>
            </div>

            <div className="study-goal">
              <div className="study-goal-top">
                <strong>
                  Complete today's
                  study session
                </strong>

                <span>
                  {progressPercentage}%
                </span>
              </div>

              <div className="study-progress-bar">
                <span
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>
            </div>
          </GlassCard>
        )}

        {/* =========================
            QUICK NOTES
        ========================== */}

        {isSectionEnabled(
          "notes"
        ) && (
          <GlassCard>
            <GlassBadge>
              NOTES
            </GlassBadge>

            <div className="study-heading">
              <h2>
                Quick Notes
              </h2>

              <p>
                Save your thoughts,
                ideas and study notes.
              </p>
            </div>

            {/* NEW NOTE */}

            <textarea
              className="glass-input study-notes"
              placeholder="Write a new note..."
              value={noteInput}
              onChange={(event) =>
                setNoteInput(
                  event.target.value
                )
              }
            />

            <div className="study-note-actions">
              <button
                type="button"
                className="settings-action"
                onClick={saveNewNote}
                disabled={
                  !noteInput.trim()
                }
              >
                💾 Save Note
              </button>
            </div>

            {/* SAVED NOTES */}

            {notes.length > 0 && (
              <div className="study-saved-notes">
                <div className="study-saved-notes-title">
                  <span>
                    SAVED NOTES
                  </span>

                  <small>
                    {notes.length}
                  </small>
                </div>

                {notes.map((note) => {
                  const editing =
                    editingNoteId ===
                    note.id;

                  if (editing) {
                    return (
                      <div
                        key={note.id}
                        className="study-saved-note"
                      >
                        <textarea
                          className="glass-input study-notes"
                          value={
                            editingNoteInput
                          }
                          onChange={(
                            event
                          ) =>
                            setEditingNoteInput(
                              event.target
                                .value
                            )
                          }
                          autoFocus
                        />

                        <div className="study-note-actions">
                          <button
                            type="button"
                            className="mini-action"
                            onClick={() => {
                              setEditingNoteId(
                                null
                              );

                              setEditingNoteInput(
                                ""
                              );
                            }}
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            className="settings-action"
                            onClick={
                              saveEditedNote
                            }
                          >
                            ✓ Save Changes
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={note.id}
                      className="study-saved-note"
                    >
                      <div className="study-note-content">
                        {note.content}
                      </div>

                      <div className="study-note-footer">
                        <small>
                          Saved{" "}
                          {new Date(
                            note.createdAt
                          ).toLocaleString()}
                        </small>

                        <div className="study-note-actions">
                          <button
                            type="button"
                            className="mini-action"
                            onClick={() =>
                              startEditNote(
                                note
                              )
                            }
                          >
                            ✎ Edit
                          </button>

                          <button
                            type="button"
                            className="mini-action delete-action"
                            onClick={() =>
                              deleteNote(
                                note.id
                              )
                            }
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        )}

        {/* =========================
            STREAK
            ALWAYS VISIBLE
        ========================== */}

        <GlassCard>
          <GlassBadge>
            STREAK
          </GlassBadge>

          <div className="study-streak">
            <div className="streak-icon">
              🔥
            </div>

            <div>
              <h2>
                Study Streak
              </h2>

              <p>
                {currentStreak === 0
                  ? "Complete a task today to start your streak."
                  : currentStreak === 1
                  ? "Great start! Come back tomorrow to continue."
                  : "Keep showing up and protect your streak."}
              </p>
            </div>

            <strong>
              {currentStreak}{" "}
              {currentStreak === 1
                ? "DAY"
                : "DAYS"}
            </strong>
          </div>
        </GlassCard>

      </div>
    </PageShell>
  );
}