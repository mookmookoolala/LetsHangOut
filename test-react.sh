#!/bin/bash

# Script to test the React app locally

echo "Starting React app for testing..."

# Navigate to the React app directory
cd /home/LetsHangOut/react-app

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the React development server
echo "Starting development server..."
npm start