// ═══════════════════════════════════════════════════════════════
//  Seekers — the souls you read for. Each carries their own bond,
//  their own relics, kept apart from your own.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useStore } from "../store";
import type { Seeker } from "../types";

const STAGES: [number, string][] = [
  [400, "Companion"], [150, "Confidant"], [50, "Friend"], [10, "Acquaintance"], [0, "Stranger"],
];
export function bondStage(points: number): string {
  return STAGES.find(([p]) => points >= p)?.[1] ?? "Stranger";
}

const EMPTY: Seeker = {
  id: "", name: "", birthDate: "", birthTime: "12:00", birthPlace: "",
  notes: "", bondStage: "Stranger", bondPoints: 0, createdAt: 0,
};

export default function SeekersPanel() {
  const { seekers, saveSeeker, removeSeeker, setMode, setActiveSeeker, setModule } = useStore();
  const [draft, setDraft] = useState<Seeker | null>(null);

  function edit(s?: Seeker) {
    setDraft(s ? { ...s } : { ...EMPTY, id: crypto.randomUUID?.() ?? `seeker-${Date.now()}`, createdAt: Date.now() });
  }
  async function save() {
    if (!draft || !draft.name.trim()) return;
    await saveSeeker({ ...draft, bondStage: bondStage(draft.bondPoints) });
    setDraft(null);
  }
  function readFor(s: Seeker) {
    setActiveSeeker(s.id);
    setMode("seeker");
    setModule("chamber");
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="row between">
          <div>
            <div className="panel-title"><span className="glyph">☉</span> Seekers</div>
            <div className="panel-sub">"Carry one another's burdens." — Galatians 6:2</div>
          </div>
          <button className="btn btn-primary" onClick={() => edit()}>＋ New Seeker</button>
        </div>
      </div>

      {seekers.length === 0 && !draft && <div className="empty">No seekers yet. Add one to keep their readings, their bond, and their chart.</div>}

      <div className="grid grid-auto">
        {seekers.map((s) => (
          <div key={s.id} className="card gild">
            <div className="row between">
              <h3 style={{ fontSize: "1.15rem" }}>{s.name}</h3>
              <span className="chip chip-gold">{bondStage(s.bondPoints)}</span>
            </div>
            <div className="mono muted" style={{ fontSize: "0.74rem", marginTop: 6 }}>
              {s.birthDate || "no birth date"}{s.birthPlace ? ` · ${s.birthPlace}` : ""}
            </div>
            {s.notes && <div className="serif" style={{ marginTop: 8, color: "var(--ink-soft)" }}>{s.notes}</div>}
            <div className="row" style={{ marginTop: 14, gap: 8 }}>
              <button className="btn btn-sm btn-primary" onClick={() => readFor(s)}>◈ Read for them</button>
              <button className="btn btn-sm" onClick={() => edit(s)}>Edit</button>
              <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }} onClick={() => { if (confirm(`Remove ${s.name}?`)) removeSeeker(s.id); }}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      {draft && (
        <div onClick={() => setDraft(null)} style={{ position: "fixed", inset: 0, background: "rgba(44,5,9,0.55)", backdropFilter: "blur(6px)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", padding: 30 }}>
          <div className="card gild" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520 }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: 14 }}>{draft.createdAt && seekers.some((s) => s.id === draft.id) ? "Edit Seeker" : "New Seeker"}</h2>
            <div className="field">
              <label className="label">Name</label>
              <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus />
            </div>
            <div className="grid grid-2">
              <div className="field"><label className="label">Birth Date</label><input className="input" type="date" value={draft.birthDate} onChange={(e) => setDraft({ ...draft, birthDate: e.target.value })} /></div>
              <div className="field"><label className="label">Birth Time</label><input className="input" type="time" value={draft.birthTime} onChange={(e) => setDraft({ ...draft, birthTime: e.target.value })} /></div>
            </div>
            <div className="field"><label className="label">Birth Place</label><input className="input" value={draft.birthPlace} onChange={(e) => setDraft({ ...draft, birthPlace: e.target.value })} placeholder="city, country" /></div>
            <div className="field"><label className="label">Notes</label><textarea className="textarea" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="What should I remember about this soul?" /></div>
            <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setDraft(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={!draft.name.trim()}>Save Seeker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
