// ═══════════════════════════════════════════════════════════════
//  Calibration — the honest ledger. Robust accuracy that a few
//  strange outcomes cannot warp, and falsifiable beliefs tracked
//  over time.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store";
import { robustStat } from "../prime/governance";
import type { Belief } from "../types";

export default function CalibrationPanel() {
  const { signals, beliefs, governance, refreshSignals, saveBelief } = useStore();
  const [showBelief, setShowBelief] = useState(false);

  useEffect(() => { refreshSignals(); }, [refreshSignals]);

  const stat = useMemo(() => robustStat(governance.feedback), [governance.feedback]);
  const breakdown = useMemo(() => {
    const b = { hit: 0, partial: 0, miss: 0, ambiguous: 0, pending: 0 };
    signals.forEach((s) => { b[s.status]++; });
    return b;
  }, [signals]);

  const scored = breakdown.hit + breakdown.partial + breakdown.miss + breakdown.ambiguous;

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title"><span className="glyph">⊕</span> Calibration</div>
        <div className="panel-sub">Honesty is the whole discipline. Misses are counted as faithfully as hits.</div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card gild">
          <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Robust Accuracy</h3>
          <div className="center" style={{ margin: "10px 0" }}>
            <div style={{ fontFamily: "var(--decorative)", fontSize: "3.2rem", color: "var(--gold-deep)" }}>
              {Math.round(stat.calibration * 100)}%
            </div>
            <div className="muted serif" style={{ fontStyle: "italic" }}>outlier-robust central estimate</div>
          </div>
          <div className="divider" />
          <RStat label="Samples (n)" value={stat.n} />
          <RStat label="Median" value={`${Math.round(stat.median * 100)}%`} />
          <RStat label="Trimmed mean" value={`${Math.round(stat.trimmedMean * 100)}%`} />
          <RStat label="Dispersion (MAD)" value={stat.mad.toFixed(2)} />
          <RStat label="Outliers excluded" value={stat.outliers} />
          <div className="muted serif" style={{ fontStyle: "italic", fontSize: "0.86rem", marginTop: 10 }}>
            The estimate blends median and a 10%-trimmed mean, and casts out points more than 3·MAD from center — so one strange day cannot swing the verdict.
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>By Outcome</h3>
          {scored === 0 ? (
            <div className="muted serif">No scored signals yet. Seal impressions in the Signal Lab, then score them.</div>
          ) : (
            <>
              <Bar label="Hits" n={breakdown.hit} total={scored} color="var(--hit)" />
              <Bar label="Partial" n={breakdown.partial} total={scored} color="var(--partial)" />
              <Bar label="Misses" n={breakdown.miss} total={scored} color="var(--miss)" />
              <Bar label="Ambiguous" n={breakdown.ambiguous} total={scored} color="var(--gold-deep)" />
            </>
          )}
          <div className="divider" />
          <div className="row between mono" style={{ fontSize: "0.74rem", color: "var(--ink-soft)" }}>
            <span>{breakdown.pending} awaiting outcome</span>
            <span>{scored} scored of {signals.length}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: "1.1rem" }}>Beliefs</h3>
          <button className="btn btn-sm btn-primary" onClick={() => setShowBelief(true)}>＋ Record a Belief</button>
        </div>
        {beliefs.length === 0 ? (
          <div className="muted serif">No beliefs recorded. A belief is a claim with a confidence and a clear way to be proven wrong.</div>
        ) : (
          <div className="stack">
            {beliefs.map((b) => (
              <div key={b.id} style={{ borderLeft: "3px solid var(--gold)", paddingLeft: 12 }}>
                <div className="row between">
                  <span className="serif" style={{ fontSize: "1.05rem", color: "var(--ink)" }}>{b.claim}</span>
                  <span className="veil veil-felt">{b.confidence}%</span>
                </div>
                <div className="mono muted" style={{ fontSize: "0.7rem", marginTop: 3 }}>{b.epistemicType} · {b.status}</div>
                {b.falsifier && <div className="serif muted" style={{ fontSize: "0.88rem", marginTop: 3 }}><em>Would change my mind:</em> {b.falsifier}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showBelief && <BeliefForm onClose={() => setShowBelief(false)} onSave={async (b) => { await saveBelief(b); setShowBelief(false); }} />}
    </div>
  );
}

function RStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="row between" style={{ marginBottom: 6 }}>
      <span className="mono muted" style={{ fontSize: "0.74rem" }}>{label}</span>
      <span className="mono" style={{ fontSize: "0.82rem", color: "var(--velvet)" }}>{value}</span>
    </div>
  );
}

function Bar({ label, n, total, color }: { label: string; n: number; total: number; color: string }) {
  const pct = total ? Math.round((n / total) * 100) : 0;
  return (
    <div className="meter-row" style={{ gridTemplateColumns: "90px 1fr 50px" }}>
      <span className="meter-label">{label}</span>
      <div className="meter"><div className="meter-fill" style={{ width: `${pct}%`, background: color }} /></div>
      <span className="meter-val">{n}</span>
    </div>
  );
}

function BeliefForm({ onClose, onSave }: { onClose: () => void; onSave: (b: Belief) => void }) {
  const [claim, setClaim] = useState("");
  const [confidence, setConfidence] = useState(60);
  const [epistemicType, setType] = useState<Belief["epistemicType"]>("inferred");
  const [evidence, setEvidence] = useState("");
  const [falsifier, setFalsifier] = useState("");

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(44,5,9,0.55)", backdropFilter: "blur(6px)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", padding: 30 }}>
      <div className="card gild" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 540 }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: 14 }}>Record a Belief</h2>
        <div className="field"><label className="label">The Claim</label><textarea className="textarea" value={claim} onChange={(e) => setClaim(e.target.value)} placeholder="What do you believe to be true?" /></div>
        <div className="grid grid-2">
          <div className="field">
            <label className="label">Epistemic type</label>
            <select className="select" value={epistemicType} onChange={(e) => setType(e.target.value as Belief["epistemicType"])}>
              <option value="measured">measured</option>
              <option value="inferred">inferred</option>
              <option value="analogy">analogy</option>
              <option value="speculation">speculation</option>
            </select>
          </div>
          <div className="field"><label className="label">Confidence — {confidence}%</label><input type="range" min={0} max={100} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--velvet)" }} /></div>
        </div>
        <div className="field"><label className="label">Evidence</label><input className="input" value={evidence} onChange={(e) => setEvidence(e.target.value)} /></div>
        <div className="field"><label className="label">What would change my mind (falsifier)</label><input className="input" value={falsifier} onChange={(e) => setFalsifier(e.target.value)} /></div>
        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!claim.trim()} onClick={() => onSave({
            id: crypto.randomUUID?.() ?? `belief-${Date.now()}`, claim: claim.trim(), confidence,
            epistemicType, evidence, falsifier, status: "open", supersedesId: null, createdAt: Date.now(),
          })}>Record</button>
        </div>
      </div>
    </div>
  );
}
