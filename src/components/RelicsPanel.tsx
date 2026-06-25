// ═══════════════════════════════════════════════════════════════
//  Relics — the reliquary. Readings, testimonies, and sacred
//  moments, kept and searchable.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useStore } from "../store";
import { sanctuary } from "../lib/sanctuary";
import type { Relic } from "../types";
import Prose from "./Prose";

const KIND_GLYPH: Record<string, string> = {
  reading: "✦", testimony: "✝", synchronicity: "✧", dream: "☽", moment: "◇",
};

export default function RelicsPanel() {
  const { relics, refreshRelics, removeRelic } = useStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Relic[] | null>(null);
  const [open, setOpen] = useState<Relic | null>(null);

  useEffect(() => { refreshRelics(); }, [refreshRelics]);

  async function search(q: string) {
    setQuery(q);
    if (!q.trim()) { setResults(null); return; }
    setResults(await sanctuary.relics.search(q, 40));
  }

  const list = results ?? relics;

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title"><span className="glyph">◇</span> Relics</div>
        <div className="panel-sub">"Mary kept all these things, pondering them in her heart." — Luke 2:19</div>
      </div>

      <div className="row" style={{ marginBottom: 18 }}>
        <input className="input" placeholder="Search the reliquary…" value={query} onChange={(e) => search(e.target.value)} />
        {query && <button className="btn btn-ghost" onClick={() => search("")}>Clear</button>}
      </div>

      {list.length === 0 && <div className="empty">No relics yet. Keep a reading, a chart, or a testimony, and it will rest here.</div>}

      <div className="grid grid-auto">
        {list.map((r) => (
          <div key={r.id} className="card gild" style={{ cursor: "pointer" }} onClick={() => setOpen(r)}>
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="chip chip-gold">{KIND_GLYPH[r.kind] ?? "◇"} {r.kind}</span>
              <span className="mono muted" style={{ fontSize: "0.64rem" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            <h3 style={{ fontSize: "1.05rem", marginBottom: 6 }}>{r.title}</h3>
            <div className="serif muted" style={{ fontSize: "0.92rem", maxHeight: 66, overflow: "hidden" }}>
              {r.bodyMd.replace(/[*#>]/g, "").slice(0, 130)}…
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div
          onClick={() => setOpen(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(44,5,9,0.55)", backdropFilter: "blur(6px)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", padding: 30 }}
        >
          <div className="card gild" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680, maxHeight: "82vh", overflow: "auto", width: "100%" }}>
            <div className="row between" style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: "1.4rem" }}>{open.title}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(null)}>✕</button>
            </div>
            <div className="bubble oracle" style={{ maxWidth: "100%" }}><Prose text={open.bodyMd} /></div>
            <div className="row between" style={{ marginTop: 14 }}>
              <span className="mono muted" style={{ fontSize: "0.7rem" }}>{new Date(open.createdAt).toLocaleString()}</span>
              <button className="btn btn-sm btn-ghost" onClick={() => { if (confirm("Release this relic forever?")) { removeRelic(open.id); setOpen(null); } }}>Release</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
