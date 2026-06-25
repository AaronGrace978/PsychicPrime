// ═══════════════════════════════════════════════════════════════
//  Tarot Card — a single drawn card, with a velvet-and-gold back
//  that flips to reveal its face.
// ═══════════════════════════════════════════════════════════════

import type { DrawnCard } from "../types";

export default function TarotCard({
  drawn,
  flipped,
  onClick,
  showPosition = true,
  delay = 0,
}: {
  drawn: DrawnCard;
  flipped: boolean;
  onClick?: () => void;
  showPosition?: boolean;
  delay?: number;
}) {
  const { card, reversed, position } = drawn;
  return (
    <div
      className={`tarot ${flipped ? "flipped" : ""}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", animation: `floatUp 0.5s ease ${delay}ms both` }}
      title={flipped ? `${card.name}${reversed ? " (reversed)" : ""}` : "A card awaits"}
    >
      <div className="tarot-inner">
        <div className="tarot-back">
          <div className="tarot-back-sigil">✝</div>
        </div>
        <div className={`tarot-face ${reversed ? "reversed" : ""}`}>
          <div className="tarot-num">
            {card.arcana === "major" ? toRoman(card.number) : card.element}
          </div>
          <div className="tarot-art">{card.glyph}</div>
          <div className="tarot-name">{card.name}</div>
          {reversed && <div className="tarot-rev-flag">⤬ REVERSED</div>}
          {showPosition && <div className="tarot-pos">{position}</div>}
        </div>
      </div>
    </div>
  );
}

function toRoman(n: number): string {
  if (n === 0) return "0";
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let r = "";
  for (const [v, s] of map) {
    while (n >= v) { r += s; n -= v; }
  }
  return r;
}
