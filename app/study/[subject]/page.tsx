"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassButton from "@/component/glass/GlassButton";
import GlassInput from "@/component/glass/GlassInput";
import GlassBadge from "@/component/glass/GlassBadge";
import { useFeatures } from "@/component/settings/feature-store";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

type Note = {
  id: string;
  text: string;
  createdAt: string;
};

type Photo = {
  id: string;
  title: string;
  image: string;
};

export default function SubjectWorkspace({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { getFeature } = useFeatures();

  const [subjectId, setSubjectId] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState("");

  const [notes, setNotes] = useState<Note[]>([]);
  const [noteInput, setNoteInput] = useState("");

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoTitle, setPhotoTitle] = useState("");

  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    params.then((value) => {
      setSubjectId(decodeURIComponent(value.subject));
    });
  }, [params]);

  const studyFeature = getFeature("study");

  const subject = useMemo(() => {
    return studyFeature?.items?.find(
      (item) => item.id === subjectId
    );
  }, [studyFeature, subjectId]);

  const subjectName = subject?.name ?? "Study";
  const subjectIcon = subject?.icon ?? "📚";
  const subjectDescription =
    subject?.description ??
    `Your personal ${subjectName} workspace.`;

  const storagePrefix = `my-little-universe-subject-${subjectId}`;

  useEffect(() => {
    if (!subjectId) return;

    const savedTasks = localStorage.getItem(
      `${storagePrefix}-tasks`
    );

    const savedNotes = localStorage.getItem(
      `${storagePrefix}-notes`
    );

    const savedPhotos = localStorage.getItem(
      `${storagePrefix}-photos`
    );

    const savedTopic = localStorage.getItem(
      `${storagePrefix}-topic`
    );

    const savedGoal = localStorage.getItem(
      `${storagePrefix}-goal`
    );

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch {}
    }

    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch {}
    }

    if (savedPhotos) {
      try {
        setPhotos(JSON.parse(savedPhotos));
      } catch {}
    }

    if (savedTopic) {
      setTopic(savedTopic);
    }

    if (savedGoal) {
      setGoal(savedGoal);
    }
  }, [subjectId, storagePrefix]);

  useEffect(() => {
    if (!subjectId) return;

    localStorage.setItem(
      `${storagePrefix}-tasks`,
      JSON.stringify(tasks)
    );
  }, [tasks, subjectId, storagePrefix]);

  useEffect(() => {
    if (!subjectId) return;

    localStorage.setItem(
      `${storagePrefix}-notes`,
      JSON.stringify(notes)
    );
  }, [notes, subjectId, storagePrefix]);

  useEffect(() => {
    if (!subjectId) return;

    localStorage.setItem(
      `${storagePrefix}-photos`,
      JSON.stringify(photos)
    );
  }, [photos, subjectId, storagePrefix]);

  useEffect(() => {
    if (!subjectId) return;

    localStorage.setItem(
      `${storagePrefix}-topic`,
      topic
    );
  }, [topic, subjectId, storagePrefix]);

  useEffect(() => {
    if (!subjectId) return;

    localStorage.setItem(
      `${storagePrefix}-goal`,
      goal
    );
  }, [goal, subjectId, storagePrefix]);

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks / tasks.length) * 100
        );

  const addTask = () => {
    const title = taskInput.trim();

    if (!title) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };

    setTasks((current) => [
      ...current,
      newTask,
    ]);

    setTaskInput("");
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

  const deleteTask = (id: string) => {
    setTasks((current) =>
      current.filter((task) => task.id !== id)
    );
  };

  const addNote = () => {
    const text = noteInput.trim();

    if (!text) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toLocaleDateString(),
    };

    setNotes((current) => [
      newNote,
      ...current,
    ]);

    setNoteInput("");
  };

  const deleteNote = (id: string) => {
    setNotes((current) =>
      current.filter((note) => note.id !== id)
    );
  };

  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return;
    }

    if (!photoTitle.trim()) {
      alert("Please enter a photo title first.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const newPhoto: Photo = {
        id: crypto.randomUUID(),
        title: photoTitle.trim(),
        image: reader.result as string,
      };

      setPhotos((current) => [
        newPhoto,
        ...current,
      ]);

      setPhotoTitle("");
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const deletePhoto = (id: string) => {
    setPhotos((current) =>
      current.filter((photo) => photo.id !== id)
    );
  };

  if (!subjectId) {
    return (
      <PageShell
        eyebrow="Study"
        title="Loading..."
        backHref="/study"
        backLabel="Back to Study"
      >
        <GlassCard>
          <p>Loading your workspace...</p>
        </GlassCard>
      </PageShell>
    );
  }

  if (!subject) {
    return (
      <PageShell
        eyebrow="Study"
        title="Subject Not Found"
        description="This subject may have been removed from Settings."
        backHref="/study"
        backLabel="Back to Study"
      >
        <GlassCard>
          <p>
            This study subject does not exist anymore.
          </p>
        </GlassCard>
      </PageShell>
    );
  }

  if (!subject.enabled) {
    return (
      <PageShell
        eyebrow="Study"
        title={subjectName}
        description="This subject is currently disabled."
        backHref="/study"
        backLabel="Back to Study"
      >
        <GlassCard>
          <p>
            Enable this subject from Settings to use
            its workspace.
          </p>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={`Study • ${subjectName}`}
      title={`${subjectIcon} ${subjectName}`}
      description={subjectDescription}
      backHref="/study"
      backLabel="Back to Study"
    >
      <div className="study-workspace">

        {/* TODAY'S FOCUS */}

        <GlassCard className="subject-progress-card">
  <div className="subject-progress-top">

    <div className="subject-progress-content">
      <GlassBadge>Study</GlassBadge>

      <h2>Today&apos;s Progress</h2>

      <p>
        Keep your focus gentle and consistent.
        Small progress still counts.
      </p>
    </div>

    <div className="subject-progress-circle">
      <strong>{progress}%</strong>
      <span>Done</span>
    </div>

  </div>

  <div className="subject-progress-track">
    <div
      className="subject-progress-fill"
      style={{
        width: `${progress}%`,
      }}
    />
  </div>

  <div className="subject-progress-info">
    <span>
      {completedTasks} completed
    </span>

    <span>
      {tasks.length} total tasks
    </span>
  </div>
</GlassCard>

        {/* TODAY'S TOPIC */}

        <GlassCard>
          <div className="study-section-head">
            <div>
              <GlassBadge>
                Today&apos;s Topic
              </GlassBadge>

              <h2>What are you studying today?</h2>
            </div>
          </div>

          <div className="study-add-row">
            <GlassInput
              placeholder={`Enter today's ${subjectName} topic...`}
              value={topic}
              onChange={setTopic}
            />

            <GlassButton
              onClick={() =>
                localStorage.setItem(
                  `${storagePrefix}-topic`,
                  topic
                )
              }
            >
              Save Topic
            </GlassButton>
          </div>
        </GlassCard>


        {/* TASKS */}

        <GlassCard>
          <div className="study-section-head">
            <div>
              <GlassBadge>
                {subjectName} Tasks
              </GlassBadge>

              <h2>Practice & Tasks</h2>
            </div>

            <span className="study-stat">
              {completedTasks}/{tasks.length}
            </span>
          </div>

          <div className="study-add-row">
            <GlassInput
              placeholder="Add a study task..."
              value={taskInput}
              onChange={setTaskInput}
            />

            <GlassButton onClick={addTask}>
              + Add
            </GlassButton>
          </div>

          <div className="study-task-list">
            {tasks.length === 0 ? (
              <p className="study-empty">
                No tasks yet. Add your first task.
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`study-task ${
                    task.completed
                      ? "completed"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="study-check"
                    onClick={() =>
                      toggleTask(task.id)
                    }
                  >
                    {task.completed ? "✓" : ""}
                  </button>

                  <span>{task.title}</span>

                  <button
                    type="button"
                    className="study-delete"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </GlassCard>


        {/* GOAL */}

        <GlassCard>
          <div className="study-section-head">
            <div>
              <GlassBadge>
                Today&apos;s Goal
              </GlassBadge>

              <h2>
                One small goal for today
              </h2>
            </div>
          </div>

          <div className="study-add-row">
            <GlassInput
              placeholder={`My ${subjectName} goal...`}
              value={goal}
              onChange={setGoal}
            />

            <GlassButton
              onClick={() =>
                localStorage.setItem(
                  `${storagePrefix}-goal`,
                  goal
                )
              }
            >
              Save Goal
            </GlassButton>
          </div>

          {goal && (
            <div className="study-goal-display">
              🎯 {goal}
            </div>
          )}
        </GlassCard>


        {/* NOTES */}

        <GlassCard>
          <div className="study-section-head">
            <div>
              <GlassBadge>
                {subjectName} Notes
              </GlassBadge>

              <h2>Quick Notes</h2>
            </div>
          </div>

          <div className="study-add-row">
            <GlassInput
              placeholder="Write a quick note..."
              value={noteInput}
              onChange={setNoteInput}
            />

            <GlassButton onClick={addNote}>
              Save Note
            </GlassButton>
          </div>

          <div className="study-notes-grid">
            {notes.length === 0 ? (
              <p className="study-empty">
                Your saved notes will appear here.
              </p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="study-note-card"
                >
                  <p>{note.text}</p>

                  <div className="study-note-footer">
                    <small>
                      {note.createdAt}
                    </small>

                    <button
                      type="button"
                      onClick={() =>
                        deleteNote(note.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>


        {/* STUDY PHOTOS */}

        <GlassCard>
          <div className="study-section-head">
            <div>
              <GlassBadge>
                Study Photos
              </GlassBadge>

              <h2>Save Formula / Notes Photos</h2>

              <p>
                Upload photos related to{" "}
                {subjectName}.
              </p>
            </div>
          </div>

          <div className="study-add-row">
            <GlassInput
              placeholder="Photo title..."
              value={photoTitle}
              onChange={setPhotoTitle}
            />

            <label className="glass-button">
              📷 Upload Photo

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                hidden
              />
            </label>
          </div>

          <div className="study-photo-grid">
            {photos.length === 0 ? (
              <p className="study-empty">
                No study photos saved yet.
              </p>
            ) : (
              photos.map((photo) => (
                <div
                  key={photo.id}
                  className="study-photo-card"
                >
                  <img
                    src={photo.image}
                    alt={photo.title}
                  />

                  <div>
                    <strong>{photo.title}</strong>

                    <button
                      type="button"
                      onClick={() =>
                        deletePhoto(photo.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>


        {/* STREAK */}

        <GlassCard>
          <div className="study-streak-card">
            <div className="study-streak-icon">
              🔥
            </div>

            <div>
              <GlassBadge>
                Study Streak
              </GlassBadge>

              <h2>Keep going!</h2>

              <p>
                Every study session helps build
                your learning habit.
              </p>
            </div>
          </div>
        </GlassCard>

      </div>
    </PageShell>
  );
}