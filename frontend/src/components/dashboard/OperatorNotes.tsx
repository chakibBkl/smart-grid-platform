"use client";
import { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { getStoredScope } from "@/lib/dashboard/scope";
import { getAuthSession } from "@/lib/auth/session";
import { isReadOnly } from "@/lib/auth/permissions";

interface OperatorNote {
  id: string;
  timestamp: string;
  text: string;
}

export function OperatorNotes() {
  const [text, setText] = useState("");
  const [notes, setNotes] = useState<OperatorNote[]>([]);
  const [storageKey, setStorageKey] = useState("operatorNotes:national");
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    const { scope, regionId } = getStoredScope();
    const key = scope === "regional" && regionId ? `operatorNotes:region:${regionId}` : "operatorNotes:national";
    setStorageKey(key);
    setReadOnly(isReadOnly(getAuthSession()));
    const saved = localStorage.getItem(key);
    if (saved) setNotes(JSON.parse(saved) as OperatorNote[]);
  }, []);

  function saveNote() {
    if (!text.trim() || readOnly) return;
    const note = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "2-digit" }),
      text: text.trim(),
    };
    const next = [note, ...notes].slice(0, 6);
    setNotes(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setText("");
  }

  function deleteNote(noteId: string) {
    if (readOnly) return;
    const next = notes.filter((note) => note.id !== noteId);
    setNotes(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <h2 className="text-sm font-semibold">Operator Notes</h2>
      <div className="mt-3 flex gap-2">
        <input disabled={readOnly} value={text} onChange={(event) => setText(event.target.value)} placeholder={readOnly ? "Read-only user cannot edit notes" : "Add operational note..."} className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-grid-500 disabled:opacity-60" />
        <button disabled={readOnly} onClick={saveNote} className="rounded-lg bg-grid-500 px-3 py-2 text-white disabled:opacity-40" title="Save note"><Save size={16} /></button>
      </div>
      <div className="mt-4 space-y-2">
        {(notes.length > 0 ? notes : [{ id: "demo", timestamp: "Today 16:00", text: "Industrial demand in Arzew increased after 16:00. Monitor tomorrow pattern." }]).map((note) => (
          <div key={note.id} className="rounded-lg bg-[var(--bg-secondary)] p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] text-[var(--text-secondary)]">{note.timestamp}</p>
              {note.id !== "demo" && (
                <button
                  disabled={readOnly}
                  onClick={() => deleteNote(note.id)}
                  className="rounded-md border border-red-500/20 p-1 text-red-500 hover:bg-red-500/10 disabled:opacity-40"
                  title="Delete note"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <p className="mt-1 whitespace-pre-wrap text-xs">{note.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
