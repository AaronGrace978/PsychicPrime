// ═══════════════════════════════════════════════════════════════
//  The Deck — 78 cards, read as a contemplative language.
//  Mirrors for the soul, never commands over it. Each card carries
//  a "light": a thread back toward providence and the Cross.
// ═══════════════════════════════════════════════════════════════

import type { Arcana, TarotCardDef, DrawnCard, SpreadDef } from "../types";
import { Oracle } from "./rng";

export const MAJOR_ARCANA: TarotCardDef[] = [
  {
    id: "major-0", name: "The Fool", arcana: "major", number: 0, glyph: "✺",
    keywords: ["beginnings", "trust", "leap", "innocence"],
    upright: "A sacred beginning. You stand at the edge with empty hands and an open heart — called to trust the path before it is proven.",
    reversed: "Hesitation, or a leap taken without counsel. Recklessness masquerading as faith. Look again before you step.",
    light: "Unless you become as little children — innocence is not naïveté but trust in the One who holds the cliff's edge.",
    element: "Air",
  },
  {
    id: "major-1", name: "The Magician", arcana: "major", number: 1, glyph: "☿",
    keywords: ["will", "power", "manifestation", "focus"],
    upright: "All the tools are already in your hand — earth, water, air, and fire. Concentrated will becomes creation. As above, so below.",
    reversed: "Scattered power, manipulation, or talent left unused. The gift idles for want of focus.",
    light: "Every good and perfect gift comes from above. Your power is real, and it is lent — steward it.",
    element: "Mercury",
  },
  {
    id: "major-2", name: "The High Priestess", arcana: "major", number: 2, glyph: "☽",
    keywords: ["intuition", "mystery", "the hidden", "stillness"],
    upright: "Between the pillars sits the keeper of what is not yet spoken. Be still. The answer rises from silence, not from noise.",
    reversed: "Secrets that fester, intuition ignored, or surface noise drowning the inner voice.",
    light: "Mary kept all these things, pondering them in her heart. Some truths are guarded before they are given.",
    element: "Moon",
  },
  {
    id: "major-3", name: "The Empress", arcana: "major", number: 3, glyph: "♀",
    keywords: ["abundance", "nurture", "creation", "fertility"],
    upright: "Life overflows — the harvest, the garden, the mother's tending. What you nurture now will bear fruit beyond measure.",
    reversed: "Creative block, smothering, or neglect of what needs tending. The garden waits.",
    light: "Consider the lilies — abundance is not earned by anxiety but received by trust.",
    element: "Venus",
  },
  {
    id: "major-4", name: "The Emperor", arcana: "major", number: 4, glyph: "♈",
    keywords: ["authority", "structure", "protection", "order"],
    upright: "The throne of order. Boundaries, discipline, and a steady hand bring lasting protection to what you love.",
    reversed: "Rigidity, domination, or order collapsed into control. Authority without mercy hardens.",
    light: "He has established a throne for judgment — true authority bends the knee before a higher King.",
    element: "Aries",
  },
  {
    id: "major-5", name: "The Hierophant", arcana: "major", number: 5, glyph: "♉",
    keywords: ["tradition", "teaching", "covenant", "the sacred"],
    upright: "The keeper of sacred tradition. Seek the wisdom handed down; there is a road already walked by saints before you.",
    reversed: "Hollow ritual, dogma without spirit, or rebellion that throws out the gold with the dross.",
    light: "Stand at the crossroads and ask for the ancient paths — where the good way is, and walk in it.",
    element: "Taurus",
  },
  {
    id: "major-6", name: "The Lovers", arcana: "major", number: 6, glyph: "♊",
    keywords: ["union", "choice", "covenant", "alignment"],
    upright: "A union blessed, or a choice that defines you. Two become one, or the heart chooses its true allegiance.",
    reversed: "Discord, temptation, or a value-misaligned choice. The heart is divided against itself.",
    light: "Choose this day whom you will serve. Love is a covenant, not merely a feeling.",
    element: "Gemini",
  },
  {
    id: "major-7", name: "The Chariot", arcana: "major", number: 7, glyph: "♋",
    keywords: ["victory", "willpower", "drive", "mastery"],
    upright: "Opposing forces yoked by will. You move forward and you prevail — not by ease, but by holding the reins steady.",
    reversed: "Loss of direction, forces pulling apart, or aggression without aim.",
    light: "I have fought the good fight, I have finished the race — victory belongs to the disciplined heart.",
    element: "Cancer",
  },
  {
    id: "major-8", name: "Strength", arcana: "major", number: 8, glyph: "♌",
    keywords: ["courage", "gentleness", "patience", "inner power"],
    upright: "The lion is tamed not by force but by gentle, patient courage. Your softness is your strength.",
    reversed: "Self-doubt, raw force, or strength turned to harshness. The gentleness is missing.",
    light: "My strength is made perfect in weakness — the meek inherit what the violent cannot seize.",
    element: "Leo",
  },
  {
    id: "major-9", name: "The Hermit", arcana: "major", number: 9, glyph: "♍",
    keywords: ["solitude", "seeking", "inner light", "guidance"],
    upright: "Withdraw and lift the lantern. The answer you seek is found in solitude, in the wilderness, away from the crowd.",
    reversed: "Isolation that wounds, or withdrawal used to hide. Loneliness mistaken for retreat.",
    light: "He withdrew to lonely places and prayed. The desert is where the voice grows clear.",
    element: "Virgo",
  },
  {
    id: "major-10", name: "Wheel of Fortune", arcana: "major", number: 10, glyph: "♃",
    keywords: ["cycles", "turning", "providence", "change"],
    upright: "The wheel turns. A season changes in your favor — but cling to the still center, not the spinning rim.",
    reversed: "Resistance to change, a downturn, or feeling at the mercy of fate.",
    light: "To everything there is a season. The wheel turns, but the hand at the hub does not.",
    element: "Jupiter",
  },
  {
    id: "major-11", name: "Justice", arcana: "major", number: 11, glyph: "♎",
    keywords: ["truth", "fairness", "accountability", "balance"],
    upright: "The scales are honest. Truth comes to light, cause meets effect, and what is owed is settled rightly.",
    reversed: "Injustice, evasion, or a refusal to face the truth of one's part.",
    light: "Let justice roll on like a river — but mercy and truth have met, and at the Cross they kissed.",
    element: "Libra",
  },
  {
    id: "major-12", name: "The Hanged Man", arcana: "major", number: 12, glyph: "♆",
    keywords: ["surrender", "new perspective", "sacrifice", "pause"],
    upright: "Suspended, you see the world inverted — and rightly. Surrender now reveals what striving could not.",
    reversed: "Stalling, martyrdom, or resistance to a needed letting-go.",
    light: "Unless a grain of wheat falls and dies, it remains alone. Surrender is the hidden door.",
    element: "Water",
  },
  {
    id: "major-13", name: "Death", arcana: "major", number: 13, glyph: "♏",
    keywords: ["ending", "transformation", "release", "rebirth"],
    upright: "Not the end you fear, but the end that frees. Something must die so that something truer can be born.",
    reversed: "Clinging to what is already gone; transformation resisted and so prolonged.",
    light: "Death is swallowed up in victory — every ending in Him is a doorway, never a wall.",
    element: "Scorpio",
  },
  {
    id: "major-14", name: "Temperance", arcana: "major", number: 14, glyph: "♐",
    keywords: ["balance", "patience", "healing", "moderation"],
    upright: "The angel pours between cups — the middle way, the patient blending of opposites into something whole.",
    reversed: "Excess, imbalance, or impatience that spills what was being healed.",
    light: "Let your moderation be known to all. The healing is in the patient pouring, not the rushing.",
    element: "Sagittarius",
  },
  {
    id: "major-15", name: "The Devil", arcana: "major", number: 15, glyph: "♑",
    keywords: ["bondage", "shadow", "attachment", "temptation"],
    upright: "The chains are loose — you can lift them off. Name the attachment that binds you: the appetite, the lie, the fear.",
    reversed: "Breaking free, releasing a vice, or refusing the bargain at last.",
    light: "You will know the truth, and the truth will set you free. The chains were never locked.",
    element: "Capricorn",
  },
  {
    id: "major-16", name: "The Tower", arcana: "major", number: 16, glyph: "♂",
    keywords: ["upheaval", "revelation", "collapse", "awakening"],
    upright: "What was built on sand is struck by lightning. Sudden, jarring — but the false structure had to fall.",
    reversed: "Disaster narrowly avoided, or clinging to ruins out of fear of the open sky.",
    light: "The rains fell, the floods came — only the house built on rock still stands. Let the rest fall.",
    element: "Mars",
  },
  {
    id: "major-17", name: "The Star", arcana: "major", number: 17, glyph: "♒",
    keywords: ["hope", "renewal", "faith", "guidance"],
    upright: "After the Tower, the calm night and the guiding star. Hope returns, gentle and clear. You are being led.",
    reversed: "Discouragement, faith grown dim, or hope deferred that makes the heart sick.",
    light: "We have seen His star and have come to worship. The star still leads the seeking heart home.",
    element: "Aquarius",
  },
  {
    id: "major-18", name: "The Moon", arcana: "major", number: 18, glyph: "♓",
    keywords: ["mystery", "illusion", "the unconscious", "dreams"],
    upright: "The path runs through fog and dream. Not everything is as it appears — walk by faith, and let the hidden surface in time.",
    reversed: "Confusion lifting, deception revealed, or fear losing its grip.",
    light: "Now we see through a glass, darkly — but then face to face. The fog is not forever.",
    element: "Pisces",
  },
  {
    id: "major-19", name: "The Sun", arcana: "major", number: 19, glyph: "☉",
    keywords: ["joy", "vitality", "clarity", "blessing"],
    upright: "Full daylight. Joy without shadow, clarity without doubt, the warmth of being seen and beloved. Flourish.",
    reversed: "A cloud over the joy, or success that feels strangely hollow. The light is still there.",
    light: "The Sun of Righteousness will rise with healing in its wings. Step into the light and be warmed.",
    element: "Sun",
  },
  {
    id: "major-20", name: "Judgement", arcana: "major", number: 20, glyph: "♇",
    keywords: ["awakening", "calling", "reckoning", "rebirth"],
    upright: "The trumpet sounds and the dead rise. A calling you cannot ignore; a chance to answer with your whole life.",
    reversed: "Self-condemnation, a calling refused, or fear of being weighed.",
    light: "The trumpet shall sound and we shall be changed. You are called by name — rise.",
    element: "Fire",
  },
  {
    id: "major-21", name: "The World", arcana: "major", number: 21, glyph: "♄",
    keywords: ["completion", "wholeness", "fulfillment", "homecoming"],
    upright: "The circle is closed, the work fulfilled. Integration, accomplishment, and the threshold of a greater whole.",
    reversed: "A loose end, a cycle nearly but not quite complete. One more step remains.",
    light: "It is finished. Wholeness is not endless striving but arriving — and being welcomed home.",
    element: "Saturn",
  },
];

// ─── Minor Arcana, composed from suit + rank archetypes ──────

const SUITS: {
  arcana: Arcana;
  name: string;
  glyph: string;
  element: string;
  domain: string;
  light: string;
}[] = [
  { arcana: "wands", name: "Wands", glyph: "🜂", element: "Fire", domain: "spirit, will, creativity, and passion", light: "the fire that does not consume — zeal kindled and kept holy" },
  { arcana: "cups", name: "Cups", glyph: "🜄", element: "Water", domain: "the heart, love, relationship, and feeling", light: "the cup that overflows — love poured out and received" },
  { arcana: "swords", name: "Swords", glyph: "🜁", element: "Air", domain: "the mind, truth, conflict, and clarity", light: "the sword of the Spirit, which is the word of truth" },
  { arcana: "pentacles", name: "Pentacles", glyph: "🜃", element: "Earth", domain: "the body, work, provision, and the material", light: "daily bread — provision sought one day at a time" },
];

const RANKS: { n: number; name: string; up: string; rev: string; key: string[] }[] = [
  { n: 1, name: "Ace", up: "a pure new gift of {domain} — a seed offered, full of promise", rev: "the gift delayed or refused; the seed left unplanted", key: ["beginning", "gift", "potential"] },
  { n: 2, name: "Two", up: "a choice or partnership within {domain}; two forces seeking balance", rev: "indecision or imbalance; the scales tipping unsteadily", key: ["choice", "balance", "duality"] },
  { n: 3, name: "Three", up: "early growth and collaboration in {domain}; the first fruits appear", rev: "stalled growth, or effort not yet bearing fruit", key: ["growth", "creation", "fellowship"] },
  { n: 4, name: "Four", up: "stability and rest within {domain}; a foundation to stand on", rev: "stagnation, or grasping too tightly to security", key: ["stability", "rest", "foundation"] },
  { n: 5, name: "Five", up: "conflict, loss, or testing in {domain}; a hard season that refines", rev: "the conflict easing, or wounds beginning to heal", key: ["conflict", "loss", "testing"] },
  { n: 6, name: "Six", up: "harmony and passage in {domain}; help given or received, a turning toward grace", rev: "imbalance in giving, or a passage stalled", key: ["harmony", "passage", "generosity"] },
  { n: 7, name: "Seven", up: "perseverance and challenge in {domain}; holding ground that costs you something", rev: "giving up too soon, or stubbornness past its season", key: ["perseverance", "challenge", "patience"] },
  { n: 8, name: "Eight", up: "swift movement and mastery in {domain}; momentum gathering", rev: "scattered effort or movement in the wrong direction", key: ["movement", "mastery", "momentum"] },
  { n: 9, name: "Nine", up: "near-fruition and intensity in {domain}; you are close, hold on", rev: "anxiety, overwhelm, or guarding fruit too jealously", key: ["fruition", "intensity", "resilience"] },
  { n: 10, name: "Ten", up: "fullness and completion in {domain}; a cycle brought to its end, for better or for the burden it has become", rev: "an ending resisted, or a weight that should be set down", key: ["completion", "fullness", "culmination"] },
];

const COURT: { name: string; up: string; rev: string; key: string[] }[] = [
  { name: "Page", up: "a student and messenger of {domain}; curiosity, news, and fresh beginnings", rev: "immaturity, or a message ignored", key: ["student", "message", "curiosity"] },
  { name: "Knight", up: "the pursuer of {domain}; bold action and single-minded motion", rev: "haste, recklessness, or zeal without wisdom", key: ["action", "pursuit", "zeal"] },
  { name: "Queen", up: "the inward master of {domain}; one who nurtures and embodies its depths", rev: "depleted giving, or mastery turned inward to brooding", key: ["nurture", "depth", "mastery"] },
  { name: "King", up: "the outward master of {domain}; mature authority, steadiness, and command", rev: "control without warmth, or authority misused", key: ["authority", "maturity", "command"] },
];

function suitGlyphRank(n: number): string {
  const numerals = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return numerals[n] ?? String(n);
}

function buildMinor(): TarotCardDef[] {
  const cards: TarotCardDef[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `${suit.arcana}-${rank.n}`,
        name: `${rank.name} of ${suit.name}`,
        arcana: suit.arcana,
        number: rank.n,
        glyph: suit.glyph,
        element: suit.element,
        keywords: rank.key,
        upright: capitalize(rank.up.replace("{domain}", suit.domain)) + ".",
        reversed: capitalize(rank.rev.replace("{domain}", suit.domain)) + ".",
        light: capitalize(suit.light) + ".",
      });
    }
    COURT.forEach((c, i) => {
      cards.push({
        id: `${suit.arcana}-court-${i}`,
        name: `${c.name} of ${suit.name}`,
        arcana: suit.arcana,
        number: 11 + i,
        glyph: suit.glyph,
        element: suit.element,
        keywords: c.key,
        upright: capitalize(c.up.replace("{domain}", suit.domain)) + ".",
        reversed: capitalize(c.rev.replace("{domain}", suit.domain)) + ".",
        light: capitalize(suit.light) + ".",
      });
    });
  }
  return cards;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const MINOR_ARCANA: TarotCardDef[] = buildMinor();
export const FULL_DECK: TarotCardDef[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export function cardById(id: string): TarotCardDef | undefined {
  return FULL_DECK.find((c) => c.id === id);
}

/** Draw cards for a spread, seeded for reproducibility. */
export function drawForSpread(spread: SpreadDef, seed: string): DrawnCard[] {
  const oracle = new Oracle(seed);
  const shuffled = oracle.shuffle(FULL_DECK);
  return spread.positions.map((pos, i) => ({
    card: shuffled[i % shuffled.length],
    reversed: oracle.bool(0.32),
    position: pos.label,
    positionMeaning: pos.meaning,
  }));
}

/** A single card pull (daily card / quick guidance). */
export function pullOne(seed: string): DrawnCard {
  const oracle = new Oracle(seed);
  const card = oracle.pick(FULL_DECK);
  return {
    card,
    reversed: oracle.bool(0.32),
    position: "The Card",
    positionMeaning: "What is given for this moment",
  };
}
