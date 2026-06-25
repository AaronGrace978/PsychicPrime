// ═══════════════════════════════════════════════════════════════
//  Signal Lab — record an impression BEFORE its outcome, then score
//  it honestly. No retroactive edits. This is what separates
//  discernment from fortune-telling.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store";
import { calibrationValue } from "../prime/governance";
import type { Signal } from "../types";

const KINDS = [
  ["intuition", "Intuition / nudge"],
  ["premonition", "Premonition"],
  ["dream", "Dream / sleep image"],
  ["synchronicity", "Synchronicity"],
  ["discernment", "Discernment in prayer"],
  ["prayer_impression", "Prayer impression"],
  ["remote_viewing", "Remote impression"],
];

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--ink-faint)", hit: "var(--hit)", partial: "var(--partial)", miss: "var(--miss)", ambiguous: "var(--gold-deep)",
};

export default function SignalLabPanel() {
  const { signals, refreshSignals, saveSignal, scoreSignal, removeSignal, addFeedback, setPresence } = useStore();
  const [kind, setKind] = useState("intuition");
  const [impression, setImpression] = useState("");
  const [target, setTarget] = useState("");
  const [timeWindow, setTimeWindow] = useState("Next 30 days");
  const [confidence, setConfidence] = useState(55);
  const [notes, setNotes] = useState("");

  useEffect(() => { refreshSignals(); }, [refreshSignals]);

  const stats = useMemo(() => {
    const scored = signals.filter((s) => s.status !== "pending");
    const hits = signals.filter((s) => s.status === "hit").length;
    const partials = signals.filter((s) => s.status === "partial").length;
    const rate = scored.length ? Math.round(((hits + partials * 0.5) / scored.length) * 100) : 0;
    return { total: signals.length, scored: scored.length, pending: signals.length - scored.length, rate };
  }, [signals]);

  async function lock() {
    if (impression.trim().length < 6 || target.trim().length < 3) return;
    const s: Signal = {
      id: crypto.randomUUID?.() ?? `sig-${Date.now()}`,
      kind, impression: impression.trim(), target: target.trim(), timeWindow,
      confidence, controls: "No retroactive edits; recorded before outcome; misses scored as well as hits.",
      notes: notes.trim(), status: "pending", outcome: "", createdAt: Date.now(), scoredAt: null,
    };
    await saveSignal(s);
    setPresence("holding");
    setImpression(""); setTarget(""); setNotes(""); setConfidence(55);
    setTimeout(() => setPresence("attuned"), 1500);
  }

  async function score(s: Signal, status: Signal["status"]) {
    const outcome = prompt(`What actually happened? (${status})`, s.outcome) ?? s.outcome;
    await scoreSignal(s.id, status, outcome);
    addFeedback(calibrationValue(status), "calibration");
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title"><span className="glyph">◎</span> Signal Lab</div>
        <div className="panel-sub">"Test everything; hold fast what is good." — 1 Thessalonians 5:21</div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1.4fr", gap: 20, alignItems: "start" }}>
        <div className="card gild">
          <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Record an Impression</h3>
          <div className="field">
            <label className="label">Kind</label>
            <select className="select" value={kind} onChange={(e) => setKind(e.target.value)}>
              {KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">The Impression</label>
            <textarea className="textarea" value={impression} onChange={(e) => setImpression(e.target.value)} placeholder="What do you sense, specifically?" />
          </div>
          <div className="field">
            <label className="label">The Target (what it concerns)</label>
            <input className="input" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="person, event, decision…" />
          </div>
          <div className="field">
            <label className="label">Time Window</label>
            <input className="input" value={timeWindow} onChange={(e) => setTimeWindow(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Confidence — {confidence}%</label>
            <input type="range" min={0} max={100} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--velvet)" }} />
          </div>
          <button className="btn btn-primary btn-block" onClick={lock} disabled={impression.trim().length < 6 || target.trim().length < 3}>
            ⊕ Seal this Impression
          </button>
          <div className="muted serif" style={{ fontStyle: "italic", fontSize: "0.85rem", marginTop: 8 }}>
            Once sealed, it cannot be edited — only scored.
          </div>
        </div>

        <div>
          <div className="row" style={{ gap: 12, marginBottom: 14 }}>
            <Stat label="Sealed" value={stats.total} />
            <Stat label="Awaiting" value={stats.pending} />
            <Stat label="Scored" value={stats.scored} />
            <Stat label="Accuracy" value={`${stats.rate}%`} highlight />
          </div>

          {signals.length === 0 && <div className="empty">No impressions sealed yet. The ledger begins with the first.</div>}

          <div className="stack">
            {signals.map((s) => (
              <div key={s.id} className="card" style={{ padding: 16 }}>
                <div className="row between">
                  <span className="chip">{KINDS.find((k) => k[0] === s.kind)?.[1] ?? s.kind}</span>
                  <span className="mono" style={{ fontSize: "0.7rem", color: STATUS_COLORS[s.status], fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    ● {s.status}
                  </span>
                </div>
                <div className="serif" style={{ fontSize: "1.08rem", margin: "8px 0 4px", color: "var(--ink)" }}>"{s.impression}"</div>
                <div className="mono muted" style={{ fontSize: "0.72rem" }}>
                  {s.target} · {s.timeWindow} · {s.confidence}% confidence · {new Date(s.createdAt).toLocaleDateString()}
                </div>
                {s.outcome && <div className="serif" style={{ marginTop: 8, color: "var(--velvet)" }}><strong>Outcome:</strong> {s.outcome}</div>}

                {s.status === "pending" ? (
                  <div className="row row-wrap" style={{ marginTop: 12, gap: 6 }}>
                    <button className="btn btn-sm" onClick={() => score(s, "hit")}>✓ Hit</button>
                    <button className="btn btn-sm" onClick={() => score(s, "partial")}>~ Partial</button>
                    <button className="btn btn-sm" onClick={() => score(s, "miss")}>✗ Miss</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => score(s, "ambiguous")}>? Ambiguous</button>
                    <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }} onClick={() => removeSignal(s.id)}>Delete</button>
                  </div>
                ) : (
                  <div className="row" style={{ marginTop: 10 }}>
                    <span className="muted mono" style={{ fontSize: "0.68rem" }}>scored {s.scoredAt ? new Date(s.scoredAt).toLocaleDateString() : ""}</span>
                    <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }} onClick={() => removeSignal(s.id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="card" style={{ flex: 1, padding: "12px 14px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--decorative)", fontSize: "1.7rem", color: highlight ? "var(--gold-deep)" : "var(--velvet)" }}>{value}</div>
      <div className="mono" style={{ fontSize: "0.6rem", letterSpacing: "0.14em", color: "var(--ink-soft)" }}>{label.toUpperCase()}</div>
    </div>
  );
}
