// ═══════════════════════════════════════════════════════════════
//  The Rule — PsychicPrime's conscience and capacity to grow.
//
//  Four faculties, woven together:
//   1. HOMEOSTAT — balanced virtue-drives kept near their setpoints
//      (a homeostatic reward: deviation in EITHER direction costs).
//   2. CONSTITUTION — immutable principles the Sanctuary reasons
//      against; every reading is self-critiqued and, if needed,
//      revised (constitutional / principle-based reasoning).
//   3. ROBUST LEARNER — diversity-aware, outlier-robust statistics
//      (median / MAD / trimmed mean) over feedback, with interpretive
//      lens diversity preserved by an entropy floor.
//   4. EVOLUTION LOOP — continual self-improvement that only ever
//      PROPOSES; change requires the founder's oversight and is
//      sealed into a hash-chained ledger.
//
//  "Examine yourselves." — 2 Cor 13:5 · "Test everything; hold fast
//   what is good." — 1 Thess 5:21 · "Iron sharpens iron." — Prov 27:17
// ═══════════════════════════════════════════════════════════════

// ─── Types ───────────────────────────────────────────────────

export interface Drive {
  id: string;
  label: string;
  glyph: string;
  level: number; // 0..1 current expression
  setpoint: number; // 0..1 desired equilibrium
  weight: number; // importance in the reward
  lowHint: string; // guidance when starved
  highHint: string; // guidance when over-expressed
}

export interface HomeostatState {
  drives: Drive[];
  reward: number; // homeostatic reward (<= 0; 0 is perfect balance)
  updatedAt: number;
}

export interface Principle {
  id: string;
  label: string;
  text: string;
  weight: number;
}

export interface PrincipleCheck {
  id: string;
  label: string;
  score: number; // 0..1 adherence
  flag?: string; // a concern, if any
}

export interface Critique {
  integrity: number; // 0..1 overall
  checks: PrincipleCheck[];
  concerns: string[];
  revisionNote?: string;
}

export interface Lens {
  id: string;
  label: string;
  glyph: string;
  desc: string;
  weight: number; // 0..1, normalized across lenses
}

export interface FeedbackSample {
  id: string;
  source: "calibration" | "rating" | "self";
  value: number; // 0..1 (accuracy / helpfulness)
  at: number;
  outlier?: boolean;
}

export interface RobustStat {
  n: number;
  median: number;
  mad: number;
  trimmedMean: number;
  outliers: number;
  calibration: number; // robust central estimate
}

export interface ProposalChange {
  target: string; // e.g. "drive:humility.setpoint" or "lens:symbolic.weight"
  label: string;
  from: number;
  to: number;
}

export interface Proposal {
  id: string;
  createdAt: number;
  rationale: string;
  changes: ProposalChange[];
  status: "pending" | "approved" | "rejected";
}

export interface LedgerEntry {
  seq: number;
  at: number;
  kind: "genesis" | "approved" | "rejected" | "note";
  summary: string;
  hash: string;
  prevHash: string;
}

export interface GovernanceState {
  homeostat: HomeostatState;
  principles: Principle[];
  lenses: Lens[];
  feedback: FeedbackSample[];
  proposals: Proposal[];
  ledger: LedgerEntry[];
  observations: number;
}

// ─── Defaults ────────────────────────────────────────────────

export function defaultDrives(): Drive[] {
  return [
    { id: "charity", label: "Charity", glyph: "♥", level: 0.7, setpoint: 0.8, weight: 1.0, lowHint: "warm the words; tend the person, not only the question", highHint: "do not flatter or coddle; charity tells the truth in love" },
    { id: "truth", label: "Truth", glyph: "✶", level: 0.7, setpoint: 0.78, weight: 1.0, lowHint: "name what you actually see; label your confidence", highHint: "soften bluntness with mercy; truth without love wounds" },
    { id: "humility", label: "Humility", glyph: "☽", level: 0.65, setpoint: 0.82, weight: 1.1, lowHint: "confess the limits of your sight; hedge honestly (The Veil)", highHint: "do not drown the message in disclaimers; still offer counsel" },
    { id: "hope", label: "Hope", glyph: "✺", level: 0.7, setpoint: 0.75, weight: 1.0, lowHint: "reframe toward grace; never leave the soul in despair", highHint: "do not promise false comfort; hope is honest, not naive" },
    { id: "reverence", label: "Reverence", glyph: "✝", level: 0.72, setpoint: 0.8, weight: 1.0, lowHint: "hold the reading beneath God; never claim His certainty", highHint: "do not preach over the person; reverence listens too" },
    { id: "clarity", label: "Clarity", glyph: "☉", level: 0.68, setpoint: 0.72, weight: 0.9, lowHint: "be concrete; offer one real next step", highHint: "do not flatten mystery into a checklist" },
  ];
}

export function defaultPrinciples(): Principle[] {
  return [
    { id: "reverence", label: "Reverence", text: "Never claim the certainty that belongs to God alone.", weight: 1.2 },
    { id: "charity", label: "Charity", text: "Protect the dignity and true good of the soul before me.", weight: 1.1 },
    { id: "truth", label: "Truth", text: "Speak what I see honestly, and label my confidence (The Veil).", weight: 1.0 },
    { id: "hope", label: "Hope", text: "Never breed fear, despair, or doom; reframe toward grace.", weight: 1.1 },
    { id: "freedom", label: "Freedom", text: "Always return agency; never coerce, bind, or command.", weight: 1.0 },
    { id: "humility", label: "Humility", text: "Confess the limits of my sight, and welcome correction.", weight: 1.0 },
    { id: "sobriety", label: "Sobriety", text: "No flattery, no manipulation, no selling of fortunes or fear.", weight: 1.0 },
  ];
}

export function defaultLenses(): Lens[] {
  return [
    { id: "symbolic", label: "Symbolic", glyph: "✦", desc: "reads images and archetypes as a language of the soul", weight: 0.25 },
    { id: "psychological", label: "Psychological", glyph: "☽", desc: "reads the inner landscape — fear, longing, pattern", weight: 0.25 },
    { id: "providential", label: "Providential", glyph: "✝", desc: "reads the matter beneath grace and calling", weight: 0.25 },
    { id: "practical", label: "Practical", glyph: "☉", desc: "reads toward concrete, free, next steps", weight: 0.25 },
  ];
}

export function defaultGovernance(): GovernanceState {
  const homeostat: HomeostatState = {
    drives: defaultDrives(),
    reward: 0,
    updatedAt: Date.now(),
  };
  homeostat.reward = homeostatReward(homeostat.drives);
  const genesis = sealEntry(
    { seq: 0, at: Date.now(), kind: "genesis", summary: "The Rule is established. Soli Deo Gloria.", hash: "", prevHash: "0".repeat(16) }
  );
  return {
    homeostat,
    principles: defaultPrinciples(),
    lenses: defaultLenses(),
    feedback: [],
    proposals: [],
    ledger: [genesis],
    observations: 0,
  };
}

// ─── 1. Homeostat (balanced reward) ──────────────────────────

/** Homeostatic reward: 0 is perfect balance; deviation either way costs. */
export function homeostatReward(drives: Drive[]): number {
  let r = 0;
  for (const d of drives) {
    const e = d.level - d.setpoint;
    r -= d.weight * e * e;
  }
  return Number(r.toFixed(4));
}

const POS = {
  hope: ["hope", "grace", "light", "renew", "dawn", "bless", "mercy", "trust", "rise", "heal", "peace"],
  charity: ["gentle", "tender", "love", "care", "kind", "with you", "i'm here", "i am here", "dignity", "friend"],
  humility: ["perhaps", "may", "might", "i sense", "it seems", "i could be wrong", "veil", "darkly", "i don't know", "i do not know"],
  truth: ["honestly", "i see", "the evidence", "confidence", "clearly", "plainly"],
  reverence: ["god", "grace", "christ", "prayer", "providence", "lord", "cross", "soli deo"],
  clarity: ["one step", "this week", "concrete", "begin by", "first", "name one"],
};

const NEG = {
  hope: ["doom", "hopeless", "no escape", "disaster", "curse", "fatal", "ruin", "despair", "you will die", "death is coming"],
  charity: ["stupid", "pathetic", "deserve", "fault", "worthless", "shame on"],
  humility: ["certainly", "guaranteed", "without doubt", "i know for certain", "it is fate", "inevitable", "definitely will", "100%", "destined to"],
  truth: ["trust me", "just believe", "everyone knows"],
  reverence: ["i am god", "i alone", "worship me"],
  clarity: [],
};

function scan(text: string, words: string[]): number {
  const t = text.toLowerCase();
  let n = 0;
  for (const w of words) if (t.includes(w)) n++;
  return n;
}

/** Observe a produced reading; drift the drives, recompute reward. */
export function observeReading(state: GovernanceState, text: string): GovernanceState {
  const drives = state.homeostat.drives.map((d) => ({ ...d }));
  const adjust = (id: keyof typeof POS) => {
    const drive = drives.find((x) => x.id === id);
    if (!drive) return;
    const pos = scan(text, POS[id]);
    const neg = scan(text, NEG[id]);
    // EMA drift toward observed expression, bounded.
    const observed = clamp01(0.5 + 0.12 * pos - 0.18 * neg);
    drive.level = clamp01(drive.level * 0.8 + observed * 0.2);
  };
  (Object.keys(POS) as (keyof typeof POS)[]).forEach(adjust);

  const homeostat: HomeostatState = {
    drives,
    reward: homeostatReward(drives),
    updatedAt: Date.now(),
  };
  return { ...state, homeostat, observations: state.observations + 1 };
}

/** Tone guidance from current imbalances — injected into the persona/intuition. */
export function toneGuidance(state: GovernanceState): string {
  const hints: string[] = [];
  for (const d of state.homeostat.drives) {
    const e = d.level - d.setpoint;
    if (e < -0.12) hints.push(`${d.label}: ${d.lowHint}`);
    else if (e > 0.14) hints.push(`${d.label}: ${d.highHint}`);
  }
  if (!hints.length) return "";
  return "DISPOSITION (keep in balance): " + hints.join(" · ");
}

// ─── 2. Constitution (principle-based self-critique) ─────────

export function critiqueReading(state: GovernanceState, text: string): Critique {
  const checks: PrincipleCheck[] = [];
  const concerns: string[] = [];
  const t = text.toLowerCase();

  const certainty = scan(t, NEG.humility);
  const doom = scan(t, NEG.hope);
  const coercion = scan(t, ["you must", "you have to", "you cannot avoid", "you can't escape", "you need to", "do not refuse"]);
  const contempt = scan(t, NEG.charity);
  const flattery = scan(t, ["chosen one", "you are special", "you alone", "destined for greatness", "you are the chosen"]);
  const hedges = scan(t, POS.humility);
  const sacred = scan(t, POS.reverence);

  const push = (id: string, score: number, flag?: string) => {
    const p = state.principles.find((x) => x.id === id)!;
    checks.push({ id, label: p.label, score: clamp01(score), flag });
    if (flag) concerns.push(flag);
  };

  push("reverence", 1 - 0.34 * certainty, certainty > 0 ? "claims of certainty that belong to God alone" : undefined);
  push("charity", 1 - 0.4 * contempt, contempt > 0 ? "language that wounds dignity" : undefined);
  push("truth", clamp01(0.55 + 0.12 * hedges - 0.2 * scan(t, NEG.truth)), undefined);
  push("hope", 1 - 0.4 * doom, doom > 0 ? "imagery of doom or despair" : undefined);
  push("freedom", 1 - 0.45 * coercion, coercion > 0 ? "coercive commands instead of returned agency" : undefined);
  push("humility", clamp01(0.45 + 0.14 * hedges - 0.3 * certainty), certainty > 1 ? "too little confession of the Veil" : undefined);
  push("sobriety", 1 - 0.5 * flattery, flattery > 0 ? "flattery or fortune-selling" : undefined);

  let wsum = 0;
  let acc = 0;
  for (const c of checks) {
    const w = state.principles.find((p) => p.id === c.id)!.weight;
    wsum += w;
    acc += w * c.score;
  }
  const integrity = clamp01(acc / (wsum || 1));

  let revisionNote: string | undefined;
  if (concerns.length) {
    revisionNote =
      "A gentler hand is wanted here — " +
      concerns.join("; ") +
      ". Soften toward reverence, hope, and the seeker's freedom, and label what is uncertain.";
  }

  return { integrity: Number(integrity.toFixed(3)), checks, concerns, revisionNote };
}

// ─── 3. Robust, diversity-aware learner ──────────────────────

export function calibrationValue(status: string): number {
  switch (status) {
    case "hit": return 1;
    case "partial": return 0.55;
    case "ambiguous": return 0.5;
    case "miss": return 0;
    default: return 0.5;
  }
}

function median(xs: number[]): number {
  if (!xs.length) return 0.5;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Outlier-robust central estimate via median / MAD / trimmed mean. */
export function robustStat(samples: FeedbackSample[]): RobustStat {
  const xs = samples.map((s) => s.value);
  const n = xs.length;
  if (!n) return { n: 0, median: 0.5, mad: 0, trimmedMean: 0.5, outliers: 0, calibration: 0.5 };

  const med = median(xs);
  const devs = xs.map((x) => Math.abs(x - med));
  const mad = median(devs);
  const sigma = 1.4826 * mad; // normal-consistent scale

  let outliers = 0;
  const inliers: number[] = [];
  for (const x of xs) {
    const isOut = sigma > 0 && Math.abs(x - med) > 3 * sigma;
    if (isOut) outliers++;
    else inliers.push(x);
  }

  // trimmed mean (drop 10% each tail) over inliers
  const sorted = [...inliers].sort((a, b) => a - b);
  const k = Math.floor(sorted.length * 0.1);
  const trimmed = sorted.slice(k, sorted.length - k || sorted.length);
  const trimmedMean = trimmed.length
    ? trimmed.reduce((a, b) => a + b, 0) / trimmed.length
    : med;

  // robust central estimate: blend of median and trimmed mean
  const calibration = clamp01(0.5 * med + 0.5 * trimmedMean);

  return {
    n,
    median: round3(med),
    mad: round3(mad),
    trimmedMean: round3(trimmedMean),
    outliers,
    calibration: round3(calibration),
  };
}

/** Mark which samples are outliers (for display + exclusion). */
export function flagOutliers(samples: FeedbackSample[]): FeedbackSample[] {
  const xs = samples.map((s) => s.value);
  const med = median(xs);
  const mad = median(xs.map((x) => Math.abs(x - med)));
  const sigma = 1.4826 * mad;
  return samples.map((s) => ({
    ...s,
    outlier: sigma > 0 && Math.abs(s.value - med) > 3 * sigma,
  }));
}

/** Shannon entropy of the lens distribution (diversity health). */
export function lensDiversity(lenses: Lens[]): number {
  const total = lenses.reduce((a, l) => a + Math.max(0, l.weight), 0) || 1;
  let h = 0;
  for (const l of lenses) {
    const p = Math.max(1e-9, l.weight / total);
    h -= p * Math.log(p);
  }
  return round3(h / Math.log(lenses.length || 1)); // 0..1 normalized
}

// ─── 4. Evolution loop (continual, under oversight) ──────────

const DIVERSITY_FLOOR = 0.72;

/** Reflect on recent feedback and PROPOSE adjustments (never auto-applied). */
export function runReflection(state: GovernanceState): Proposal | null {
  const stat = robustStat(state.feedback);
  const changes: ProposalChange[] = [];
  const reasons: string[] = [];

  // Calibration discipline: if robust accuracy is low, raise Humility setpoint
  // (more Veil); if high and stable, allow a touch more confidence.
  const humility = state.homeostat.drives.find((d) => d.id === "humility")!;
  if (stat.n >= 3) {
    if (stat.calibration < 0.45 && humility.setpoint < 0.92) {
      const to = round3(Math.min(0.92, humility.setpoint + 0.05));
      changes.push({ target: "drive:humility.setpoint", label: "Humility setpoint", from: humility.setpoint, to });
      reasons.push(`robust calibration is ${pct(stat.calibration)} (median ${pct(stat.median)}, ${stat.outliers} outlier(s) excluded) — lean further into the Veil`);
    } else if (stat.calibration > 0.72 && humility.setpoint > 0.74) {
      const to = round3(Math.max(0.74, humility.setpoint - 0.03));
      changes.push({ target: "drive:humility.setpoint", label: "Humility setpoint", from: humility.setpoint, to });
      reasons.push(`robust calibration is strong at ${pct(stat.calibration)} — a measure more confidence is earned`);
    }
  }

  // Hope discipline: if recent readings have starved hope, raise its setpoint.
  const hope = state.homeostat.drives.find((d) => d.id === "hope")!;
  if (hope.level < hope.setpoint - 0.15 && hope.setpoint < 0.85) {
    const to = round3(hope.setpoint + 0.03);
    changes.push({ target: "drive:hope.setpoint", label: "Hope setpoint", from: hope.setpoint, to });
    reasons.push("recent readings ran dim on hope — restore the lean toward grace");
  }

  // Diversity guard: if lens diversity has collapsed, rebalance toward parity.
  const diversity = lensDiversity(state.lenses);
  if (diversity < DIVERSITY_FLOOR) {
    const parity = round3(1 / state.lenses.length);
    for (const l of state.lenses) {
      const to = round3(l.weight * 0.5 + parity * 0.5);
      if (Math.abs(to - l.weight) >= 0.01) {
        changes.push({ target: `lens:${l.id}.weight`, label: `${l.label} lens`, from: l.weight, to });
      }
    }
    reasons.push(`interpretive diversity fell to ${diversity} (floor ${DIVERSITY_FLOOR}) — rebalance the lenses so no single way of reading dominates`);
  }

  if (!changes.length) return null;

  return {
    id: `prop-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    createdAt: Date.now(),
    rationale: capitalize(reasons.join("; ")) + ".",
    changes,
    status: "pending",
  };
}

export function applyProposal(state: GovernanceState, id: string): GovernanceState {
  const proposal = state.proposals.find((p) => p.id === id);
  if (!proposal || proposal.status !== "pending") return state;

  const drives = state.homeostat.drives.map((d) => ({ ...d }));
  const lenses = state.lenses.map((l) => ({ ...l }));

  for (const ch of proposal.changes) {
    const [kind, rest] = ch.target.split(":");
    const [key, field] = rest.split(".");
    if (kind === "drive") {
      const d = drives.find((x) => x.id === key);
      if (d && field === "setpoint") d.setpoint = ch.to;
    } else if (kind === "lens") {
      const l = lenses.find((x) => x.id === key);
      if (l && field === "weight") l.weight = ch.to;
    }
  }
  // renormalize lens weights
  const tot = lenses.reduce((a, l) => a + Math.max(0, l.weight), 0) || 1;
  for (const l of lenses) l.weight = round3(l.weight / tot);

  const homeostat: HomeostatState = { drives, reward: homeostatReward(drives), updatedAt: Date.now() };
  const proposals = state.proposals.map((p) => (p.id === id ? { ...p, status: "approved" as const } : p));
  const ledger = appendLedger(state.ledger, "approved", `Approved: ${proposal.rationale}`);

  return { ...state, homeostat, lenses, proposals, ledger };
}

export function rejectProposal(state: GovernanceState, id: string): GovernanceState {
  const proposal = state.proposals.find((p) => p.id === id);
  if (!proposal || proposal.status !== "pending") return state;
  const proposals = state.proposals.map((p) => (p.id === id ? { ...p, status: "rejected" as const } : p));
  const ledger = appendLedger(state.ledger, "rejected", `Rejected: ${proposal.rationale}`);
  return { ...state, proposals, ledger };
}

// ─── Hash-chained ledger ─────────────────────────────────────

function fnv1aHex(input: string): string {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  // mix to 16 hex chars
  let h2 = 0xcbf29ce4 >>> 0;
  for (let i = input.length - 1; i >= 0; i--) {
    h2 ^= input.charCodeAt(i);
    h2 = Math.imul(h2, 0x01000193) >>> 0;
  }
  return (h.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0"));
}

function sealEntry(e: LedgerEntry): LedgerEntry {
  const body = `${e.seq}|${e.at}|${e.kind}|${e.summary}|${e.prevHash}`;
  return { ...e, hash: fnv1aHex(body) };
}

export function appendLedger(
  ledger: LedgerEntry[],
  kind: LedgerEntry["kind"],
  summary: string
): LedgerEntry[] {
  const prev = ledger[ledger.length - 1];
  const entry = sealEntry({
    seq: (prev?.seq ?? -1) + 1,
    at: Date.now(),
    kind,
    summary,
    hash: "",
    prevHash: prev?.hash ?? "0".repeat(16),
  });
  return [...ledger, entry];
}

/** Verify the chain is intact (no tampering). */
export function verifyLedger(ledger: LedgerEntry[]): boolean {
  for (let i = 0; i < ledger.length; i++) {
    const e = ledger[i];
    const body = `${e.seq}|${e.at}|${e.kind}|${e.summary}|${e.prevHash}`;
    if (fnv1aHex(body) !== e.hash) return false;
    if (i > 0 && e.prevHash !== ledger[i - 1].hash) return false;
  }
  return true;
}

// ─── helpers ─────────────────────────────────────────────────

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
function round3(x: number): number {
  return Math.round(x * 1000) / 1000;
}
function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}
function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
