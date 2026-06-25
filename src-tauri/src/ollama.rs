// ═══════════════════════════════════════════════════════════════
//  PsychicPrime — The Bridge (optional LLM voice via Ollama)
//
//  Modes (per https://docs.ollama.com/cloud):
//   • ollama_local  — local daemon at host (default localhost:11434)
//   • ollama_cloud  — direct hosted API at https://ollama.com
//                     with Authorization: Bearer <OLLAMA_API_KEY>
//
//  Cloud listing: GET https://ollama.com/api/tags
//  Cloud chat:    POST https://ollama.com/api/chat  (stream: true)
// ═══════════════════════════════════════════════════════════════

use futures_util::StreamExt;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct BridgeModel {
    pub name: String,
    pub cloud: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub size: Option<u64>,
}

#[derive(Debug, Serialize)]
struct ChatRequest<'a> {
    model: &'a str,
    messages: &'a [ChatMessage],
    stream: bool,
    options: ChatOptions,
}

#[derive(Debug, Serialize)]
struct ChatOptions {
    temperature: f32,
    top_p: f32,
}

#[derive(Debug, Deserialize)]
struct StreamChunk {
    #[serde(default)]
    message: Option<ChunkMessage>,
    #[serde(default)]
    done: bool,
}

#[derive(Debug, Deserialize)]
struct ChunkMessage {
    #[serde(default)]
    content: String,
}

#[derive(Debug, Deserialize)]
struct TagsResponse {
    #[serde(default)]
    models: Vec<TagModel>,
}

#[derive(Debug, Deserialize)]
struct TagModel {
    name: String,
    #[serde(default)]
    size: Option<u64>,
}

pub struct LlmConfig {
    pub provider: String, // "none" | "ollama_local" | "ollama_cloud"
    pub host: String,
    pub model: String,
    pub key: String,
    pub temperature: f32,
}

const CLOUD_HOST: &str = "https://ollama.com";

fn base_url(cfg: &LlmConfig) -> String {
    match cfg.provider.as_str() {
        "ollama_cloud" => CLOUD_HOST.to_string(),
        _ => {
            let h = cfg.host.trim_end_matches('/');
            if h.is_empty() {
                "http://localhost:11434".to_string()
            } else {
                h.to_string()
            }
        }
    }
}

fn is_cloud_model_name(name: &str) -> bool {
    name.contains(":cloud") || name.ends_with("-cloud")
}

fn auth_request<'a>(
    builder: reqwest::RequestBuilder,
    cfg: &'a LlmConfig,
    require_key: bool,
) -> Result<reqwest::RequestBuilder, String> {
    if cfg.provider == "ollama_cloud" {
        let key = cfg.key.trim();
        if require_key && key.is_empty() {
            return Err(
                "Ollama Cloud requires an API key. Create one at https://ollama.com/settings/keys"
                    .into(),
            );
        }
        if !key.is_empty() {
            return Ok(builder.bearer_auth(key));
        }
    }
    Ok(builder)
}

/// Probe availability. Returns models from /api/tags (live catalog).
pub async fn probe(client: &reqwest::Client, cfg: &LlmConfig) -> Result<Vec<BridgeModel>, String> {
    if cfg.provider == "none" {
        return Err("No LLM provider configured.".into());
    }

    let url = format!("{}/api/tags", base_url(cfg));
    let req = auth_request(client.get(&url), cfg, false)?;

    let resp = req
        .send()
        .await
        .map_err(|e| format!("Could not reach the bridge: {e}"))?;

    if !resp.status().is_success() {
        let code = resp.status();
        let body = resp.text().await.unwrap_or_default();
        if cfg.provider == "ollama_cloud" && code.as_u16() == 401 {
            return Err(
                "Ollama Cloud rejected the API key. Check it at https://ollama.com/settings/keys"
                    .into(),
            );
        }
        return Err(format!("Bridge responded {code}: {body}"));
    }

    let tags: TagsResponse = resp
        .json()
        .await
        .unwrap_or(TagsResponse { models: vec![] });

    let cloud_mode = cfg.provider == "ollama_cloud";
    let mut models: Vec<BridgeModel> = tags
        .models
        .into_iter()
        .map(|m| BridgeModel {
            cloud: cloud_mode || is_cloud_model_name(&m.name),
            name: m.name,
            size: m.size,
        })
        .collect();

    // Stable ordering: cloud-tagged first when local, then alpha.
    models.sort_by(|a, b| {
        if a.cloud != b.cloud {
            return b.cloud.cmp(&a.cloud);
        }
        a.name.cmp(&b.name)
    });

    Ok(models)
}

/// Stream a chat completion, invoking `on_token` for each fragment.
pub async fn stream_chat<F: FnMut(&str)>(
    client: &reqwest::Client,
    cfg: &LlmConfig,
    messages: &[ChatMessage],
    mut on_token: F,
) -> Result<String, String> {
    if cfg.provider == "none" {
        return Err("No LLM provider configured.".into());
    }
    if cfg.model.trim().is_empty() {
        return Err("No model selected for the Bridge.".into());
    }

    let url = format!("{}/api/chat", base_url(cfg));
    let body = ChatRequest {
        model: cfg.model.trim(),
        messages,
        stream: true,
        options: ChatOptions {
            temperature: cfg.temperature,
            top_p: 0.92,
        },
    };

    let req = auth_request(client.post(&url).json(&body), cfg, true)?;

    let resp = req
        .send()
        .await
        .map_err(|e| format!("The bridge did not answer: {e}"))?;

    if !resp.status().is_success() {
        let code = resp.status();
        let text = resp.text().await.unwrap_or_default();
        if cfg.provider == "ollama_cloud" && code.as_u16() == 401 {
            return Err(
                "Ollama Cloud rejected the API key. Check it at https://ollama.com/settings/keys"
                    .into(),
            );
        }
        return Err(format!("Bridge error {code}: {text}"));
    }

    let mut full = String::new();
    let mut buf = String::new();
    let mut stream = resp.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let bytes = chunk.map_err(|e| format!("Stream interrupted: {e}"))?;
        buf.push_str(&String::from_utf8_lossy(&bytes));

        while let Some(idx) = buf.find('\n') {
            let line: String = buf.drain(..=idx).collect();
            let line = line.trim();
            if line.is_empty() {
                continue;
            }
            if let Ok(parsed) = serde_json::from_str::<StreamChunk>(line) {
                if let Some(msg) = parsed.message {
                    if !msg.content.is_empty() {
                        full.push_str(&msg.content);
                        on_token(&msg.content);
                    }
                }
                if parsed.done {
                    return Ok(full);
                }
            }
        }
    }

    Ok(full)
}
