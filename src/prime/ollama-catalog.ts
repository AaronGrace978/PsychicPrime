// ═══════════════════════════════════════════════════════════════
//  Ollama Cloud catalog — live list from https://ollama.com/api/tags
//  plus curated metadata (recommended tier, descriptions).
//  Docs: https://docs.ollama.com/cloud
// ═══════════════════════════════════════════════════════════════

export interface BridgeModel {
  name: string;
  cloud: boolean;
  size?: number;
  description?: string;
  recommended?: boolean;
}

/** Curated metadata for known cloud models (merged with live /api/tags). */
const CLOUD_META: Record<string, { description: string; recommended?: boolean }> = {
  "kimi-k2.6": { description: "Multimodal agentic · long-horizon coding & vision", recommended: true },
  "kimi-k2.7-code": { description: "Coding-focused agent · ~30% fewer thinking tokens", recommended: true },
  "kimi-k2.5": { description: "Vision + language · instant & thinking modes", recommended: true },
  "qwen3.5:397b": { description: "Frontier multimodal · reasoning, coding, tools", recommended: true },
  "qwen3-coder:480b": { description: "Alibaba coding & agentic · long context", recommended: true },
  "qwen3-coder-next": { description: "Next-gen Qwen coder", recommended: true },
  "glm-5.2": { description: "Z.ai flagship · long-horizon agentic tasks", recommended: true },
  "glm-5.1": { description: "Agentic engineering · strong SWE-Bench", recommended: true },
  "glm-5": { description: "744B MoE · complex systems engineering", recommended: true },
  "glm-4.7": { description: "Advancing coding capability", recommended: false },
  "minimax-m3": { description: "Coding & agentic frontier · 1M context · vision", recommended: true },
  "minimax-m2.7": { description: "Coding, agents & productivity", recommended: true },
  "minimax-m2.5": { description: "Real-world productivity & coding", recommended: false },
  "minimax-m2.1": { description: "Multilingual code engineering", recommended: false },
  "gpt-oss:120b": { description: "OpenAI open-weight · powerful reasoning", recommended: true },
  "gpt-oss:20b": { description: "OpenAI open-weight · lighter & fast", recommended: false },
  "deepseek-v4-pro": { description: "Frontier MoE · three reasoning modes", recommended: true },
  "deepseek-v4-flash": { description: "DeepSeek V4 preview · 1M context", recommended: true },
  "deepseek-v3.2": { description: "DeepSeek V3.2", recommended: false },
  "deepseek-v3.1:671b": { description: "DeepSeek V3.1 671B", recommended: false },
  "nemotron-3-ultra": { description: "NVIDIA · high-throughput agent reasoning", recommended: true },
  "nemotron-3-super": { description: "NVIDIA 120B MoE · multi-agent", recommended: true },
  "nemotron-3-nano:30b": { description: "NVIDIA Nemotron nano", recommended: false },
  "gemma4:31b": { description: "Gemma 4 · frontier performance multimodal", recommended: true },
  "gemini-3-flash-preview": { description: "Gemini 3 Flash · speed at lower cost", recommended: true },
  "mistral-large-3:675b": { description: "Mistral Large 3", recommended: false },
  "devstral-2:123b": { description: "Mistral Devstral 2", recommended: false },
  "devstral-small-2:24b": { description: "Mistral Devstral small", recommended: false },
  "ministral-3:14b": { description: "Ministral 3 14B", recommended: false },
  "ministral-3:8b": { description: "Ministral 3 8B", recommended: false },
  "ministral-3:3b": { description: "Ministral 3 3B", recommended: false },
  "gemma3:27b": { description: "Gemma 3 27B", recommended: false },
  "gemma3:12b": { description: "Gemma 3 12B", recommended: false },
  "gemma3:4b": { description: "Gemma 3 4B", recommended: false },
  "rnj-1:8b": { description: "RNJ-1 8B", recommended: false },
};

/** Fallback when /api/tags is unreachable (snapshot from ollama.com, Mar 2026). */
export const OLLAMA_CLOUD_FALLBACK: string[] = [
  "kimi-k2.6",
  "kimi-k2.7-code",
  "qwen3.5:397b",
  "glm-5.2",
  "glm-5.1",
  "minimax-m3",
  "minimax-m2.7",
  "gpt-oss:120b",
  "deepseek-v4-pro",
  "deepseek-v4-flash",
  "nemotron-3-ultra",
  "qwen3-coder:480b",
  "kimi-k2.5",
  "gpt-oss:20b",
  "gemma4:31b",
  "gemini-3-flash-preview",
  "nemotron-3-super",
  "glm-5",
  "minimax-m2.5",
  "qwen3-coder-next",
  "deepseek-v3.2",
  "deepseek-v3.1:671b",
  "mistral-large-3:675b",
  "glm-4.7",
  "minimax-m2.1",
  "devstral-2:123b",
  "devstral-small-2:24b",
  "nemotron-3-nano:30b",
  "gemma3:27b",
  "gemma3:12b",
  "gemma3:4b",
  "ministral-3:14b",
  "ministral-3:8b",
  "ministral-3:3b",
  "rnj-1:8b",
];

export const OLLAMA_CLOUD_DEFAULT = "kimi-k2.6";

export function enrichBridgeModel(name: string, cloud: boolean, size?: number): BridgeModel {
  const meta = cloud ? CLOUD_META[name] : undefined;
  return {
    name,
    cloud,
    size,
    description: meta?.description,
    recommended: meta?.recommended ?? false,
  };
}

export function sortBridgeModels(models: BridgeModel[]): BridgeModel[] {
  return [...models].sort((a, b) => {
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function mergeCloudCatalog(liveNames: string[]): BridgeModel[] {
  const all = new Set([...liveNames, ...OLLAMA_CLOUD_FALLBACK]);
  const models = [...all].map((name) => enrichBridgeModel(name, true));
  return sortBridgeModels(models);
}

export function formatModelSize(bytes?: number): string {
  if (!bytes) return "";
  const gb = bytes / (1024 ** 3);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 ** 2);
  return `${mb.toFixed(0)} MB`;
}
