// ═══════════════════════════════════════════════════════════════
//  Numerology — number as a contemplative lens (Pythagorean).
//  "You have numbered my wanderings." — Psalm 56:8
// ═══════════════════════════════════════════════════════════════

import type { Numerology } from "../types";

const LETTER_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

const LIFE_PATH_MEANING: Record<number, { title: string; text: string }> = {
  1: { title: "The Pioneer", text: "Called to lead, to begin, to stand alone when needed. Your road asks for courage and original action — and a guard against pride." },
  2: { title: "The Peacemaker", text: "Called to harmony, partnership, and gentle diplomacy. Your gift is the bridge; your test is to be seen without losing yourself." },
  3: { title: "The Voice", text: "Called to express, create, and uplift. Joy and word pour through you — steward them so they build rather than scatter." },
  4: { title: "The Builder", text: "Called to order, foundation, and faithful work. You make things that last; beware rigidity, and let grace soften the stone." },
  5: { title: "The Pilgrim", text: "Called to freedom, change, and experience. Your soul travels far — let your liberty serve love, not mere restlessness." },
  6: { title: "The Guardian", text: "Called to nurture, heal, and shoulder responsibility. You carry others well; remember you too may be carried." },
  7: { title: "The Seeker", text: "Called to contemplation, depth, and hidden truth. The desert and the lamp are yours — seek, and do not mistake solitude for hiding." },
  8: { title: "The Steward", text: "Called to mastery of the material — authority, provision, and power. Hold it as a trust; what you build, build for more than yourself." },
  9: { title: "The Compassionate", text: "Called to mercy, completion, and selfless love. You are here to give and release; let go gracefully, again and again." },
  11: { title: "The Illuminator (Master)", text: "A master vibration: spiritual insight meant to be shared. You sense what others miss — ground the vision, and let it bless." },
  22: { title: "The Master Builder", text: "A master vibration: vision made concrete on a great scale. You can build what outlasts you — for that, lean hard on humility." },
  33: { title: "The Master Teacher", text: "The rarest vibration: love teaching by example, the healer's healer. Pour out, but tend the wellspring within." },
};

function reduce(n: number, keepMaster = true): number {
  while (n > 9) {
    if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
    n = String(n).split("").reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

function sumLetters(name: string, filter?: (ch: string) => boolean): number {
  const total = name
    .toLowerCase()
    .split("")
    .filter((ch) => LETTER_VALUES[ch] !== undefined && (!filter || filter(ch)))
    .reduce((s, ch) => s + LETTER_VALUES[ch], 0);
  return reduce(total);
}

export function computeNumerology(birthDate: string, fullName: string): Numerology | null {
  if (!birthDate) return null;
  const match = birthDate.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, yy, mm, dd] = match;

  const digits = (yy + mm + dd).split("").map(Number);
  const lifePath = reduce(digits.reduce((a, b) => a + b, 0));

  const expression = fullName ? sumLetters(fullName) : 0;
  const soulUrge = fullName ? sumLetters(fullName, (ch) => VOWELS.has(ch)) : 0;

  const currentYear = new Date().getFullYear();
  const personalYear = reduce(
    reduce(Number(mm), false) + reduce(Number(dd), false) + reduce(currentYear, false),
    false
  );

  const meaning = LIFE_PATH_MEANING[lifePath] ?? LIFE_PATH_MEANING[1];

  return {
    lifePath,
    lifePathTitle: meaning.title,
    expression,
    soulUrge,
    personalYear,
    meaning: meaning.text,
  };
}

export const PERSONAL_YEAR_THEME: Record<number, string> = {
  1: "Planting — new beginnings, fresh seeds, bold first steps.",
  2: "Tending — patience, partnership, quiet development.",
  3: "Flowering — expression, joy, social bloom and creativity.",
  4: "Laboring — discipline, foundations, the faithful grind.",
  5: "Turning — change, freedom, unexpected doors.",
  6: "Caring — home, responsibility, love and duty.",
  7: "Withdrawing — reflection, study, inner work and rest.",
  8: "Harvesting — achievement, provision, the fruit of labor.",
  9: "Releasing — completion, letting go, making room.",
};
