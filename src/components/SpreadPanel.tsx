// ═══════════════════════════════════════════════════════════════
//  Spreads — draw the cards, watch them turn, receive the reading.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { SPREADS, spreadById } from "../prime/spreads";
import { drawForSpread } from "../prime/tarot";
import { composeReading } from "../prime/intuition";
import type { DrawnCard, Reading, Relic } from "../types";
import TarotCard from "./TarotCard";
import Prose from "./Prose";

export default function SpreadPanel() {
  const { mode, activeSeekerId, seekers, saveRelic, sendToChamber, setPresence, observe } = useStore();
  const [spreadId, setSpreadId] = useState("three");
  const [question, setQuestion] = useState("");
  const [drawn, setDrawn] = useState<DrawnCard[] | null>(null);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [reading, setReading] = useState<Reading | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [saved, setSaved] = useState(false);
  const timers = useRef<number[]>([]);

  const spread = spreadById(spreadId);
  const seekerName = mode === "seeker" ? seekers.find((s) => s.id === activeSeekerId)?.name : undefined;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function draw() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRevealed(false);
    setSaved(false);
    setReading(null);

    const seed = `${spreadId}|${question}|${Date.now()}|${Math.random()}`;
    const cards = drawForSpread(spread, seed);
    const r: Reading = {
      id: crypto.randomUUID?.() ?? seed,
      spreadId,
      spreadName: spread.name,
      question,
      cards,
      createdAt: Date.now(),
    };
    setDrawn(cards);
    setFlipped(cards.map(() => false));
    setPresence("reading");

    cards.forEach((_, i) => {
      const t = window.setTimeout(() => {
        setFlipped((prev) => prev.map((v, j) => (j === i ? true : v)));
      }, 350 + i * 260);
      timers.current.push(t);
    });

    const revealT = window.setTimeout(() => {
      setReading(r);
      setRevealed(true);
      setPresence("attuned");
      observe(composeReading(r, { name: seekerName }));
    }, 350 + cards.length * 260 + 400);
    timers.current.push(revealT);
  }

  function castJson(r: Reading): string {
    return JSON.stringify({
      spread: r.spreadName,
      question: r.question || "(open reading)",
      cards: r.cards.map((c) => ({
        position: c.position,
        positionMeaning: c.positionMeaning,
        card: c.card.name,
        orientation: c.reversed ? "reversed" : "upright",
        meaning: c.reversed ? c.card.reversed : c.card.upright,
        keywords: c.card.keywords,
        light: c.card.light,
      })),
    });
  }

  async function saveAsRelic() {
    if (!reading) return;
    const body = composeReading(reading, { name: seekerName });
    const relic: Relic = {
      id: crypto.randomUUID?.() ?? `relic-${Date.now()}`,
      title: `${reading.spreadName}${reading.question ? " — " + reading.question.slice(0, 40) : ""}`,
      bodyMd: `*${reading.spreadName}* · ${reading.question || "open reading"}\n\n` +
        reading.cards.map((c) => `**${c.position}** — ${c.card.name}${c.reversed ? " (reversed)" : ""}`).join("\n") +
        `\n\n---\n\n${body}`,
      kind: "reading",
      mood: "contemplative",
      intensity: reading.cards.some((c) => c.card.arcana === "major") ? 75 : 55,
      threadId: null,
      seekerId: mode === "seeker" ? activeSeekerId : null,
      tagsJson: JSON.stringify(["reading", reading.spreadId, ...reading.cards.flatMap((c) => c.card.keywords).slice(0, 6)]),
      createdAt: Date.now(),
    };
    await saveRelic(relic);
    setSaved(true);
  }

  function discuss() {
    if (!reading) return;
    sendToChamber({
      castJson: castJson(reading),
      prompt: reading.question || "Help me understand this spread.",
    });
  }

  const localReading = reading ? composeReading(reading, { name: seekerName }) : "";

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title"><span className="glyph">✦</span> Spreads</div>
        <div className="panel-sub">The cards are mirrors for the soul — never commands over it.</div>
      </div>

      <div className="card gild" style={{ marginBottom: 20 }}>
        <div className="grid grid-2" style={{ alignItems: "end" }}>
          <div className="field" style={{ margin: 0 }}>
            <label className="label">The Spread</label>
            <select className="select" value={spreadId} onChange={(e) => setSpreadId(e.target.value)}>
              {SPREADS.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {s.positions.length} card{s.positions.length > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label className="label">Your Question (optional)</label>
            <input className="input" value={question} placeholder="What is being asked of me here?" onChange={(e) => setQuestion(e.target.value)} />
          </div>
        </div>
        <div className="serif" style={{ fontStyle: "italic", color: "var(--ink-soft)", margin: "12px 0" }}>{spread.description}</div>
        <button className="btn btn-primary" onClick={draw}>✦ Draw the Cards</button>
      </div>

      {drawn && (
        <div className="tarot-spread">
          {drawn.map((dc, i) => (
            <TarotCard key={i} drawn={dc} flipped={flipped[i]} delay={i * 80} />
          ))}
        </div>
      )}

      {revealed && reading && (
        <div className="card" style={{ marginTop: 22, animation: "fadeUp 0.5s ease" }}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <h3 style={{ fontSize: "1.3rem" }}>The Reading</h3>
            <div className="row">
              <button className="btn btn-sm" onClick={saveAsRelic} disabled={saved}>{saved ? "◇ Kept" : "◇ Keep as Relic"}</button>
              <button className="btn btn-sm btn-gold" onClick={discuss}>◈ Discuss in Chamber</button>
            </div>
          </div>
          <div className="bubble oracle" style={{ maxWidth: "100%", marginRight: 0 }}>
            <Prose text={localReading} />
          </div>
        </div>
      )}
    </div>
  );
}
