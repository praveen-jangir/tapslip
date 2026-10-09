#!/bin/zsh
# Fetch Gradle 8.10.2 distribution from Tencent mirror into the wrapper cache (services.gradle.org
# is nearly unreachable from this network), then run assembleRelease via build_apk.sh.
set -e
DIR="$HOME/.gradle/wrapper/dists/gradle-8.10.2-all/7iv73wktx1xtkvlq19urqw1wm"
ZIP="$DIR/gradle-8.10.2-all.zip"
mkdir -p "$DIR"
cd "$DIR"
if [ -f "$DIR/gradle-8.10.2-all.zip.ok" ] && [ -d "$DIR/gradle-8.10.2" ]; then
  echo "=== Gradle dist already cached, skipping download ==="
else
  rm -f "$ZIP.part" 2>/dev/null
  echo "=== Downloading Gradle 8.10.2-all from Tencent mirror at $(date) ==="
  ok=0
  for i in {1..25}; do
    echo "--- attempt $i ($(date '+%H:%M:%S')) current size: $(stat -f%z "$ZIP" 2>/dev/null || echo 0) ---"
    if curl -sS -L -C - --connect-timeout 30 --max-time 600 -o "$ZIP" \
        https://mirrors.cloud.tencent.com/gradle/gradle-8.10.2-all.zip; then
      ok=1
      break
    fi
    sleep 5
  done
  if [ "$ok" != "1" ]; then
    echo "=== DOWNLOAD FAILED after retries ==="
    exit 1
  fi
  echo "=== Download complete: $(stat -f%z "$ZIP") bytes ==="
  echo "=== Verifying zip integrity ==="
  unzip -tq "$ZIP" > /dev/null
  echo "=== Unzipping into wrapper cache ==="
  unzip -q -o "$ZIP" -d "$DIR"
  touch "$DIR/gradle-8.10.2-all.zip.ok"
  echo "=== Gradle dist ready at $(date) ==="
fi
exec /bin/zsh /Users/excellentmirror/Documents/tapslip/tapslip/scripts/build_apk.sh
