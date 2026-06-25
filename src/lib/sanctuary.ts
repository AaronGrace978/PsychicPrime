// ═══════════════════════════════════════════════════════════════
//  The Sanctuary API — one surface, two bodies.
//  In Tauri it speaks to the Rust Reliquary; in a plain browser it
//  keeps a faithful localStorage mirror so development never breaks.
// ═══════════════════════════════════════════════════════════════

import { invoke, Channel } from "@tauri-apps/api/core";
import type {
  Thread,
  Message,
  Seeker,
  Relic,
  Signal,
  Belief,
  ReadingEvent,
  Settings,
  BridgeModel,
} from "../types";

export const isTauri =
  typeof window !== "undefined" &&
  ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);

// ─── localStorage mirror (browser dev) ───────────────────────

const PREFIX = "psychicprime.";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}
function uid(): string {
  return (crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);
}
const now = () => Date.now();

// Web mock implementations -------------------------------------

const webThreads = {
  list: async (): Promise<Thread[]> => {
    const t = load<Thread[]>("threads", []);
    return [...t].sort((a, b) =>
      a.pinned === b.pinned ? b.updatedAt - a.updatedAt : a.pinned ? -1 : 1
    );
  },
  create: async (title: string, mode: Thread["mode"], seekerId: string | null): Promise<Thread> => {
    const t = load<Thread[]>("threads", []);
    const thread: Thread = {
      id: uid(), title, mode, seekerId, summary: "", pinned: false,
      archived: false, createdAt: now(), updatedAt: now(),
    };
    save("threads", [thread, ...t]);
    return thread;
  },
  update: async (id: string, patch: Partial<Thread>): Promise<void> => {
    const t = load<Thread[]>("threads", []).map((x) =>
      x.id === id ? { ...x, ...patch, updatedAt: now() } : x
    );
    save("threads", t);
  },
  remove: async (id: string): Promise<void> => {
    save("threads", load<Thread[]>("threads", []).filter((x) => x.id !== id));
    save("messages", load<Message[]>("messages", []).filter((m) => m.threadId !== id));
  },
};

const webMessages = {
  list: async (threadId: string): Promise<Message[]> =>
    load<Message[]>("messages", [])
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.createdAt - b.createdAt),
  append: async (threadId: string, role: Message["role"], content: string, metaJson: string | null): Promise<Message> => {
    const msg: Message = { id: uid(), threadId, role, content, metaJson, createdAt: now() };
    save("messages", [...load<Message[]>("messages", []), msg]);
    await webThreads.update(threadId, {});
    return msg;
  },
};

function genericList<T extends { createdAt: number }>(key: string): T[] {
  return [...load<T[]>(key, [])].sort((a, b) => b.createdAt - a.createdAt);
}

// ─── unified API ─────────────────────────────────────────────

export const sanctuary = {
  isTauri,

  threads: {
    list: (): Promise<Thread[]> => (isTauri ? invoke("list_threads") : webThreads.list()),
    create: (title: string, mode: Thread["mode"], seekerId: string | null): Promise<Thread> =>
      isTauri ? invoke("create_thread", { title, mode, seekerId }) : webThreads.create(title, mode, seekerId),
    update: (id: string, patch: { title?: string; summary?: string; pinned?: boolean; archived?: boolean }): Promise<void> =>
      isTauri ? invoke("update_thread", { id, ...patch }) : webThreads.update(id, patch),
    remove: (id: string): Promise<void> =>
      isTauri ? invoke("delete_thread", { id }) : webThreads.remove(id),
  },

  messages: {
    list: (threadId: string): Promise<Message[]> =>
      isTauri ? invoke("list_messages", { threadId }) : webMessages.list(threadId),
    append: (threadId: string, role: Message["role"], content: string, metaJson: string | null = null): Promise<Message> =>
      isTauri ? invoke("append_message", { threadId, role, content, metaJson }) : webMessages.append(threadId, role, content, metaJson),
  },

  seekers: {
    list: (): Promise<Seeker[]> => (isTauri ? invoke("list_seekers") : Promise.resolve(genericList<Seeker>("seekers"))),
    save: async (seeker: Seeker): Promise<void> => {
      if (isTauri) return invoke("save_seeker", { seeker });
      const all = load<Seeker[]>("seekers", []).filter((s) => s.id !== seeker.id);
      save("seekers", [seeker, ...all]);
    },
    remove: async (id: string): Promise<void> => {
      if (isTauri) return invoke("delete_seeker", { id });
      save("seekers", load<Seeker[]>("seekers", []).filter((s) => s.id !== id));
    },
  },

  relics: {
    list: (): Promise<Relic[]> => (isTauri ? invoke("list_relics") : Promise.resolve(genericList<Relic>("relics"))),
    search: async (query: string, limit = 20): Promise<Relic[]> => {
      if (isTauri) return invoke("search_relics", { query, limit });
      const q = query.toLowerCase().trim();
      const all = genericList<Relic>("relics");
      if (!q) return all;
      return all.filter((r) => (r.title + " " + r.bodyMd + " " + r.tagsJson).toLowerCase().includes(q)).slice(0, limit);
    },
    save: async (relic: Relic): Promise<void> => {
      if (isTauri) return invoke("save_relic", { relic });
      save("relics", [relic, ...load<Relic[]>("relics", [])]);
    },
    remove: async (id: string): Promise<void> => {
      if (isTauri) return invoke("delete_relic", { id });
      save("relics", load<Relic[]>("relics", []).filter((r) => r.id !== id));
    },
  },

  signals: {
    list: (): Promise<Signal[]> => (isTauri ? invoke("list_signals") : Promise.resolve(genericList<Signal>("signals"))),
    save: async (signal: Signal): Promise<void> => {
      if (isTauri) return invoke("save_signal", { signal });
      save("signals", [signal, ...load<Signal[]>("signals", []).filter((s) => s.id !== signal.id)]);
    },
    score: async (id: string, status: Signal["status"], outcome: string): Promise<void> => {
      if (isTauri) return invoke("score_signal", { id, status, outcome });
      save("signals", load<Signal[]>("signals", []).map((s) => (s.id === id ? { ...s, status, outcome, scoredAt: now() } : s)));
    },
    remove: async (id: string): Promise<void> => {
      if (isTauri) return invoke("delete_signal", { id });
      save("signals", load<Signal[]>("signals", []).filter((s) => s.id !== id));
    },
  },

  beliefs: {
    list: (): Promise<Belief[]> => (isTauri ? invoke("list_beliefs") : Promise.resolve(genericList<Belief>("beliefs"))),
    save: async (belief: Belief): Promise<void> => {
      if (isTauri) return invoke("save_belief", { belief });
      save("beliefs", [belief, ...load<Belief[]>("beliefs", []).filter((b) => b.id !== belief.id)]);
    },
  },

  config: {
    get: async (key: string): Promise<string | null> => {
      if (isTauri) return invoke("config_get", { key });
      return load<string | null>("config." + key, null);
    },
    set: async (key: string, value: string): Promise<void> => {
      if (isTauri) return invoke("config_set", { key, value });
      save("config." + key, value);
    },
  },

  bridge: {
    probe: (opts?: {
      provider?: Settings["llmProvider"];
      host?: string;
      key?: string;
    }): Promise<BridgeModel[]> =>
      isTauri
        ? invoke("probe_bridge", {
            provider: opts?.provider ?? null,
            host: opts?.host ?? null,
            key: opts?.key ?? null,
          })
        : Promise.reject("Bridge runs only in the desktop Sanctuary."),
    conductReading: async (
      request: {
        mode: string;
        register: string;
        castJson?: string;
        userMessage: string;
        history?: { role: string; content: string }[];
        recalledRelics?: string[];
      },
      onEvent: (e: ReadingEvent) => void
    ): Promise<string> => {
      if (!isTauri) {
        throw new Error("no-bridge");
      }
      const channel = new Channel<ReadingEvent>();
      channel.onmessage = onEvent;
      // Rust expects snake_case fields inside `request`.
      const payload = {
        mode: request.mode,
        register: request.register,
        cast_json: request.castJson ?? "",
        user_message: request.userMessage,
        history: request.history ?? [],
        recalled_relics: request.recalledRelics ?? [],
      };
      return invoke("conduct_reading", { request: payload, onEvent: channel });
    },
  },
};
