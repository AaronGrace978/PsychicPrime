// ═══════════════════════════════════════════════════════════════
//  Sidebar — the nave of the Sanctuary; navigation among its rooms.
// ═══════════════════════════════════════════════════════════════

import { useStore } from "../store";
import type { ModuleId } from "../types";
import Sigil from "./Sigil";

interface NavDef { id: ModuleId; label: string; glyph: string; }

const SECTIONS: { title: string; items: NavDef[] }[] = [
  {
    title: "The Work",
    items: [
      { id: "chamber", label: "Chamber", glyph: "◈" },
      { id: "spreads", label: "Spreads", glyph: "✦" },
      { id: "oracle", label: "Oracle", glyph: "☿" },
      { id: "solomon", label: "The Binding", glyph: "✶" },
      { id: "testimony", label: "The Testimony", glyph: "✝" },
    ],
  },
  {
    title: "The Ledger",
    items: [
      { id: "signals", label: "Signal Lab", glyph: "◎" },
      { id: "relics", label: "Relics", glyph: "◇" },
      { id: "constellation", label: "Constellation", glyph: "✧" },
      { id: "calibration", label: "Calibration", glyph: "⊕" },
    ],
  },
  {
    title: "The Soul",
    items: [
      { id: "seekers", label: "Seekers", glyph: "☉" },
      { id: "rule", label: "The Rule", glyph: "⚖" },
      { id: "settings", label: "Settings", glyph: "⚙" },
    ],
  },
];

export default function Sidebar() {
  const moduleId = useStore((s) => s.module);
  const setModule = useStore((s) => s.setModule);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Sigil size={52} />
        <div className="brand-name">PsychicPrime</div>
        <div className="brand-tagline">through a glass, darkly</div>
      </div>

      <nav className="nav">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="nav-section">{section.title}</div>
            {section.items.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${moduleId === item.id ? "active" : ""}`}
                onClick={() => setModule(item.id)}
              >
                <span className="nav-glyph">{item.glyph}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">SOLI DEO GLORIA</div>
    </aside>
  );
}
