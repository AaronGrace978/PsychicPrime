// ═══════════════════════════════════════════════════════════════
//  The Convergence Engine — when many independent signals point
//  the same way, a constellation forms. This builds the star-map
//  of your psychic history: relics, signals, and beliefs as nodes,
//  drawn together by shared theme and nearness in time.
// ═══════════════════════════════════════════════════════════════

import type { Relic, Signal, Belief } from "../types";

export interface ConstNode {
  id: string;
  kind: "relic" | "signal" | "belief";
  label: string;
  detail: string;
  weight: number; // 0..1 brightness
  createdAt: number;
  tokens: Set<string>;
}

export interface ConstEdge {
  a: string;
  b: string;
  strength: number; // 0..1
  reason: string;
}

export interface Constellation {
  nodes: ConstNode[];
  edges: ConstEdge[];
  convergenceScore: number; // 0..1, density of meaningful links
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "is", "are", "was", "were", "be", "been", "it", "this", "that", "you", "your",
  "i", "me", "my", "we", "us", "they", "them", "he", "she", "his", "her", "as",
  "at", "by", "from", "will", "would", "what", "when", "where", "who", "how",
  "not", "no", "yes", "so", "if", "then", "than", "about", "into", "over",
]);

function tokenize(...parts: string[]): Set<string> {
  const text = parts.join(" ").toLowerCase();
  const words = text.match(/[a-z][a-z']{2,}/g) ?? [];
  return new Set(words.filter((w) => !STOPWORDS.has(w)));
}

function overlap(a: Set<string>, b: Set<string>): string[] {
  const shared: string[] = [];
  for (const t of a) if (b.has(t)) shared.push(t);
  return shared;
}

const DAY = 86400000;

export function buildConstellation(
  relics: Relic[],
  signals: Signal[],
  beliefs: Belief[]
): Constellation {
  const nodes: ConstNode[] = [];

  for (const r of relics) {
    nodes.push({
      id: `relic-${r.id}`,
      kind: "relic",
      label: r.title || "Relic",
      detail: r.bodyMd.slice(0, 160),
      weight: Math.min(1, 0.4 + r.intensity / 200),
      createdAt: r.createdAt,
      tokens: tokenize(r.title, r.bodyMd, r.tagsJson, r.mood),
    });
  }
  for (const s of signals) {
    const hit = s.status === "hit" ? 0.35 : s.status === "partial" ? 0.18 : 0;
    nodes.push({
      id: `signal-${s.id}`,
      kind: "signal",
      label: s.impression.slice(0, 48) || "Signal",
      detail: `${s.kind} · ${s.status} · ${s.target}`,
      weight: Math.min(1, 0.35 + s.confidence / 200 + hit),
      createdAt: s.createdAt,
      tokens: tokenize(s.impression, s.target, s.kind, s.notes),
    });
  }
  for (const b of beliefs) {
    nodes.push({
      id: `belief-${b.id}`,
      kind: "belief",
      label: b.claim.slice(0, 48) || "Belief",
      detail: `${b.epistemicType} · ${b.status} · ${b.confidence}%`,
      weight: Math.min(1, 0.35 + b.confidence / 200),
      createdAt: b.createdAt,
      tokens: tokenize(b.claim, b.evidence),
    });
  }

  const edges: ConstEdge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const shared = overlap(nodes[i].tokens, nodes[j].tokens);
      const dayGap = Math.abs(nodes[i].createdAt - nodes[j].createdAt) / DAY;
      const temporal = dayGap <= 3 ? 0.25 : dayGap <= 14 ? 0.12 : 0;
      const thematic = Math.min(0.75, shared.length * 0.22);
      const strength = thematic + temporal;
      if (strength >= 0.22) {
        const reason =
          shared.length > 0
            ? `shared: ${shared.slice(0, 3).join(", ")}`
            : "near in time";
        edges.push({ a: nodes[i].id, b: nodes[j].id, strength: Math.min(1, strength), reason });
      }
    }
  }

  const maxEdges = (nodes.length * (nodes.length - 1)) / 2 || 1;
  const convergenceScore = Math.min(1, edges.length / Math.max(4, maxEdges * 0.3));

  return { nodes, edges, convergenceScore };
}
