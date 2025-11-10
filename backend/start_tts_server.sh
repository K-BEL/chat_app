#!/bin/bash
# Auto-start script for Continue-TTS server on Vast.ai
# This script sets up and starts the TTS server automatically

set -e

echo "🚀 Starting Continue-TTS Server Setup..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt --quiet
    echo "✅ Dependencies installed"
else
    echo "⚠️  requirements.txt not found, skipping dependency installation"
fi

# Install continue-speech package
echo "📦 Installing continue-speech package..."
pip3 install continue-speech --quiet
echo "✅ continue-speech installed"

# Check if screen is available (for background running)
if command -v screen &> /dev/null; then
    echo "✅ Screen is available for background execution"
    USE_SCREEN=true
else
    echo "⚠️  Screen not available, will run in foreground"
    USE_SCREEN=false
fi

# Function to start server
start_server() {
    echo "🎤 Starting TTS server..."
    
    # Get port from environment or use default
    PORT=${PORT:-5000}
    echo "🌐 Server will run on port: $PORT"
    
    # Start server
    if [ "$USE_SCREEN" = true ]; then
        # Kill any existing screen session with this name
        screen -S tts-server -X quit 2>/dev/null || true
        # Start new screen session
        screen -dmS tts-server python3 tts_server.py
        echo "✅ Server started in screen session 'tts-server'"
        echo "📺 To view logs: screen -r tts-server"
        echo "🔌 To detach: Press Ctrl+A then D"
    else
        # Run in foreground
        echo "🚀 Starting server in foreground..."
        python3 tts_server.py
    fi
}

# Check if server is already running
if pgrep -f "tts_server.py" > /dev/null; then
    echo "⚠️  TTS server is already running"
    read -p "Do you want to restart it? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🛑 Stopping existing server..."
        pkill -f "tts_server.py" || true
        sleep 2
        start_server
    else
        echo "✅ Keeping existing server running"
        echo "📺 To view logs: screen -r tts-server (if using screen)"
    fi
else
    start_server
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Server Information:"
echo "   - URL: http://$(hostname -I | awk '{print $1}'):${PORT:-5000}"
echo "   - Health check: http://$(hostname -I | awk '{print $1}'):${PORT:-5000}/health"
echo ""
echo "🔍 To check if server is running:"
echo "   curl http://localhost:${PORT:-5000}/health"
echo ""
echo "📺 To view server logs (if using screen):"
echo "   screen -r tts-server"
echo ""

