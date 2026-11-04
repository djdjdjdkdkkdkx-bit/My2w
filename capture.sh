#!/usr/bin/env bash
# Capture desktop + mobile screenshots of the running preview.
# Env: CAPTURE_URL (default local server), CAPTURE_DIR (output).
# Exit codes: 0 success, 75 temporary browser/navigation infrastructure
# failure, 1 script or rendering defect. Leaves the app running.
set -uo pipefail
cd "$(dirname "$0")" || exit 1

CAPTURE_URL="${CAPTURE_URL:-http://127.0.0.1:${PORT:-3000}/}"
CAPTURE_DIR="${CAPTURE_DIR:-/home/runner/work/_temp/omgithub-capture}"
DESKTOP_PNG="$CAPTURE_DIR/final-desktop.png"
MOBILE_PNG="$CAPTURE_DIR/final-mobile.png"
CHROME_LOG="$CAPTURE_DIR/chromium.log"

echo "[capture] url=$CAPTURE_URL dir=$CAPTURE_DIR"

/usr/bin/time -p mkdir -p "$CAPTURE_DIR" || { echo "[capture] cannot create CAPTURE_DIR" >&2; exit 1; }

if ! command -v chromium >/dev/null 2>&1; then
  echo "[capture] FATAL: chromium not found" >&2
  exit 1
fi
if ! command -v curl >/dev/null 2>&1; then
  echo "[capture] FATAL: curl not found" >&2
  exit 1
fi

# Chromium runs with its own throwaway profile so cleanup can target only
# processes we started (never the app server).
PROFILE="$(mktemp -d 2>/dev/null || mktemp -d /tmp/cap.XXXXXX)"
trap 'pkill -9 -f -- "--user-data-dir=$PROFILE" 2>/dev/null; rm -rf "$PROFILE"' EXIT

shot() { # $1 window geometry WxH  $2 destination png
  local dims="$1" out="$2" n bytes rc=0
  for ((n = 1; n <= 3; n++)); do
    echo "[capture] attempt $n: $dims -> $out"
    /usr/bin/time -p chromium --headless=new --no-sandbox --disable-gpu \
      --user-data-dir="$PROFILE" --hide-scrollbars \
      --window-size="$dims" --virtual-time-budget=20000 --timeout=45000 \
      --screenshot="$out" "$CAPTURE_URL" >> "$CHROME_LOG" 2>&1
    rc=$?
    if [[ $rc -eq 0 && -s "$out" ]]; then
      bytes="$(stat -c%s "$out")"
      if (( bytes >= 8000 )); then
        echo "[capture] saved $out ($bytes bytes)"
        return 0
      fi
      # Chromium succeeded but the page rendered nothing substantial.
      echo "[capture] $out renders too small ($bytes bytes)." >&2
      return 1
    fi
    echo "[capture] chromium rc=$rc (temporary navigation/browser failure), retrying in 3s" >&2
    sleep 3
  done
  echo "[capture] giving up on $out after $n attempts" >&2
  return 75
}

# --- wait for the preview to respond (temporary failure -> exit 75) ---------
code=""
ok=0
for ((n = 1; n <= 10; n++)); do
  code="$({ /usr/bin/time -p curl -so /dev/null -w '%{http_code}' --max-time 10 "$CAPTURE_URL"; } 2>/dev/null)"
  case "$code" in 2*) ok=1; break ;; *) sleep 3 ;; esac
done
if (( ok != 1 )); then
  echo "[capture] preview did not respond at $CAPTURE_URL (last HTTP ${code:-none})" >&2
  exit 75
fi
echo "[capture] preview responded (HTTP $code)"

# Wait for rendered content: verify the page actually renders EMBERFALL's DOM
# (a grey browser error page would be a rendering defect -> exit 1).
dom_log="$CAPTURE_DIR/rendered-dom.html"
/usr/bin/time -p chromium --headless=new --no-sandbox --disable-gpu \
  --user-data-dir="$PROFILE" --virtual-time-budget=20000 --timeout=45000 \
  --dump-dom "$CAPTURE_URL" > "$dom_log" 2>>"$CHROME_LOG"
/usr/bin/time -p grep -qi 'EMBERFALL' "$dom_log" || {
  echo "[capture] FATAL: page did not render EMBERFALL content" >&2
  exit 1
}
echo "[capture] rendered content verified in DOM"

/usr/bin/time -p sleep 2

shot 1440x900 "$DESKTOP_PNG" || exit $?

shot 390x844 "$MOBILE_PNG" || exit $?

/usr/bin/time -p echo "[capture] complete: $DESKTOP_PNG $MOBILE_PNG"
exit 0
