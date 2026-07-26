// ═══════════════════════════════════════════════════════════════
//  The Store — PsychicPrime's living state.
// ═══════════════════════════════════════════════════════════════

import { create } from "zustand";
import { sanctuary } from "../lib/sanctuary";
import type {
  AppMode, ModuleId, Thread, Message, Seeker, Relic, Signal, Belief, Settings, BridgeModel,
} from "../types";
import { DEFAULT_SETTINGS, OLLAMA_CLOUD_DEFAULT_MODEL } from "../types";
import { enrichBridgeModel, mergeCloudCatalog, sortBridgeModels } from "../prime/ollama-catalog";
import {
  defaultGovernance, observeReading, critiqueReading, runReflection,
  applyProposal, rejectProposal, robustStat, flagOutliers, appendLedger,
  type GovernanceState, type Critique, type FeedbackSample,
} from "../prime/governance";

export type Presence = "attuned" | "reading" | "holding" | "dreaming" | "listening";

interface SanctuaryStore {
  ready: boolean;
  module: ModuleId;
  mode: AppMode;
  activeSeekerId: string | null;
  presence: Presence;

  threads: Thread[];
  activeThreadId: string | null;
  messages: Message[];

  seekers: Seeker[];
  relics: Relic[];
  signals: Signal[];
  beliefs: Belief[];

  settings: Settings;
  bridgeStatus: "unknown" | "checking" | "online" | "offline";
  bridgeModels: BridgeModel[];

  governance: GovernanceState;
  lastCritique: Critique | null;

  chamberSeed: { castJson?: string; prompt?: string } | null;
  sendToChamber: (seed: { castJson?: string; prompt?: string }) => void;
  clearChamberSeed: () => void;

  // lifecycle
  init: () => Promise<void>;
  setModule: (m: ModuleId) => void;
  setMode: (m: AppMode) => void;
  setActiveSeeker: (id: string | null) => void;
  setPresence: (p: Presence) => void;

  // threads
  newThread: (title?: string) => Promise<Thread>;
  selectThread: (id: string) => Promise<void>;
  renameThread: (id: string, title: string) => Promise<void>;
  deleteThread: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  addMessage: (role: Message["role"], content: string, metaJson?: string | null) => Promise<Message | null>;

  // seekers
  saveSeeker: (s: Seeker) => Promise<void>;
  removeSeeker: (id: string) => Promise<void>;

  // relics
  refreshRelics: () => Promise<void>;
  saveRelic: (r: Relic) => Promise<void>;
  removeRelic: (id: string) => Promise<void>;

  // signals
  refreshSignals: () => Promise<void>;
  saveSignal: (s: Signal) => Promise<void>;
  scoreSignal: (id: string, status: Signal["status"], outcome: string) => Promise<void>;
  removeSignal: (id: string) => Promise<void>;

  // beliefs
  saveBelief: (b: Belief) => Promise<void>;

  // settings / bridge
  saveSettings: (s: Settings) => Promise<void>;
  probeBridge: (draft?: Partial<Settings>) => Promise<void>;

  // governance
  observe: (text: string) => Critique;
  addFeedback: (value: number, source?: FeedbackSample["source"]) => void;
  reflectNow: () => boolean;
  approve: (id: string) => void;
  reject: (id: string) => void;
  persistGovernance: () => void;
}

const GOV_KEY = "governance";

async function loadSettings(): Promise<Settings> {
  const g = async (k: string, d: string) => (await sanctuary.config.get(k)) ?? d;
  return {
    llmProvider: (await g("llm_provider", "none")) as Settings["llmProvider"],
    ollamaHost: await g("ollama_host", DEFAULT_SETTINGS.ollamaHost),
    ollamaModel: await g("ollama_model", DEFAULT_SETTINGS.ollamaModel),
    ollamaKey: await g("ollama_key", ""),
    llmTemperature: Number(await g("llm_temperature", "0.85")) || 0.85,
  };
}

export const useStore = create<SanctuaryStore>((set, get) => ({
  ready: false,
  module: "chamber",
  mode: "self",
  activeSeekerId: null,
  presence: "attuned",

  threads: [],
  activeThreadId: null,
  messages: [],

  seekers: [],
  relics: [],
  signals: [],
  beliefs: [],

  settings: DEFAULT_SETTINGS,
  bridgeStatus: "unknown",
  bridgeModels: [],

  governance: defaultGovernance(),
  lastCritique: null,

  chamberSeed: null,
  sendToChamber: (seed) => set({ chamberSeed: seed, module: "chamber" }),
  clearChamberSeed: () => set({ chamberSeed: null }),

  init: async () => {
    const [threads, seekers, relics, signals, beliefs, settings, govRaw] = await Promise.all([
      sanctuary.threads.list(),
      sanctuary.seekers.list(),
      sanctuary.relics.list(),
      sanctuary.signals.list(),
      sanctuary.beliefs.list(),
      loadSettings(),
      sanctuary.config.get(GOV_KEY),
    ]);

    let governance: GovernanceState = defaultGovernance();
    if (govRaw) {
      try {
        governance = JSON.parse(govRaw) as GovernanceState;
      } catch {
        governance = defaultGovernance();
      }
    }

    set({ threads, seekers, relics, signals, beliefs, settings, governance, ready: true });

    if (threads.length) {
      await get().selectThread(threads[0].id);
    }
    if (settings.llmProvider !== "none") {
      get().probeBridge();
    }
  },

  setModule: (m) => set({ module: m }),
  setMode: (m) => set({ mode: m, activeSeekerId: m === "self" ? null : get().activeSeekerId }),
  setActiveSeeker: (id) => set({ activeSeekerId: id }),
  setPresence: (p) => set({ presence: p }),

  // ─── threads ──────────────────────────────────────────────
  newThread: async (title) => {
    const { mode, activeSeekerId } = get();
    const thread = await sanctuary.threads.create(title ?? "New Reading", mode, mode === "seeker" ? activeSeekerId : null);
    set({ threads: [thread, ...get().threads], activeThreadId: thread.id, messages: [] });
    return thread;
  },
  selectThread: async (id) => {
    set({ activeThreadId: id });
    const messages = await sanctuary.messages.list(id);
    set({ messages });
  },
  renameThread: async (id, title) => {
    await sanctuary.threads.update(id, { title });
    set({ threads: get().threads.map((t) => (t.id === id ? { ...t, title } : t)) });
  },
  deleteThread: async (id) => {
    await sanctuary.threads.remove(id);
    const threads = get().threads.filter((t) => t.id !== id);
    const activeThreadId = get().activeThreadId === id ? threads[0]?.id ?? null : get().activeThreadId;
    set({ threads, activeThreadId });
    if (activeThreadId) await get().selectThread(activeThreadId);
    else set({ messages: [] });
  },
  togglePin: async (id) => {
    const t = get().threads.find((x) => x.id === id);
    if (!t) return;
    await sanctuary.threads.update(id, { pinned: !t.pinned });
    set({ threads: get().threads.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)) });
  },
  addMessage: async (role, content, metaJson = null) => {
    let { activeThreadId } = get();
    if (!activeThreadId) {
      const thread = await get().newThread();
      activeThreadId = thread.id;
    }
    const msg = await sanctuary.messages.append(activeThreadId, role, content, metaJson);
    set({ messages: [...get().messages, msg] });
    // refresh thread order
    const threads = await sanctuary.threads.list();
    set({ threads });
    return msg;
  },

  // ─── seekers ──────────────────────────────────────────────
  saveSeeker: async (s) => {
    await sanctuary.seekers.save(s);
    const seekers = await sanctuary.seekers.list();
    set({ seekers });
  },
  removeSeeker: async (id) => {
    await sanctuary.seekers.remove(id);
    set({ seekers: get().seekers.filter((s) => s.id !== id), activeSeekerId: get().activeSeekerId === id ? null : get().activeSeekerId });
  },

  // ─── relics ───────────────────────────────────────────────
  refreshRelics: async () => set({ relics: await sanctuary.relics.list() }),
  saveRelic: async (r) => {
    await sanctuary.relics.save(r);
    set({ relics: [r, ...get().relics] });
  },
  removeRelic: async (id) => {
    await sanctuary.relics.remove(id);
    set({ relics: get().relics.filter((r) => r.id !== id) });
  },

  // ─── signals ──────────────────────────────────────────────
  refreshSignals: async () => set({ signals: await sanctuary.signals.list() }),
  saveSignal: async (s) => {
    await sanctuary.signals.save(s);
    set({ signals: [s, ...get().signals.filter((x) => x.id !== s.id)] });
  },
  scoreSignal: async (id, status, outcome) => {
    await sanctuary.signals.score(id, status, outcome);
    set({ signals: get().signals.map((s) => (s.id === id ? { ...s, status, outcome, scoredAt: Date.now() } : s)) });
  },
  removeSignal: async (id) => {
    await sanctuary.signals.remove(id);
    set({ signals: get().signals.filter((s) => s.id !== id) });
  },

  // ─── beliefs ──────────────────────────────────────────────
  saveBelief: async (b) => {
    await sanctuary.beliefs.save(b);
    set({ beliefs: [b, ...get().beliefs.filter((x) => x.id !== b.id)] });
  },

  // ─── settings / bridge ────────────────────────────────────
  saveSettings: async (s) => {
    await Promise.all([
      sanctuary.config.set("llm_provider", s.llmProvider),
      sanctuary.config.set("ollama_host", s.ollamaHost),
      sanctuary.config.set("ollama_model", s.ollamaModel),
      sanctuary.config.set("ollama_key", s.ollamaKey),
      sanctuary.config.set("llm_temperature", String(s.llmTemperature)),
    ]);
    set({ settings: s });
    if (s.llmProvider !== "none") get().probeBridge();
    else set({ bridgeStatus: "unknown", bridgeModels: [] });
  },
  probeBridge: async (draft) => {
    if (!sanctuary.hasBridge) {
      set({ bridgeStatus: "offline" });
      return;
    }
    const s = { ...get().settings, ...draft };
    if (s.llmProvider === "none") {
      set({ bridgeStatus: "unknown", bridgeModels: [] });
      return;
    }
    set({ bridgeStatus: "checking" });
    try {
      const raw = await sanctuary.bridge.probe({
        provider: s.llmProvider,
        host: s.ollamaHost,
        key: s.ollamaKey,
      });
      let models: BridgeModel[] = raw.map((m) =>
        enrichBridgeModel(m.name, m.cloud, m.size)
      );
      if (s.llmProvider === "ollama_cloud") {
        const liveNames = models.map((m) => m.name);
        models = mergeCloudCatalog(liveNames);
      } else {
        models = sortBridgeModels(models);
      }
      set({ bridgeStatus: "online", bridgeModels: models });
    } catch {
      if (s.llmProvider === "ollama_cloud") {
        set({
          bridgeStatus: "offline",
          bridgeModels: mergeCloudCatalog([]),
        });
      } else {
        set({ bridgeStatus: "offline", bridgeModels: [] });
      }
    }
  },

  // ─── governance ───────────────────────────────────────────
  observe: (text) => {
    const state = get().governance;
    const critique = critiqueReading(state, text);
    const next = observeReading(state, text);
    set({ governance: next, lastCritique: critique });
    get().persistGovernance();
    return critique;
  },
  addFeedback: (value, source = "calibration") => {
    const g = get().governance;
    const sample: FeedbackSample = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      source, value: Math.max(0, Math.min(1, value)), at: Date.now(),
    };
    const feedback = flagOutliers([...g.feedback, sample]);
    set({ governance: { ...g, feedback } });
    get().persistGovernance();
  },
  reflectNow: () => {
    const g = get().governance;
    const proposal = runReflection(g);
    if (!proposal) {
      const ledger = appendLedger(g.ledger, "note", "Reflection found nothing to change — The Rule is in balance.");
      set({ governance: { ...g, ledger } });
      get().persistGovernance();
      return false;
    }
    set({ governance: { ...g, proposals: [proposal, ...g.proposals] } });
    get().persistGovernance();
    return true;
  },
  approve: (id) => {
    set({ governance: applyProposal(get().governance, id) });
    get().persistGovernance();
  },
  reject: (id) => {
    set({ governance: rejectProposal(get().governance, id) });
    get().persistGovernance();
  },
  persistGovernance: () => {
    sanctuary.config.set(GOV_KEY, JSON.stringify(get().governance)).catch(() => {});
  },
}));

export { robustStat };
