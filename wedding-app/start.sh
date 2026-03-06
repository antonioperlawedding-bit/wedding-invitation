#!/usr/bin/env bash
set -e

PORT=6626

# Kill any process already running on the port
lsof -ti:"$PORT" | xargs -r kill -9 2>/dev/null || true

cd "$(dirname "$0")"
npm run dev
