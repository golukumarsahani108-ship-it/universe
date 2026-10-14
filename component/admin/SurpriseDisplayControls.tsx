"use client";

import { useState } from "react";

type Props = { initialHideButtons: boolean };

export default function SurpriseDisplayControls({ initialHideButtons }: Props) {
  const [hideButtons, setHideButtons] = useState(initialHideButtons);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function update(value: boolean) {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hide_surprise_buttons: value }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not save this setting.");
      setHideButtons(value);
      setMessage(value ? "Buttons are hidden on published surprise websites." : "Buttons are visible on published surprise websites.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save this setting.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", padding: "18px 20px", border: "1px solid var(--border, rgba(130,130,160,.22))", borderRadius: 16 }}>
      <div style={{ minWidth: 220, flex: 1 }}>
        <strong style={{ display: "block", marginBottom: 6 }}>Hide all surprise action buttons</strong>
        <p style={{ margin: 0, opacity: .72, fontSize: 13, lineHeight: 1.6 }}>This affects published surprise pages only. App navigation and admin controls stay available.</p>
        {message ? <p role="status" style={{ margin: "8px 0 0", fontSize: 13 }}>{message}</p> : null}
      </div>
      <button
        type="button"
        disabled={saving}
        aria-pressed={hideButtons}
        onClick={() => update(!hideButtons)}
        style={{ border: 0, borderRadius: 999, padding: "11px 18px", minWidth: 142, cursor: saving ? "wait" : "pointer", color: "#fff", background: hideButtons ? "#d94676" : "#64748b", fontWeight: 700, opacity: saving ? .7 : 1 }}
      >
        {saving ? "Saving…" : hideButtons ? "Buttons: OFF" : "Buttons: ON"}
      </button>
    </div>
  );
}
