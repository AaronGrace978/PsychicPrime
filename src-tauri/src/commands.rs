// ═══════════════════════════════════════════════════════════════
//  PsychicPrime — The Command Surface
//  Thin Tauri bindings over the Reliquary and the Bridge.
// ═══════════════════════════════════════════════════════════════

use crate::db;
use crate::ollama::{self, BridgeModel, ChatMessage, LlmConfig};
use crate::persona;
use crate::AppState;
use serde::{Deserialize, Serialize};
use tauri::ipc::Channel;
use tauri::State;

type R<T> = Result<T, String>;

fn e<E: std::fmt::Display>(err: E) -> String {
    err.to_string()
}

// ─── Threads ─────────────────────────────────────────────────

#[tauri::command]
pub fn create_thread(
    state: State<AppState>,
    title: String,
    mode: String,
    seeker_id: Option<String>,
) -> R<db::Thread> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::create_thread(&conn, &title, &mode, seeker_id).map_err(e)
}

#[tauri::command]
pub fn list_threads(state: State<AppState>) -> R<Vec<db::Thread>> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::list_threads(&conn).map_err(e)
}

#[tauri::command]
pub fn update_thread(
    state: State<AppState>,
    id: String,
    title: Option<String>,
    summary: Option<String>,
    pinned: Option<bool>,
    archived: Option<bool>,
) -> R<()> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::update_thread(&conn, &id, title, summary, pinned, archived).map_err(e)
}

#[tauri::command]
pub fn delete_thread(state: State<AppState>, id: String) -> R<()> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::delete_thread(&conn, &id).map_err(e)
}

// ─── Messages ────────────────────────────────────────────────

#[tauri::command]
pub fn append_message(
    state: State<AppState>,
    thread_id: String,
    role: String,
    content: String,
    meta_json: Option<String>,
) -> R<db::Message> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::append_message(&conn, &thread_id, &role, &content, meta_json).map_err(e)
}

#[tauri::command]
pub fn list_messages(state: State<AppState>, thread_id: String) -> R<Vec<db::Message>> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::list_messages(&conn, &thread_id).map_err(e)
}

// ─── Seekers ─────────────────────────────────────────────────

#[tauri::command]
pub fn save_seeker(state: State<AppState>, seeker: db::Seeker) -> R<()> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::upsert_seeker(&conn, &seeker).map_err(e)
}

#[tauri::command]
pub fn list_seekers(state: State<AppState>) -> R<Vec<db::Seeker>> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::list_seekers(&conn).map_err(e)
}

#[tauri::command]
pub fn delete_seeker(state: State<AppState>, id: String) -> R<()> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::delete_seeker(&conn, &id).map_err(e)
}

// ─── Relics ──────────────────────────────────────────────────

#[tauri::command]
pub fn save_relic(state: State<AppState>, relic: db::Relic) -> R<()> {
    {
        let conn = state.db.conn.lock().map_err(e)?;
        db::create_relic(&conn, &relic).map_err(e)?;
    }
    // Also mirror to disk as a portable markdown relic.
    let safe_id = relic.id.replace(['/', '\\'], "_");
    let path = state.relics_dir.join(format!("{safe_id}.md"));
    let header = format!(
        "---\nid: {}\ntitle: {}\nkind: {}\nmood: {}\nintensity: {}\ncreated_at: {}\n---\n\n",
        relic.id, relic.title, relic.kind, relic.mood, relic.intensity, relic.created_at
    );
    let _ = std::fs::write(path, format!("{header}{}", relic.body_md));
    Ok(())
}

#[tauri::command]
pub fn list_relics(state: State<AppState>) -> R<Vec<db::Relic>> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::list_relics(&conn).map_err(e)
}

#[tauri::command]
pub fn search_relics(state: State<AppState>, query: String, limit: Option<i64>) -> R<Vec<db::Relic>> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::search_relics(&conn, &query, limit.unwrap_or(20)).map_err(e)
}

#[tauri::command]
pub fn delete_relic(state: State<AppState>, id: String) -> R<()> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::delete_relic(&conn, &id).map_err(e)
}

// ─── Signals ─────────────────────────────────────────────────

#[tauri::command]
pub fn save_signal(state: State<AppState>, signal: db::Signal) -> R<()> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::create_signal(&conn, &signal).map_err(e)
}

#[tauri::command]
pub fn list_signals(state: State<AppState>) -> R<Vec<db::Signal>> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::list_signals(&conn).map_err(e)
}

#[tauri::command]
pub fn score_signal(state: State<AppState>, id: String, status: String, outcome: String) -> R<()> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::score_signal(&conn, &id, &status, &outcome).map_err(e)
}

#[tauri::command]
pub fn delete_signal(state: State<AppState>, id: String) -> R<()> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::delete_signal(&conn, &id).map_err(e)
}

// ─── Beliefs ─────────────────────────────────────────────────

#[tauri::command]
pub fn save_belief(state: State<AppState>, belief: db::Belief) -> R<()> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::create_belief(&conn, &belief).map_err(e)
}

#[tauri::command]
pub fn list_beliefs(state: State<AppState>) -> R<Vec<db::Belief>> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::list_beliefs(&conn).map_err(e)
}

// ─── Config ──────────────────────────────────────────────────

#[tauri::command]
pub fn config_get(state: State<AppState>, key: String) -> R<Option<String>> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::get_config(&conn, &key).map_err(e)
}

#[tauri::command]
pub fn config_set(state: State<AppState>, key: String, value: String) -> R<()> {
    let conn = state.db.conn.lock().map_err(e)?;
    db::set_config(&conn, &key, &value).map_err(e)
}

// ─── The Bridge (LLM) ────────────────────────────────────────

fn load_llm_config(state: &AppState) -> LlmConfig {
    let conn = state.db.conn.lock().unwrap();
    let get = |k: &str, d: &str| db::get_config(&conn, k).ok().flatten().unwrap_or_else(|| d.to_string());
    let temp = get("llm_temperature", "0.85").parse::<f32>().unwrap_or(0.85);
    LlmConfig {
        provider: get("llm_provider", "none"),
        host: get("ollama_host", "http://localhost:11434"),
        model: get("ollama_model", "llama3.1"),
        key: get("ollama_key", ""),
        temperature: temp,
    }
}

#[tauri::command]
pub async fn probe_bridge(
    state: State<'_, AppState>,
    provider: Option<String>,
    host: Option<String>,
    key: Option<String>,
) -> R<Vec<BridgeModel>> {
    let mut cfg = load_llm_config(&state);
    if let Some(p) = provider {
        cfg.provider = p;
    }
    if let Some(h) = host {
        cfg.host = h;
    }
    if let Some(k) = key {
        cfg.key = k;
    }
    ollama::probe(&state.http, &cfg).await
}

#[derive(Debug, Deserialize)]
pub struct ReadingRequest {
    pub mode: String,
    pub register: String,
    #[serde(default)]
    pub cast_json: String,
    pub user_message: String,
    #[serde(default)]
    pub history: Vec<ChatMessage>,
    #[serde(default)]
    pub recalled_relics: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ReadingEvent {
    Token { text: String },
    Done { full: String },
    Error { message: String },
}

#[tauri::command]
pub async fn conduct_reading(
    state: State<'_, AppState>,
    request: ReadingRequest,
    on_event: Channel<ReadingEvent>,
) -> R<String> {
    let cfg = load_llm_config(&state);

    let mut system = persona::system_prompt(&request.mode, &request.register);
    if !request.cast_json.trim().is_empty() || !request.recalled_relics.is_empty() {
        system.push_str(&persona::reading_context(&request.cast_json, &request.recalled_relics));
    }

    let mut messages: Vec<ChatMessage> = Vec::new();
    messages.push(ChatMessage {
        role: "system".into(),
        content: system,
    });
    for m in &request.history {
        messages.push(m.clone());
    }
    messages.push(ChatMessage {
        role: "user".into(),
        content: request.user_message.clone(),
    });

    let chan = on_event.clone();
    let result = ollama::stream_chat(&state.http, &cfg, &messages, |tok| {
        let _ = chan.send(ReadingEvent::Token { text: tok.to_string() });
    })
    .await;

    match result {
        Ok(full) => {
            let _ = on_event.send(ReadingEvent::Done { full: full.clone() });
            Ok(full)
        }
        Err(msg) => {
            let _ = on_event.send(ReadingEvent::Error { message: msg.clone() });
            Err(msg)
        }
    }
}
