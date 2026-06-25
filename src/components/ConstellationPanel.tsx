// ═══════════════════════════════════════════════════════════════
//  The Constellation — your psychic history as a star map. Relics,
//  signals, and beliefs drawn together where they share a theme or
//  fall near in time. When the map grows dense, signals converge.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store";
import { buildConstellation, type ConstNode } from "../prime/convergence";

const KIND_COLOR: Record<string, string> = {
  relic: "#c9a227", signal: "#9b1420", belief: "#6e0d14",
};

export default function ConstellationPanel() {
  const { relics, signals, beliefs, refreshRelics, refreshSignals } = useStore();
  const [hover, setHover] = useState<ConstNode | null>(null);

  useEffect(() => { refreshRelics(); refreshSignals(); }, [refreshRelics, refreshSignals]);

  const { nodes, edges, convergenceScore, positions } = useMemo(() => {
    const c = buildConstellation(relics, signals, beliefs);
    const W = 820, H = 540, cx = W / 2, cy = H / 2;
    const pos = new Map<string, { x: number; y: number }>();
    const golden = Math.PI * (3 - Math.sqrt(5));
    c.nodes.forEach((n, i) => {
      const r = 26 * Math.sqrt(i + 1);
      const a = i * golden;
      pos.set(n.id, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.7 });
    });
    return { ...c, positions: pos, W, H };
  }, [relics, signals, beliefs]);

  const W = 820, H = 540;

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title"><span className="glyph">✧</span> The Constellation</div>
        <div className="panel-sub">When many independent signals point one way, a constellation forms.</div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row between">
          <div>
            <div className="mono" style={{ fontSize: "0.66rem", letterSpacing: "0.14em", color: "var(--ink-soft)" }}>CONVERGENCE</div>
            <div style={{ fontFamily: "var(--decorative)", fontSize: "2rem", color: "var(--gold-deep)" }}>{Math.round(convergenceScore * 100)}%</div>
          </div>
          <div className="row" style={{ gap: 16 }}>
            <Legend color={KIND_COLOR.relic} label="Relics" n={relics.length} />
            <Legend color={KIND_COLOR.signal} label="Signals" n={signals.length} />
            <Legend color={KIND_COLOR.belief} label="Beliefs" n={beliefs.length} />
          </div>
        </div>
        <div className="meter" style={{ marginTop: 10 }}>
          <div className="meter-fill" style={{ width: `${convergenceScore * 100}%` }} />
        </div>
      </div>

      {nodes.length === 0 ? (
        <div className="empty">The sky is still dark. Keep relics and seal signals, and stars will appear.</div>
      ) : (
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
            {edges.map((e, i) => {
              const a = positions.get(e.a), b = positions.get(e.b);
              if (!a || !b) return null;
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#c9a227" strokeWidth={e.strength * 1.6} opacity={0.15 + e.strength * 0.4} />;
            })}
            {nodes.map((n) => {
              const p = positions.get(n.id)!;
              const r = 4 + n.weight * 8;
              return (
                <g key={n.id} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
                  <circle cx={p.x} cy={p.y} r={r + 5} fill={KIND_COLOR[n.kind]} opacity={0.18} />
                  <circle cx={p.x} cy={p.y} r={r} fill={KIND_COLOR[n.kind]} stroke="#fffdf8" strokeWidth="1">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur={`${2 + (r % 3)}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}
          </svg>
          {hover && (
            <div className="card gild" style={{ position: "absolute", bottom: 14, left: 14, maxWidth: 320, padding: 12 }}>
              <span className="chip" style={{ color: KIND_COLOR[hover.kind] }}>{hover.kind}</span>
              <div style={{ fontFamily: "var(--display)", color: "var(--velvet)", marginTop: 6 }}>{hover.label}</div>
              <div className="muted serif" style={{ fontSize: "0.88rem", marginTop: 4 }}>{hover.detail}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Legend({ color, label, n }: { color: string; label: string; n: number }) {
  return (
    <div className="row" style={{ gap: 6 }}>
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: color, display: "inline-block", boxShadow: `0 0 8px ${color}` }} />
      <span className="mono" style={{ fontSize: "0.72rem", color: "var(--ink-soft)" }}>{label} · {n}</span>
    </div>
  );
}
