"use client";

import { useEffect, useMemo, useState } from "react";

import PageShell from "@/component/layout/PageShell";
import GlassCard from "@/component/glass/GlassCard";
import GlassBadge from "@/component/glass/GlassBadge";
import GlassButton from "@/component/glass/GlassButton";

type Memory = {
  id: string;
  title: string;
  story: string;
  date: string;
  image?: string;
  createdAt: number;
};

const STORAGE_KEY = "my-little-universe-memories";

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setMemories(parsed);
        }
      }
    } catch {
      console.log("Memories could not be loaded.");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  }, [memories, loaded]);

  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) => b.createdAt - a.createdAt);
  }, [memories]);

  const addMemory = () => {
    const cleanTitle = title.trim();
    const cleanStory = story.trim();

    if (!cleanTitle) return;

    const newMemory: Memory = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      story: cleanStory,
      date: date || new Date().toISOString().split("T")[0],
      image,
      createdAt: Date.now(),
    };

    setMemories((current) => [newMemory, ...current]);

    setTitle("");
    setStory("");
    setDate("");
    setImage("");
  };

  const deleteMemory = (id: string) => {
    setMemories((current) =>
      current.filter((memory) => memory.id !== id)
    );
  };

  const handleImage = (file: File | undefined) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please choose an image smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <PageShell
      eyebrow="My Little Universe"
      title="Memories"
      description="Little moments I never want to forget."
    >
      <div className="memories-layout">
        {/* ADD MEMORY */}
        <GlassCard className="memory-create-card">
          <div className="memory-card-heading">
            <div>
              <GlassBadge>NEW MEMORY</GlassBadge>
              <h2 className="memory-section-title">
                Save a little moment ✨
              </h2>
            </div>

            <span className="memory-count">
              {memories.length} saved
            </span>
          </div>

          <div className="memory-form">
            <label className="memory-field">
              <span>Title</span>
              <input
                className="glass-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A beautiful day..."
              />
            </label>

            <label className="memory-field">
              <span>Date</span>
              <input
                className="glass-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <label className="memory-field memory-field-full">
              <span>Story</span>
              <textarea
                className="glass-input memory-textarea"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Write what made this moment special..."
                rows={4}
              />
            </label>

            <label className="memory-upload">
              <span>📸 Add a photo</span>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImage(e.target.files?.[0])
                }
              />
            </label>

            {image && (
              <div className="memory-preview">
                <img src={image} alt="Memory preview" />

                <button
                  type="button"
                  onClick={() => setImage("")}
                  aria-label="Remove selected photo"
                >
                  ×
                </button>
              </div>
            )}

            <GlassButton
              onClick={addMemory}
              active
              className="memory-save-button"
            >
              ✨ Save Memory
            </GlassButton>
          </div>
        </GlassCard>

        {/* MEMORIES */}
        <div className="memories-list">
          {sortedMemories.length === 0 ? (
            <GlassCard className="memory-empty">
              <div className="memory-empty-icon">📸</div>

              <GlassBadge>YOUR SPACE</GlassBadge>

              <h2>No memories yet</h2>

              <p>
                Save your first special moment above. Your little
                collection will appear here.
              </p>
            </GlassCard>
          ) : (
            sortedMemories.map((memory) => (
              <GlassCard
                key={memory.id}
                className="memory-item"
              >
                {memory.image && (
                  <div className="memory-image-wrap">
                    <img
                      src={memory.image}
                      alt={memory.title}
                      className="memory-image"
                    />
                  </div>
                )}

                <div className="memory-item-content">
                  <div className="memory-item-top">
                    <GlassBadge>MEMORY</GlassBadge>

                    <span className="memory-date">
                      {formatDate(memory.date)}
                    </span>
                  </div>

                  <h2>{memory.title}</h2>

                  {memory.story && (
                    <p>{memory.story}</p>
                  )}

                  <button
                    type="button"
                    className="memory-delete"
                    onClick={() => deleteMemory(memory.id)}
                  >
                    Delete memory
                  </button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}

function formatDate(date: string) {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}