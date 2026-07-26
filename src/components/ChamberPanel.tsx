// ═══════════════════════════════════════════════════════════════
//  The Chamber — where the reading is spoken. Streams from the
//  Bridge when present; otherwise the inner light carries it.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { sanctuary } from "../lib/sanctuary";
import { chamberFallback } from "../prime/intuition";
import Prose from "./Prose";

export default function ChamberPanel() {
  const {
    messages, threads, activeThreadId, mode, bridgeStatus,
    addMessage, newThread, selectThread, deleteThread, renameThread,
    setPresence, observe, chamberSeed, clearChamberSeed,
  } = useStore();

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const castRef = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chamberSeed) {
      if (chamberSeed.prompt) setInput(chamberSeed.prompt);
      castRef.current = chamberSeed.castJson;
      clearChamberSeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chamberSeed]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function speak() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    await addMessage("seeker", text);
    setPresence("reading");

    const cast = castRef.current;
    castRef.current = undefined;

    const history = messages.slice(-10).map((m) => ({
      role: m.role === "oracle" ? "assistant" : "user",
      content: m.content,
    }));

    let recalledRelics: string[] = [];
    try {
      const found = await sanctuary.relics.search(text, 3);
      recalledRelics = found.map((r) => `${r.title}: ${r.bodyMd.slice(0, 120)}`);
    } catch { /* ignore */ }

    let finalText = "";
    let live = "";
    setStreaming("");

    try {
      if (!sanctuary.hasBridge || bridgeStatus !== "online") throw new Error("no-bridge");
      finalText = await sanctuary.bridge.conductReading(
        { mode, register: "reading", castJson: cast, userMessage: text, history, recalledRelics },
        (e) => {
          if (e.type === "token") { live += e.text; setStreaming(live); }
          else if (e.type === "done" && e.full) { live = e.full; setStreaming(live); }
        }
      );
      if (!finalText) finalText = live;
    } catch {
      finalText =
        (cast ? "I read the cast you brought me.\n\n" : "") +
        chamberFallback(text);
    }

    setStreaming(null);
    await addMessage("oracle", finalText);
    observe(finalText);
    setPresence("attuned");
    setBusy(false);
  }

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="panel chamber" style={{ height: "calc(100vh - 150px)", maxWidth: 900 }}>
      <div className="row between" style={{ marginBottom: 12 }}>
        <div className="row">
          <select
            className="select"
            style={{ width: "auto", minWidth: 200 }}
            value={activeThreadId ?? ""}
            onChange={(e) => e.target.value && selectThread(e.target.value)}
          >
            {threads.length === 0 && <option value="">No readings yet</option>}
            {threads.map((t) => (
              <option key={t.id} value={t.id}>{t.pinned ? "★ " : ""}{t.title}</option>
            ))}
          </select>
          <button className="btn btn-sm" onClick={() => newThread()}>✦ New</button>
        </div>
        {activeThread && (
          <div className="row">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                const t = prompt("Rename this reading", activeThread.title);
                if (t) renameThread(activeThread.id, t);
              }}
            >Rename</button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { if (confirm("Release this reading?")) deleteThread(activeThread.id); }}
            >Release</button>
          </div>
        )}
      </div>

      <div className="chat-scroll" ref={scrollRef} style={{ flex: 1 }}>
        {messages.length === 0 && !streaming && (
          <div className="empty">
            Speak what weighs on you, and I will read it as clearly as I can.
            <br />
            <span style={{ fontSize: "0.9rem" }}>Or bring a spread from the cards, or a chart from the heavens.</span>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.role === "seeker" ? "seeker" : "oracle"}`}>
            <div className="bubble-role">{m.role === "seeker" ? "You" : "PsychicPrime"}</div>
            {m.role === "oracle" ? <Prose text={m.content} /> : m.content}
          </div>
        ))}

        {streaming !== null && (
          <div className="bubble oracle">
            <div className="bubble-role">PsychicPrime</div>
            {streaming ? <Prose text={streaming} /> : <span className="cursor-blink" />}
          </div>
        )}
      </div>

      <div className="composer">
        <textarea
          className="textarea"
          placeholder={mode === "seeker" ? "Ask on behalf of your seeker..." : "What weighs on you?"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); speak(); }
          }}
        />
        <button className="btn btn-primary" disabled={busy || !input.trim()} onClick={speak}>
          {busy ? "Reading…" : "Speak"}
        </button>
      </div>
    </div>
  );
}
