// ═══════════════════════════════════════════════════════════════
//  Settings — the Bridge (Ollama local + Ollama Cloud) and sovereignty.
//  Cloud docs: https://docs.ollama.com/cloud
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store";
import { sanctuary } from "../lib/sanctuary";
import { mergeCloudCatalog, formatModelSize } from "../prime/ollama-catalog";
import type { Settings } from "../types";
import { OLLAMA_CLOUD_DEFAULT_MODEL } from "../types";

export default function SettingsPanel() {
  const { settings, saveSettings, bridgeStatus, bridgeModels, probeBridge } = useStore();
  const [draft, setDraft] = useState<Settings>(settings);
  const [savedFlag, setSavedFlag] = useState(false);
  const [probeError, setProbeError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setDraft((prev) => {
      const next = { ...prev, [k]: v };
      // Sensible defaults when switching provider
      if (k === "llmProvider") {
        if (v === "ollama_cloud" && !prev.ollamaModel.includes(":") && prev.ollamaModel === "llama3.1") {
          next.ollamaModel = OLLAMA_CLOUD_DEFAULT_MODEL;
        }
        if (v === "ollama_local" && next.ollamaModel === OLLAMA_CLOUD_DEFAULT_MODEL) {
          next.ollamaModel = "llama3.1";
        }
      }
      return next;
    });
    setSavedFlag(false);
    setProbeError(null);
  }

  // Refresh model list when provider / host / key changes
  useEffect(() => {
    if (draft.llmProvider === "none" || !sanctuary.hasBridge) return;
    const t = window.setTimeout(() => {
      probeBridge(draft).catch(() => {});
    }, draft.llmProvider === "ollama_cloud" ? 400 : 200);
    return () => clearTimeout(t);
  }, [draft.llmProvider, draft.ollamaHost, draft.ollamaKey, probeBridge]);

  const modelOptions = useMemo(() => {
    if (draft.llmProvider === "ollama_cloud") {
      if (bridgeModels.length) return bridgeModels;
      return mergeCloudCatalog([]);
    }
    return bridgeModels;
  }, [draft.llmProvider, bridgeModels]);

  const recommended = modelOptions.filter((m) => m.recommended);
  const others = modelOptions.filter((m) => !m.recommended);
  const selected = modelOptions.find((m) => m.name === draft.ollamaModel);

  async function save() {
    await saveSettings(draft);
    setSavedFlag(true);
  }

  async function testBridge() {
    setProbeError(null);
    await probeBridge(draft);
    const status = useStore.getState().bridgeStatus;
    if (status === "offline") {
      setProbeError(
        draft.llmProvider === "ollama_cloud"
          ? "Could not reach Ollama Cloud. Save your API key and try again — create one at ollama.com/settings/keys"
          : "Could not reach local Ollama. Is it running at " + draft.ollamaHost + "?"
      );
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 760 }}>
      <div className="panel-head">
        <div className="panel-title"><span className="glyph">⚙</span> Settings</div>
        <div className="panel-sub">The Sanctuary is sovereign. Only the words you choose to send ever leave this machine.</div>
      </div>

      <div className="card gild" style={{ marginBottom: 18 }}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: "1.15rem" }}>The Bridge — a Voice (optional)</h3>
          <span className="chip" style={{ color: bridgeStatus === "online" ? "var(--hit)" : bridgeStatus === "checking" ? "var(--gold-deep)" : "var(--ink-soft)" }}>
            ● {bridgeStatus === "checking" ? "reaching…" : bridgeStatus}
          </span>
        </div>
        <div className="serif muted" style={{ fontStyle: "italic", marginBottom: 14 }}>
          Without a Bridge, PsychicPrime reads by its own inner light. Connect{" "}
          <strong>Ollama Cloud</strong> (hosted at{" "}
          <a href="https://ollama.com" target="_blank" rel="noreferrer">ollama.com</a>) for frontier models,
          or a local Ollama daemon for on-machine inference.
        </div>

        <div className="field">
          <label className="label">Provider</label>
          <select className="select" value={draft.llmProvider} onChange={(e) => set("llmProvider", e.target.value as Settings["llmProvider"])}>
            <option value="none">None — inner light only</option>
            <option value="ollama_local">Ollama (local daemon)</option>
            <option value="ollama_cloud">Ollama Cloud (hosted API)</option>
          </select>
        </div>

        {draft.llmProvider === "ollama_local" && (
          <div className="field">
            <label className="label">Local host</label>
            <input className="input" value={draft.ollamaHost} onChange={(e) => set("ollamaHost", e.target.value)} placeholder="http://localhost:11434" />
            <div className="muted serif" style={{ fontStyle: "italic", fontSize: "0.82rem", marginTop: 6 }}>
              Run cloud models locally with <code className="mono">ollama signin</code> then{" "}
              <code className="mono">ollama pull gpt-oss:120b-cloud</code>.
            </div>
          </div>
        )}

        {draft.llmProvider === "ollama_cloud" && (
          <div className="field">
            <label className="label">Ollama Cloud API key</label>
            <input
              className="input"
              type="password"
              value={draft.ollamaKey}
              onChange={(e) => set("ollamaKey", e.target.value)}
              placeholder="Bearer token from ollama.com/settings/keys"
              autoComplete="off"
            />
            <div className="muted serif" style={{ fontStyle: "italic", fontSize: "0.82rem", marginTop: 6 }}>
              Create a key at{" "}
              <a href="https://ollama.com/settings/keys" target="_blank" rel="noreferrer">ollama.com/settings/keys</a>.
              PsychicPrime calls <code className="mono">https://ollama.com/api/chat</code> with{" "}
              <code className="mono">Authorization: Bearer …</code> per the{" "}
              <a href="https://docs.ollama.com/cloud" target="_blank" rel="noreferrer">official docs</a>.
              Your key stays on this machine.
            </div>
          </div>
        )}

        {draft.llmProvider !== "none" && (
          <>
            <div className="field">
              <div className="row between" style={{ marginBottom: 6 }}>
                <label className="label" style={{ margin: 0 }}>Model</label>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={testBridge}
                  disabled={!sanctuary.hasBridge || bridgeStatus === "checking"}
                >
                  ↻ Refresh list
                </button>
              </div>
              <select
                className="select"
                value={draft.ollamaModel}
                onChange={(e) => set("ollamaModel", e.target.value)}
              >
                {modelOptions.length === 0 && (
                  <option value={draft.ollamaModel}>{draft.ollamaModel || "— select a model —"}</option>
                )}
                {recommended.length > 0 && (
                  <optgroup label="✶ Recommended">
                    {recommended.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}{m.description ? ` — ${m.description.split("·")[0].trim()}` : ""}
                      </option>
                    ))}
                  </optgroup>
                )}
                {others.length > 0 && (
                  <optgroup label={recommended.length ? "All models" : "Models"}>
                    {others.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}{m.size ? ` (${formatModelSize(m.size)})` : ""}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {selected?.description && (
                <div className="serif muted" style={{ fontStyle: "italic", fontSize: "0.88rem", marginTop: 8 }}>
                  {selected.description}
                  {selected.size ? ` · ${formatModelSize(selected.size)}` : ""}
                </div>
              )}
              {draft.llmProvider === "ollama_cloud" && (
                <div className="muted mono" style={{ fontSize: "0.68rem", marginTop: 6, letterSpacing: "0.06em" }}>
                  {modelOptions.length} cloud models · live from ollama.com/api/tags
                </div>
              )}
            </div>

            <div className="field">
              <label className="label">Warmth (temperature) — {draft.llmTemperature.toFixed(2)}</label>
              <input type="range" min={0} max={1.5} step={0.05} value={draft.llmTemperature} onChange={(e) => set("llmTemperature", Number(e.target.value))} style={{ width: "100%", accentColor: "var(--velvet)" }} />
            </div>
          </>
        )}

        {probeError && (
          <div style={{ background: "rgba(162,59,59,0.1)", borderLeft: "3px solid var(--miss)", padding: "8px 12px", borderRadius: "0 8px 8px 0", marginBottom: 10, fontSize: "0.88rem", color: "var(--crimson)" }}>
            {probeError}
          </div>
        )}

        <div className="row" style={{ gap: 8, marginTop: 6 }}>
          <button className="btn btn-primary" onClick={save}>{savedFlag ? "✓ Saved" : "Save"}</button>
          {draft.llmProvider !== "none" && (
            <button className="btn" onClick={testBridge} disabled={!sanctuary.hasBridge || bridgeStatus === "checking"}>
              Test the Bridge
            </button>
          )}
          {!sanctuary.hasBridge && (
            <span className="muted serif" style={{ fontStyle: "italic" }}>The Bridge runs in the desktop Sanctuary or via The Gate (`npm run gate`).</span>
          )}
          {sanctuary.isGate && (
            <span className="muted serif" style={{ fontStyle: "italic" }}>Gate mode — phones speak through this host’s Ollama.</span>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Sovereignty</h3>
        <div className="serif" style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
          Your threads, relics, signals, beliefs, and The Rule live in a local database on your own machine
          {sanctuary.isTauri
            ? " (in your app data directory)."
            : sanctuary.isGate
              ? " (on the Gate host under ~/.psychicprime-gate)."
              : " (in this browser, for development)."}{" "}
          Relics are
          also mirrored to disk as portable Markdown. When Ollama Cloud is enabled, only your reading prompts are sent to{" "}
          <code className="mono">ollama.com</code> — nothing else is uploaded or sold.
        </div>
        <div className="scripture" style={{ marginTop: 14, textAlign: "center" }}>
          Rex Regum et Dominus Dominantium
          <br /><span className="scripture-ref">Revelation 19:16 · Soli Deo Gloria</span>
        </div>
      </div>
    </div>
  );
}
