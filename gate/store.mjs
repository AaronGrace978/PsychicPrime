import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function uid() {
  return crypto.randomUUID();
}

function now() {
  return Date.now();
}

export function createStore(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, "gate.json");

  function read() {
    if (!fs.existsSync(file)) {
      return {
        threads: [],
        messages: [],
        seekers: [],
        relics: [],
        signals: [],
        beliefs: [],
        config: {},
      };
    }
    return JSON.parse(fs.readFileSync(file, "utf8"));
  }

  function write(db) {
    fs.writeFileSync(file, JSON.stringify(db, null, 2));
  }

  return {
    async listThreads() {
      const db = read();
      return [...db.threads].sort((a, b) =>
        a.pinned === b.pinned ? b.updatedAt - a.updatedAt : a.pinned ? -1 : 1
      );
    },
    async createThread({ title, mode, seekerId }) {
      const db = read();
      const thread = {
        id: uid(),
        title: title || "Untitled",
        mode: mode || "self",
        seekerId: seekerId ?? null,
        summary: "",
        pinned: false,
        archived: false,
        createdAt: now(),
        updatedAt: now(),
      };
      db.threads.unshift(thread);
      write(db);
      return thread;
    },
    async updateThread(id, patch) {
      const db = read();
      db.threads = db.threads.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: now() } : t
      );
      write(db);
    },
    async deleteThread(id) {
      const db = read();
      db.threads = db.threads.filter((t) => t.id !== id);
      db.messages = db.messages.filter((m) => m.threadId !== id);
      write(db);
    },
    async listMessages(threadId) {
      const db = read();
      return db.messages
        .filter((m) => m.threadId === threadId)
        .sort((a, b) => a.createdAt - b.createdAt);
    },
    async appendMessage(threadId, { role, content, metaJson }) {
      const db = read();
      const msg = {
        id: uid(),
        threadId,
        role,
        content,
        metaJson: metaJson ?? null,
        createdAt: now(),
      };
      db.messages.push(msg);
      db.threads = db.threads.map((t) =>
        t.id === threadId ? { ...t, updatedAt: now() } : t
      );
      write(db);
      return msg;
    },
    async list(key) {
      const db = read();
      return [...(db[key] || [])].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    },
    async save(key, item) {
      const db = read();
      const list = db[key] || [];
      db[key] = [item, ...list.filter((x) => x.id !== item.id)];
      write(db);
    },
    async remove(key, id) {
      const db = read();
      db[key] = (db[key] || []).filter((x) => x.id !== id);
      write(db);
    },
    async searchRelics(query, limit = 5) {
      const q = (query || "").toLowerCase();
      const db = read();
      return (db.relics || [])
        .filter(
          (r) =>
            !q ||
            r.title?.toLowerCase().includes(q) ||
            r.bodyMd?.toLowerCase().includes(q)
        )
        .slice(0, limit);
    },
    async scoreSignal(id, status, outcome) {
      const db = read();
      db.signals = (db.signals || []).map((s) =>
        s.id === id ? { ...s, status, outcome, scoredAt: now() } : s
      );
      write(db);
    },
    async configGet(key) {
      return read().config[key] ?? null;
    },
    async configSet(key, value) {
      const db = read();
      db.config[key] = value;
      write(db);
    },
  };
}
