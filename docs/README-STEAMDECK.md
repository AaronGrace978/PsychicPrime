# PsychicPrime for Steam Deck

Local-first desktop Sanctuary for SteamOS (Steam Deck).

## Install from GitHub (recommended)

1. Switch to **Desktop Mode** (Steam button → Power → Switch to Desktop).
2. Open **Konsole** and run:

```bash
curl -fsSL https://github.com/AaronGrace978/PsychicPrime/releases/download/v0.1.0/install-steamdeck.sh | bash
```

That downloads the AppImage from the [GitHub Release](https://github.com/AaronGrace978/PsychicPrime/releases/tag/v0.1.0), installs it to `~/Applications/PsychicPrime/`, and adds a desktop launcher.

## Add to Gaming Mode (Steam)

1. Steam → **Games** → **Add a Non-Steam Game to My Library**
2. Browse to:

```text
~/Applications/PsychicPrime/PsychicPrime.AppImage
```

3. Add it. Optional: in Properties, set controller layout to **Gamepad with Mouse Trackpad**.

## Other install options

### Zip package

Download [PsychicPrime-SteamDeck-0.1.0.zip](https://github.com/AaronGrace978/PsychicPrime/releases/download/v0.1.0/PsychicPrime-SteamDeck-0.1.0.zip), extract, then:

```bash
chmod +x install-steamdeck.sh
./install-steamdeck.sh
```

### Direct AppImage

```bash
curl -fL -o PsychicPrime.AppImage \
  https://github.com/AaronGrace978/PsychicPrime/releases/download/v0.1.0/PsychicPrime_0.1.0_amd64.AppImage
chmod +x PsychicPrime.AppImage
./PsychicPrime.AppImage
```

## Notes

- Built for **amd64 / x86_64** (Steam Deck).
- Uses an **AppImage** (SteamOS is Arch-based; `.deb` packages are not used).
- Data stays on the device (local SQLite).

## Uninstall

```bash
rm -rf ~/Applications/PsychicPrime
rm -f ~/.local/share/applications/psychicprime.desktop
```
