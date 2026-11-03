#!/usr/bin/env bash
# =====================================================================
# Stop Ambient Background Music Player
# =====================================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$DIR/.music_pid"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  kill -TERM "$PID" 2>/dev/null
  rm -f "$PID_FILE"
fi

killall afplay 2>/dev/null
echo "Ambient music loop stopped successfully."
