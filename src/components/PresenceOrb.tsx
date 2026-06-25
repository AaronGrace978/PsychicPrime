// ═══════════════════════════════════════════════════════════════
//  Presence Orb — the Sanctuary's heartbeat made visible.
// ═══════════════════════════════════════════════════════════════

import { useStore, type Presence } from "../store";

const LABELS: Record<Presence, string> = {
  attuned: "Attuned",
  reading: "Reading",
  holding: "Holding a thought",
  dreaming: "Dreaming",
  listening: "Listening",
};

export default function PresenceOrb({ showLabel = true }: { showLabel?: boolean }) {
  const presence = useStore((s) => s.presence);
  return (
    <div className="row" title={LABELS[presence]}>
      <div className="orb" data-state={presence} aria-label={`PsychicPrime is ${LABELS[presence].toLowerCase()}`}>
        <div className="orb-ring" />
        <div className="orb-core" />
      </div>
      {showLabel && <span className="mono" style={{ fontSize: "0.7rem", color: "var(--ink-soft)", letterSpacing: "0.1em" }}>{LABELS[presence].toUpperCase()}</span>}
    </div>
  );
}
