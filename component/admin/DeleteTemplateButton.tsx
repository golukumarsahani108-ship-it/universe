"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteTemplateButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete "${name}"? This removes the Admin-added template from the builder.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not delete website template.");
      router.push("/admin/websites/templates");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not delete website template.");
      setBusy(false);
    }
  }

  return (
    <button type="button" className="admin-added-btn admin-template-delete" onClick={remove} disabled={busy}>
      {busy ? "Deleting…" : "Delete Website"}
    </button>
  );
}
