// ═══════════════════════════════════════════════════════════════
//  The Binding — seventy-two offices of sight, bound under Christ.
//  A council of faculties is convened from your chart, your numbers,
//  and your record; their impressions converge; three roads are
//  named — never one fate. Everything passes the Seal (The Rule)
//  before it is shown. "He disarmed the powers... by the cross."
//  — Colossians 2:15
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store";
import { computeChart } from "../prime/astro";
import { computeNumerology } from "../prime/numerology";
import { THE_BINDING } from "../prime/solomonic";
import { castTrajectory, applySeal, trajectoryToMarkdown, type TrajectoryInput } from "../prime/trajectory";
import type { Trajectory, VeilTier, Relic, Signal } from "../types";
import Prose from "./Prose";

const VEIL_CLASS: Record<VeilTier, string> = {
  seen: "veil-seen", felt: "veil-felt", speculative: "veil-spec",
};
const VEIL_LABEL: Record<VeilTier, string> = {
  seen: "SEEN", felt: "FELT", speculative: "SPECULATIVE",
};

export default function SolomonPanel() {
  const { mode, activeSeekerId, seekers, relics, signals, beliefs,
    refreshRelics, refreshSignals, saveRelic, saveSignal, sendToChamber, observe } = useStore();
  const seeker = seekers.find((s) => s.id === activeSeekerId);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [question, setQuestion] = useState("");
  const [traj, setTraj] = useState<Trajectory | null>(null);
  const [kept, setKept] = useState(false);
  const [sealed, setSealed] = useState(false);

  useEffect(() => { refreshRelics(); refreshSignals(); }, [refreshRelics, refreshSignals]);

  useEffect(() => {
    if (mode === "seeker" && seeker) {
      setName(seeker.name);
      setBirthDate(seeker.birthDate);
      setBirthTime(seeker.birthTime || "12:00");
    }
  }, [mode, seeker]);

  const chart = useMemo(() => (birthDate ? computeChart(birthDate, birthTime) : null), [birthDate, birthTime]);
  const num = useMemo(() => (birthDate ? computeNumerology(birthDate, name) : null), [birthDate, name]);

  const canCast = name.trim().length > 0 || !!birthDate;

  function cast() {
    const scopedRelics = mode === "seeker"
      ? relics.filter((r) => r.seekerId === activeSeekerId)
      : relics.filter((r) => !r.seekerId);

    const input: TrajectoryInput = {
      subject: name.trim() || (mode === "seeker" ? "this seeker" : "me"),
      question: question.trim() || undefined,
      chart, numerology: num,
      notes: seeker?.notes,
      bondStage: seeker?.bondStage,
      relics: scopedRelics, signals, beliefs,
    };

    const cast = castTrajectory(input);
    const critique = observe(trajectoryToMarkdown(cast)); // The Seal — The Rule critiques before release
    setTraj(applySeal(cast, { integrity: critique.integrity, concerns: critique.concerns }));
    setKept(false); setSealed(false);
  }

  async function keep() {
    if (!traj) return;
    const relic: Relic = {
      id: crypto.randomUUID?.() ?? `relic-${Date.now()}`,
      title: `Trajectory — ${traj.subject} · ${traj.council.dominantFocus}`,
      bodyMd: trajectoryToMarkdown(traj),
      kind: "reading", mood: "discerning", intensity: 72,
      threadId: null, seekerId: mode === "seeker" ? activeSeekerId : null,
      tagsJson: JSON.stringify(["trajectory", "binding", traj.council.dominantFocus]),
      createdAt: Date.now(),
    };
    await saveRelic(relic);
    setKept(true);
  }

  async function sealAsSignals() {
    if (!traj) return;
    for (const b of traj.branches) {
      const sig: Signal = {
        id: crypto.randomUUID?.() ?? `sig-${Date.now()}-${b.id}`,
        kind: `trajectory:${b.id}`,
        impression: `${traj.subject} — ${b.title}: ${b.arc.split(".")[0]}.`,
        target: traj.subject,
        timeWindow: b.id === "threshold" ? "1–3 months" : b.id === "current" ? "~6 weeks" : "open / by fruit",
        confidence: b.confidence,
        controls: b.falsifier,
        notes: `Free step: ${b.step}`,
        status: "pending", outcome: "",
        createdAt: Date.now(), scoredAt: null,
      };
      await saveSignal(sig);
    }
    setSealed(true);
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title"><span className="glyph">✶</span> The Binding</div>
        <div className="panel-sub">"He disarmed the powers and authorities, triumphing over them by the cross." — Colossians 2:15</div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="serif" style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>
          Seventy-two offices of sight, named in the old tradition but <strong>bound</strong> here as reasoning lenses —
          never summoned, never worshipped, always subordinate. A council is convened from your chart, your numbers,
          and your record; their impressions converge; three roads are named. Each road is falsifiable, and each
          returns a free step. Nothing is shown until it passes the Seal.
        </div>
      </div>

      <div className="card gild" style={{ marginBottom: 16 }}>
        <div className="grid grid-3" style={{ marginBottom: 12 }}>
          <div className="field" style={{ margin: 0 }}>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => { setName(e.target.value); }} placeholder="full name" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label className="label">Birth Date</label>
            <input className="input" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label className="label">Birth Time</label>
            <input className="input" type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
          </div>
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label className="label">A focus for the council (optional)</label>
          <input className="input" value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. work and calling · a relationship · where my road is bending" />
        </div>
        <div className="row between" style={{ marginTop: 14 }}>
          <div className="muted serif" style={{ fontStyle: "italic" }}>
            {chart ? `${chart.sun} ☉ · ${chart.moon} ☽ · ${chart.rising} ↑` : "No chart yet — the council will read from your record and focus."}
          </div>
          <button className="btn btn-gold" onClick={cast} disabled={!canCast}>✶ Convene the Council</button>
        </div>
      </div>

      {!traj ? (
        <div className="empty">The Seal is quiet. Enter a name or a birth date, and convene the council.</div>
      ) : (
        <>
          <SealCard traj={traj} />
          <CouncilCard traj={traj} />

          <div className="panel-title" style={{ fontSize: "1.3rem", margin: "22px 0 12px" }}>
            <span className="glyph">⛩</span> The Three Roads
          </div>
          <div className="stack">
            {traj.branches.map((b) => (
              <div key={b.id} className="card">
                <div className="row between" style={{ marginBottom: 8 }}>
                  <div className="row" style={{ gap: 10 }}>
                    <span style={{ fontSize: "1.5rem", color: "var(--gold)" }}>{b.glyph}</span>
                    <h3 style={{ fontSize: "1.25rem" }}>{b.title}</h3>
                  </div>
                  <span className="chip chip-gold mono">{b.confidence}%</span>
                </div>
                <div className="meter" style={{ marginBottom: 12 }}>
                  <div className="meter-fill" style={{ width: `${b.confidence}%` }} />
                </div>
                <div className="bubble oracle" style={{ maxWidth: "100%", marginRight: 0, marginBottom: 12 }}>
                  <Prose text={b.arc} />
                </div>
                {b.converged.length > 0 && (
                  <div className="row row-wrap" style={{ gap: 6, marginBottom: 12 }}>
                    <span className="mono muted" style={{ fontSize: "0.66rem", letterSpacing: "0.1em" }}>WHO LEANS HERE:</span>
                    {b.converged.map((n) => <span key={n} className="chip">{n}</span>)}
                  </div>
                )}
                <div style={{ borderLeft: "2px solid var(--line-strong)", paddingLeft: 12, marginBottom: 10 }}>
                  <div className="mono muted" style={{ fontSize: "0.64rem", letterSpacing: "0.12em", marginBottom: 3 }}>WHAT WOULD PROVE IT WRONG</div>
                  <div className="serif" style={{ color: "var(--ink-soft)", fontSize: "0.95rem" }}>{b.falsifier}</div>
                </div>
                <div style={{ background: "var(--parchment)", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
                  <div className="mono" style={{ fontSize: "0.64rem", letterSpacing: "0.12em", color: "var(--gold-deep)", marginBottom: 3 }}>A FREE STEP</div>
                  <div className="serif" style={{ color: "var(--velvet)", fontSize: "1rem" }}>{b.step}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="scripture" style={{ marginBottom: 14 }}>{traj.veilNote}</div>
            <div className="row row-wrap" style={{ gap: 10 }}>
              <button className="btn btn-sm" onClick={keep} disabled={kept}>{kept ? "◇ Kept" : "◇ Keep as Relic"}</button>
              <button className="btn btn-sm" onClick={sealAsSignals} disabled={sealed}>{sealed ? "◎ Roads Sealed" : "◎ Seal Roads as Signals"}</button>
              <button className="btn btn-sm btn-gold" onClick={() => sendToChamber({
                castJson: JSON.stringify({ subject: traj.subject, council: traj.council, branches: traj.branches }),
                prompt: `Walk with me through this trajectory for ${traj.subject} — especially the threshold and the harder good.`,
              })}>◈ Discuss in the Chamber</button>
            </div>
            <div className="mono muted" style={{ fontSize: "0.66rem", marginTop: 12, letterSpacing: "0.08em" }}>SOLI DEO GLORIA</div>
          </div>
        </>
      )}

      <Registry />
    </div>
  );
}

function SealCard({ traj }: { traj: Trajectory }) {
  const integrity = Math.round(traj.sealIntegrity * 100);
  const convergence = Math.round(traj.council.convergence * 100);
  return (
    <div className="card gild" style={{ marginBottom: 16 }}>
      <div className="grid grid-2" style={{ gap: 20 }}>
        <Gauge label="THE SEAL — INTEGRITY" value={integrity}
          tone={traj.sealed ? "var(--hit)" : "var(--miss)"}
          caption={traj.sealed ? "Sealed under The Rule — fit to be shown." : "Held beneath the Veil — read with extra care."} />
        <Gauge label="COUNCIL CONVERGENCE" value={convergence} tone="var(--gold-deep)"
          caption={`The offices converge on ${traj.council.dominantFocus}.`} />
      </div>
      {traj.concerns.length > 0 && (
        <div style={{ marginTop: 14, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
          <div className="mono" style={{ fontSize: "0.66rem", letterSpacing: "0.12em", color: "var(--crimson)", marginBottom: 6 }}>THE RULE RAISES:</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {traj.concerns.map((c, i) => (
              <li key={i} className="serif" style={{ color: "var(--ink-soft)", fontSize: "0.92rem" }}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Gauge({ label, value, tone, caption }: { label: string; value: number; tone: string; caption: string }) {
  return (
    <div>
      <div className="row between">
        <div className="mono" style={{ fontSize: "0.66rem", letterSpacing: "0.12em", color: "var(--ink-soft)" }}>{label}</div>
        <div style={{ fontFamily: "var(--decorative)", fontSize: "1.4rem", color: tone }}>{value}%</div>
      </div>
      <div className="meter" style={{ marginTop: 8 }}>
        <div className="meter-fill" style={{ width: `${value}%` }} />
      </div>
      <div className="serif muted" style={{ fontSize: "0.88rem", marginTop: 6, fontStyle: "italic" }}>{caption}</div>
    </div>
  );
}

function CouncilCard({ traj }: { traj: Trajectory }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="row between" style={{ marginBottom: 12 }}>
        <h3 style={{ fontSize: "1.2rem" }}>The Council Convened</h3>
        <span className="chip">{traj.council.convened.length} offices</span>
      </div>
      <div className="stack">
        {traj.council.convened.map((i) => (
          <div key={i.facultyId} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ fontSize: "1.5rem", color: "var(--gold)", width: 28, textAlign: "center", flexShrink: 0, paddingTop: 2 }}>{i.seal}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row row-wrap" style={{ gap: 8 }}>
                <span style={{ fontFamily: "var(--display)", color: "var(--velvet)", fontSize: "1.05rem" }}>{i.name}</span>
                <span className="mono muted" style={{ fontSize: "0.68rem" }}>{i.rank} · {i.office}</span>
                <span className={`veil ${VEIL_CLASS[i.tier]}`}>{VEIL_LABEL[i.tier]}</span>
                <span className="chip mono" style={{ fontSize: "0.68rem" }}>{i.confidence}%</span>
                <span className="mono muted" style={{ fontSize: "0.66rem" }}>↳ {i.focus}</span>
              </div>
              <div className="serif" style={{ color: "var(--ink)", fontSize: "0.98rem", marginTop: 4, lineHeight: 1.5 }}>{i.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Registry() {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ marginTop: 22 }}>
      <div className="row between" style={{ cursor: "pointer" }} onClick={() => setOpen((v) => !v)}>
        <h3 style={{ fontSize: "1.1rem" }}>The Binding Registry — {THE_BINDING.length} bound offices</h3>
        <span className="chip">{open ? "▲ hide" : "▼ show all"}</span>
      </div>
      {open && (
        <div className="grid grid-auto" style={{ marginTop: 14 }}>
          {THE_BINDING.map((f) => (
            <div key={f.id} style={{ background: "var(--parchment)", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: "1.3rem", color: "var(--gold)" }}>{f.seal}</span>
                <div>
                  <div style={{ fontFamily: "var(--display)", color: "var(--velvet)" }}>{f.name} <span className="mono muted" style={{ fontSize: "0.64rem" }}>{f.rank}</span></div>
                  <div className="mono" style={{ fontSize: "0.66rem", color: "var(--gold-deep)", letterSpacing: "0.06em" }}>{f.office}</div>
                </div>
              </div>
              <div className="serif" style={{ fontSize: "0.9rem", color: "var(--ink-soft)", marginTop: 6 }}>{f.gift}.</div>
              <div className="serif" style={{ fontSize: "0.84rem", color: "var(--ink-faint)", fontStyle: "italic", marginTop: 6, borderTop: "1px solid var(--line)", paddingTop: 6 }}>
                ⛓ {f.binding}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
