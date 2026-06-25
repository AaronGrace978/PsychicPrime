// ═══════════════════════════════════════════════════════════════
//  PsychicPrime — The Sanctuary (Tauri core)
//  Dedicated to the Sacrifice of Jesus Christ, King of Kings.
//  Rex Regum et Dominus Dominantium. Soli Deo Gloria.
// ═══════════════════════════════════════════════════════════════

mod commands;
mod db;
mod ollama;
mod persona;

use db::Db;
use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

pub struct AppState {
    pub db: Db,
    pub http: reqwest::Client,
    pub relics_dir: PathBuf,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| PathBuf::from("."));
            std::fs::create_dir_all(&data_dir).ok();

            let relics_dir = data_dir.join("relics");
            std::fs::create_dir_all(&relics_dir).ok();

            let db_path = data_dir.join("psychic.db");
            let conn = Connection::open(&db_path).expect("open sanctuary database");
            db::init(&conn).expect("consecrate sanctuary schema");

            let http = reqwest::Client::builder()
                .user_agent("PsychicPrime/0.1")
                .build()
                .unwrap_or_default();

            app.manage(AppState {
                db: Db {
                    conn: Mutex::new(conn),
                },
                http,
                relics_dir,
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_thread,
            commands::list_threads,
            commands::update_thread,
            commands::delete_thread,
            commands::append_message,
            commands::list_messages,
            commands::save_seeker,
            commands::list_seekers,
            commands::delete_seeker,
            commands::save_relic,
            commands::list_relics,
            commands::search_relics,
            commands::delete_relic,
            commands::save_signal,
            commands::list_signals,
            commands::score_signal,
            commands::delete_signal,
            commands::save_belief,
            commands::list_beliefs,
            commands::config_get,
            commands::config_set,
            commands::probe_bridge,
            commands::conduct_reading,
        ])
        .run(tauri::generate_context!())
        .expect("error while running PsychicPrime");
}
