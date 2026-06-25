// ═══════════════════════════════════════════════════════════════
//  TopBar — title, the Self/Seeker veil, presence, and the Bridge.
// ═══════════════════════════════════════════════════════════════

import { useStore } from "../store";
import type { ModuleId } from "../types";
import PresenceOrb from "./PresenceOrb";

const TITLES: Record<ModuleId, { title: string; sub: string }> = {
  chamber: { title: "The Chamber", sub: "where the reading is spoken" },
  spreads: { title: "Spreads", sub: "the cards, read as a language of the soul" },
  oracle: { title: "The Oracle", sub: "the heavens and the numbers as a symbolic clock" },
  solomon: { title: "The Binding", sub: "seventy-two offices of sight, bound under Christ" },
  testimony: { title: "The Testimony", sub: "He was foretold, and He came" },
  signals: { title: "Signal Lab", sub: "impressions, recorded before their outcome" },
  relics: { title: "Relics", sub: "sacred moments, kept" },
  constellation: { title: "The Constellation", sub: "when many signals point one way" },
  calibration: { title: "Calibration", sub: "the honest ledger of hits and misses" },
  seekers: { title: "Seekers", sub: "the souls you read for" },
  rule: { title: "The Rule", sub: "the conscience of the Sanctuary" },
  settings: { title: "Settings", sub: "the Bridge, the voice, and sovereignty" },
};

export default function TopBar() {
  const moduleId = useStore((s) => s.module);
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const seekers = useStore((s) => s.seekers);
  const activeSeekerId = useStore((s) => s.activeSeekerId);
  const setActiveSeeker = useStore((s) => s.setActiveSeeker);
  const bridgeStatus = useStore((s) => s.bridgeStatus);

  const t = TITLES[moduleId];

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{t.title}</div>
        <div className="topbar-sub">{t.sub}</div>
      </div>

      <div className="topbar-spacer" />

      {mode === "seeker" && (
        <select
          className="select"
          style={{ width: "auto", minWidth: 160 }}
          value={activeSeekerId ?? ""}
          onChange={(e) => setActiveSeeker(e.target.value || null)}
        >
          <option value="">— choose a seeker —</option>
          {seekers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}

      <div className="mode-toggle" title="Self mode is for you; Seeker mode is for those you read for.">
        <button className={mode === "self" ? "active" : ""} onClick={() => setMode("self")}>Self</button>
        <button className={mode === "seeker" ? "active" : ""} onClick={() => setMode("seeker")}>Seeker</button>
      </div>

      <div
        className="chip"
        title={`The Bridge is ${bridgeStatus}`}
        style={{
          background: bridgeStatus === "online" ? "rgba(47,125,79,0.16)" : "var(--parchment)",
          color: bridgeStatus === "online" ? "#1f6b3f" : "var(--ink-soft)",
        }}
      >
        <span style={{ fontSize: "0.6rem" }}>●</span>
        {bridgeStatus === "online" ? "Bridge" : "Inner light"}
      </div>

      <PresenceOrb showLabel={false} />
    </header>
  );
}
