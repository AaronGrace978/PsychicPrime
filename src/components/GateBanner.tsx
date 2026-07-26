import { sanctuary } from "../lib/sanctuary";

/** Subtle strip when the Sanctuary is entered through The Gate (phone / LAN). */
export default function GateBanner() {
  if (!sanctuary.isGate) return null;
  return (
    <div className="gate-banner" role="status">
      <span className="gate-banner-sigil">✧</span>
      <span>
        <strong>The Gate</strong> — Sanctuary relay · phone &amp; LAN · local-first
      </span>
    </div>
  );
}
