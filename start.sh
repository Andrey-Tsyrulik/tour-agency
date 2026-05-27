#!/bin/bash

# Install backend deps if needed
cd /home/runner/workspace/backend
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
fi

# Install frontend deps if needed
cd /home/runner/workspace/frontend
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

# Start backend on port 3001 in background
echo "Starting backend on port 3001..."
cd /home/runner/workspace/backend
PORT=3001 node server.js &
BACKEND_PID=$!

# Start frontend dev server on port 3000
echo "Starting frontend on port 3000..."
cd /home/runner/workspace/frontend
PORT=3000 BROWSER=none DISABLE_ESLINT_PLUGIN=true npm start &
FRONTEND_PID=$!

# Wait for both processes; if either exits, kill the other
wait -n $BACKEND_PID $FRONTEND_PID
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
wait
