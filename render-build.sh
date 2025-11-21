#!/bin/bash
# Render build script for Puppeteer

echo "Installing dependencies..."
npm install

echo "Installing Chrome browser for Puppeteer..."
# Set cache directory and install Chrome
export PUPPETEER_CACHE_DIR="$(pwd)/.cache/puppeteer"
mkdir -p "$PUPPETEER_CACHE_DIR"
npx puppeteer browsers install chrome --path "$PUPPETEER_CACHE_DIR"

echo "Verifying Chrome installation..."
ls -la "$PUPPETEER_CACHE_DIR" || echo "Cache directory not found"

echo "Build complete!"
