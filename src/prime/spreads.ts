// ═══════════════════════════════════════════════════════════════
//  Spreads — the geometry of a reading.
// ═══════════════════════════════════════════════════════════════

import type { SpreadDef } from "../types";

export const SPREADS: SpreadDef[] = [
  {
    id: "one",
    name: "The Single Light",
    description: "One card. A lamp for the present step.",
    positions: [{ label: "The Light", meaning: "What is given for this moment" }],
  },
  {
    id: "three",
    name: "Past · Present · Future",
    description: "The classic three — the arc of a matter through time.",
    positions: [
      { label: "Past", meaning: "The root the matter grew from" },
      { label: "Present", meaning: "Where you stand now" },
      { label: "Future", meaning: "The current you are moving into" },
    ],
  },
  {
    id: "mind-body-spirit",
    name: "Mind · Body · Spirit",
    description: "Three cards for the wholeness of the person.",
    positions: [
      { label: "Mind", meaning: "Your thoughts and clarity" },
      { label: "Body", meaning: "Your circumstances and vitality" },
      { label: "Spirit", meaning: "Your soul's deeper movement" },
    ],
  },
  {
    id: "cross",
    name: "The Discernment Cross",
    description: "Five cards in the shape of the Cross — a prayerful weighing of a decision.",
    positions: [
      { label: "The Center", meaning: "The heart of the matter" },
      { label: "Above", meaning: "What heaven offers — the higher invitation" },
      { label: "Below", meaning: "The foundation — what is truly beneath this" },
      { label: "Left", meaning: "What is passing away" },
      { label: "Right", meaning: "What is coming to be" },
    ],
  },
  {
    id: "celtic",
    name: "The Celtic Cross",
    description: "Ten cards — the deepest and most complete reading.",
    positions: [
      { label: "The Heart", meaning: "The present situation" },
      { label: "The Crossing", meaning: "The challenge that crosses it" },
      { label: "The Crown", meaning: "What is sought or known consciously" },
      { label: "The Root", meaning: "The hidden foundation beneath" },
      { label: "The Past", meaning: "What is receding" },
      { label: "The Future", meaning: "What approaches" },
      { label: "The Self", meaning: "How you meet this matter" },
      { label: "The House", meaning: "Your environment and others' influence" },
      { label: "Hopes & Fears", meaning: "What you long for and dread" },
      { label: "The Outcome", meaning: "Where the current leads, should it hold" },
    ],
  },
  {
    id: "year",
    name: "Wheel of the Year",
    description: "A card for each of the four seasons ahead.",
    positions: [
      { label: "Spring", meaning: "What awakens" },
      { label: "Summer", meaning: "What flourishes" },
      { label: "Autumn", meaning: "What is harvested or released" },
      { label: "Winter", meaning: "What rests and waits" },
    ],
  },
];

export function spreadById(id: string): SpreadDef {
  return SPREADS.find((s) => s.id === id) ?? SPREADS[0];
}
