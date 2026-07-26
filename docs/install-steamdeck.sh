#!/usr/bin/env bash
# PsychicPrime — install from GitHub (Steam Deck / Linux amd64)
# Desktop Mode on Steam Deck: Steam button → Power → Switch to Desktop
#
# One-liner:
#   curl -fsSL https://github.com/AaronGrace978/PsychicPrime/releases/download/v0.1.1/install-steamdeck.sh | bash
set -euo pipefail

APP_NAME="PsychicPrime"
VERSION="${PSYCHICPRIME_VERSION:-0.1.1}"
REPO="AaronGrace978/PsychicPrime"
RELEASE_BASE="https://github.com/${REPO}/releases/download/v${VERSION}"
APPIMAGE_NAME="PsychicPrime_${VERSION}_amd64.AppImage"
ICON_URL="https://raw.githubusercontent.com/${REPO}/master/src-tauri/icons/128x128.png"

INSTALL_DIR="${HOME}/Applications/PsychicPrime"
BIN_PATH="${INSTALL_DIR}/PsychicPrime.AppImage"
LAUNCHER_PATH="${INSTALL_DIR}/PsychicPrime.sh"
ICON_PATH="${INSTALL_DIR}/psychicprime.png"
DESKTOP_PATH="${HOME}/.local/share/applications/psychicprime.desktop"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

download() {
  local url="$1"
  local out="$2"
  if command -v curl >/dev/null 2>&1; then
    curl -fL --progress-bar -o "${out}" "${url}"
  elif command -v wget >/dev/null 2>&1; then
    wget -O "${out}" "${url}"
  else
    echo "ERROR: need curl or wget to download from GitHub." >&2
    exit 1
  fi
}

echo "==> Installing ${APP_NAME} v${VERSION} from GitHub"
echo "    ${RELEASE_BASE}/${APPIMAGE_NAME}"
echo

mkdir -p "${INSTALL_DIR}"
mkdir -p "$(dirname "${DESKTOP_PATH}")"

# Prefer a local AppImage (zip install); otherwise download the release asset.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
LOCAL_APPIMAGE=""
if [[ -n "${SCRIPT_DIR}" && -f "${SCRIPT_DIR}/${APPIMAGE_NAME}" ]]; then
  LOCAL_APPIMAGE="${SCRIPT_DIR}/${APPIMAGE_NAME}"
elif [[ -f "./${APPIMAGE_NAME}" ]]; then
  LOCAL_APPIMAGE="./${APPIMAGE_NAME}"
fi

if [[ -n "${LOCAL_APPIMAGE}" ]]; then
  echo "==> Using local AppImage: ${LOCAL_APPIMAGE}"
  cp -f "${LOCAL_APPIMAGE}" "${BIN_PATH}"
else
  echo "==> Downloading AppImage from GitHub Releases…"
  # Fall back to 0.1.0 asset name if 0.1.1 not published yet
  if ! download "${RELEASE_BASE}/${APPIMAGE_NAME}" "${TMP_DIR}/${APPIMAGE_NAME}" 2>/dev/null; then
    echo "==> v${VERSION} AppImage not found; trying v0.1.0…"
    download "https://github.com/${REPO}/releases/download/v0.1.0/PsychicPrime_0.1.0_amd64.AppImage" "${TMP_DIR}/${APPIMAGE_NAME}"
  fi
  cp -f "${TMP_DIR}/${APPIMAGE_NAME}" "${BIN_PATH}"
fi
chmod +x "${BIN_PATH}"

# Icon: local copy, then GitHub
LOCAL_ICON=""
if [[ -n "${SCRIPT_DIR}" && -f "${SCRIPT_DIR}/icons/psychicprime.png" ]]; then
  LOCAL_ICON="${SCRIPT_DIR}/icons/psychicprime.png"
elif [[ -n "${SCRIPT_DIR}" && -f "${SCRIPT_DIR}/../src-tauri/icons/128x128.png" ]]; then
  LOCAL_ICON="${SCRIPT_DIR}/../src-tauri/icons/128x128.png"
fi

if [[ -n "${LOCAL_ICON}" ]]; then
  cp -f "${LOCAL_ICON}" "${ICON_PATH}"
else
  echo "==> Downloading icon…"
  download "${ICON_URL}" "${ICON_PATH}" || true
fi

# Steam Deck / AMD WebKit black-screen launcher
cat > "${LAUNCHER_PATH}" <<EOF
#!/usr/bin/env bash
# PsychicPrime Steam Deck / Linux launcher
# Fixes black/blank WebKitGTK windows on SteamOS AMD.
set -euo pipefail
DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
export GDK_BACKEND="\${GDK_BACKEND:-x11}"
export WEBKIT_DISABLE_DMABUF_RENDERER="\${WEBKIT_DISABLE_DMABUF_RENDERER:-1}"
export WEBKIT_DISABLE_COMPOSITING_MODE="\${WEBKIT_DISABLE_COMPOSITING_MODE:-1}"
# Prefer native Mesa over Steam Runtime when launched from Gaming Mode
unset LD_LIBRARY_PATH || true
exec "\${DIR}/PsychicPrime.AppImage" "\$@"
EOF
chmod +x "${LAUNCHER_PATH}"

cat > "${DESKTOP_PATH}" <<EOF
[Desktop Entry]
Type=Application
Name=PsychicPrime
Comment=A Christ-grounded instrument of discernment — The Sanctuary
Exec=${LAUNCHER_PATH}
Icon=${ICON_PATH}
Terminal=false
Categories=Utility;Education;
StartupNotify=true
EOF
chmod +x "${DESKTOP_PATH}"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "${HOME}/.local/share/applications" >/dev/null 2>&1 || true
fi

echo
echo "Installed from GitHub → ${BIN_PATH}"
echo "Launcher (use this)  → ${LAUNCHER_PATH}"
echo "Desktop launcher     → ${DESKTOP_PATH}"
echo
echo "Launch from Desktop Mode:"
echo "  ${LAUNCHER_PATH}"
echo
echo "If you still see a black window, run in Konsole:"
echo "  WEBKIT_DISABLE_DMABUF_RENDERER=1 WEBKIT_DISABLE_COMPOSITING_MODE=1 GDK_BACKEND=x11 ${BIN_PATH}"
echo
echo "Add to Steam (Gaming Mode) — important:"
echo "  Games → Add a Non-Steam Game → pick:"
echo "    ${LAUNCHER_PATH}"
echo "  Then Properties → Launch Options:"
echo "    WEBKIT_DISABLE_DMABUF_RENDERER=1 WEBKIT_DISABLE_COMPOSITING_MODE=1 GDK_BACKEND=x11 %command%"
echo
echo "Done."
