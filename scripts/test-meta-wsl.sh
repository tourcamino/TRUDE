#!/usr/bin/env bash
set -euo pipefail

# Meta runner for WSL/Linux: start Ganache, run Truffle compile+test, then Hardhat tests.
# Usage: ./scripts/test-meta-wsl.sh [PORT]

PORT="${1:-8545}"
SUMMARY=()

cleanup() {
  if [[ -n "${GANACHE_PID:-}" ]] && kill -0 "$GANACHE_PID" 2>/dev/null; then
    echo "[meta] Stopping Ganache (pid=$GANACHE_PID)"
    kill "$GANACHE_PID" || true
  fi
}
trap cleanup EXIT

echo "[meta] Starting Ganache on port $PORT"
(
  npx ganache -p "$PORT" &
  echo $! > /tmp/ganache.pid
) || true
GANACHE_PID="$(cat /tmp/ganache.pid 2>/dev/null || true)"
SUMMARY+=("Ganache: started on 127.0.0.1:$PORT")

# Give Ganache a moment to boot
sleep 1

echo "[meta] Truffle compile"
if npm run truffle:compile; then
  SUMMARY+=("Truffle compile: OK")
else
  SUMMARY+=("Truffle compile: FAIL")
fi

echo "[meta] Truffle test (explicit JS files)"
if npm run truffle:test; then
  SUMMARY+=("Truffle test: OK")
else
  SUMMARY+=("Truffle test: FAIL")
fi

echo "[meta] Hardhat tests"
# Prefer native hardhat; fall back if script isn't present
if npm run hh:test 2>/dev/null; then
  SUMMARY+=("Hardhat test: OK")
else
  if npx hardhat test; then
    SUMMARY+=("Hardhat test: OK (npx hardhat)")
  else
    SUMMARY+=("Hardhat test: FAIL")
  fi
fi

echo
echo "===== Consolidated Summary ====="
for line in "${SUMMARY[@]}"; do
  echo "$line"
done