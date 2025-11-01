#!/bin/bash
# Render build script for Puppeteer

echo "Installing dependencies..."
npm install

echo "Installing Chrome browser for Puppeteer..."
npx puppeteer browsers install chrome

echo "Verifying Chrome installation..."
ls -la /opt/render/.cache/puppeteer/ || echo "Cache directory not found, will be created on first run"

echo "Build complete!"
