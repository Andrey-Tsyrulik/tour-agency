#!/bin/bash
set -e

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

# Build the frontend
echo "Building frontend..."
cd /home/runner/workspace/frontend
DISABLE_ESLINT_PLUGIN=true npm run build

# Start the backend (which also serves the built frontend)
echo "Starting server..."
cd /home/runner/workspace/backend
node server.js
