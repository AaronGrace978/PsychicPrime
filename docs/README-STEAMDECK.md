# PsychicPrime for Steam Deck

Local-first desktop Sanctuary for SteamOS (Steam Deck).

## Install (Desktop Mode)

1. Switch to **Desktop Mode** (Steam button → Power → Switch to Desktop).
2. Download `PsychicPrime-SteamDeck-0.1.0.zip` and extract it.
3. Open Konsole in the extracted folder and run:

```bash
chmod +x install-steamdeck.sh
./install-steamdeck.sh
```

That places the AppImage in `~/Applications/PsychicPrime/` and adds a desktop launcher.

## Add to Gaming Mode (Steam)

1. Steam → **Games** → **Add a Non-Steam Game to My Library**
2. Browse to:

```text
~/Applications/PsychicPrime/PsychicPrime.AppImage
```

3. Add it. Optional: in Properties, set controller layout to **Gamepad with Mouse Trackpad**.

## Manual run (no installer)

```bash
chmod +x PsychicPrime_0.1.0_amd64.AppImage
./PsychicPrime_0.1.0_amd64.AppImage
```

## Notes

- Built for **amd64 / x86_64** (Steam Deck).
- Uses an **AppImage** (SteamOS is Arch-based; `.deb` packages are not used).
- Data stays on the device (local SQLite).
- Needs Desktop Mode or a Non-Steam Game entry to launch from Gaming Mode.

## Uninstall

```bash
rm -rf ~/Applications/PsychicPrime
rm -f ~/.local/share/applications/psychicprime.desktop
```
