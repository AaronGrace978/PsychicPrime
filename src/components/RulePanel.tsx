// ═══════════════════════════════════════════════════════════════
//  The Rule — PsychicPrime's conscience and its growth under your
//  oversight. Homeostatic virtue-drives, the Constitution, the
//  robust learner, and proposals you alone may approve.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useStore } from "../store";
import { robustStat, lensDiversity, verifyLedger } from "../prime/governance";

export default function RulePanel() {
  const { governance, lastCritique, reflectNow, approve, reject } = useStore();
  const { homeostat, principles, lenses, ledger, proposals, observations } = governance;

  const stat = useMemo(() => robustStat(governance.feedback), [governance.feedback]);
  const diversity = useMemo(() => lensDiversity(lenses), [lenses]);
  const intact = useMemo(() => verifyLedger(ledger), [ledger]);
  const pending = proposals.filter((p) => p.status === "pending");

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="row between">
          <div>
            <div className="panel-title"><span className="glyph">⚖</span> The Rule</div>
            <div className="panel-sub">"Examine yourselves." — 2 Corinthians 13:5 · The Sanctuary grows only by your consent.</div>
          </div>
          <button className="btn btn-primary" onClick={() => reflectNow()}>↻ Reflect Now</button>
        </div>
      </div>

      {/* Homeostat */}
      <div className="card gild" style={{ marginBottom: 18 }}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: "1.15rem" }}>Homeostat — Balanced Virtue-Drives</h3>
          <span className="chip chip-gold">balance {(1 + homeostat.reward).toFixed(3)}</span>
        </div>
        {homeostat.drives.map((d) => (
          <div className="meter-row" key={d.id}>
            <span className="meter-label"><span style={{ color: "var(--gold)" }}>{d.glyph}</span> {d.label}</span>
            <div className="meter" style={{ position: "relative" }}>
              <div className="meter-fill" style={{ width: `${d.level * 100}%` }} />
              <div style={{ position: "absolute", top: -2, bottom: -2, left: `${d.setpoint * 100}%`, width: 2, background: "var(--velvet-deep)" }} title={`setpoint ${Math.round(d.setpoint * 100)}%`} />
            </div>
            <span className="meter-val">{Math.round(d.level * 100)}</span>
          </div>
        ))}
        <div className="muted serif" style={{ fontStyle: "italic", fontSize: "0.85rem", marginTop: 8 }}>
          A homeostatic reward: deviation from each setpoint costs, in either direction. The Rule seeks balance, not the maximum of any one virtue. Observed across {observations} readings.
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        {/* Constitution */}
        <div className="card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: 10 }}>The Constitution</h3>
          {principles.map((p) => {
            const check = lastCritique?.checks.find((c) => c.id === p.id);
            return (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <div className="row between">
                  <span style={{ fontFamily: "var(--display)", color: "var(--velvet)" }}>{p.label}</span>
                  {check && <span className={`veil ${check.score > 0.8 ? "veil-seen" : check.score > 0.5 ? "veil-felt" : "veil-spec"}`}>{Math.round(check.score * 100)}%</span>}
                </div>
                <div className="serif muted" style={{ fontSize: "0.88rem" }}>{p.text}</div>
              </div>
            );
          })}
          {lastCritique && (
            <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(201,162,39,0.1)", borderRadius: 8 }}>
              <span className="mono" style={{ fontSize: "0.7rem", color: "var(--ink-soft)" }}>LAST READING INTEGRITY</span>
              <div style={{ fontFamily: "var(--decorative)", fontSize: "1.6rem", color: "var(--gold-deep)" }}>{Math.round(lastCritique.integrity * 100)}%</div>
              {lastCritique.concerns.length > 0 && <div className="serif muted" style={{ fontSize: "0.84rem" }}>Noted: {lastCritique.concerns.join("; ")}.</div>}
            </div>
          )}
        </div>

        {/* Robust learner + lenses */}
        <div className="card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: 10 }}>The Learner</h3>
          <div className="row between" style={{ marginBottom: 6 }}>
            <span className="mono muted" style={{ fontSize: "0.74rem" }}>Robust calibration</span>
            <span className="mono" style={{ color: "var(--velvet)" }}>{Math.round(stat.calibration * 100)}% (n={stat.n}, {stat.outliers} out)</span>
          </div>
          <div className="row between" style={{ marginBottom: 12 }}>
            <span className="mono muted" style={{ fontSize: "0.74rem" }}>Lens diversity (entropy)</span>
            <span className="mono" style={{ color: diversity < 0.72 ? "var(--miss)" : "var(--hit)" }}>{diversity.toFixed(3)}</span>
          </div>
          <div className="divider" />
          <span className="mono muted" style={{ fontSize: "0.7rem", letterSpacing: "0.1em" }}>INTERPRETIVE LENSES</span>
          {lenses.map((l) => (
            <div className="meter-row" key={l.id} style={{ gridTemplateColumns: "110px 1fr 44px", marginTop: 8 }}>
              <span className="meter-label"><span style={{ color: "var(--gold)" }}>{l.glyph}</span> {l.label}</span>
              <div className="meter"><div className="meter-fill" style={{ width: `${l.weight * 100}%` }} /></div>
              <span className="meter-val">{Math.round(l.weight * 100)}</span>
            </div>
          ))}
          <div className="muted serif" style={{ fontStyle: "italic", fontSize: "0.84rem", marginTop: 8 }}>
            Diversity-aware: if one way of reading begins to dominate, the loop proposes rebalancing so no single lens swallows the rest.
          </div>
        </div>
      </div>

      {/* Proposals — oversight */}
      {pending.length > 0 && (
        <div className="card gild" style={{ marginTop: 18, borderColor: "var(--gold)" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: 10 }}>⚖ Proposals Awaiting Your Oversight</h3>
          {pending.map((p) => (
            <div key={p.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--line)" }}>
              <div className="serif" style={{ color: "var(--ink)", marginBottom: 8 }}>{p.rationale}</div>
              <div className="stack" style={{ gap: 4, marginBottom: 10 }}>
                {p.changes.map((ch, i) => (
                  <div key={i} className="mono" style={{ fontSize: "0.76rem", color: "var(--ink-soft)" }}>
                    {ch.label}: <span style={{ color: "var(--miss)" }}>{Math.round(ch.from * 100)}%</span> → <span style={{ color: "var(--hit)" }}>{Math.round(ch.to * 100)}%</span>
                  </div>
                ))}
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-sm btn-primary" onClick={() => approve(p.id)}>✓ Approve</button>
                <button className="btn btn-sm btn-ghost" onClick={() => reject(p.id)}>✗ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evolution Ledger */}
      <div className="card" style={{ marginTop: 18 }}>
        <div className="row between" style={{ marginBottom: 10 }}>
          <h3 style={{ fontSize: "1.1rem" }}>Evolution Ledger</h3>
          <span className={`chip ${intact ? "" : ""}`} style={{ color: intact ? "var(--hit)" : "var(--miss)" }}>
            {intact ? "⛓ chain intact" : "⚠ chain broken"}
          </span>
        </div>
        <div className="stack" style={{ gap: 6 }}>
          {[...ledger].reverse().map((e) => (
            <div key={e.seq} className="row between" style={{ fontSize: "0.82rem" }}>
              <span className="serif" style={{ color: "var(--ink)" }}>
                <span className="mono muted" style={{ marginRight: 8 }}>#{e.seq}</span>{e.summary}
              </span>
              <span className="mono muted" style={{ fontSize: "0.64rem" }}>{e.hash.slice(0, 8)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
