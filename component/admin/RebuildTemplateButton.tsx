"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function RebuildTemplateButton({ id }: { id: string }) {
  const router = useRouter(); const [busy,setBusy]=useState(false);
  async function rebuild(){ setBusy(true); try{ const r=await fetch(`/api/admin/templates/${id}/rebuild`,{method:"POST"}); const d=await r.json(); if(!r.ok) throw new Error(d.error||"Could not rebuild."); window.alert(`Template scanned again: ${d.pages} pages, ${d.fields} editable fields.`); router.refresh(); }catch(e){window.alert(e instanceof Error?e.message:"Could not rebuild.");}finally{setBusy(false);} }
  return <button type="button" className="admin-added-btn" onClick={rebuild} disabled={busy}>{busy?"Scanning…":"↻ Re-scan Website"}</button>;
}
