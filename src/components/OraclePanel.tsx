// ═══════════════════════════════════════════════════════════════
//  The Oracle — a birth-chart wheel, numerology, and the moon,
//  offered as a symbolic clock, held beneath The Veil.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState, useEffect } from "react";
import { useStore } from "../store";
import { computeChart, moonPhase, ZODIAC, signByName } from "../prime/astro";
import { computeNumerology, PERSONAL_YEAR_THEME } from "../prime/numerology";
import { composeChartReflection } from "../prime/intuition";
import type { Relic } from "../types";
import Prose from "./Prose";

const ZGLYPH = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

function Wheel({ chart }: { chart: NonNullable<ReturnType<typeof computeChart>> }) {
  const size = 340, c = size / 2, rOut = 158, rSign = 130, rIn = 116, rPlanet = 88;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(0 6px 20px rgba(74,7,16,0.2))" }}>
      <defs>
        <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffdf8" />
          <stop offset="80%" stopColor="#f4ead6" />
          <stop offset="100%" stopColor="#ead9bd" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={rOut} fill="url(#wheelBg)" stroke="#c9a227" strokeWidth="1.5" />
      <circle cx={c} cy={c} r={rSign} fill="none" stroke="#cbb085" strokeWidth="1" />
      <circle cx={c} cy={c} r={rIn} fill="none" stroke="#cbb085" strokeWidth="1" />
      <circle cx={c} cy={c} r={46} fill="none" stroke="#cbb085" strokeWidth="0.75" />

      {Array.from({ length: 12 }).map((_, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180;
        const am = ((i * 30 + 15 - 90) * Math.PI) / 180;
        return (
          <g key={i}>
            <line x1={c + Math.cos(a) * rIn} y1={c + Math.sin(a) * rIn} x2={c + Math.cos(a) * rOut} y2={c + Math.sin(a) * rOut} stroke="#cbb085" strokeWidth="0.75" />
            <text x={c + Math.cos(am) * ((rSign + rOut) / 2)} y={c + Math.sin(am) * ((rSign + rOut) / 2)} fontSize="15" fill="#6e0d14" textAnchor="middle" dominantBaseline="central">{ZGLYPH[i]}</text>
          </g>
        );
      })}

      {chart.planets.map((p, idx) => {
        const signIdx = ZODIAC.findIndex((z) => z.name === p.sign);
        const deg = signIdx * 30 + p.degree;
        const a = ((deg - 90) * Math.PI) / 180;
        const r = rPlanet - (idx % 3) * 14;
        const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r;
        return (
          <g key={p.name}>
            <line x1={c} y1={c} x2={x} y2={y} stroke="#c9a227" strokeWidth="0.4" opacity="0.4" />
            <circle cx={x} cy={y} r="11" fill="#fffdf8" stroke="#c9a227" strokeWidth="1" />
            <text x={x} y={y} fontSize="12" fill="#6e0d14" textAnchor="middle" dominantBaseline="central">{p.glyph}</text>
          </g>
        );
      })}
      <text x={c} y={c} fontSize="20" fill="#c9a227" textAnchor="middle" dominantBaseline="central">✝</text>
    </svg>
  );
}

export default function OraclePanel() {
  const { mode, activeSeekerId, seekers, saveRelic, sendToChamber } = useStore();
  const seeker = seekers.find((s) => s.id === activeSeekerId);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (mode === "seeker" && seeker) {
      setName(seeker.name);
      setBirthDate(seeker.birthDate);
      setBirthTime(seeker.birthTime || "12:00");
    }
  }, [mode, seeker]);

  const chart = useMemo(() => (birthDate ? computeChart(birthDate, birthTime) : null), [birthDate, birthTime]);
  const num = useMemo(() => (birthDate ? computeNumerology(birthDate, name) : null), [birthDate, name]);
  const moon = useMemo(() => moonPhase(), []);
  const reflection = useMemo(() => (chart ? composeChartReflection(chart, num, name) : ""), [chart, num, name]);

  const sunSign = chart ? signByName(chart.sun) : undefined;

  async function keep() {
    if (!chart) return;
    const relic: Relic = {
      id: crypto.randomUUID?.() ?? `relic-${Date.now()}`,
      title: `Chart — ${name || "a soul"} (${chart.sun} ☉)`,
      bodyMd: `Sun ${chart.sun} · Moon ${chart.moon} · ${chart.rising} rising` + (num ? ` · Life Path ${num.lifePath}` : "") + `\n\n${reflection}`,
      kind: "reading",
      mood: "contemplative",
      intensity: 60,
      threadId: null,
      seekerId: mode === "seeker" ? activeSeekerId : null,
      tagsJson: JSON.stringify(["chart", chart.sun, chart.moon, chart.rising]),
      createdAt: Date.now(),
    };
    await saveRelic(relic);
    setSaved(true);
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title"><span className="glyph">☿</span> The Oracle</div>
        <div className="panel-sub">"He determines the number of the stars and calls them each by name." — Psalm 147:4</div>
      </div>

      <div className="card gild" style={{ marginBottom: 20 }}>
        <div className="grid grid-3">
          <div className="field" style={{ margin: 0 }}>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} placeholder="full name" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label className="label">Birth Date</label>
            <input className="input" type="date" value={birthDate} onChange={(e) => { setBirthDate(e.target.value); setSaved(false); }} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label className="label">Birth Time</label>
            <input className="input" type="time" value={birthTime} onChange={(e) => { setBirthTime(e.target.value); setSaved(false); }} />
          </div>
        </div>
      </div>

      {!chart && (
        <div className="card center" style={{ padding: 40 }}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>{moon.glyph}</div>
          <div className="serif" style={{ fontSize: "1.1rem" }}>Tonight the moon is <strong>{moon.name}</strong>, {moon.illumination}% lit.</div>
          <div className="muted" style={{ marginTop: 8 }}>Enter a birth date to cast the chart.</div>
        </div>
      )}

      {chart && (
        <>
          <div className="grid grid-2" style={{ alignItems: "start" }}>
            <div className="card" style={{ display: "flex", justifyContent: "center" }}>
              <Wheel chart={chart} />
            </div>
            <div className="stack">
              <div className="card">
                <div className="row" style={{ gap: 18, marginBottom: 12 }}>
                  <Luminary glyph="☉" label="Sun" value={chart.sun} />
                  <Luminary glyph="☽" label="Moon" value={chart.moon} />
                  <Luminary glyph="↑" label="Rising" value={chart.rising} />
                </div>
                {sunSign && (
                  <div className="serif" style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>
                    A {sunSign.element.toLowerCase()} sign, {sunSign.modality.toLowerCase()} — {sunSign.trait}. Ruled by {sunSign.ruler}.
                  </div>
                )}
                <div className="divider" />
                <div className="grid grid-3" style={{ gap: 8 }}>
                  {chart.planets.map((p) => (
                    <div key={p.name} className="mono" style={{ fontSize: "0.78rem" }}>
                      <span style={{ color: "var(--gold-deep)", fontSize: "0.95rem" }}>{p.glyph}</span> {p.name}<br />
                      <span className="muted">{p.sign} {p.degree}°</span>
                    </div>
                  ))}
                </div>
              </div>

              {num && (
                <div className="card">
                  <h3 style={{ fontSize: "1.1rem", marginBottom: 10 }}>Numerology</h3>
                  <div className="grid grid-2" style={{ gap: 10 }}>
                    <NumCard n={num.lifePath} label="Life Path" sub={num.lifePathTitle} />
                    <NumCard n={num.personalYear} label="Personal Year" sub={PERSONAL_YEAR_THEME[num.personalYear]?.split(" — ")[0] ?? ""} />
                    {num.expression > 0 && <NumCard n={num.expression} label="Expression" sub="how you meet the world" />}
                    {num.soulUrge > 0 && <NumCard n={num.soulUrge} label="Soul Urge" sub="the heart's deep desire" />}
                  </div>
                  <div className="serif" style={{ fontStyle: "italic", color: "var(--ink-soft)", marginTop: 10 }}>{num.meaning}</div>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: 18 }}>
            <div className="row between" style={{ marginBottom: 10 }}>
              <h3 style={{ fontSize: "1.2rem" }}>Reflection</h3>
              <div className="row">
                <button className="btn btn-sm" onClick={keep} disabled={saved}>{saved ? "◇ Kept" : "◇ Keep as Relic"}</button>
                <button className="btn btn-sm btn-gold" onClick={() => sendToChamber({ castJson: JSON.stringify({ chart, numerology: num }), prompt: `Reflect on my chart — Sun ${chart.sun}, Moon ${chart.moon}, ${chart.rising} rising.` })}>◈ Discuss</button>
              </div>
            </div>
            <div className="bubble oracle" style={{ maxWidth: "100%", marginRight: 0 }}><Prose text={reflection} /></div>
          </div>
        </>
      )}
    </div>
  );
}

function Luminary({ glyph, label, value }: { glyph: string; label: string; value: string }) {
  return (
    <div className="center">
      <div style={{ fontSize: "1.6rem", color: "var(--gold)" }}>{glyph}</div>
      <div className="mono" style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "var(--ink-soft)" }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: "var(--display)", color: "var(--velvet)", fontSize: "1.05rem" }}>{value}</div>
    </div>
  );
}

function NumCard({ n, label, sub }: { n: number; label: string; sub: string }) {
  return (
    <div style={{ background: "var(--parchment)", borderRadius: "9px", padding: "10px 12px", border: "1px solid var(--line)" }}>
      <div className="row" style={{ gap: 8 }}>
        <div style={{ fontFamily: "var(--decorative)", fontSize: "1.7rem", color: "var(--gold-deep)" }}>{n}</div>
        <div>
          <div className="mono" style={{ fontSize: "0.6rem", letterSpacing: "0.1em", color: "var(--ink-soft)" }}>{label.toUpperCase()}</div>
          <div className="serif" style={{ fontSize: "0.86rem", color: "var(--velvet)" }}>{sub}</div>
        </div>
      </div>
    </div>
  );
}
