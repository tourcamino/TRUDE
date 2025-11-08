#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${1:-reports}"
echo "[slither] Preparing output directory: $OUT_DIR"
mkdir -p "$OUT_DIR"

if ! command -v slither >/dev/null 2>&1; then
  echo "[slither] Slither non trovato. Provo installazione con pipx..."
  if command -v pipx >/dev/null 2>&1; then
    pipx install slither-analyzer || true
  else
    echo "[slither] pipx non presente; uso pip --user"
    python3 -m pip install --user slither-analyzer || true
    export PATH="$HOME/.local/bin:$PATH"
  fi
fi

echo "[slither] Running Slither"
slither . --config slither.config.json --json "$OUT_DIR/slither.json"
echo "[slither] Report JSON: $OUT_DIR/slither.json"