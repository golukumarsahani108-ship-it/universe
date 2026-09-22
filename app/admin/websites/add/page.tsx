"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import "./page.css";

export default function AddWebsiteTemplatePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("birthday");
  const [description, setDescription] = useState("");
  const [editorNote, setEditorNote] = useState("Website content is editable page-by-page. Change only what you want; the original design stays the same.");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!file) {
      setError("Please choose a ZIP file.");
      return;
    }

    setBusy(true);

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("editor_note", editorNote);
      formData.append("file", file);

      const response = await fetch("/api/admin/templates", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      router.push("/admin/websites/templates");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-template-add-page">
      <section className="admin-template-add-card">

        <button
          type="button"
          className="admin-template-back"
          onClick={() => router.push("/admin/websites")}
        >
          ← Back to Websites
        </button>

        <span className="admin-template-kicker">
          TEMPLATE STUDIO
        </span>

        <h1>
          Add a <span>Website Template</span>
        </h1>

        <p>
          Upload one complete HTML/CSS/JS website and make it
          available to the builder.
        </p>

        <div className="admin-template-editable-note">
          <strong>Creator editing: ON</strong>

          <span>
            Every website added here is automatically scanned page-by-page.
            Text, secret codes, photos, music and other editable content
            are detected from the uploaded HTML, CSS and JavaScript.
          </span>
        </div>

        <form onSubmit={submit}>

          <label>
            Website / Template Name

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Birthday — The Box"
              required
            />
          </label>

          <label>
            Category

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              <option value="birthday">
                Birthday
              </option>

              <option value="anniversary">
                Anniversary
              </option>

              <option value="friendship">
                Friendship
              </option>

              <option value="general">
                General
              </option>
            </select>
          </label>

          <label>
            Description

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="A short description shown in Choose Design."
              rows={4}
            />
          </label>

          <label>
            Creator Editor Note
            <textarea
              value={editorNote}
              onChange={(event) => setEditorNote(event.target.value)}
              placeholder="Explain what the creator can customize..."
              rows={4}
            />
          </label>

          <label className="admin-template-file">
            Website ZIP

            <input
              type="file"
              accept=".zip,application/zip"
              onChange={(event) =>
                setFile(
                  event.target.files?.[0] ?? null
                )
              }
              required
            />

            <small>
              Required: index.html, style.css, script.js.
              Optional: schema.json and assets/.
            </small>
          </label>

          {error && (
            <div className="admin-template-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-template-submit"
            disabled={busy}
          >
            {busy
              ? "Uploading template…"
              : "Upload & Publish Template →"}
          </button>

        </form>
      </section>
    </main>
  );
}