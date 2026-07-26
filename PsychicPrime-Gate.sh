#!/usr/bin/env bash
# PsychicPrime — open The Gate (phone / LAN Sanctuary proxy)
set -euo pipefail
cd "$(dirname "$0")"
export PATH="${HOME}/.nvm/versions/node/$(ls "${HOME}/.nvm/versions/node" 2>/dev/null | tail -1)/bin:${PATH:-}"
command -v npm >/dev/null || { echo "npm required"; exit 1; }
npm run gate:build
