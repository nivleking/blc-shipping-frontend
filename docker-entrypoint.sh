#!/bin/sh

echo "Installing dependencies..."
npm install

echo "Building the application..."
npm run build

echo "Starting the preview server..."
exec npm run preview -- --host 0.0.0.0 --port 5174