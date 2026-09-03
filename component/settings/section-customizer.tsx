"use client";

import { useState } from "react";
import type { FeatureSection } from "./feature-config";

type SectionCustomizerProps = {
  featureName: string;
  featureIcon: string;
  sections: FeatureSection[];
  onSectionsChange: (sections: FeatureSection[]) => void;
};

const availableIcons = [
  "📚",
  "✅",
  "🎯",
  "📝",
  "🔥",
  "⏱️",
  "📅",
  "📋",
  "⭐",
  "💡",
  "🚀",
  "🏆",
];

export default function SectionCustomizer({
  featureName,
  featureIcon,
  sections,
  onSectionsChange,
}: SectionCustomizerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setName("");
    setIcon("⭐");
    setDescription("");
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (section: FeatureSection) => {
    setName(section.name);
    setIcon(section.icon);
    setDescription(section.description ?? "");
    setEditingId(section.id);
    setShowForm(true);
  };

  const saveSection = () => {
    const cleanName = name.trim();

    if (!cleanName) return;

    if (editingId) {
      onSectionsChange(
        sections.map((section) =>
          section.id === editingId
            ? {
                ...section,
                name: cleanName,
                icon,
                description: description.trim(),
              }
            : section
        )
      );
    } else {
      const newSection: FeatureSection = {
        id: `${featureName
          .toLowerCase()
          .replace(/\s+/g, "-")}-section-${Date.now()}`,
        name: cleanName,
        icon,
        description: description.trim(),
        enabled: true,
      };

      onSectionsChange([...sections, newSection]);
    }

    resetForm();
  };

  const toggleSection = (id: string) => {
    onSectionsChange(
      sections.map((section) =>
        section.id === id
          ? {
              ...section,
              enabled: !section.enabled,
            }
          : section
      )
    );
  };

  const deleteSection = (id: string) => {
    const section = sections.find(
      (item) => item.id === id
    );

    if (!section) return;

    const confirmed = window.confirm(
      `Remove "${section.name}" from ${featureName}?`
    );

    if (!confirmed) return;

    onSectionsChange(
      sections.filter((item) => item.id !== id)
    );
  };

  const moveSection = (
    index: number,
    direction: "up" | "down"
  ) => {
    const newIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      newIndex < 0 ||
      newIndex >= sections.length
    ) {
      return;
    }

    const updatedSections = [...sections];

    [
      updatedSections[index],
      updatedSections[newIndex],
    ] = [
      updatedSections[newIndex],
      updatedSections[index],
    ];

    onSectionsChange(updatedSections);
  };

  return (
    <div className="section-customizer">
      <div className="customizer-header">
        <div className="customizer-title">
          <div className="customizer-feature-icon">
            {featureIcon}
          </div>

          <div>
            <h2>{featureName} Sections</h2>

            <p>
              Choose which sections appear inside
              your {featureName} space.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="settings-action settings-action-primary"
          onClick={openAddForm}
        >
          ＋ Add Section
        </button>
      </div>

      <div className="customizer-items">
        {sections.length === 0 ? (
          <div className="customizer-empty">
            <span>✨</span>

            <strong>No sections yet</strong>

            <p>
              Add a new section to your{" "}
              {featureName} space.
            </p>

            <button
              type="button"
              className="settings-action"
              onClick={openAddForm}
            >
              ＋ Add First Section
            </button>
          </div>
        ) : (
          sections.map((section, index) => (
            <div
              key={section.id}
              className={`customizer-item ${
                section.enabled
                  ? ""
                  : "customizer-item-disabled"
              }`}
            >
              <div className="customizer-item-icon">
                {section.icon}
              </div>

              <div className="feature-info">
                <h3>{section.name}</h3>

                {section.description && (
                  <p>{section.description}</p>
                )}
              </div>

              <div className="customizer-item-actions">
                <button
                  type="button"
                  className="mini-action"
                  title="Move up"
                  disabled={index === 0}
                  onClick={() =>
                    moveSection(index, "up")
                  }
                >
                  ↑
                </button>

                <button
                  type="button"
                  className="mini-action"
                  title="Move down"
                  disabled={
                    index === sections.length - 1
                  }
                  onClick={() =>
                    moveSection(index, "down")
                  }
                >
                  ↓
                </button>

                <button
                  type="button"
                  className="mini-action"
                  title="Edit"
                  onClick={() =>
                    openEditForm(section)
                  }
                >
                  ✎
                </button>

                <button
                  type="button"
                  className="mini-action delete-action"
                  title="Delete"
                  onClick={() =>
                    deleteSection(section.id)
                  }
                >
                  🗑
                </button>

                <button
                  type="button"
                  className={`toggle ${
                    section.enabled
                      ? "toggle-on"
                      : ""
                  }`}
                  aria-label={`Turn ${
                    section.name
                  } ${
                    section.enabled
                      ? "off"
                      : "on"
                  }`}
                  onClick={() =>
                    toggleSection(section.id)
                  }
                >
                  <span />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="custom-modal-backdrop">
          <div
            className="custom-modal glass"
            role="dialog"
            aria-modal="true"
            aria-label={
              editingId
                ? `Edit ${featureName} section`
                : `Add ${featureName} section`
            }
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  {featureName}
                </div>

                <h2>
                  {editingId
                    ? "Edit Section"
                    : "Add New Section"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={resetForm}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-field">
              <span>NAME</span>

              <input
                className="glass-input"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Revision"
                autoFocus
              />
            </div>

            <div className="modal-field">
              <span>ICON</span>

              <div className="icon-picker">
                {availableIcons.map(
                  (availableIcon) => (
                    <button
                      key={availableIcon}
                      type="button"
                      className={`icon-choice ${
                        icon === availableIcon
                          ? "icon-choice-active"
                          : ""
                      }`}
                      onClick={() =>
                        setIcon(availableIcon)
                      }
                    >
                      {availableIcon}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="modal-field">
              <span>DESCRIPTION</span>

              <textarea
                className="glass-input glass-textarea"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="A short description..."
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="settings-action"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="button"
                className="settings-action settings-action-primary"
                onClick={saveSection}
              >
                {editingId
                  ? "Save Changes"
                  : "Add Section"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}