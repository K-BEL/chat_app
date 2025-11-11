#!/bin/bash
# Start TTS Server - Works for both local and Vast.ai

set -e

echo "🚀 Starting Continue-TTS Server..."
echo "===================================="

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed."
    echo "💡 On Vast.ai, Python should be pre-installed."
    echo "💡 On local machine, install Python 3.8+ first."
    exit 1
fi

echo "✅ Python3 found: $(python3 --version)"

# Install dependencies if needed
if [ -f "requirements.txt" ]; then
    echo "📦 Installing dependencies..."
    pip3 install -r requirements.txt --quiet 2>/dev/null || pip3 install -r requirements.txt
    echo "✅ Dependencies installed"
fi

# Install continue-speech if not installed
echo "📦 Installing continue-speech..."
pip3 install continue-speech --quiet 2>/dev/null || pip3 install continue-speech
echo "✅ continue-speech installed"

# Get IP address
IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}' || echo "localhost")
PORT=${PORT:-5000}

echo ""
echo "===================================="
echo "🌐 Server Information:"
echo "   - IP: $IP"
echo "   - Port: $PORT"
echo "   - URL: http://$IP:$PORT"
echo "   - Health: http://$IP:$PORT/health"
echo "===================================="
echo ""
echo "🎤 Starting TTS server..."
echo "💡 Model will load on first request"
echo "💡 Press Ctrl+C to stop"
echo ""

# Start server
export PORT=$PORT
python3 tts_server.py

