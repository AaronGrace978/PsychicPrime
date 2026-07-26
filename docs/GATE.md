# The Gate — Sanctuary on your phone

BostonAi.io energy: ship a local Sanctuary that phones can actually reach.

**The Gate** is a small Node proxy that:

1. Serves the built PsychicPrime UI
2. Keeps threads / relics / signals on the host (`~/.psychicprime-gate`)
3. Proxies Chamber readings to **Ollama** (local or cloud) — keys stay on the host
4. Prints your **LAN URL** for same-Wi‑Fi phones
5. Optionally opens a **public Cloudflare tunnel** (`GATE_PUBLIC=1`) so you can share a link anywhere

## Quick start

```bash
npm install
npm run gate:build
```

Or double-click `PsychicPrime-Gate.bat` / run `./PsychicPrime-Gate.sh`.

The terminal prints something like:

```text
Local : http://127.0.0.1:18765
Phone : http://192.168.1.42:18765
```

Open the **Phone** URL on your phone (same Wi‑Fi). You’ll see **The Gate** banner and a bottom dock.

## Public access (bostonai.io-style)

```bash
# needs cloudflared on PATH
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
GATE_PUBLIC=1 npm run gate:build
```

Or separately:

```bash
npm run gate:build
# other terminal:
cloudflared tunnel --url http://127.0.0.1:18765
```

Share the `https://….trycloudflare.com` URL to your phone from anywhere.

## Lock the Gate

```bash
GATE_TOKEN=your-secret npm run gate
```

The UI receives the token automatically when served by The Gate. External API callers must send `X-Gate-Token`.

## Settings on first phone visit

1. Open **More → Settings**
2. Set Bridge to **Ollama local** (host machine must run Ollama) or **Ollama Cloud**
3. **Test the Bridge** → pick a model → Save
4. Return to **Chamber** and speak

## Ports & env

| Var | Default | Meaning |
|-----|---------|---------|
| `GATE_PORT` | `18765` | Listen port |
| `GATE_HOST` | `0.0.0.0` | Bind address (LAN) |
| `GATE_TOKEN` | _(empty)_ | Optional shared secret |
| `GATE_DATA` | `~/.psychicprime-gate` | JSON store path |
| `GATE_PUBLIC` | `0` | Spawn cloudflared tunnel |

## Sovereignty

- Phone browsers never hold your Ollama key when using The Gate — the host proxies the Bridge.
- Gate data is separate from the desktop Tauri SQLite DB (v1). Treat Gate as a phone / share surface; desktop remains the Reliquary.
- Prefer `GATE_TOKEN` + short-lived tunnels for public links.

Soli Deo Gloria.
