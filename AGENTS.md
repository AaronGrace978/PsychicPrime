# AGENTS.md

## Cursor Cloud specific instructions

PsychicPrime is a Tauri 2 (Rust) + React 19 / Vite / TypeScript desktop app ("The Sanctuary"). It runs in two modes; the **web dev mode is the supported path in this cloud environment** because it has zero external dependencies.

### Web dev mode (use this)
- `npm run dev` starts Vite on `http://localhost:1420` (fixed `strictPort`). The app is fully usable here.
- In the browser there is no Rust backend; `src/lib/sanctuary.ts` transparently falls back to a `localStorage` mirror, so storage and all rooms work standalone. No DB server, no `.env`, no migrations.
- Core flows to smoke-test: Spreads room → "Draw the Cards" (tarot), or Chamber → ask the oracle (uses a built-in "inner light" fallback when no LLM is connected).

### Build / typecheck
- `npm run build` runs `tsc` (typecheck) then `vite build` → `dist/`. There are **no `lint` or `test` scripts**; `npm run build` is the only programmatic check.

### Desktop (Tauri) mode — not set up here
- `npm run desktop` (= `tauri dev`) and `npm run desktop:build` require Linux GTK/WebKit system libraries that are **not** installed by default (`gtk+-3.0`, `webkit2gtk-4.1`, `libsoup-3.0`, `javascriptcoregtk-4.1`). The Rust toolchain (cargo) is present, but those system libs must be apt-installed (e.g. `libwebkit2gtk-4.1-dev libgtk-3-dev libsoup-3.0-dev`) before `cargo` can build `src-tauri`. Prefer web dev mode for development/testing unless desktop packaging is specifically required.

### LLM (optional)
- The "oracle"/Chamber LLM is optional and defaults to `none`. Ollama (local `http://localhost:11434` or Ollama Cloud) is only needed to test live LLM chat; it is configured at runtime in Settings, not via env vars.
