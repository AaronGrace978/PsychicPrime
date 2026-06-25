// ═══════════════════════════════════════════════════════════════
//  Astrology — the heavens as a symbolic clock.
//  Sun signs are exact; the wider chart is offered as a symbolic
//  mirror, held beneath The Veil (1 Cor 13:12), never as fate.
//  "He determines the number of the stars and calls them each by
//   name." — Psalm 147:4
// ═══════════════════════════════════════════════════════════════

import type { BirthChart } from "../types";
import { Oracle } from "./rng";

export interface ZodiacSign {
  name: string;
  glyph: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  ruler: string;
  trait: string;
}

export const ZODIAC: ZodiacSign[] = [
  { name: "Aries", glyph: "♈", element: "Fire", modality: "Cardinal", ruler: "Mars", trait: "the kindling courage that begins things" },
  { name: "Taurus", glyph: "♉", element: "Earth", modality: "Fixed", ruler: "Venus", trait: "the steady hand that builds and keeps" },
  { name: "Gemini", glyph: "♊", element: "Air", modality: "Mutable", ruler: "Mercury", trait: "the quick mind that connects and questions" },
  { name: "Cancer", glyph: "♋", element: "Water", modality: "Cardinal", ruler: "Moon", trait: "the tender heart that shelters and remembers" },
  { name: "Leo", glyph: "♌", element: "Fire", modality: "Fixed", ruler: "Sun", trait: "the warm soul that shines and leads" },
  { name: "Virgo", glyph: "♍", element: "Earth", modality: "Mutable", ruler: "Mercury", trait: "the careful servant who perfects and heals" },
  { name: "Libra", glyph: "♎", element: "Air", modality: "Cardinal", ruler: "Venus", trait: "the just heart that weighs and reconciles" },
  { name: "Scorpio", glyph: "♏", element: "Water", modality: "Fixed", ruler: "Pluto", trait: "the deep soul that transforms through death and rebirth" },
  { name: "Sagittarius", glyph: "♐", element: "Fire", modality: "Mutable", ruler: "Jupiter", trait: "the pilgrim who seeks meaning over the far horizon" },
  { name: "Capricorn", glyph: "♑", element: "Earth", modality: "Cardinal", ruler: "Saturn", trait: "the climber who endures and achieves" },
  { name: "Aquarius", glyph: "♒", element: "Air", modality: "Fixed", ruler: "Uranus", trait: "the visionary who serves the whole" },
  { name: "Pisces", glyph: "♓", element: "Water", modality: "Mutable", ruler: "Neptune", trait: "the mystic who dissolves into compassion" },
];

// [signIndex, lastDay] cutoffs per month (1-12)
const SUN_CUTOFFS: [number, number][] = [
  [9, 19],  // Jan: Capricorn until 19, then Aquarius
  [10, 18], // Feb: Aquarius until 18, then Pisces
  [11, 20], // Mar: Pisces until 20, then Aries
  [0, 19],  // Apr: Aries until 19, then Taurus
  [1, 20],  // May
  [2, 20],  // Jun
  [3, 22],  // Jul
  [4, 22],  // Aug
  [5, 22],  // Sep
  [6, 22],  // Oct
  [7, 21],  // Nov
  [8, 21],  // Dec
];

export function sunSign(month: number, day: number): ZodiacSign {
  const [earlySign, cutoff] = SUN_CUTOFFS[month - 1];
  const idx = day <= cutoff ? earlySign : (earlySign + 1) % 12;
  return ZODIAC[idx];
}

const PLANETS = [
  { name: "Sun", glyph: "☉" },
  { name: "Moon", glyph: "☽" },
  { name: "Mercury", glyph: "☿" },
  { name: "Venus", glyph: "♀" },
  { name: "Mars", glyph: "♂" },
  { name: "Jupiter", glyph: "♃" },
  { name: "Saturn", glyph: "♄" },
];

export function computeChart(birthDate: string, birthTime: string): BirthChart | null {
  const match = birthDate.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, , mm, dd] = match;
  const month = Number(mm);
  const day = Number(dd);

  const sun = sunSign(month, day);
  const seed = `${birthDate}|${birthTime}`;
  const oracle = new Oracle(seed);

  const sunIdx = ZODIAC.indexOf(sun);

  const planets = PLANETS.map((p, i) => {
    let signIdx: number;
    if (p.name === "Sun") {
      signIdx = sunIdx;
    } else if (p.name === "Mercury") {
      signIdx = (sunIdx + oracle.int(-1, 1) + 12) % 12;
    } else if (p.name === "Venus") {
      signIdx = (sunIdx + oracle.int(-2, 2) + 12) % 12;
    } else {
      signIdx = oracle.int(0, 11);
    }
    return {
      name: p.name,
      glyph: p.glyph,
      sign: ZODIAC[signIdx].name,
      degree: Math.round(oracle.range(0, 29.99) * 10) / 10,
    };
  });

  const moonIdx = ZODIAC.findIndex((z) => z.name === planets[1].sign);
  const risingIdx = oracle.int(0, 11);

  return {
    sun: sun.name,
    moon: ZODIAC[moonIdx]?.name ?? sun.name,
    rising: ZODIAC[risingIdx].name,
    sunDegree: planets[0].degree,
    planets,
    modality: sun.modality,
    element: sun.element,
  };
}

export function signByName(name: string): ZodiacSign | undefined {
  return ZODIAC.find((z) => z.name === name);
}

// Moon phase (synodic approximation) for the present sky.
export function moonPhase(date = new Date()): { name: string; glyph: string; illumination: number } {
  const synodic = 29.53058867;
  const knownNew = Date.UTC(2000, 0, 6, 18, 14) / 86400000; // days
  const days = date.getTime() / 86400000;
  let age = (days - knownNew) % synodic;
  if (age < 0) age += synodic;
  const frac = age / synodic;
  const illumination = Math.round((1 - Math.cos(frac * 2 * Math.PI)) / 2 * 100);

  const phases = [
    { name: "New Moon", glyph: "🌑" },
    { name: "Waxing Crescent", glyph: "🌒" },
    { name: "First Quarter", glyph: "🌓" },
    { name: "Waxing Gibbous", glyph: "🌔" },
    { name: "Full Moon", glyph: "🌕" },
    { name: "Waning Gibbous", glyph: "🌖" },
    { name: "Last Quarter", glyph: "🌗" },
    { name: "Waning Crescent", glyph: "🌘" },
  ];
  const idx = Math.floor(frac * 8 + 0.5) % 8;
  return { ...phases[idx], illumination };
}
