#!/usr/bin/env bash
set -euo pipefail

SESSION="agentfail-server"
PORT=3070
WEBSITE_DIR="$(cd "$(dirname "$0")/../website" && pwd)"

usage() {
  echo "Usage: $0 [--kill | --restart]"
  echo ""
  echo "  (no args)   Start dev server (error if already running)"
  echo "  --kill      Kill the running session"
  echo "  --restart   Kill and restart the session"
  exit 1
}

session_exists() {
  tmux has-session -t "$SESSION" 2>/dev/null
}

kill_session() {
  if session_exists; then
    tmux kill-session -t "$SESSION"
    echo "Killed session: $SESSION"
  else
    echo "No session named '$SESSION' is running."
  fi
}

start_session() {
  tmux new-session -d -s "$SESSION" -c "$WEBSITE_DIR" \
    "pnpm install && pnpm dev --port $PORT --hostname 0.0.0.0; exec bash"
  echo "Started: $SESSION → http://agentfail.local  (port $PORT)"
  echo "Attach:  tmux attach -t $SESSION"
}

ACTION="${1:-}"

case "$ACTION" in
  --kill)
    kill_session
    ;;
  --restart)
    kill_session
    start_session
    ;;
  "")
    if session_exists; then
      echo "Session '$SESSION' is already running."
      echo "Use --restart to restart it, or --kill to stop it."
      exit 1
    fi
    start_session
    ;;
  --help | -h)
    usage
    ;;
  *)
    echo "Unknown option: $ACTION"
    usage
    ;;
esac
