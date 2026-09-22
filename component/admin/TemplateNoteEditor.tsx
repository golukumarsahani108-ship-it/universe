"use client";
import { useState } from "react";
export default function TemplateNoteEditor({ id, initialNote }: { id: string; initialNote: string | null }) {
  const [note, setNote] = useState(initialNote || "");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(next: string) {
    setBusy(true); setMessage("");
    try { const r=await fetch(`/api/admin/templates/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({editor_note:next})}); const d=await r.json(); if(!r.ok)throw new Error(d.error||"Could not save note."); setNote(next); setEditing(false); setMessage("Saved"); } catch(e){setMessage(e instanceof Error?e.message:"Could not save note.");} finally{setBusy(false);}
  }
  return <div className="mt-7 rounded-2xl border border-red-400/25 bg-red-500/[.06] p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold text-red-200">Creator Editor Note</h2><p className="mt-1 text-xs text-red-100/50">This note appears at the top of the creator&apos;s editor.</p></div><div className="flex gap-2"><button type="button" onClick={()=>setEditing(true)} className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-2 text-xs text-white/70 hover:text-white">Edit Note</button><button type="button" disabled={busy} onClick={()=>save("")} className="rounded-xl border border-red-300/15 bg-red-400/10 px-3 py-2 text-xs text-red-200 hover:bg-red-400/20">Delete Note</button></div></div>{editing?<><textarea autoFocus value={note} onChange={e=>setNote(e.target.value)} className="mt-4 min-h-28 w-full rounded-2xl border border-white/15 bg-[#090914] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-red-300/60"/><div className="mt-3 flex gap-2"><button type="button" disabled={busy} onClick={()=>save(note)} className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black">{busy?"Saving…":"Save Note"}</button><button type="button" onClick={()=>{setNote(initialNote||"");setEditing(false)}} className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/60">Cancel</button></div></>:<p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-red-100/80">{note||"No note set."}</p>}{message&&<div className="mt-2 text-xs text-white/45">{message}</div>}</div>;
}
