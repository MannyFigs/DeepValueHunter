#!/bin/bash

echo "========================================"
echo "  DeepValueHunter - One-Click Launch"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Or use Homebrew: brew install node"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo "[1/3] Checking Node.js... OK"
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[2/3] Installing dependencies... (this may take a few minutes)"
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies!"
        read -p "Press Enter to exit..."
        exit 1
    fi
else
    echo "[2/3] Dependencies already installed... OK"
fi

echo ""
echo "[3/3] Starting development server..."
echo ""
echo "========================================"
echo "  Server starting on http://localhost:5173"
echo "  Also available on your network!"
echo "  Press Ctrl+C to stop the server"
echo "========================================"
echo ""

# Start the development server
npm run dev
