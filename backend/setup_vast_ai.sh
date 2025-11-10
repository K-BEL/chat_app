#!/bin/bash
# Complete setup script for Vast.ai - Run this once to set everything up

set -e

echo "🔧 Vast.ai Continue-TTS Server Setup"
echo "===================================="
echo ""

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Update system
echo "📦 Step 1: Updating system packages..."
apt-get update -qq
echo "✅ System updated"
echo ""

# Step 2: Install Python and pip if not installed
echo "🐍 Step 2: Installing Python..."
if ! command -v python3 &> /dev/null; then
    apt-get install -y python3 python3-pip
    echo "✅ Python installed"
else
    echo "✅ Python already installed"
fi
echo ""

# Step 3: Install system dependencies
echo "📦 Step 3: Installing system dependencies..."
apt-get install -y curl screen
echo "✅ System dependencies installed"
echo ""

# Step 4: Install Python dependencies
echo "📦 Step 4: Installing Python dependencies..."
pip3 install --upgrade pip
pip3 install -r requirements.txt
pip3 install continue-speech
echo "✅ Python dependencies installed"
echo ""

# Step 5: Make scripts executable
echo "🔧 Step 5: Making scripts executable..."
chmod +x start_tts_server.sh
chmod +x setup_vast_ai.sh
echo "✅ Scripts are executable"
echo ""

# Step 6: Get IP address
echo "🌐 Step 6: Getting server IP address..."
PUBLIC_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
echo "✅ Public IP: $PUBLIC_IP"
echo ""

# Step 7: Create systemd service (optional, for auto-start)
echo "⚙️  Step 7: Creating systemd service..."
cat > /etc/systemd/system/tts-server.service << EOF
[Unit]
Description=Continue-TTS Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$SCRIPT_DIR
ExecStart=/usr/bin/python3 $SCRIPT_DIR/tts_server.py
Restart=always
RestartSec=10
Environment="PORT=5000"

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
echo "✅ Systemd service created"
echo ""

# Step 8: Start server
echo "🚀 Step 8: Starting TTS server..."
./start_tts_server.sh

echo ""
echo "===================================="
echo "✅ Setup Complete!"
echo "===================================="
echo ""
echo "📋 Your server information:"
echo "   - Public IP: $PUBLIC_IP"
echo "   - Port: 5000"
echo "   - URL: http://$PUBLIC_IP:5000"
echo "   - Health: http://$PUBLIC_IP:5000/health"
echo ""
echo "🔧 To manage the server:"
echo "   - Start: systemctl start tts-server"
echo "   - Stop: systemctl stop tts-server"
echo "   - Status: systemctl status tts-server"
echo "   - Logs: journalctl -u tts-server -f"
echo "   - Enable auto-start: systemctl enable tts-server"
echo ""
echo "📺 Or use screen:"
echo "   - View: screen -r tts-server"
echo "   - Detach: Ctrl+A then D"
echo ""
echo "🧪 Test the server:"
echo "   curl http://$PUBLIC_IP:5000/health"
echo ""

