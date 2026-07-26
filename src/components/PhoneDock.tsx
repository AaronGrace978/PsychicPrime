import { useStore } from "../store";
import type { ModuleId } from "../types";

const TABS: { id: ModuleId; label: string; glyph: string }[] = [
  { id: "chamber", label: "Chamber", glyph: "◈" },
  { id: "spreads", label: "Spreads", glyph: "✦" },
  { id: "oracle", label: "Oracle", glyph: "☿" },
  { id: "solomon", label: "Binding", glyph: "✶" },
  { id: "testimony", label: "Witness", glyph: "✝" },
  { id: "signals", label: "Signals", glyph: "◎" },
  { id: "relics", label: "Relics", glyph: "◇" },
  { id: "constellation", label: "Stars", glyph: "✧" },
  { id: "calibration", label: "Cal", glyph: "⊕" },
  { id: "seekers", label: "Seekers", glyph: "☉" },
  { id: "rule", label: "Rule", glyph: "⚖" },
  { id: "settings", label: "Gate", glyph: "⚙" },
];

/** Scrollable bottom dock for phones entering through The Gate. */
export default function PhoneDock() {
  const moduleId = useStore((s) => s.module);
  const setModule = useStore((s) => s.setModule);

  return (
    <nav className="phone-dock" aria-label="Sanctuary rooms">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`phone-dock-item ${moduleId === t.id ? "active" : ""}`}
          onClick={() => setModule(t.id)}
        >
          <span className="phone-dock-glyph">{t.glyph}</span>
          <span className="phone-dock-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
