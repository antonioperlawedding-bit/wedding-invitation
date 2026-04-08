#!/usr/bin/env bash
set -e

VITE_PORT=6626
API_PORT=7626

cd "$(dirname "$0")"

# Kill any processes on our ports
for p in $VITE_PORT $API_PORT; do
  lsof -ti:"$p" | xargs -r kill -9 2>/dev/null || true
done

echo "Starting Express API on port $API_PORT..."
PORT=$API_PORT node server/index.js &
API_PID=$!

echo "Starting Vite dev server on port $VITE_PORT..."
npm run dev &
VITE_PID=$!

# Graceful shutdown: kill both on exit
trap 'kill $API_PID $VITE_PID 2>/dev/null; exit' INT TERM

echo ""
echo "  Vite  → http://localhost:$VITE_PORT"
echo "  API   → http://localhost:$API_PORT"
echo "  CMS   → http://localhost:$VITE_PORT/cms"
echo ""

wait
