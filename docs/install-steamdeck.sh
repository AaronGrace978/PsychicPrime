#!/usr/bin/env bash
# PsychicPrime — Steam Deck installer
# Run in Desktop Mode (Switch to Desktop from the Steam power menu).
set -euo pipefail

APP_NAME="PsychicPrime"
VERSION="0.1.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPIMAGE_SRC="${SCRIPT_DIR}/PsychicPrime_${VERSION}_amd64.AppImage"
ICON_SRC="${SCRIPT_DIR}/icons/psychicprime.png"

INSTALL_DIR="${HOME}/Applications/PsychicPrime"
BIN_PATH="${INSTALL_DIR}/PsychicPrime.AppImage"
ICON_PATH="${INSTALL_DIR}/psychicprime.png"
DESKTOP_PATH="${HOME}/.local/share/applications/psychicprime.desktop"

echo "==> Installing ${APP_NAME} ${VERSION} for Steam Deck"

if [[ ! -f "${APPIMAGE_SRC}" ]]; then
  echo "ERROR: AppImage not found next to this script:" >&2
  echo "  ${APPIMAGE_SRC}" >&2
  exit 1
fi

mkdir -p "${INSTALL_DIR}"
mkdir -p "$(dirname "${DESKTOP_PATH}")"

cp -f "${APPIMAGE_SRC}" "${BIN_PATH}"
chmod +x "${BIN_PATH}"

if [[ -f "${ICON_SRC}" ]]; then
  cp -f "${ICON_SRC}" "${ICON_PATH}"
fi

cat > "${DESKTOP_PATH}" <<EOF
[Desktop Entry]
Type=Application
Name=PsychicPrime
Comment=A Christ-grounded instrument of discernment — The Sanctuary
Exec=${BIN_PATH}
Icon=${ICON_PATH}
Terminal=false
Categories=Utility;Education;
StartupNotify=true
EOF
chmod +x "${DESKTOP_PATH}"

# Refresh desktop database if available
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "${HOME}/.local/share/applications" >/dev/null 2>&1 || true
fi

echo
echo "Installed to: ${BIN_PATH}"
echo "Launcher:     ${DESKTOP_PATH}"
echo
echo "Launch now:"
echo "  ${BIN_PATH}"
echo
echo "Add to Steam (Gaming Mode):"
echo "  1. Open Steam → Games → Add a Non-Steam Game"
echo "  2. Browse to: ${BIN_PATH}"
echo "  3. Add it, then optionally set a custom artwork in properties"
echo
echo "Done. Open PsychicPrime from the application menu or run the AppImage above."
