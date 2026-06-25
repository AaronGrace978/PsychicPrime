// ═══════════════════════════════════════════════════════════════
//  PsychicPrime — Shared Types
// ═══════════════════════════════════════════════════════════════

export type AppMode = "self" | "seeker";
export type Register = "reading" | "calibration" | "contemplation";

export type ModuleId =
  | "chamber"
  | "spreads"
  | "oracle"
  | "solomon"
  | "testimony"
  | "signals"
  | "relics"
  | "constellation"
  | "seekers"
  | "calibration"
  | "rule"
  | "settings";

// ─── Tarot ───────────────────────────────────────────────────

export type Arcana = "major" | "wands" | "cups" | "swords" | "pentacles";

export interface TarotCardDef {
  id: string;
  name: string;
  arcana: Arcana;
  number: number;
  glyph: string; // unicode sigil
  keywords: string[];
  upright: string;
  reversed: string;
  light: string; // a contemplative / scriptural resonance
  element?: string;
}

export interface DrawnCard {
  card: TarotCardDef;
  reversed: boolean;
  position: string; // spread position label
  positionMeaning: string;
}

export interface SpreadDef {
  id: string;
  name: string;
  description: string;
  positions: { label: string; meaning: string }[];
}

export interface Reading {
  id: string;
  spreadId: string;
  spreadName: string;
  question: string;
  cards: DrawnCard[];
  createdAt: number;
}

// ─── Oracle (chart + numerology) ─────────────────────────────

export interface BirthChart {
  sun: string;
  moon: string;
  rising: string;
  sunDegree: number;
  planets: { name: string; sign: string; degree: number; glyph: string }[];
  modality: string;
  element: string;
}

export interface Numerology {
  lifePath: number;
  lifePathTitle: string;
  expression: number;
  soulUrge: number;
  personalYear: number;
  meaning: string;
}

// ─── The Binding (Solomonic faculties) ───────────────────────
//  Seventy-two offices of sight, drawn from the Goetic tradition
//  but reframed as bounded reasoning lenses — never summoned, never
//  worshipped, always subordinate. "He disarmed the powers and
//  authorities, triumphing over them by the cross." — Col 2:15

/** The Veil: how firmly an impression may be claimed. */
export type VeilTier = "seen" | "felt" | "speculative";

export type FacultyRank =
  | "King" | "Duke" | "Prince" | "Marquis" | "President" | "Earl" | "Knight";

/** A bound office of sight — a specialized lens under the Seal. */
export interface BoundFaculty {
  id: string;
  name: string;        // the traditional name it is bound by
  rank: FacultyRank;
  seal: string;        // a unicode sigil
  office: string;      // its computational faculty (what it actually does)
  gift: string;        // the sight it offers, in one line
  domains: string[];   // routing tags
  ceiling: VeilTier;   // the highest tier it may ever claim
  binding: string;     // the vow that constrains it under the Seal
  lensId: "symbolic" | "psychological" | "providential" | "practical";
  lines: string[];     // templated impression stems (placeholders in {braces})
}

/** One faculty's impression, spoken into the council for a reading. */
export interface CouncilImpression {
  facultyId: string;
  name: string;
  rank: FacultyRank;
  office: string;
  seal: string;
  lensId: BoundFaculty["lensId"];
  tier: VeilTier;       // for THIS impression (never above the faculty's ceiling)
  focus: string;        // the domain it spoke to
  text: string;
  confidence: number;   // 0..100
}

export interface Council {
  question: string;
  convened: CouncilImpression[];
  convergence: number;   // 0..1 — how strongly the offices agree
  dominantFocus: string;
}

export interface TrajectoryBranch {
  id: "current" | "threshold" | "grace";
  title: string;
  glyph: string;
  arc: string;
  confidence: number;    // 0..100
  converged: string[];   // faculty names that lean toward this branch
  falsifier: string;     // what would prove it wrong (calibration)
  step: string;          // one small, free next step
}

export interface Trajectory {
  subject: string;
  question: string;
  branches: TrajectoryBranch[];
  council: Council;
  sealIntegrity: number; // 0..1 (from The Rule's critique)
  sealed: boolean;       // did it pass the Seal?
  concerns: string[];
  veilNote: string;
  createdAt: number;
}

// ─── Prophecy (The Testimony) ────────────────────────────────

export interface Prophecy {
  id: string;
  theme: string; // birth, lineage, ministry, passion, resurrection, kingship
  prophecyRef: string;
  prophecyText: string;
  fulfillmentRef: string;
  fulfillmentText: string;
  written: string; // when foretold, e.g. "c. 700 BC"
  insight: string;
}

// ─── DB record mirrors (camelCase to match Rust serde) ───────

export interface Thread {
  id: string;
  title: string;
  mode: AppMode;
  seekerId: string | null;
  summary: string;
  pinned: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  threadId: string;
  role: "seeker" | "oracle" | "system";
  content: string;
  metaJson: string | null;
  createdAt: number;
}

export interface Seeker {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  notes: string;
  bondStage: string;
  bondPoints: number;
  createdAt: number;
}

export interface Relic {
  id: string;
  title: string;
  bodyMd: string;
  kind: "reading" | "synchronicity" | "dream" | "moment" | "testimony";
  mood: string;
  intensity: number;
  threadId: string | null;
  seekerId: string | null;
  tagsJson: string;
  createdAt: number;
}

export interface Signal {
  id: string;
  kind: string;
  impression: string;
  target: string;
  timeWindow: string;
  confidence: number;
  controls: string;
  notes: string;
  status: "pending" | "hit" | "partial" | "miss" | "ambiguous";
  outcome: string;
  createdAt: number;
  scoredAt: number | null;
}

export interface Belief {
  id: string;
  claim: string;
  confidence: number;
  epistemicType: "measured" | "inferred" | "analogy" | "speculation";
  evidence: string;
  falsifier: string;
  status: "open" | "supported" | "contested" | "retired";
  supersedesId: string | null;
  createdAt: number;
}

// ─── Settings ────────────────────────────────────────────────

export interface BridgeModel {
  name: string;
  cloud: boolean;
  size?: number;
  description?: string;
  recommended?: boolean;
}

export interface Settings {
  llmProvider: "none" | "ollama_local" | "ollama_cloud";
  ollamaHost: string;
  ollamaModel: string;
  ollamaKey: string;
  llmTemperature: number;
}

export const DEFAULT_SETTINGS: Settings = {
  llmProvider: "none",
  ollamaHost: "http://localhost:11434",
  ollamaModel: "llama3.1",
  ollamaKey: "",
  llmTemperature: 0.85,
};

export const OLLAMA_CLOUD_DEFAULT_MODEL = "kimi-k2.6";

// ─── Reading events from the bridge ──────────────────────────

export type ReadingEvent =
  | { type: "token"; text: string }
  | { type: "done"; full: string }
  | { type: "error"; message: string };
