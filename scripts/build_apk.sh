#!/bin/zsh
# Build a release APK for Tapslip (local Gradle build, no EAS account needed).
set -o pipefail
cd /Users/excellentmirror/Documents/tapslip/tapslip/android || exit 1
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
echo "=== Gradle assembleRelease started at $(date) ==="
./gradlew assembleRelease --console=plain
rc=$?
echo "=== GRADLE_EXIT=$rc at $(date) ==="
exit $rc
