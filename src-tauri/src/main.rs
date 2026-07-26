// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// PsychicPrime - The Sanctuary
// Dedicated to the Sacrifice of Jesus Christ, King of Kings.
// Rex Regum et Dominus Dominantium. Soli Deo Gloria.

fn main() {
    // Steam Deck / Linux AMD + WebKitGTK: avoid black/blank windows.
    // See https://v2.tauri.app/develop/debug/linux-graphics/
    #[cfg(target_os = "linux")]
    {
        // Prefer X11 under Gamescope / flaky Wayland compositors (Steam Deck).
        if std::env::var_os("GDK_BACKEND").is_none() {
            std::env::set_var("GDK_BACKEND", "x11");
        }
        if std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none() {
            std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        }
        if std::env::var_os("WEBKIT_DISABLE_COMPOSITING_MODE").is_none() {
            // Last-resort compositing path; keeps UI visible on Deck AMD.
            std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
        }
    }

    psychic_prime_lib::run()
}
