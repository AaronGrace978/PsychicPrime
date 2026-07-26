// ═══════════════════════════════════════════════════════════════
//  The Sanctuary API — one surface, three bodies.
//  Tauri → Rust Reliquary · Gate → phone/LAN proxy · else localStorage.
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

declare global {
  interface Window {
    __PSYCHIC_GATE__?: { version?: string; token?: string | null; mode?: string };
  }
}

export const isGate =
  typeof window !== "undefined" && Boolean(window.__PSYCHIC_GATE__);

/** True when a real Bridge host is available (desktop or Gate). */
export const hasBridge = isTauri || isGate;

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
  return (
    crypto.randomUUID?.() ??
    `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
const now = () => Date.now();

// ─── Gate HTTP client ────────────────────────────────────────

async function gateFetch<T = unknown>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const g = window.__PSYCHIC_GATE__;
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (!(opts.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }
  if (g?.token) headers["X-Gate-Token"] = g.token;

  const res = await fetch(`/api${path}`, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Gate ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return undefined as T;
}

async function gateStreamReading(
  request: {
    mode: string;
    register: string;
    castJson?: string;
    userMessage: string;
    history?: { role: string; content: string }[];
    recalledRelics?: string[];
  },
  onEvent: (e: ReadingEvent) => void
): Promise<string> {
  const g = window.__PSYCHIC_GATE__;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (g?.token) headers["X-Gate-Token"] = g.token;

  const res = await fetch("/api/bridge/read", {
    method: "POST",
    headers,
    body: JSON.stringify({
      mode: request.mode,
      register: request.register,
      castJson: request.castJson ?? "",
      userMessage: request.userMessage,
      history: request.history ?? [],
      recalledRelics: request.recalledRelics ?? [],
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`Gate read failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    for (const part of parts) {
      const line = part
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.startsWith("data:"));
      if (!line) continue;
      try {
        const ev = JSON.parse(line.slice(5).trim()) as ReadingEvent;
        onEvent(ev);
        if (ev.type === "token") full += ev.text;
        if (ev.type === "done" && ev.full) full = ev.full;
        if (ev.type === "error") throw new Error(ev.message);
      } catch (e) {
        if (e instanceof Error && e.message && !e.message.includes("JSON")) throw e;
      }
    }
  }
  return full;
}

// Web mock implementations -------------------------------------

const webThreads = {
  list: async (): Promise<Thread[]> => {
    const t = load<Thread[]>("threads", []);
    return [...t].sort((a, b) =>
      a.pinned === b.pinned ? b.updatedAt - a.updatedAt : a.pinned ? -1 : 1
    );
  },
  create: async (
    title: string,
    mode: Thread["mode"],
    seekerId: string | null
  ): Promise<Thread> => {
    const t = load<Thread[]>("threads", []);
    const thread: Thread = {
      id: uid(),
      title,
      mode,
      seekerId,
      summary: "",
      pinned: false,
      archived: false,
      createdAt: now(),
      updatedAt: now(),
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
    save(
      "threads",
      load<Thread[]>("threads", []).filter((x) => x.id !== id)
    );
    save(
      "messages",
      load<Message[]>("messages", []).filter((m) => m.threadId !== id)
    );
  },
};

const webMessages = {
  list: async (threadId: string): Promise<Message[]> =>
    load<Message[]>("messages", [])
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.createdAt - b.createdAt),
  append: async (
    threadId: string,
    role: Message["role"],
    content: string,
    metaJson: string | null
  ): Promise<Message> => {
    const msg: Message = {
      id: uid(),
      threadId,
      role,
      content,
      metaJson,
      createdAt: now(),
    };
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
  isGate,
  hasBridge,

  threads: {
    list: (): Promise<Thread[]> =>
      isTauri
        ? invoke("list_threads")
        : isGate
          ? gateFetch("/threads")
          : webThreads.list(),
    create: (
      title: string,
      mode: Thread["mode"],
      seekerId: string | null
    ): Promise<Thread> =>
      isTauri
        ? invoke("create_thread", { title, mode, seekerId })
        : isGate
          ? gateFetch("/threads", {
              method: "POST",
              body: JSON.stringify({ title, mode, seekerId }),
            })
          : webThreads.create(title, mode, seekerId),
    update: (
      id: string,
      patch: {
        title?: string;
        summary?: string;
        pinned?: boolean;
        archived?: boolean;
      }
    ): Promise<void> =>
      isTauri
        ? invoke("update_thread", { id, ...patch })
        : isGate
          ? gateFetch(`/threads/${id}`, {
              method: "PATCH",
              body: JSON.stringify(patch),
            }).then(() => undefined)
          : webThreads.update(id, patch),
    remove: (id: string): Promise<void> =>
      isTauri
        ? invoke("delete_thread", { id })
        : isGate
          ? gateFetch(`/threads/${id}`, { method: "DELETE" }).then(() => undefined)
          : webThreads.remove(id),
  },

  messages: {
    list: (threadId: string): Promise<Message[]> =>
      isTauri
        ? invoke("list_messages", { threadId })
        : isGate
          ? gateFetch(`/threads/${threadId}/messages`)
          : webMessages.list(threadId),
    append: (
      threadId: string,
      role: Message["role"],
      content: string,
      metaJson: string | null = null
    ): Promise<Message> =>
      isTauri
        ? invoke("append_message", { threadId, role, content, metaJson })
        : isGate
          ? gateFetch(`/threads/${threadId}/messages`, {
              method: "POST",
              body: JSON.stringify({ role, content, metaJson }),
            })
          : webMessages.append(threadId, role, content, metaJson),
  },

  seekers: {
    list: (): Promise<Seeker[]> =>
      isTauri
        ? invoke("list_seekers")
        : isGate
          ? gateFetch("/seekers")
          : Promise.resolve(genericList<Seeker>("seekers")),
    save: async (seeker: Seeker): Promise<void> => {
      if (isTauri) return invoke("save_seeker", { seeker });
      if (isGate) {
        await gateFetch("/seekers", {
          method: "POST",
          body: JSON.stringify(seeker),
        });
        return;
      }
      save("seekers", [
        seeker,
        ...load<Seeker[]>("seekers", []).filter((s) => s.id !== seeker.id),
      ]);
    },
    remove: async (id: string): Promise<void> => {
      if (isTauri) return invoke("delete_seeker", { id });
      if (isGate) {
        await gateFetch(`/seekers/${id}`, { method: "DELETE" });
        return;
      }
      save(
        "seekers",
        load<Seeker[]>("seekers", []).filter((s) => s.id !== id)
      );
    },
  },

  relics: {
    list: (): Promise<Relic[]> =>
      isTauri
        ? invoke("list_relics")
        : isGate
          ? gateFetch("/relics")
          : Promise.resolve(genericList<Relic>("relics")),
    search: (query: string, limit = 5): Promise<Relic[]> => {
      if (isTauri) return invoke("search_relics", { query, limit });
      if (isGate) {
        return gateFetch(
          `/relics/search?q=${encodeURIComponent(query)}&limit=${limit}`
        );
      }
      const q = query.toLowerCase();
      return Promise.resolve(
        genericList<Relic>("relics")
          .filter(
            (r) =>
              r.title.toLowerCase().includes(q) ||
              r.bodyMd.toLowerCase().includes(q)
          )
          .slice(0, limit)
      );
    },
    save: async (relic: Relic): Promise<void> => {
      if (isTauri) return invoke("save_relic", { relic });
      if (isGate) {
        await gateFetch("/relics", {
          method: "POST",
          body: JSON.stringify(relic),
        });
        return;
      }
      save("relics", [
        relic,
        ...load<Relic[]>("relics", []).filter((r) => r.id !== relic.id),
      ]);
    },
    remove: async (id: string): Promise<void> => {
      if (isTauri) return invoke("delete_relic", { id });
      if (isGate) {
        await gateFetch(`/relics/${id}`, { method: "DELETE" });
        return;
      }
      save(
        "relics",
        load<Relic[]>("relics", []).filter((r) => r.id !== id)
      );
    },
  },

  signals: {
    list: (): Promise<Signal[]> =>
      isTauri
        ? invoke("list_signals")
        : isGate
          ? gateFetch("/signals")
          : Promise.resolve(genericList<Signal>("signals")),
    save: async (signal: Signal): Promise<void> => {
      if (isTauri) return invoke("save_signal", { signal });
      if (isGate) {
        await gateFetch("/signals", {
          method: "POST",
          body: JSON.stringify(signal),
        });
        return;
      }
      save("signals", [
        signal,
        ...load<Signal[]>("signals", []).filter((s) => s.id !== signal.id),
      ]);
    },
    score: async (
      id: string,
      status: Signal["status"],
      outcome: string
    ): Promise<void> => {
      if (isTauri) return invoke("score_signal", { id, status, outcome });
      if (isGate) {
        await gateFetch(`/signals/${id}/score`, {
          method: "POST",
          body: JSON.stringify({ status, outcome }),
        });
        return;
      }
      save(
        "signals",
        load<Signal[]>("signals", []).map((s) =>
          s.id === id ? { ...s, status, outcome, scoredAt: now() } : s
        )
      );
    },
    remove: async (id: string): Promise<void> => {
      if (isTauri) return invoke("delete_signal", { id });
      if (isGate) {
        await gateFetch(`/signals/${id}`, { method: "DELETE" });
        return;
      }
      save(
        "signals",
        load<Signal[]>("signals", []).filter((s) => s.id !== id)
      );
    },
  },

  beliefs: {
    list: (): Promise<Belief[]> =>
      isTauri
        ? invoke("list_beliefs")
        : isGate
          ? gateFetch("/beliefs")
          : Promise.resolve(genericList<Belief>("beliefs")),
    save: async (belief: Belief): Promise<void> => {
      if (isTauri) return invoke("save_belief", { belief });
      if (isGate) {
        await gateFetch("/beliefs", {
          method: "POST",
          body: JSON.stringify(belief),
        });
        return;
      }
      save("beliefs", [
        belief,
        ...load<Belief[]>("beliefs", []).filter((b) => b.id !== belief.id),
      ]);
    },
  },

  config: {
    get: async (key: string): Promise<string | null> => {
      if (isTauri) return invoke("config_get", { key });
      if (isGate) {
        const r = await gateFetch<{ value: string | null }>(
          `/config/${encodeURIComponent(key)}`
        );
        return r.value;
      }
      return load<string | null>("config." + key, null);
    },
    set: async (key: string, value: string): Promise<void> => {
      if (isTauri) return invoke("config_set", { key, value });
      if (isGate) {
        await gateFetch(`/config/${encodeURIComponent(key)}`, {
          method: "PUT",
          body: JSON.stringify({ value }),
        });
        return;
      }
      save("config." + key, value);
    },
  },

  bridge: {
    probe: (opts?: {
      provider?: Settings["llmProvider"];
      host?: string;
      key?: string;
    }): Promise<BridgeModel[]> => {
      if (isTauri) {
        return invoke("probe_bridge", {
          provider: opts?.provider ?? null,
          host: opts?.host ?? null,
          key: opts?.key ?? null,
        });
      }
      if (isGate) {
        return gateFetch("/bridge/probe", {
          method: "POST",
          body: JSON.stringify({
            provider: opts?.provider,
            host: opts?.host,
            key: opts?.key,
          }),
        });
      }
      return Promise.reject(new Error("Bridge runs only in desktop or Gate."));
    },
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
      if (isGate) return gateStreamReading(request, onEvent);
      if (!isTauri) throw new Error("no-bridge");
      const channel = new Channel<ReadingEvent>();
      channel.onmessage = onEvent;
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
