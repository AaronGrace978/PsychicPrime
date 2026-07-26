#!/usr/bin/env bash
# Strip bundled Mesa/EGL/Wayland libs from a Tauri AppImage so SteamOS
# (and other hosts) use their own GPU stack instead of Ubuntu CI libs.
# Usage: scripts/patch-appimage-steamos.sh path/to/AppImage
set -euo pipefail

APPIMAGE="${1:?Usage: $0 path/to/Something.AppImage}"
APPIMAGE="$(cd "$(dirname "$APPIMAGE")" && pwd)/$(basename "$APPIMAGE")"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "==> Patching AppImage for SteamOS/AMD: $APPIMAGE"
cd "$WORK"
chmod +x "$APPIMAGE"

# Extract (AppImage self-extract)
"$APPIMAGE" --appimage-extract >/dev/null

LIB_DIR="squashfs-root/usr/lib"
if [[ ! -d "$LIB_DIR" ]]; then
  # some layouts nest further
  LIB_DIR="$(find squashfs-root -type d -path '*/usr/lib' | head -1 || true)"
fi
if [[ -z "${LIB_DIR}" || ! -d "$LIB_DIR" ]]; then
  echo "ERROR: could not find usr/lib inside AppImage" >&2
  exit 1
fi

echo "==> Stripping conflicting graphics libs from $LIB_DIR"
cd "$LIB_DIR"
rm -f \
  libEGL.so* libEGL_mesa.so* \
  libGLESv2.so* \
  libGLX.so* libGLX_mesa.so* \
  libwayland-client.so* libwayland-egl.so* libwayland-cursor.so* libwayland-server.so* \
  libGLdispatch.so* \
  2>/dev/null || true
cd "$WORK"

# Prefer system appimagetool; else download
TOOL=""
if command -v appimagetool >/dev/null 2>&1; then
  TOOL="$(command -v appimagetool)"
else
  curl -fsSL -o "$WORK/appimagetool" \
    https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage
  chmod +x "$WORK/appimagetool"
  TOOL="$WORK/appimagetool"
fi

OUT="$APPIMAGE"
ARCH=x86_64 "$TOOL" --no-appstream squashfs-root "$OUT"
chmod +x "$OUT"
echo "==> Patched: $OUT"
