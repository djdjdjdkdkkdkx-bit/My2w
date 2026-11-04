#!/usr/bin/env bash
# EMBERFALL project startup.
# The project is a plain static HTML/JS game under emberfall/ (no package.json,
# no build step), so startup = publish deployment metadata + serve statically
# in the foreground on ${PORT:-3000}.
set -uo pipefail
cd "$(dirname "$0")" || exit 1
PROJECT_DIR="$(pwd -P)"

# Built static directory: the game ships pre-built (vanilla JS), kept inside
# PROJECT_DIR. OPENCODE_WEB_DIR / RUNNER_TEMP are used only for metadata.
STATIC_DIR="$PROJECT_DIR/emberfall"
META_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"

echo "[start] PROJECT_DIR=$PROJECT_DIR"
echo "[start] STATIC_DIR=$STATIC_DIR"

# --- sanity check -----------------------------------------------------------
/usr/bin/time -p test -f "$STATIC_DIR/index.html" || {
  echo "[start] FATAL: $STATIC_DIR/index.html is missing" >&2
  exit 1
}

# --- dependencies / build (static project: both are no-ops, timed as usual) --
/usr/bin/time -p echo "[start] dependencies: none required (no package.json)"
/usr/bin/time -p echo "[start] build: none required (vanilla HTML/JS)"

# --- controller metadata -----------------------------------------------------
/usr/bin/time -p mkdir -p "$META_DIR" && printf '{"project":"%s","directory":"%s"}\n' \
  "$PROJECT_DIR" "$STATIC_DIR" > "$META_DIR/deployment-output.json"
echo "[start] wrote $META_DIR/deployment-output.json"

# --- serve in the foreground on PORT (default 3000) --------------------------
PORT="${PORT:-3000}"
echo "[start] serving on 0.0.0.0:$PORT"
/usr/bin/time -p python3 -m http.server "$PORT" --bind 0.0.0.0 --directory "$STATIC_DIR"
