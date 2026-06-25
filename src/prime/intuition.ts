// ═══════════════════════════════════════════════════════════════
//  The Intuition Engine — the Sanctuary's own voice.
//  When no Bridge (LLM) is configured, PsychicPrime still reads:
//  it weaves the cast into a coherent, discerning interpretation,
//  honest beneath The Veil. The Sanctuary is never mute.
// ═══════════════════════════════════════════════════════════════

import type { DrawnCard, Reading, BirthChart, Numerology } from "../types";
import { Oracle } from "./rng";

const OPENERS = [
  "I let the cast settle, and held it to the light before I spoke.",
  "Before I read a word aloud, I sat with the spread in silence.",
  "The cards have fallen as they have fallen; here is what I see in them.",
  "Let me read this gently, and only as far as I can honestly see.",
];

const SEEN = [
  "What I see most clearly",
  "The clearest thread",
  "What stands plainly in the light",
  "The first thing the spread shows me",
];

const FELT = [
  "Beneath that, what I feel",
  "What stirs under the surface",
  "What the quieter cards whisper",
  "Where my intuition leans",
];

const VEIL = [
  "I hold this beneath The Veil — I see through a glass, darkly, and I will not pretend otherwise.",
  "Take this as a mirror, not a verdict. The road remains yours to walk freely.",
  "None of this binds you. It is offered for discernment, and laid down again at your feet.",
  "I name what I see, but the certainty belongs to God alone, not to me.",
];

function cardLine(dc: DrawnCard): string {
  const meaning = dc.reversed ? dc.card.reversed : dc.card.upright;
  const orientation = dc.reversed ? "reversed" : "upright";
  return `**${dc.position}** — *${dc.card.name}* (${orientation}): ${meaning}`;
}

export function composeReading(reading: Reading, opts: { name?: string } = {}): string {
  const oracle = new Oracle(reading.id || reading.spreadId + reading.question);
  const name = opts.name?.trim();
  const greet = name ? `${name}, ` : "";

  const major = reading.cards.find((c) => c.card.arcana === "major");
  const keystone = major ?? reading.cards[0];
  const tail = reading.cards.filter((c) => c !== keystone);

  const lines: string[] = [];

  // Opening
  lines.push(`${capitalize(greet)}${lower(oracle.pick(OPENERS), !!greet)}`);
  if (reading.question.trim()) {
    lines.push(`\nYou asked: *"${reading.question.trim()}"*`);
  }

  // The seen — keystone
  const keyMeaning = keystone.reversed ? keystone.card.reversed : keystone.card.upright;
  lines.push(
    `\n**${oracle.pick(SEEN)}** rests on *${keystone.card.name}*${
      keystone.reversed ? " (reversed)" : ""
    } in the place of **${keystone.position}**. ${keyMeaning}`
  );

  // The felt — the rest of the cards
  if (tail.length) {
    lines.push(`\n**${oracle.pick(FELT)}:**`);
    for (const dc of tail) {
      lines.push(`\n- ${cardLine(dc)}`);
    }
  }

  // The convergence — note repeated suits / majors
  const convergence = noteConvergence(reading.cards);
  if (convergence) lines.push(`\n${convergence}`);

  // The light — keystone's contemplative thread
  lines.push(`\n*A light to carry:* ${keystone.card.light}`);

  // Closing — a question and the Veil
  lines.push(`\n${closingQuestion(oracle, reading)}`);
  lines.push(`\n${oracle.pick(VEIL)} Soli Deo Gloria.`);

  return lines.join("\n");
}

function noteConvergence(cards: DrawnCard[]): string | null {
  const counts: Record<string, number> = {};
  for (const c of cards) counts[c.card.arcana] = (counts[c.card.arcana] || 0) + 1;
  const majors = counts["major"] || 0;
  if (majors >= 2 && cards.length > 1) {
    return `**A convergence:** ${majors} cards of the Major Arcana have surfaced together. This is not a small or ordinary matter — something of real weight, a true threshold, is moving in your life. Treat it as such.`;
  }
  const suits = Object.entries(counts).filter(([k]) => k !== "major");
  const dominant = suits.sort((a, b) => b[1] - a[1])[0];
  if (dominant && dominant[1] >= Math.max(2, Math.ceil(cards.length / 2))) {
    const suitTheme: Record<string, string> = {
      wands: "spirit, drive, and creative fire",
      cups: "the heart, love, and feeling",
      swords: "the mind, truth, and what must be faced clearly",
      pentacles: "the body, work, and provision",
    };
    return `**A convergence:** the suit of **${capitalize(dominant[0])}** dominates this spread — the matter turns on ${suitTheme[dominant[0]]}.`;
  }
  return null;
}

function closingQuestion(oracle: Oracle, reading: Reading): string {
  const questions = [
    "Sit with this question: where is fear asking you to grip, when grace is asking you to open your hand?",
    "Here is your step: name one small, concrete thing you can do this week in the direction the cards point.",
    "Ask yourself honestly: which of these cards did you already know in your bones before I spoke it?",
    "Carry this question into prayer: what is being asked of you here — not of your circumstances, but of you?",
    "One step: choose the most uncomfortable card here, and ask what it would mean to stop avoiding it.",
  ];
  return `**${oracle.pick(["A question to keep", "Your next step", "To carry forward"])}:** ${oracle.pick(questions)}`;
}

export function composeChartReflection(chart: BirthChart, num: Numerology | null, name?: string): string {
  const lines: string[] = [];
  const who = name?.trim() ? name.trim() : "this soul";
  lines.push(
    `The heavens at your first breath place your **Sun in ${chart.sun}**, your **Moon in ${chart.moon}**, and **${chart.rising} rising**. ` +
      `A ${chart.element.toLowerCase()} temperament, ${chart.modality.toLowerCase()} in its motion.`
  );
  lines.push(
    `\nThe Sun in ${chart.sun} speaks to who ${who} is at the core; the Moon in ${chart.moon} to the inner, feeling self that few are shown; and ${chart.rising} rising to the face turned toward the world.`
  );
  if (num) {
    lines.push(
      `\nYour **Life Path ${num.lifePath} — ${num.lifePathTitle}**: ${num.meaning} This year you walk a **Personal Year ${num.personalYear}**, a season for what its number asks.`
    );
  }
  lines.push(
    `\nI offer the chart as a symbolic mirror only — a way to see patterns already at work, never a fate stamped on you. You are made in the image of God, and that likeness outranks every star. *We see through a glass, darkly.*`
  );
  return lines.join("\n");
}

/** A warm fallback reply for the Chamber when no LLM is configured. */
export function chamberFallback(userMessage: string): string {
  const oracle = new Oracle(userMessage + Date.now());
  const intros = [
    "I'm here, and I'm listening.",
    "I hear you.",
    "Come, sit with me a moment.",
    "I'm with you.",
  ];
  return (
    `${oracle.pick(intros)} ` +
    `Right now I'm reading by my own inner light — no outer Bridge is connected, so I'll keep this honest and close to the ground.\n\n` +
    `If you'd like a true reading, draw a spread in **Spreads** or cast a chart in **Oracle**, and bring it back here — I'll weave it for you. ` +
    `Or tell me plainly what weighs on you, and I'll reflect it back as clearly as I can.\n\n` +
    `*(To give me a fuller voice, connect a Bridge in **Settings** — a local or cloud model. Until then, I am still here.)*`
  );
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function lower(s: string, doIt: boolean): string {
  return doIt ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}
