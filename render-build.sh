#!/bin/bash
# Render build script for Puppeteer

echo "Installing dependencies..."
npm install

echo "Installing Chromium for Puppeteer..."
npx puppeteer browsers install chrome

echo "Build complete!"
