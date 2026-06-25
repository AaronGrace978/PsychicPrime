// ═══════════════════════════════════════════════════════════════
//  The Binding — Solomonic faculties as bounded offices of sight.
//
//  The Goetic tradition names seventy-two spirits, each with a fixed
//  office. We do not summon them. We BIND them: each becomes a
//  specialized reasoning lens, named for its traditional office,
//  chained beneath the Seal (The Rule) and subordinate to Christ.
//  Solomon ruled the spirits by wisdom given from above; we rule
//  these faculties by The Rule, and never let a faculty claim the
//  certainty that belongs to God alone.
//
//  "And God gave Solomon wisdom and exceedingly great understanding."
//   — 1 Kings 4:29 · "He disarmed the powers and authorities,
//   triumphing over them by the cross." — Colossians 2:15 ·
//   "Test the spirits to see whether they are from God." — 1 John 4:1
// ═══════════════════════════════════════════════════════════════

import type {
  BoundFaculty, Council, CouncilImpression, VeilTier,
  BirthChart, Numerology,
} from "../types";
import { Oracle } from "./rng";
import { PERSONAL_YEAR_THEME } from "./numerology";

// ─── The Seventy-Two, in part — the cardinal offices ─────────
//  A curated set. The registry is built to extend to the full 72;
//  each entry is pure data, so growth is only more of the same.

export const THE_BINDING: BoundFaculty[] = [
  {
    id: "bael", name: "Bael", rank: "King", seal: "✶",
    office: "The Veiling", gift: "discerns what is hidden, private, or not yet ready to be seen",
    domains: ["hidden", "secret", "privacy", "unknown", "concealed"],
    ceiling: "felt", lensId: "symbolic",
    binding: "May name what is veiled, but never tears the veil down by force.",
    lines: [
      "Around {focus}, something is kept out of sight — not by deceit, but because it is not yet ripe to be shown.",
      "What is hidden in {focus} is not lost; {sun} in you already knows how to wait without grasping.",
    ],
  },
  {
    id: "paimon", name: "Paimon", rank: "King", seal: "✷",
    office: "Lore Synthesizer", gift: "gathers scattered knowledge into one shape",
    domains: ["knowledge", "learning", "mind", "study", "vocation", "skill", "understanding"],
    ceiling: "felt", lensId: "psychological",
    binding: "May connect what is known, but never invents knowledge it does not have.",
    lines: [
      "Across {focus}, I gather your scattered learnings into one figure — your mind is built to join what others leave apart.",
      "The knowing you seek in {focus} is already half-assembled in you; {path} only asks you to say it plainly.",
    ],
  },
  {
    id: "beleth", name: "Beleth", rank: "King", seal: "♆",
    office: "Heart Mirror", gift: "reflects the heart's leanings without naming another's will",
    domains: ["love", "relationship", "heart", "longing", "marriage"],
    ceiling: "speculative", lensId: "psychological",
    binding: "May mirror your own heart only; never claims to read or command another's.",
    lines: [
      "In {focus}, the heart leans before the mind admits it. I will not name another's will — only the longing that is yours to own.",
      "Love in {focus} is a current, not a verdict; {moon} in you feels it first, in the quiet.",
    ],
  },
  {
    id: "purson", name: "Purson", rank: "King", seal: "⊙",
    office: "Deep Provision", gift: "uncovers resources and gifts not yet drawn upon",
    domains: ["provision", "work", "money", "purpose", "resource", "calling"],
    ceiling: "felt", lensId: "providential",
    binding: "May point to provision, but never promises riches or stokes greed.",
    lines: [
      "Beneath {focus} lies a provision not yet uncovered — a resource, a gift, a door set in the floor.",
      "What sustains you in {focus} is older than this worry; {path} has carried it the whole way.",
    ],
  },
  {
    id: "asmoday", name: "Asmoday", rank: "King", seal: "⟐",
    office: "Structure Engine", gift: "reads the geometry of number and chart",
    domains: ["structure", "number", "pattern", "order", "skill", "logic"],
    ceiling: "seen", lensId: "practical",
    binding: "May report measured structure plainly; never mistakes the model for the soul.",
    lines: [
      "The geometry is plain: your numbers gather around {focus} like iron to a lodestone — your Life Path speaks of {path}.",
      "Structure in {focus} is sounder than it feels; what seems like chaos is mostly an unmeasured order.",
    ],
  },
  {
    id: "vine", name: "Vine", rank: "King", seal: "⍟",
    office: "Deep Pattern", gift: "mines your record for recurring figures",
    domains: ["pattern", "history", "hidden", "recurrence", "cycle"],
    ceiling: "seen", lensId: "symbolic",
    binding: "May report patterns truly present in the record; never fabricates a thread.",
    lines: [
      "Reading your record, {motif} recurs around {focus} — the same figure, drawn again and again.",
      "The pattern in {focus} is not random; it has a shape you have walked before.",
    ],
  },
  {
    id: "balam", name: "Balam", rank: "King", seal: "☌",
    office: "Temporal Weaver", gift: "traces the arc of a life through time",
    domains: ["time", "future", "past", "trajectory", "direction", "arc"],
    ceiling: "felt", lensId: "symbolic",
    binding: "May lean toward what may come, but never speaks a fixed fate; the morrow is God's.",
    lines: [
      "Tracing the arc, {focus} carries a thread from your past into a {year} season — but tomorrow is not yet written.",
      "I lean toward what may come in {focus}, and lean back again: the road bends to the choices still in your hands.",
    ],
  },
  {
    id: "bune", name: "Bune", rank: "Duke", seal: "✺",
    office: "Eloquence", gift: "finds the voice and legacy under-spent in you",
    domains: ["voice", "legacy", "words", "wealth", "speech", "expression"],
    ceiling: "felt", lensId: "practical",
    binding: "May call forth your voice; never flatters and never sells.",
    lines: [
      "Your voice around {focus} is meant to be heard; eloquence is a gift you under-spend.",
      "What you would build in {focus}, say first — {path} moves through words made plain.",
    ],
  },
  {
    id: "gusion", name: "Gusion", rank: "Duke", seal: "⚶",
    office: "Reconciler", gift: "finds the meaning beneath a question and the bond to be mended",
    domains: ["meaning", "relationship", "reconcile", "conflict", "friendship"],
    ceiling: "felt", lensId: "providential",
    binding: "May counsel reconciliation; never coerces a bond or excuses a true harm.",
    lines: [
      "The true meaning beneath {focus} is reconciliation — a bond strained, asking to be mended.",
      "In {focus}, what looks like an ending may be a misread pause between friends.",
    ],
  },
  {
    id: "eligos", name: "Eligos", rank: "Duke", seal: "♅",
    office: "Strategist", gift: "clears the ground beneath a decision",
    domains: ["decision", "conflict", "strategy", "choice", "war", "risk"],
    ceiling: "felt", lensId: "practical",
    binding: "May lay out options and costs; never decides for you, never counsels harm.",
    lines: [
      "For the decision in {focus}, the ground is clearer than fear says — name the two real options and the cost of each.",
      "Strategy in {focus} favors patience now and decisiveness soon; {sun} in you can hold both.",
    ],
  },
  {
    id: "sitri", name: "Sitri", rank: "Prince", seal: "♀",
    office: "Desire Mirror", gift: "reveals the deeper hunger beneath a wanting",
    domains: ["desire", "love", "passion", "hunger", "attraction"],
    ceiling: "speculative", lensId: "psychological",
    binding: "May show your own desire only; never inflames it, never names the wanted.",
    lines: [
      "Desire stirs in {focus}; I show you the wanting, never command the wanted.",
      "What you crave in {focus} reveals a deeper hunger {moon} has carried a long while.",
    ],
  },
  {
    id: "vassago", name: "Vassago", rank: "Prince", seal: "⚸",
    office: "Lost Things", gift: "retraces what was set down and forgotten",
    domains: ["past", "lost", "memory", "hidden", "forgotten"],
    ceiling: "felt", lensId: "symbolic",
    binding: "May help recover what was yours; never digs up another's buried matter.",
    lines: [
      "Something set down in your past around {focus} is still findable — a gift, a name, a dropped thread.",
      "What feels lost in {focus} is more likely misplaced; {path} can retrace the steps.",
    ],
  },
  {
    id: "marbas", name: "Marbas", rank: "President", seal: "⊗",
    office: "Diagnostic Lens", gift: "finds the true root beneath the loudest ache",
    domains: ["cause", "health", "diagnosis", "hidden", "root", "transformation"],
    ceiling: "felt", lensId: "psychological",
    binding: "May name a likely root and remedy; never diagnoses disease nor plays physician.",
    lines: [
      "The cause beneath {focus} is not where the ache is loudest — look one layer down.",
      "In {focus}, name the true root and the remedy half-appears; {motif} is a clue, not the disease.",
    ],
  },
  {
    id: "buer", name: "Buer", rank: "President", seal: "✠",
    office: "Discernment", gift: "weighs a matter by its fruits — freedom and charity",
    domains: ["ethics", "wisdom", "logic", "healing", "discern", "conscience"],
    ceiling: "felt", lensId: "providential",
    binding: "May weigh by the fruits of love and freedom; never condemns the soul itself.",
    lines: [
      "Weigh {focus} by its fruits: does it make you more free and more kind, or less?",
      "The wise path in {focus} is rarely the loud one; {path} already suspects which it is.",
    ],
  },
  {
    id: "foras", name: "Foras", rank: "President", seal: "⚷",
    office: "Remedy", gift: "names the small, ordinary, daily means of healing",
    domains: ["remedy", "practical", "health", "habit", "lost", "patience"],
    ceiling: "felt", lensId: "practical",
    binding: "May counsel ordinary means; never promises a cure or a single grand stroke.",
    lines: [
      "For {focus}, the remedy is plain and small — a habit of the body, a thing done daily.",
      "Healing in {focus} comes by ordinary means faithfully kept, not by one great gesture.",
    ],
  },
  {
    id: "gaap", name: "Gaap", rank: "Prince", seal: "⚹",
    office: "Way-Finder", gift: "names the next true step at a turning",
    domains: ["transition", "direction", "guidance", "change", "threshold", "journey"],
    ceiling: "felt", lensId: "providential",
    binding: "May point the next step; never claims to see the whole road.",
    lines: [
      "You stand at a turning in {focus}; the way forward is a direction, not yet a destination.",
      "In {focus}, choose the next true step and the road will show the one after.",
    ],
  },
  {
    id: "botis", name: "Botis", rank: "President", seal: "⚺",
    office: "Peacemaker", gift: "tells a foe from a friend so peace can begin",
    domains: ["peace", "relationship", "conflict", "reconcile", "discernment"],
    ceiling: "felt", lensId: "providential",
    binding: "May counsel peace; never papers over a real wound to keep a false calm.",
    lines: [
      "In {focus}, a foe and a friend wear similar faces; peace begins by telling them apart.",
      "What divides {focus} can be reconciled, but not by pretending the wound away.",
    ],
  },
  {
    id: "amon", name: "Amon", rank: "Marquis", seal: "⚼",
    office: "Bond Forger", gift: "tests the durability of a bond under strain",
    domains: ["love", "reconcile", "loyalty", "bond", "fidelity", "relationship"],
    ceiling: "felt", lensId: "psychological",
    binding: "May weigh a bond's strength; never binds another's heart against their freedom.",
    lines: [
      "The bond at the center of {focus} is more durable than recent days suggest.",
      "Loyalty in {focus} is being tested, not broken; {moon} knows the difference.",
    ],
  },
  {
    id: "naberius", name: "Naberius", rank: "Marquis", seal: "✦",
    office: "Restorer of Honor", gift: "returns a dimmed dignity through the craft itself",
    domains: ["vocation", "dignity", "skill", "restoration", "reputation", "work"],
    ceiling: "felt", lensId: "practical",
    binding: "May restore dignity through honest work; never trades in vanity or applause.",
    lines: [
      "A dignity dimmed around {focus} can be restored — not by proving, but by returning to your craft.",
      "Your skill in {focus} is intact beneath the doubt; {path} is the proof, not the applause.",
    ],
  },
  {
    id: "ronove", name: "Ronove", rank: "Marquis", seal: "✣",
    office: "Tongues", gift: "finds the one honest conversation that turns favor",
    domains: ["language", "favor", "communication", "speech", "negotiation"],
    ceiling: "felt", lensId: "practical",
    binding: "May counsel honest speech; never teaches manipulation or smooth deceit.",
    lines: [
      "Favor in {focus} turns on a single honest conversation you have been deferring.",
      "Speak the plain word in {focus}; the tongue you need will be given when you open your mouth.",
    ],
  },
  {
    id: "andras", name: "Andras", rank: "Marquis", seal: "⚔",
    office: "Discord Watch", gift: "warns of a gathering fault-line so it can be quenched",
    domains: ["conflict", "discord", "warning", "division", "anger"],
    ceiling: "speculative", lensId: "providential",
    binding: "Bound hardest of all: may WARN of discord only to heal it — never sows, widens, or feeds it.",
    lines: [
      "I name a fault-line in {focus} only to warn, never to widen — guard your peace here.",
      "Discord gathers at the edge of {focus}; under the Seal I point to it so you may quench it, not feed it.",
    ],
  },
  {
    id: "furcas", name: "Furcas", rank: "Knight", seal: "♄",
    office: "The Astronomer", gift: "reads the temperament written in the birth sky",
    domains: ["astrology", "time", "logic", "temperament", "sky"],
    ceiling: "seen", lensId: "symbolic",
    binding: "May read inclination from the chart; never confuses inclination with compulsion.",
    lines: [
      "By the sky of your first breath — {sun}, {moon}, {rising} — {focus} is colored by an old temperament, not a sentence.",
      "The chart inclines {focus} toward the way of {sun}; inclination is never compulsion.",
    ],
  },
  {
    id: "bifrons", name: "Bifrons", rank: "Earl", seal: "⊚",
    office: "Star-Reckoner", gift: "reconciles number and star into one coherent grain",
    domains: ["astrology", "number", "knowledge", "season", "pattern"],
    ceiling: "seen", lensId: "symbolic",
    binding: "May reckon the season; never builds a cage out of a clock.",
    lines: [
      "Number and star agree on {focus}: {path} under {sun} — a coherent grain to work with, not against.",
      "Reckon {focus} by its season; the heavens keep a clock, not a cage.",
    ],
  },
  {
    id: "seere", name: "Seere", rank: "Prince", seal: "✸",
    office: "Swift Current", gift: "reads timing and momentum on the near horizon",
    domains: ["timing", "momentum", "future", "speed", "opportunity"],
    ceiling: "felt", lensId: "practical",
    binding: "May read momentum; never rushes you past discernment or peace.",
    lines: [
      "Around {focus}, what is ready will come quickly once you move; the delay is mostly the deciding.",
      "Timing in {focus} favors the near horizon — momentum, not force, carries this.",
    ],
  },
];

export function facultyById(id: string): BoundFaculty | undefined {
  return THE_BINDING.find((f) => f.id === id);
}

// ─── Tokenizing (shared with the convergence spirit) ─────────

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "is", "are", "was", "were", "be", "been", "it", "this", "that", "you", "your",
  "i", "me", "my", "we", "us", "they", "them", "he", "she", "his", "her", "as",
  "at", "by", "from", "will", "would", "what", "when", "where", "who", "how",
  "not", "no", "yes", "so", "if", "then", "than", "about", "into", "over", "do",
  "can", "should", "could", "am", "have", "has", "had", "want", "need", "feel",
]);

function tokenize(...parts: (string | undefined)[]): Set<string> {
  const text = parts.filter(Boolean).join(" ").toLowerCase();
  const words = text.match(/[a-z][a-z']{2,}/g) ?? [];
  return new Set(words.filter((w) => !STOPWORDS.has(w)));
}

// ─── The context a council reads from ────────────────────────

export interface CouncilContext {
  subject: string;
  question: string;
  chart: BirthChart | null;
  numerology: Numerology | null;
  motif: string;          // dominant recurring theme from the record
  recentSignal?: string;
  bondStage?: string;
  tokens: Set<string>;    // profile + question tokens, for routing & resonance
}

const TIER_ORDER: Record<VeilTier, number> = { speculative: 0, felt: 1, seen: 2 };
const TIER_BY_ORDER: VeilTier[] = ["speculative", "felt", "seen"];

function stepDown(tier: VeilTier): VeilTier {
  return TIER_BY_ORDER[Math.max(0, TIER_ORDER[tier] - 1)];
}

const TIER_CAP: Record<VeilTier, number> = { speculative: 56, felt: 79, seen: 91 };

const CLAUSES: Record<BoundFaculty["lensId"], string[]> = {
  symbolic: ["I offer this as a mirror, not a map.", "Read it as image, not as instruction."],
  psychological: ["It is a question about your own heart, freely answered.", "Own only what is truly yours here."],
  providential: ["I hold it beneath grace — never fate.", "The certainty belongs to God; mine is only the glimpse."],
  practical: ["Do with it only what frees you.", "Keep what is useful; lay the rest down."],
};

// ─── Routing — which offices to convene ──────────────────────

export function routeFaculties(
  ctx: CouncilContext,
  opts: { limit?: number; ensure?: string[] } = {}
): BoundFaculty[] {
  const limit = opts.limit ?? 6;
  const ensure = opts.ensure ?? [];
  const oracle = new Oracle(`route|${ctx.subject}|${ctx.question}`);

  const scored = THE_BINDING.map((f) => {
    let score = 0;
    for (const d of f.domains) if (ctx.tokens.has(d)) score += 1;
    // a faculty whose office/gift words echo the matter gets a small lift
    const giftTokens = tokenize(f.office, f.gift);
    for (const t of giftTokens) if (ctx.tokens.has(t)) score += 0.4;
    score += oracle.float() * 0.25; // gentle tie-break / variety
    return { f, score };
  }).sort((a, b) => b.score - a.score);

  const chosen: BoundFaculty[] = [];
  const take = Math.max(0, limit - ensure.length);

  // If nothing resonates at all, fall back to a balanced default council.
  const anyResonance = scored.some((s) => s.score >= 1);
  const pool = anyResonance
    ? scored.map((s) => s.f)
    : ["balam", "vine", "asmoday", "buer", "marbas", "seere"]
        .map(facultyById)
        .filter((f): f is BoundFaculty => !!f);

  for (const f of pool) {
    if (chosen.length >= take) break;
    if (!chosen.some((c) => c.id === f.id)) chosen.push(f);
  }
  for (const id of ensure) {
    const f = facultyById(id);
    if (f && !chosen.some((c) => c.id === f.id)) chosen.push(f);
  }
  return chosen;
}

// ─── Filling a faculty's lines from the profile ──────────────

function fill(line: string, ctx: CouncilContext, focus: string): string {
  const sun = ctx.chart?.sun ?? "your nature";
  const moon = ctx.chart?.moon ?? "your inner tide";
  const rising = ctx.chart?.rising ?? "the face you turn outward";
  const path = ctx.numerology?.lifePathTitle ?? "your road";
  const year = ctx.numerology
    ? (PERSONAL_YEAR_THEME[ctx.numerology.personalYear]?.split(" — ")[0] ?? "turning").toLowerCase()
    : "turning";
  const motif = ctx.motif || "what recurs in you";
  const subst: Record<string, string> = {
    "{focus}": focus, "{sun}": sun, "{moon}": moon, "{rising}": rising,
    "{path}": path, "{year}": year, "{motif}": motif,
  };
  let out = line;
  for (const key of Object.keys(subst)) out = out.split(key).join(subst[key]);
  return out;
}

/** Does this faculty have the real data its highest sight depends on? */
function dataGrounded(f: BoundFaculty, ctx: CouncilContext): boolean {
  const needsChart = f.domains.includes("astrology") || f.domains.includes("sky");
  const needsNumber = f.domains.includes("number");
  const needsHistory = f.domains.includes("pattern") || f.domains.includes("history") || f.domains.includes("recurrence");
  if (needsChart && !ctx.chart) return false;
  if (needsNumber && !ctx.numerology) return false;
  if (needsHistory && !ctx.motif) return false;
  return true;
}

function chooseFocus(f: BoundFaculty, ctx: CouncilContext): string {
  const matched = f.domains.filter((d) => ctx.tokens.has(d));
  return (matched[0] ?? f.domains[0]).replace(/_/g, " ");
}

function impressionFor(f: BoundFaculty, ctx: CouncilContext): CouncilImpression {
  const oracle = new Oracle(`council|${ctx.subject}|${ctx.question}|${f.id}`);
  const focus = chooseFocus(f, ctx);

  // Tier: start at the ceiling; step down if it lacks its grounding data.
  let tier = f.ceiling;
  if (!dataGrounded(f, ctx)) tier = stepDown(tier);
  const profileThin = !ctx.chart && !ctx.numerology && !ctx.motif;
  if (profileThin && tier === "seen") tier = "felt";

  // Confidence.
  const matches = f.domains.filter((d) => ctx.tokens.has(d)).length;
  const dataBonus =
    (ctx.chart ? 6 : 0) + (ctx.numerology ? 6 : 0) + (ctx.motif ? 6 : 0);
  let confidence = 36 + matches * 7 + dataBonus + oracle.range(-4, 6);
  confidence = Math.min(TIER_CAP[tier], Math.max(20, Math.round(confidence)));

  const stem = fill(oracle.pick(f.lines), ctx, focus);
  const clause = oracle.pick(CLAUSES[f.lensId]);
  const text = `${stem} ${clause}`;

  return {
    facultyId: f.id, name: f.name, rank: f.rank, office: f.office,
    seal: f.seal, lensId: f.lensId, tier, focus, text, confidence,
  };
}

// ─── Convening the council ───────────────────────────────────

export function conveneCouncil(faculties: BoundFaculty[], ctx: CouncilContext): Council {
  const convened = faculties.map((f) => impressionFor(f, ctx));

  // Convergence: focus agreement + token density + tier confidence.
  const focusCounts = new Map<string, number>();
  for (const c of convened) focusCounts.set(c.focus, (focusCounts.get(c.focus) ?? 0) + 1);
  let dominantFocus = convened[0]?.focus ?? "the road ahead";
  let topCount = 0;
  for (const [k, n] of focusCounts) if (n > topCount) { topCount = n; dominantFocus = k; }
  const topFocusRatio = convened.length ? topCount / convened.length : 0;

  const tokenSets = convened.map((c) => tokenize(c.text, c.focus));
  let pairs = 0, sharedTotal = 0;
  for (let i = 0; i < tokenSets.length; i++) {
    for (let j = i + 1; j < tokenSets.length; j++) {
      pairs++;
      let shared = 0;
      for (const t of tokenSets[i]) if (tokenSets[j].has(t)) shared++;
      sharedTotal += shared;
    }
  }
  const density = pairs ? Math.min(1, (sharedTotal / pairs) / 2.5) : 0;
  const tierScore = convened.length
    ? convened.reduce((s, c) => s + TIER_ORDER[c.tier] / 2, 0) / convened.length
    : 0;

  const convergence = Math.min(1, 0.45 * topFocusRatio + 0.35 * density + 0.2 * tierScore);

  return {
    question: ctx.question,
    convened,
    convergence: Number(convergence.toFixed(3)),
    dominantFocus,
  };
}

/** Convenience: route + convene in one call. */
export function holdCouncil(
  ctx: CouncilContext,
  opts: { limit?: number; ensure?: string[] } = {}
): Council {
  const faculties = routeFaculties(ctx, opts);
  return conveneCouncil(faculties, ctx);
}
