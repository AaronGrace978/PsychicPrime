# PsychicPrime for Steam Deck

Local-first desktop Sanctuary for SteamOS (Steam Deck).

## Install from GitHub (recommended)

1. Switch to **Desktop Mode** (Steam button → Power → Switch to Desktop).
2. Open **Konsole** and run:

```bash
curl -fsSL https://github.com/AaronGrace978/PsychicPrime/releases/download/v0.1.1/install-steamdeck.sh | bash
```

That downloads the AppImage, installs a **Steam Deck launcher** (fixes black screens), and adds a desktop entry.

## Launch (important)

Use the launcher, not the raw AppImage:

```bash
~/Applications/PsychicPrime/PsychicPrime.sh
```

### Black / blank window?

Steam Deck AMD + WebKit often shows a black window. The launcher sets:

- `WEBKIT_DISABLE_DMABUF_RENDERER=1`
- `WEBKIT_DISABLE_COMPOSITING_MODE=1`
- `GDK_BACKEND=x11`

Manual test in Konsole:

```bash
WEBKIT_DISABLE_DMABUF_RENDERER=1 \
WEBKIT_DISABLE_COMPOSITING_MODE=1 \
GDK_BACKEND=x11 \
~/Applications/PsychicPrime/PsychicPrime.AppImage
```

Prefer **Desktop Mode** first. Gaming Mode (Gamescope) is harder on WebKit apps.

## Add to Gaming Mode (Steam)

1. Steam → **Games** → **Add a Non-Steam Game**
2. Browse to:

```text
~/Applications/PsychicPrime/PsychicPrime.sh
```

3. Properties → **Launch Options**:

```text
WEBKIT_DISABLE_DMABUF_RENDERER=1 WEBKIT_DISABLE_COMPOSITING_MODE=1 GDK_BACKEND=x11 %command%
```

4. Optional: controller layout → **Gamepad with Mouse Trackpad**

## Notes

- Built for **amd64 / x86_64** (Steam Deck).
- Uses an **AppImage** (SteamOS is Arch-based; `.deb` is not used).
- Data stays on the device (local SQLite).

## Uninstall

```bash
rm -rf ~/Applications/PsychicPrime
rm -f ~/.local/share/applications/psychicprime.desktop
```
