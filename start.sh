#!/bin/bash
# Start backend in background
cd /home/runner/workspace/backend && node server.js &
BACKEND_PID=$!

# Start frontend on port 5000 with host 0.0.0.0
cd /home/runner/workspace/frontend && PORT=5000 HOST=0.0.0.0 BROWSER=none npm start

# Cleanup backend on exit
kill $BACKEND_PID 2>/dev/null
