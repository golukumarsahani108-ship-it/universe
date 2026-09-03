"use client";

import { useState } from "react";
import type { CustomItem } from "./feature-config";

type FeatureCustomizerProps = {
  featureName: string;
  featureIcon: string;
  items: CustomItem[];
  onItemsChange: (items: CustomItem[]) => void;
};

const availableIcons = [
  "📚",
  "📐",
  "🔬",
  "💻",
  "📖",
  "🎯",
  "⭐",
  "💡",
  "🎨",
  "🎮",
  "❤️",
  "🔥",
  "🌟",
  "📝",
  "🚀",
];

export default function FeatureCustomizer({
  featureName,
  featureIcon,
  items,
  onItemsChange,
}: FeatureCustomizerProps) {
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
    setName("");
    setIcon("⭐");
    setDescription("");
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (item: CustomItem) => {
    setName(item.name);
    setIcon(item.icon);
    setDescription(item.description ?? "");
    setEditingId(item.id);
    setShowForm(true);
  };

  const saveItem = () => {
    const cleanName = name.trim();

    if (!cleanName) return;

    if (editingId) {
      onItemsChange(
        items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: cleanName,
                icon,
                description: description.trim(),
              }
            : item
        )
      );
    } else {
      const newItem: CustomItem = {
        id: `${featureName
          .toLowerCase()
          .replace(/\s+/g, "-")}-${Date.now()}`,
        name: cleanName,
        icon,
        description: description.trim(),
        enabled: true,
      };

      onItemsChange([...items, newItem]);
    }

    resetForm();
  };

  const toggleItem = (id: string) => {
    onItemsChange(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              enabled: !item.enabled,
            }
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    const item = items.find(
      (current) => current.id === id
    );

    if (!item) return;

    const confirmed = window.confirm(
      `Remove "${item.name}" from ${featureName}?`
    );

    if (!confirmed) return;

    onItemsChange(
      items.filter((item) => item.id !== id)
    );
  };

  const moveItem = (
    index: number,
    direction: "up" | "down"
  ) => {
    const newIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      newIndex < 0 ||
      newIndex >= items.length
    ) {
      return;
    }

    const updatedItems = [...items];

    [
      updatedItems[index],
      updatedItems[newIndex],
    ] = [
      updatedItems[newIndex],
      updatedItems[index],
    ];

    onItemsChange(updatedItems);
  };

  return (
    <div className="feature-customizer">
      <div className="customizer-header">
        <div className="customizer-title">
          <div className="customizer-feature-icon">
            {featureIcon}
          </div>

          <div>
            <h2>{featureName}</h2>

            <p>
              Customize what appears inside your{" "}
              {featureName} space.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="settings-action settings-action-primary"
          onClick={openAddForm}
        >
          ＋ Add
        </button>
      </div>

      <div className="customizer-items">
        {items.length === 0 ? (
          <div className="customizer-empty">
            <span>✨</span>

            <strong>No items yet</strong>

            <p>
              Add something new to your{" "}
              {featureName} space.
            </p>

            <button
              type="button"
              className="settings-action"
              onClick={openAddForm}
            >
              ＋ Add First Item
            </button>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className={`customizer-item ${
                item.enabled
                  ? ""
                  : "customizer-item-disabled"
              }`}
            >
              <div className="customizer-item-icon">
                {item.icon}
              </div>

              <div className="feature-info">
                <h3>{item.name}</h3>

                {item.description && (
                  <p>{item.description}</p>
                )}
              </div>

              <div className="customizer-item-actions">
                <button
                  type="button"
                  className="mini-action"
                  title="Move up"
                  disabled={index === 0}
                  onClick={() =>
                    moveItem(index, "up")
                  }
                >
                  ↑
                </button>

                <button
                  type="button"
                  className="mini-action"
                  title="Move down"
                  disabled={
                    index === items.length - 1
                  }
                  onClick={() =>
                    moveItem(index, "down")
                  }
                >
                  ↓
                </button>

                <button
                  type="button"
                  className="mini-action"
                  title="Edit"
                  onClick={() =>
                    openEditForm(item)
                  }
                >
                  ✎
                </button>

                <button
                  type="button"
                  className="mini-action delete-action"
                  title="Delete"
                  onClick={() =>
                    deleteItem(item.id)
                  }
                >
                  🗑
                </button>

                <button
                  type="button"
                  className={`toggle ${
                    item.enabled
                      ? "toggle-on"
                      : ""
                  }`}
                  onClick={() =>
                    toggleItem(item.id)
                  }
                  aria-label={`Turn ${
                    item.name
                  } ${
                    item.enabled
                      ? "off"
                      : "on"
                  }`}
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
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  {featureName}
                </div>

                <h2>
                  {editingId
                    ? "Edit Item"
                    : "Add New Item"}
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
                placeholder="e.g. Mathematics"
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
                onClick={saveItem}
              >
                {editingId
                  ? "Save Changes"
                  : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}