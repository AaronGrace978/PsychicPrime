// ═══════════════════════════════════════════════════════════════
//  PsychicPrime — The Reliquary (local-first SQLite + FTS5)
//  Sovereign storage: threads, seekers, relics, signals, beliefs.
//  Nothing leaves the machine but the words you choose to send.
// ═══════════════════════════════════════════════════════════════

use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

pub struct Db {
    pub conn: Mutex<Connection>,
}

// ─── Records ─────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Thread {
    pub id: String,
    pub title: String,
    pub mode: String, // "self" | "seeker"
    #[serde(rename = "seekerId")]
    pub seeker_id: Option<String>,
    pub summary: String,
    pub pinned: bool,
    pub archived: bool,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "updatedAt")]
    pub updated_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub id: String,
    #[serde(rename = "threadId")]
    pub thread_id: String,
    pub role: String, // "seeker" | "oracle" | "system"
    pub content: String,
    #[serde(rename = "metaJson")]
    pub meta_json: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Seeker {
    pub id: String,
    pub name: String,
    #[serde(rename = "birthDate")]
    pub birth_date: String,
    #[serde(rename = "birthTime")]
    pub birth_time: String,
    #[serde(rename = "birthPlace")]
    pub birth_place: String,
    pub notes: String,
    #[serde(rename = "bondStage")]
    pub bond_stage: String,
    #[serde(rename = "bondPoints")]
    pub bond_points: i64,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Relic {
    pub id: String,
    pub title: String,
    #[serde(rename = "bodyMd")]
    pub body_md: String,
    pub kind: String, // "reading" | "synchronicity" | "dream" | "moment"
    pub mood: String,
    pub intensity: i64,
    #[serde(rename = "threadId")]
    pub thread_id: Option<String>,
    #[serde(rename = "seekerId")]
    pub seeker_id: Option<String>,
    #[serde(rename = "tagsJson")]
    pub tags_json: String,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Signal {
    pub id: String,
    pub kind: String,
    pub impression: String,
    pub target: String,
    #[serde(rename = "timeWindow")]
    pub time_window: String,
    pub confidence: i64,
    pub controls: String,
    pub notes: String,
    pub status: String, // "pending" | "hit" | "partial" | "miss" | "ambiguous"
    pub outcome: String,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "scoredAt")]
    pub scored_at: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Belief {
    pub id: String,
    pub claim: String,
    pub confidence: i64,
    #[serde(rename = "epistemicType")]
    pub epistemic_type: String, // "measured" | "inferred" | "analogy" | "speculation"
    pub evidence: String,
    pub falsifier: String,
    pub status: String, // "open" | "supported" | "contested" | "retired"
    #[serde(rename = "supersedesId")]
    pub supersedes_id: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
}

// ─── Initialization ──────────────────────────────────────────

pub fn init(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        r#"
        PRAGMA journal_mode = WAL;
        PRAGMA busy_timeout = 5000;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS threads (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            mode TEXT NOT NULL DEFAULT 'self',
            seeker_id TEXT,
            summary TEXT NOT NULL DEFAULT '',
            pinned INTEGER NOT NULL DEFAULT 0,
            archived INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            thread_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            meta_json TEXT,
            created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);

        CREATE TABLE IF NOT EXISTS seekers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            birth_date TEXT NOT NULL DEFAULT '',
            birth_time TEXT NOT NULL DEFAULT '12:00',
            birth_place TEXT NOT NULL DEFAULT '',
            notes TEXT NOT NULL DEFAULT '',
            bond_stage TEXT NOT NULL DEFAULT 'Stranger',
            bond_points INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS relics (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            body_md TEXT NOT NULL,
            kind TEXT NOT NULL DEFAULT 'reading',
            mood TEXT NOT NULL DEFAULT '',
            intensity INTEGER NOT NULL DEFAULT 50,
            thread_id TEXT,
            seeker_id TEXT,
            tags_json TEXT NOT NULL DEFAULT '[]',
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS signals (
            id TEXT PRIMARY KEY,
            kind TEXT NOT NULL,
            impression TEXT NOT NULL,
            target TEXT NOT NULL,
            time_window TEXT NOT NULL DEFAULT '',
            confidence INTEGER NOT NULL DEFAULT 50,
            controls TEXT NOT NULL DEFAULT '',
            notes TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'pending',
            outcome TEXT NOT NULL DEFAULT '',
            created_at INTEGER NOT NULL,
            scored_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS beliefs (
            id TEXT PRIMARY KEY,
            claim TEXT NOT NULL,
            confidence INTEGER NOT NULL DEFAULT 50,
            epistemic_type TEXT NOT NULL DEFAULT 'inferred',
            evidence TEXT NOT NULL DEFAULT '',
            falsifier TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'open',
            supersedes_id TEXT,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE VIRTUAL TABLE IF NOT EXISTS relics_fts USING fts5(
            title, body_md, tags,
            content=''
        );
        "#,
    )?;
    Ok(())
}

fn now() -> i64 {
    chrono::Utc::now().timestamp_millis()
}

// ─── Threads ─────────────────────────────────────────────────

pub fn create_thread(
    conn: &Connection,
    title: &str,
    mode: &str,
    seeker_id: Option<String>,
) -> rusqlite::Result<Thread> {
    let id = uuid::Uuid::new_v4().to_string();
    let ts = now();
    conn.execute(
        "INSERT INTO threads (id, title, mode, seeker_id, summary, pinned, archived, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, '', 0, 0, ?5, ?5)",
        params![id, title, mode, seeker_id, ts],
    )?;
    Ok(Thread {
        id,
        title: title.to_string(),
        mode: mode.to_string(),
        seeker_id,
        summary: String::new(),
        pinned: false,
        archived: false,
        created_at: ts,
        updated_at: ts,
    })
}

pub fn list_threads(conn: &Connection) -> rusqlite::Result<Vec<Thread>> {
    let mut stmt = conn.prepare(
        "SELECT id, title, mode, seeker_id, summary, pinned, archived, created_at, updated_at
         FROM threads ORDER BY pinned DESC, updated_at DESC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(Thread {
            id: r.get(0)?,
            title: r.get(1)?,
            mode: r.get(2)?,
            seeker_id: r.get(3)?,
            summary: r.get(4)?,
            pinned: r.get::<_, i64>(5)? != 0,
            archived: r.get::<_, i64>(6)? != 0,
            created_at: r.get(7)?,
            updated_at: r.get(8)?,
        })
    })?;
    rows.collect()
}

pub fn update_thread(
    conn: &Connection,
    id: &str,
    title: Option<String>,
    summary: Option<String>,
    pinned: Option<bool>,
    archived: Option<bool>,
) -> rusqlite::Result<()> {
    if let Some(t) = title {
        conn.execute("UPDATE threads SET title=?1, updated_at=?2 WHERE id=?3", params![t, now(), id])?;
    }
    if let Some(s) = summary {
        conn.execute("UPDATE threads SET summary=?1 WHERE id=?2", params![s, id])?;
    }
    if let Some(p) = pinned {
        conn.execute("UPDATE threads SET pinned=?1 WHERE id=?2", params![p as i64, id])?;
    }
    if let Some(a) = archived {
        conn.execute("UPDATE threads SET archived=?1 WHERE id=?2", params![a as i64, id])?;
    }
    Ok(())
}

pub fn delete_thread(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM messages WHERE thread_id=?1", params![id])?;
    conn.execute("DELETE FROM threads WHERE id=?1", params![id])?;
    Ok(())
}

pub fn touch_thread(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("UPDATE threads SET updated_at=?1 WHERE id=?2", params![now(), id])?;
    Ok(())
}

// ─── Messages ────────────────────────────────────────────────

pub fn append_message(
    conn: &Connection,
    thread_id: &str,
    role: &str,
    content: &str,
    meta_json: Option<String>,
) -> rusqlite::Result<Message> {
    let id = uuid::Uuid::new_v4().to_string();
    let ts = now();
    conn.execute(
        "INSERT INTO messages (id, thread_id, role, content, meta_json, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, thread_id, role, content, meta_json, ts],
    )?;
    touch_thread(conn, thread_id)?;
    Ok(Message {
        id,
        thread_id: thread_id.to_string(),
        role: role.to_string(),
        content: content.to_string(),
        meta_json,
        created_at: ts,
    })
}

pub fn list_messages(conn: &Connection, thread_id: &str) -> rusqlite::Result<Vec<Message>> {
    let mut stmt = conn.prepare(
        "SELECT id, thread_id, role, content, meta_json, created_at
         FROM messages WHERE thread_id=?1 ORDER BY created_at ASC",
    )?;
    let rows = stmt.query_map([thread_id], |r| {
        Ok(Message {
            id: r.get(0)?,
            thread_id: r.get(1)?,
            role: r.get(2)?,
            content: r.get(3)?,
            meta_json: r.get(4)?,
            created_at: r.get(5)?,
        })
    })?;
    rows.collect()
}

// ─── Seekers ─────────────────────────────────────────────────

pub fn upsert_seeker(conn: &Connection, s: &Seeker) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO seekers (id, name, birth_date, birth_time, birth_place, notes, bond_stage, bond_points, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)
         ON CONFLICT(id) DO UPDATE SET
            name=excluded.name, birth_date=excluded.birth_date, birth_time=excluded.birth_time,
            birth_place=excluded.birth_place, notes=excluded.notes,
            bond_stage=excluded.bond_stage, bond_points=excluded.bond_points",
        params![s.id, s.name, s.birth_date, s.birth_time, s.birth_place, s.notes, s.bond_stage, s.bond_points, s.created_at],
    )?;
    Ok(())
}

pub fn list_seekers(conn: &Connection) -> rusqlite::Result<Vec<Seeker>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, birth_date, birth_time, birth_place, notes, bond_stage, bond_points, created_at
         FROM seekers ORDER BY created_at DESC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(Seeker {
            id: r.get(0)?,
            name: r.get(1)?,
            birth_date: r.get(2)?,
            birth_time: r.get(3)?,
            birth_place: r.get(4)?,
            notes: r.get(5)?,
            bond_stage: r.get(6)?,
            bond_points: r.get(7)?,
            created_at: r.get(8)?,
        })
    })?;
    rows.collect()
}

pub fn delete_seeker(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM seekers WHERE id=?1", params![id])?;
    Ok(())
}

// ─── Relics ──────────────────────────────────────────────────

pub fn create_relic(conn: &Connection, r: &Relic) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO relics (id, title, body_md, kind, mood, intensity, thread_id, seeker_id, tags_json, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)",
        params![r.id, r.title, r.body_md, r.kind, r.mood, r.intensity, r.thread_id, r.seeker_id, r.tags_json, r.created_at],
    )?;
    conn.execute(
        "INSERT INTO relics_fts (rowid, title, body_md, tags) VALUES ((SELECT rowid FROM relics WHERE id=?1), ?2, ?3, ?4)",
        params![r.id, r.title, r.body_md, r.tags_json],
    )?;
    Ok(())
}

pub fn list_relics(conn: &Connection) -> rusqlite::Result<Vec<Relic>> {
    let mut stmt = conn.prepare(
        "SELECT id, title, body_md, kind, mood, intensity, thread_id, seeker_id, tags_json, created_at
         FROM relics ORDER BY created_at DESC",
    )?;
    let rows = stmt.query_map([], map_relic)?;
    rows.collect()
}

fn map_relic(r: &rusqlite::Row) -> rusqlite::Result<Relic> {
    Ok(Relic {
        id: r.get(0)?,
        title: r.get(1)?,
        body_md: r.get(2)?,
        kind: r.get(3)?,
        mood: r.get(4)?,
        intensity: r.get(5)?,
        thread_id: r.get(6)?,
        seeker_id: r.get(7)?,
        tags_json: r.get(8)?,
        created_at: r.get(9)?,
    })
}

pub fn search_relics(conn: &Connection, query: &str, limit: i64) -> rusqlite::Result<Vec<Relic>> {
    if query.trim().is_empty() {
        return list_relics(conn);
    }
    let safe = sanitize_fts(query);
    if safe.is_empty() {
        return list_relics(conn);
    }
    let mut stmt = conn.prepare(
        "SELECT r.id, r.title, r.body_md, r.kind, r.mood, r.intensity, r.thread_id, r.seeker_id, r.tags_json, r.created_at
         FROM relics_fts f JOIN relics r ON r.rowid = f.rowid
         WHERE relics_fts MATCH ?1 ORDER BY rank LIMIT ?2",
    )?;
    let rows = stmt.query_map(params![safe, limit], map_relic)?;
    rows.collect()
}

fn sanitize_fts(query: &str) -> String {
    query
        .split_whitespace()
        .map(|w| w.chars().filter(|c| c.is_alphanumeric()).collect::<String>())
        .filter(|w| w.len() >= 2)
        .map(|w| format!("{}*", w))
        .collect::<Vec<_>>()
        .join(" OR ")
}

pub fn delete_relic(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute(
        "DELETE FROM relics_fts WHERE rowid=(SELECT rowid FROM relics WHERE id=?1)",
        params![id],
    )?;
    conn.execute("DELETE FROM relics WHERE id=?1", params![id])?;
    Ok(())
}

// ─── Signals ─────────────────────────────────────────────────

pub fn create_signal(conn: &Connection, s: &Signal) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO signals (id, kind, impression, target, time_window, confidence, controls, notes, status, outcome, created_at, scored_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)",
        params![s.id, s.kind, s.impression, s.target, s.time_window, s.confidence, s.controls, s.notes, s.status, s.outcome, s.created_at, s.scored_at],
    )?;
    Ok(())
}

pub fn list_signals(conn: &Connection) -> rusqlite::Result<Vec<Signal>> {
    let mut stmt = conn.prepare(
        "SELECT id, kind, impression, target, time_window, confidence, controls, notes, status, outcome, created_at, scored_at
         FROM signals ORDER BY created_at DESC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(Signal {
            id: r.get(0)?,
            kind: r.get(1)?,
            impression: r.get(2)?,
            target: r.get(3)?,
            time_window: r.get(4)?,
            confidence: r.get(5)?,
            controls: r.get(6)?,
            notes: r.get(7)?,
            status: r.get(8)?,
            outcome: r.get(9)?,
            created_at: r.get(10)?,
            scored_at: r.get(11)?,
        })
    })?;
    rows.collect()
}

pub fn score_signal(conn: &Connection, id: &str, status: &str, outcome: &str) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE signals SET status=?1, outcome=?2, scored_at=?3 WHERE id=?4",
        params![status, outcome, now(), id],
    )?;
    Ok(())
}

pub fn delete_signal(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM signals WHERE id=?1", params![id])?;
    Ok(())
}

// ─── Beliefs ─────────────────────────────────────────────────

pub fn create_belief(conn: &Connection, b: &Belief) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO beliefs (id, claim, confidence, epistemic_type, evidence, falsifier, status, supersedes_id, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
        params![b.id, b.claim, b.confidence, b.epistemic_type, b.evidence, b.falsifier, b.status, b.supersedes_id, b.created_at],
    )?;
    Ok(())
}

pub fn list_beliefs(conn: &Connection) -> rusqlite::Result<Vec<Belief>> {
    let mut stmt = conn.prepare(
        "SELECT id, claim, confidence, epistemic_type, evidence, falsifier, status, supersedes_id, created_at
         FROM beliefs ORDER BY created_at DESC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(Belief {
            id: r.get(0)?,
            claim: r.get(1)?,
            confidence: r.get(2)?,
            epistemic_type: r.get(3)?,
            evidence: r.get(4)?,
            falsifier: r.get(5)?,
            status: r.get(6)?,
            supersedes_id: r.get(7)?,
            created_at: r.get(8)?,
        })
    })?;
    rows.collect()
}

// ─── Config ──────────────────────────────────────────────────

pub fn get_config(conn: &Connection, key: &str) -> rusqlite::Result<Option<String>> {
    let mut stmt = conn.prepare("SELECT value FROM config WHERE key=?1")?;
    let mut rows = stmt.query([key])?;
    if let Some(row) = rows.next()? {
        Ok(Some(row.get(0)?))
    } else {
        Ok(None)
    }
}

pub fn set_config(conn: &Connection, key: &str, value: &str) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO config (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        params![key, value],
    )?;
    Ok(())
}
