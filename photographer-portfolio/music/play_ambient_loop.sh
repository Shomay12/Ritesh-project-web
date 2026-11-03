#!/usr/bin/env bash
# =====================================================================
# Ambient Background Music Player (macOS)
# Loops traditional wedding music at 35% volume (30-40% range)
# =====================================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
MUSIC_FILE="$DIR/Maangal माँगल Traditional Wedding Songs Pandavaas.mp3"
PID_FILE="$DIR/.music_pid"
VOLUME=0.35

if [ ! -f "$MUSIC_FILE" ]; then
  echo "Error: Music file not found at $MUSIC_FILE"
  exit 1
fi

# Stop any previously running instance
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  kill "$OLD_PID" 2>/dev/null
  rm -f "$PID_FILE"
fi
killall afplay 2>/dev/null

echo "Starting ambient wedding music loop in the background..."
echo "Volume: ~35% (0.35)"
echo "File: $(basename "$MUSIC_FILE")"

# Background loop with proper signal propagation
(
  trap 'kill $(jobs -p) 2>/dev/null; exit 0' SIGINT SIGTERM
  while true; do
    afplay -v "$VOLUME" "$MUSIC_FILE" &
    CHILD_PID=$!
    wait "$CHILD_PID" 2>/dev/null
    sleep 1
  done
) &

LOOP_PID=$!
echo "$LOOP_PID" > "$PID_FILE"
echo "Ambient playback active in background (Loop PID: $LOOP_PID, Volume: 35%)."
echo "To stop anytime, run: ./photographer-portfolio/music/stop_ambient.sh or 'killall afplay'"
