// ═══════════════════════════════════════════════════════════════
//  The Trajectory Engine — the shape of a life, read as branches,
//  never as fate. The council of bound offices is convened; their
//  impressions converge; three roads are named — the road as it
//  now runs, the road through a chosen threshold, and the harder
//  road of grace. Each is falsifiable. Each returns a free step.
//
//  "Many are the plans in a person's heart, but it is the LORD's
//   purpose that prevails." — Proverbs 19:21
//  "For now we see through a glass, darkly." — 1 Corinthians 13:12
// ═══════════════════════════════════════════════════════════════

import type {
  BirthChart, Numerology, Relic, Signal, Belief,
  Trajectory, TrajectoryBranch, Council, CouncilImpression,
} from "../types";
import { Oracle } from "./rng";
import { PERSONAL_YEAR_THEME } from "./numerology";
import { type CouncilContext, holdCouncil } from "./solomonic";

export interface TrajectoryInput {
  subject: string;
  question?: string;
  chart: BirthChart | null;
  numerology: Numerology | null;
  notes?: string;
  bondStage?: string;
  relics: Relic[];
  signals: Signal[];
  beliefs: Belief[];
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "is", "are", "was", "were", "be", "been", "it", "this", "that", "you", "your",
  "i", "me", "my", "we", "us", "they", "them", "as", "at", "by", "from", "will",
  "what", "when", "where", "who", "how", "not", "no", "yes", "so", "if", "then",
  "reading", "chart", "signal", "relic", "soul", "life", "card", "cards",
]);

function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z']{3,}/g) ?? []).filter((w) => !STOPWORDS.has(w));
}

/** The dominant recurring theme across the seeker's record. */
function findMotif(input: TrajectoryInput): string {
  const counts = new Map<string, number>();
  const add = (text: string, weight = 1) => {
    for (const t of tokens(text)) counts.set(t, (counts.get(t) ?? 0) + weight);
  };
  for (const r of input.relics) { add(r.title, 2); add(r.tagsJson, 2); add(r.bodyMd.slice(0, 200)); }
  for (const s of input.signals) { add(s.impression, 2); add(s.target); }
  for (const b of input.beliefs) add(b.claim);
  if (input.notes) add(input.notes);

  let best = "", bestN = 1;
  for (const [k, n] of counts) if (n > bestN) { bestN = n; best = k; }
  return best;
}

function buildContext(input: TrajectoryInput): CouncilContext {
  const motif = findMotif(input);
  const recentSignal = input.signals[0]?.impression;

  // Routing tokens: the question, the notes, the motif, and synthetic
  // tokens drawn from what data is actually present. Because this is a
  // life-arc reading, the temporal / pattern offices are always in scope.
  const tk = new Set<string>([
    ...tokens(input.question ?? ""),
    ...tokens(input.notes ?? ""),
    ...tokens(motif),
    "trajectory", "future", "direction", "arc", "time",
  ]);
  if (input.chart) { tk.add("astrology"); tk.add("sky"); tk.add("temperament"); }
  if (input.numerology) { tk.add("number"); tk.add("pattern"); }
  if (motif) { tk.add("pattern"); tk.add("history"); tk.add("recurrence"); }

  return {
    subject: input.subject,
    question: input.question?.trim() || "the shape of the road ahead",
    chart: input.chart,
    numerology: input.numerology,
    motif,
    recentSignal,
    bondStage: input.bondStage,
    tokens: tk,
  };
}

// ─── Branch composition ──────────────────────────────────────

function frag(ctx: CouncilContext) {
  return {
    sun: ctx.chart?.sun ?? "your nature",
    path: ctx.numerology?.lifePathTitle ?? "your road",
    year: ctx.numerology
      ? (PERSONAL_YEAR_THEME[ctx.numerology.personalYear]?.split(" — ")[0] ?? "a turning").toLowerCase()
      : "a turning",
    motif: ctx.motif || "what recurs in you",
  };
}

function names(impressions: CouncilImpression[], limit = 4): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of impressions) {
    if (out.length >= limit) break;
    if (!seen.has(c.name)) { seen.add(c.name); out.push(c.name); }
  }
  return out;
}

const THRESHOLD_IDS = new Set(["balam", "vine", "gaap", "seere", "vassago"]);

function clamp(min: number, n: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function buildBranches(ctx: CouncilContext, council: Council): TrajectoryBranch[] {
  const f = frag(ctx);
  const c = council.convergence;
  const focus = council.dominantFocus;

  const dataBonus = (ctx.chart ? 6 : 0) + (ctx.numerology ? 6 : 0) + (ctx.motif ? 6 : 0);

  // Phase-shift detection for the threshold branch.
  const pyTurn = ctx.numerology ? [1, 5, 9].includes(ctx.numerology.personalYear) : false;
  const scorpio = ctx.chart?.sun === "Scorpio";
  const transitionVoice = council.convened.some((i) => ["gaap", "marbas", "seere", "vassago"].includes(i.facultyId));
  const phaseBonus = Math.min(16, (pyTurn ? 10 : 0) + (scorpio ? 4 : 0) + (transitionVoice ? 4 : 0));

  // ── Current ──
  const currentNames = (() => {
    const matched = council.convened.filter((i) => i.lensId === "practical" || i.lensId === "symbolic" || i.focus === focus);
    return names(matched.length ? matched : council.convened, 4);
  })();

  // ── Threshold ──
  const thresholdNames = (() => {
    const matched = council.convened.filter((i) => THRESHOLD_IDS.has(i.facultyId) || i.rank === "King");
    return names(matched.length ? matched : council.convened, 4);
  })();

  // ── Grace ──
  const graceNames = (() => {
    const matched = council.convened.filter((i) => i.lensId === "providential");
    return names(matched.length ? matched : council.convened, 3);
  })();

  const current: TrajectoryBranch = {
    id: "current", title: "As the River Runs", glyph: "≈",
    arc:
      `If nothing shifts: ${f.sun} stays at the helm, and ${f.motif} remains the recurring figure around ${focus}. ` +
      `The road keeps the line it has held — momentum, not destiny. A turned wheel answers to your hand, not the other way around.`,
    confidence: clamp(30, 24 + c * 46 + dataBonus, 86),
    converged: currentNames,
    falsifier:
      `Within about six weeks, ${focus} should keep its present shape. ` +
      `If it visibly breaks pattern instead — a clean reversal, not a wobble — then this read of the current was wrong.`,
    step:
      `Name, in one sentence, the pattern you want to keep around ${focus} — and the single small thing that would break it, if you ever chose to.`,
  };

  const threshold: TrajectoryBranch = {
    id: "threshold", title: "If You Cross the Threshold", glyph: "⛩",
    arc:
      `This is a ${f.year} season, and ${focus} sits on a real threshold. ` +
      `If you cross it awake — naming clearly what ends and what you freely choose to begin — the arc bends. ` +
      `Thresholds reward the one who steps through on purpose rather than the one carried over by drift.`,
    confidence: clamp(25, 18 + c * 40 + phaseBonus, 80),
    converged: thresholdNames,
    falsifier:
      `Watch the next one to three months: a true threshold shows up as a concrete door or decision in ${focus}. ` +
      `If nothing actually presents itself to choose, then I over-named this one.`,
    step:
      `Write the threshold as a single yes/no question you could honestly answer within the month.`,
  };

  const grace: TrajectoryBranch = {
    id: "grace", title: "The Harder Good", glyph: "✝",
    arc:
      `The freer, costlier road in ${focus}: the one that asks something of you now and returns dignity later. ` +
      `It is rarely the loudest option, and ${f.path} already half-knows it. Grace does not drag — it invites, and waits.`,
    confidence: clamp(35, 42 + c * 18, 72),
    converged: graceNames,
    falsifier:
      `This is offered, not predicted. Its only test is the fruit: if walking it leaves you more free and more kind, it was true. ` +
      `If it breeds fear, obsession, or pride, disregard it — I misjudged the grace.`,
    step:
      `Do one small, costly-kind thing in ${focus} this week — freely, with no audience and no ledger.`,
  };

  return [current, threshold, grace];
}

const VEIL_NOTES = [
  "Three roads, not one fate. You are free, and the certainty belongs to God alone. We see through a glass, darkly.",
  "These are currents, not commands. The branch you water is the branch that grows. Soli Deo Gloria.",
  "I have named what I can see and felt what I cannot prove. The walking remains entirely yours.",
  "No road here is sealed shut or sealed upon you. Hold it all loosely, beneath grace.",
];

// ─── Casting the trajectory ──────────────────────────────────

export function castTrajectory(input: TrajectoryInput): Trajectory {
  const ctx = buildContext(input);
  const council = holdCouncil(ctx, { limit: 6, ensure: ["balam", "vine", "buer"] });
  const branches = buildBranches(ctx, council);
  const oracle = new Oracle(`veil|${ctx.subject}|${ctx.question}`);

  return {
    subject: input.subject || "this soul",
    question: ctx.question,
    branches,
    council,
    sealIntegrity: 1,
    sealed: true,
    concerns: [],
    veilNote: oracle.pick(VEIL_NOTES),
    createdAt: Date.now(),
  };
}

/** Apply The Rule's critique as the Seal — the final binding before release. */
export function applySeal(
  traj: Trajectory,
  critique: { integrity: number; concerns: string[] }
): Trajectory {
  return {
    ...traj,
    sealIntegrity: critique.integrity,
    sealed: critique.integrity >= 0.62,
    concerns: critique.concerns,
  };
}

/** Render a trajectory to markdown — for The Rule to critique, for relics, for the Chamber. */
export function trajectoryToMarkdown(traj: Trajectory): string {
  const lines: string[] = [];
  lines.push(`**The Binding — a trajectory for ${traj.subject}**`);
  lines.push(`*"${traj.question}"*`);
  lines.push(`\n**The Council** (${Math.round(traj.council.convergence * 100)}% convergence, focus: ${traj.council.dominantFocus})`);
  for (const i of traj.council.convened) {
    lines.push(`\n- ${i.seal} **${i.name}** — *${i.office}* (${i.tier}, ${i.confidence}%): ${i.text}`);
  }
  lines.push(`\n**The Three Roads**`);
  for (const b of traj.branches) {
    lines.push(`\n${b.glyph} **${b.title}** — ${b.confidence}%`);
    lines.push(b.arc);
    lines.push(`*What would prove it wrong:* ${b.falsifier}`);
    lines.push(`*A free step:* ${b.step}`);
  }
  lines.push(`\n${traj.veilNote}`);
  return lines.join("\n");
}
