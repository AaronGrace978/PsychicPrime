// ═══════════════════════════════════════════════════════════════
//  The Testimony — the prophecies of the Messiah and their
//  fulfillment in Christ. The convergence of all convergences.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { useStore } from "../store";
import { PROPHECIES, PROPHECY_THEMES, prophecyOfTheDay } from "../prime/prophecies";
import type { Prophecy, Relic } from "../types";

function ProphecyCard({ p, onKeep }: { p: Prophecy; onKeep: (p: Prophecy) => void }) {
  const theme = PROPHECY_THEMES.find((t) => t.id === p.theme);
  return (
    <div className="card gild" style={{ animation: "fadeUp 0.4s ease" }}>
      <div className="row between" style={{ marginBottom: 10 }}>
        <span className="chip chip-gold">{theme?.glyph} {theme?.label}</span>
        <span className="mono muted" style={{ fontSize: "0.66rem" }}>{p.written}</span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div className="scripture-ref">Foretold · {p.prophecyRef}</div>
        <div className="scripture" style={{ marginTop: 4 }}>"{p.prophecyText}"</div>
      </div>

      <div className="center" style={{ color: "var(--gold)", fontSize: "1.1rem", margin: "6px 0" }}>✝</div>

      <div style={{ marginBottom: 12 }}>
        <div className="scripture-ref">Fulfilled · {p.fulfillmentRef}</div>
        <div className="scripture" style={{ marginTop: 4, color: "var(--ink)" }}>{p.fulfillmentText}</div>
      </div>

      <div style={{ background: "rgba(201,162,39,0.1)", borderLeft: "3px solid var(--gold)", borderRadius: "0 8px 8px 0", padding: "10px 14px" }}>
        <div className="serif" style={{ fontStyle: "italic", color: "var(--velvet)" }}>{p.insight}</div>
      </div>

      <div className="row" style={{ marginTop: 12, justifyContent: "flex-end" }}>
        <button className="btn btn-sm btn-ghost" onClick={() => onKeep(p)}>◇ Keep as Relic</button>
      </div>
    </div>
  );
}

export default function TestimonyPanel() {
  const { saveRelic } = useStore();
  const [theme, setTheme] = useState<string>("all");
  const [drawn, setDrawn] = useState<Prophecy | null>(null);
  const daily = useMemo(() => prophecyOfTheDay(), []);

  const list = useMemo(
    () => (theme === "all" ? PROPHECIES : PROPHECIES.filter((p) => p.theme === theme)),
    [theme]
  );

  async function keep(p: Prophecy) {
    const relic: Relic = {
      id: crypto.randomUUID?.() ?? `relic-${Date.now()}`,
      title: `Testimony — ${p.prophecyRef} → ${p.fulfillmentRef}`,
      bodyMd: `**Foretold (${p.prophecyRef}, ${p.written}):**\n"${p.prophecyText}"\n\n**Fulfilled (${p.fulfillmentRef}):**\n${p.fulfillmentText}\n\n*${p.insight}*`,
      kind: "testimony",
      mood: "reverent",
      intensity: 90,
      threadId: null,
      seekerId: null,
      tagsJson: JSON.stringify(["testimony", p.theme, "prophecy", "christ"]),
      createdAt: Date.now(),
    };
    await saveRelic(relic);
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title"><span className="glyph">✝</span> The Testimony</div>
        <div className="panel-sub">
          "Beginning with Moses and all the Prophets, He interpreted to them the things concerning Himself." — Luke 24:27
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, background: "linear-gradient(135deg, var(--ivory), var(--parchment))", borderColor: "var(--gold)" }}>
        <div className="row between" style={{ marginBottom: 8 }}>
          <h3 style={{ fontSize: "1.15rem" }}>✶ Prophecy of the Day</h3>
          <button className="btn btn-sm btn-gold" onClick={() => setDrawn(PROPHECIES[Math.floor(Math.random() * PROPHECIES.length)])}>
            ✦ Draw a Prophecy
          </button>
        </div>
        <ProphecyCardInline p={drawn ?? daily} />
      </div>

      <div className="row row-wrap" style={{ marginBottom: 18, gap: 8 }}>
        <button className={`chip ${theme === "all" ? "chip-gold" : ""}`} onClick={() => setTheme("all")}>✺ All</button>
        {PROPHECY_THEMES.map((t) => (
          <button key={t.id} className={`chip ${theme === t.id ? "chip-gold" : ""}`} onClick={() => setTheme(t.id)}>
            {t.glyph} {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-2">
        {list.map((p) => (
          <ProphecyCard key={p.id} p={p} onKeep={keep} />
        ))}
      </div>

      <div className="center serif" style={{ fontStyle: "italic", color: "var(--ink-soft)", marginTop: 30, fontSize: "1.05rem" }}>
        Over 300 prophecies, written across a thousand years, converging on one Man.
        <br />The odds of chance grow thin as the witnesses multiply. He is the Word the cards only dimly echo.
      </div>
    </div>
  );
}

function ProphecyCardInline({ p }: { p: Prophecy }) {
  const theme = PROPHECY_THEMES.find((t) => t.id === p.theme);
  return (
    <div>
      <div className="row" style={{ gap: 10, marginBottom: 8 }}>
        <span className="chip chip-gold">{theme?.glyph} {theme?.label}</span>
        <span className="mono muted" style={{ fontSize: "0.66rem" }}>{p.written}</span>
      </div>
      <div className="scripture-ref">Foretold · {p.prophecyRef}</div>
      <div className="scripture" style={{ margin: "4px 0 10px" }}>"{p.prophecyText}"</div>
      <div className="scripture-ref">Fulfilled · {p.fulfillmentRef}</div>
      <div className="scripture" style={{ margin: "4px 0 10px", color: "var(--ink)" }}>{p.fulfillmentText}</div>
      <div className="serif" style={{ fontStyle: "italic", color: "var(--velvet)" }}>{p.insight}</div>
    </div>
  );
}
