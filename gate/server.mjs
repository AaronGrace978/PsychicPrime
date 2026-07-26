#!/usr/bin/env node
/**
 * PsychicPrime — The Gate
 * A local Sanctuary proxy so phones (and the wider net) can enter.
 * BostonAi.io energy: ship it, share it, keep the soul of the work local-first.
 *
 *   npm run gate
 *   GATE_TOKEN=secret GATE_PORT=18765 npm run gate
 *   GATE_PUBLIC=1 npm run gate   # try cloudflared tunnel if installed
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createStore } from "./store.mjs";
import { systemPrompt } from "./persona.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.GATE_PORT || 18765);
const TOKEN = process.env.GATE_TOKEN || "";
const HOST = process.env.GATE_HOST || "0.0.0.0";
const DATA_DIR =
  process.env.GATE_DATA || path.join(os.homedir(), ".psychicprime-gate");

const store = createStore(DATA_DIR);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Gate-Token",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    ...headers,
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function authorized(req) {
  if (!TOKEN) return true;
  return req.headers["x-gate-token"] === TOKEN;
}

function lanUrls() {
  const nets = os.networkInterfaces();
  const urls = [];
  for (const list of Object.values(nets)) {
    for (const n of list || []) {
      if (n.family === "IPv4" && !n.internal) {
        urls.push(`http://${n.address}:${PORT}`);
      }
    }
  }
  return urls;
}

function gateBootScript() {
  const cfg = JSON.stringify({
    version: "0.1.0",
    token: TOKEN || null,
    mode: "gate",
  });
  return `<script>window.__PSYCHIC_GATE__=${cfg};</script>`;
}

function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath.split("?")[0]);
  if (rel === "/") rel = "/index.html";
  const filePath = path.normalize(path.join(DIST, rel));
  if (!filePath.startsWith(DIST)) {
    send(res, 403, "Forbidden");
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // SPA fallback
    const index = path.join(DIST, "index.html");
    if (!fs.existsSync(index)) {
      send(
        res,
        503,
        "Sanctuary Gate: run `npm run build` first so dist/ exists."
      );
      return;
    }
    let html = fs.readFileSync(index, "utf8");
    html = html.replace("</head>", `${gateBootScript()}</head>`);
    send(res, 200, html, { "Content-Type": "text/html; charset=utf-8" });
    return;
  }
  let data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") {
    let html = data.toString("utf8");
    html = html.replace("</head>", `${gateBootScript()}</head>`);
    data = Buffer.from(html, "utf8");
  }
  send(res, 200, data, { "Content-Type": MIME[ext] || "application/octet-stream" });
}

async function llmConfig() {
  const provider = (await store.configGet("llm_provider")) || "ollama_local";
  const host = (await store.configGet("ollama_host")) || "http://127.0.0.1:11434";
  const model = (await store.configGet("ollama_model")) || "llama3.1";
  const key = (await store.configGet("ollama_key")) || "";
  const temperature = Number((await store.configGet("llm_temperature")) || "0.85");
  return { provider, host, model, key, temperature };
}

function baseUrl(cfg) {
  if (cfg.provider === "ollama_cloud") return "https://ollama.com";
  return (cfg.host || "http://127.0.0.1:11434").replace(/\/$/, "");
}

async function probeBridge(body) {
  const saved = await llmConfig();
  const cfg = {
    provider: body?.provider || saved.provider,
    host: body?.host || saved.host,
    key: body?.key ?? saved.key,
  };
  if (cfg.provider === "none") return [];
  const url = `${baseUrl(cfg)}/api/tags`;
  const headers = {};
  if (cfg.provider === "ollama_cloud" && cfg.key) {
    headers.Authorization = `Bearer ${cfg.key}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`bridge probe failed: ${res.status}`);
  const data = await res.json();
  return (data.models || []).map((m) => ({
    name: m.name,
    cloud: cfg.provider === "ollama_cloud",
    size: m.size ?? null,
  }));
}

async function streamReading(req, res, body) {
  const cfg = await llmConfig();
  if (cfg.provider === "none") {
    send(res, 400, { error: "Bridge provider is none — set Ollama in Settings." });
    return;
  }

  const messages = [
    { role: "system", content: systemPrompt(body.mode || "self", body.register || "reading") },
  ];
  for (const h of body.history || []) {
    messages.push({ role: h.role, content: h.content });
  }
  if (body.castJson) {
    messages.push({
      role: "user",
      content: `Cast context (symbols already drawn):\n${body.castJson}`,
    });
  }
  if (body.recalledRelics?.length) {
    messages.push({
      role: "user",
      content: `Recalled relics:\n- ${body.recalledRelics.join("\n- ")}`,
    });
  }
  messages.push({ role: "user", content: body.userMessage || "" });

  const url = `${baseUrl(cfg)}/api/chat`;
  const headers = { "Content-Type": "application/json" };
  if (cfg.provider === "ollama_cloud" && cfg.key) {
    headers.Authorization = `Bearer ${cfg.key}`;
  }

  const upstream = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: cfg.model,
      messages,
      stream: true,
      options: { temperature: cfg.temperature, top_p: 0.9 },
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    send(res, 502, { error: `Ollama error ${upstream.status}: ${text.slice(0, 400)}` });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Gate-Token",
  });

  const writeEvent = (obj) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  let full = "";
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const chunk = JSON.parse(trimmed);
          const token = chunk.message?.content || "";
          if (token) {
            full += token;
            writeEvent({ type: "token", text: token });
          }
          if (chunk.done) {
            writeEvent({ type: "done", full });
          }
        } catch {
          /* ignore partial */
        }
      }
    }
    if (full) writeEvent({ type: "done", full });
  } catch (e) {
    writeEvent({ type: "error", message: String(e.message || e) });
  }
  res.end();
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    send(res, 204, "");
    return;
  }
  if (!authorized(req)) {
    send(res, 401, { error: "Gate token required (X-Gate-Token)." });
    return;
  }

  const p = url.pathname.replace(/^\/api/, "") || "/";
  const body = ["POST", "PUT", "PATCH"].includes(req.method) ? await readBody(req) : null;

  try {
    if (p === "/health" && req.method === "GET") {
      send(res, 200, {
        ok: true,
        name: "PsychicPrime Gate",
        version: "0.1.0",
        tokenRequired: Boolean(TOKEN),
      });
      return;
    }

    // Threads
    if (p === "/threads" && req.method === "GET") return send(res, 200, await store.listThreads());
    if (p === "/threads" && req.method === "POST") return send(res, 200, await store.createThread(body));
    if (p.startsWith("/threads/") && req.method === "PATCH") {
      const id = p.split("/")[2];
      await store.updateThread(id, body || {});
      return send(res, 200, { ok: true });
    }
    if (p.startsWith("/threads/") && req.method === "DELETE") {
      await store.deleteThread(p.split("/")[2]);
      return send(res, 200, { ok: true });
    }

    // Messages
    if (p.startsWith("/threads/") && p.endsWith("/messages") && req.method === "GET") {
      return send(res, 200, await store.listMessages(p.split("/")[2]));
    }
    if (p.startsWith("/threads/") && p.endsWith("/messages") && req.method === "POST") {
      const id = p.split("/")[2];
      return send(res, 200, await store.appendMessage(id, body));
    }

    // Seekers / relics / signals / beliefs
    if (p === "/seekers" && req.method === "GET") return send(res, 200, await store.list("seekers"));
    if (p === "/seekers" && req.method === "POST") {
      await store.save("seekers", body);
      return send(res, 200, { ok: true });
    }
    if (p.startsWith("/seekers/") && req.method === "DELETE") {
      await store.remove("seekers", p.split("/")[2]);
      return send(res, 200, { ok: true });
    }

    if (p === "/relics" && req.method === "GET") return send(res, 200, await store.list("relics"));
    if (p === "/relics/search" && req.method === "GET") {
      const q = url.searchParams.get("q") || "";
      const limit = Number(url.searchParams.get("limit") || 5);
      return send(res, 200, await store.searchRelics(q, limit));
    }
    if (p === "/relics" && req.method === "POST") {
      await store.save("relics", body);
      return send(res, 200, { ok: true });
    }
    if (p.startsWith("/relics/") && req.method === "DELETE") {
      await store.remove("relics", p.split("/")[2]);
      return send(res, 200, { ok: true });
    }

    if (p === "/signals" && req.method === "GET") return send(res, 200, await store.list("signals"));
    if (p === "/signals" && req.method === "POST") {
      await store.save("signals", body);
      return send(res, 200, { ok: true });
    }
    if (p.startsWith("/signals/") && p.endsWith("/score") && req.method === "POST") {
      const id = p.split("/")[2];
      await store.scoreSignal(id, body?.status, body?.outcome);
      return send(res, 200, { ok: true });
    }
    if (p.startsWith("/signals/") && req.method === "DELETE") {
      await store.remove("signals", p.split("/")[2]);
      return send(res, 200, { ok: true });
    }

    if (p === "/beliefs" && req.method === "GET") return send(res, 200, await store.list("beliefs"));
    if (p === "/beliefs" && req.method === "POST") {
      await store.save("beliefs", body);
      return send(res, 200, { ok: true });
    }

    if (p.startsWith("/config/") && req.method === "GET") {
      const key = decodeURIComponent(p.slice("/config/".length));
      return send(res, 200, { value: await store.configGet(key) });
    }
    if (p.startsWith("/config/") && req.method === "PUT") {
      const key = decodeURIComponent(p.slice("/config/".length));
      await store.configSet(key, body?.value ?? "");
      return send(res, 200, { ok: true });
    }

    if (p === "/bridge/probe" && req.method === "POST") {
      return send(res, 200, await probeBridge(body || {}));
    }
    if (p === "/bridge/read" && req.method === "POST") {
      return streamReading(req, res, body || {});
    }

    send(res, 404, { error: `Unknown Gate route: ${req.method} ${p}` });
  } catch (e) {
    send(res, 500, { error: String(e.message || e) });
  }
}

if (!fs.existsSync(DIST)) {
  console.error("\n  Sanctuary Gate needs a built frontend.");
  console.error("  Run:  npm run build\n");
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url);
    return;
  }
  serveStatic(req, res, url.pathname);
});

server.listen(PORT, HOST, async () => {
  const local = `http://127.0.0.1:${PORT}`;
  const lans = lanUrls();
  console.log("");
  console.log("  ✦ PsychicPrime — The Gate is open");
  console.log("  ─────────────────────────────────");
  console.log(`  Local : ${local}`);
  for (const u of lans) console.log(`  Phone : ${u}`);
  if (TOKEN) console.log(`  Token : ${TOKEN}  (sent as X-Gate-Token)`);
  else console.log("  Token : (none — LAN open; set GATE_TOKEN for a lock)");
  console.log(`  Data  : ${DATA_DIR}`);
  console.log("");
  console.log("  On your phone (same Wi‑Fi): open the Phone URL above.");
  console.log("  Public link (bostonai.io energy): GATE_PUBLIC=1 npm run gate");
  console.log("  Or: cloudflared tunnel --url " + local);
  console.log("");

  if (process.env.GATE_PUBLIC === "1") {
    const bin = process.env.CLOUDFLARED || "cloudflared";
    console.log(`  Attempting public tunnel via ${bin}…`);
    const child = spawn(bin, ["tunnel", "--url", local], { stdio: ["ignore", "pipe", "pipe"] });
    const onData = (buf) => {
      const text = buf.toString();
      process.stdout.write(text);
      const m = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (m) {
        console.log("");
        console.log(`  ✧ Public Gate URL: ${m[0]}`);
        console.log("    Share that with your phone from anywhere.");
        console.log("");
      }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("error", () => {
      console.log("  cloudflared not found. Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/");
      console.log(`  Then: cloudflared tunnel --url ${local}`);
    });
  }
});
