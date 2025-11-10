#!/bin/bash
# Quick Start Script - Copy and paste this entire script into Vast.ai terminal

echo "🚀 Quick Start: Continue-TTS Server"
echo "===================================="

# Navigate to backend directory
cd /workspace/chat_app/backend || cd ~/chat_app/backend || cd ./backend

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt --quiet
pip3 install continue-speech --quiet

# Get IP address
IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
echo "🌐 Your server IP: $IP"

# Start server in screen
echo "🎤 Starting TTS server..."
screen -dmS tts-server python3 tts_server.py

# Wait a moment
sleep 3

# Test server
echo "🧪 Testing server..."
curl -s http://localhost:5000/health && echo ""

echo ""
echo "✅ Server is running!"
echo "📋 Server URL: http://$IP:5000"
echo "🔍 Health check: http://$IP:5000/health"
echo ""
echo "📺 To view logs: screen -r tts-server"
echo "🔌 To detach: Press Ctrl+A then D"
echo ""
echo "📝 Add this to your local .env file:"
echo "   VITE_TTS_API_URL=http://$IP:5000"
echo ""

