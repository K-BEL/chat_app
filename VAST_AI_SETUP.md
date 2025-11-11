# Running Backend on Vast.ai

This guide explains how to run the TTS backend server on Vast.ai and connect your local frontend to it.

## Quick Setup

### Step 1: On Vast.ai Terminal

```bash
# Navigate to backend directory
cd /workspace/chat_app/backend

# Make script executable
chmod +x start_server.sh

# Start server
./start_server.sh
```

The server will start on port 5000 and show you the IP address.

### Step 2: Get Your Vast.ai IP

After starting the server, you'll see:
```
🌐 Server will be accessible at: http://123.45.67.89:5000
```

**Save this IP address!**

### Step 3: Configure Frontend

On your local machine, update your `.env` file:

```env
VITE_TTS_API_URL=http://YOUR_VAST_AI_IP:5000
```

Replace `YOUR_VAST_AI_IP` with the IP from Step 2.

**Example:**
```env
VITE_TTS_API_URL=http://116.109.111.188:5000
```

### Step 4: Restart Frontend

```bash
npm run dev
```

### Step 5: Verify Connection

1. Open browser console (F12)
2. Look for: `✅ Continue-TTS service available: true`
3. Test TTS in Voice Mode

## Keep Server Running

### Option 1: Using Screen (Recommended)

```bash
# Start server in screen session
screen -dmS tts-server bash -c "cd /workspace/chat_app/backend && ./start_server.sh"

# View logs
screen -r tts-server

# Detach: Press Ctrl+A then D
```

### Option 2: Using nohup

```bash
cd /workspace/chat_app/backend
nohup ./start_server.sh > tts.log 2>&1 &

# View logs
tail -f tts.log
```

### Option 3: Using systemd (Advanced)

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/tts-server.service
```

Add:
```ini
[Unit]
Description=Continue-TTS Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/workspace/chat_app/backend
ExecStart=/usr/bin/bash /workspace/chat_app/backend/start_server.sh
Restart=always
RestartSec=10
Environment="PORT=5000"

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable tts-server
sudo systemctl start tts-server
sudo systemctl status tts-server
```

## Testing

### Test from Vast.ai

```bash
curl http://localhost:5000/health
```

### Test from Your Local Machine

```bash
curl http://YOUR_VAST_AI_IP:5000/health
```

Both should return:
```json
{"status": "healthy", "model_loaded": false}
```

## Troubleshooting

### Server Not Accessible

1. **Check firewall:**
   ```bash
   # On Vast.ai
   ufw allow 5000
   # Or check Vast.ai dashboard for port settings
   ```

2. **Check if server is running:**
   ```bash
   ps aux | grep tts_server
   ```

3. **Check server logs:**
   ```bash
   # If using screen
   screen -r tts-server
   
   # If using nohup
   tail -f tts.log
   ```

### Connection Issues

1. **Verify IP address:**
   ```bash
   # On Vast.ai
   curl ifconfig.me
   ```

2. **Check .env file:**
   ```bash
   # On local machine
   cat .env
   # Should show: VITE_TTS_API_URL=http://YOUR_IP:5000
   ```

3. **Test connection:**
   ```bash
   # From local machine
   curl http://YOUR_VAST_AI_IP:5000/health
   ```

## Environment Variables

### On Vast.ai

Set port if needed:
```bash
export PORT=5000
./start_server.sh
```

### On Local Machine

Update `.env` file:
```env
VITE_TTS_API_URL=http://YOUR_VAST_AI_IP:5000
```

## Quick Reference

### Vast.ai Commands

```bash
# Start server
cd /workspace/chat_app/backend
./start_server.sh

# Start in background (screen)
screen -dmS tts-server bash -c "cd /workspace/chat_app/backend && ./start_server.sh"

# View logs
screen -r tts-server

# Stop server
pkill -f tts_server.py
```

### Local Machine

```bash
# Update .env
echo "VITE_TTS_API_URL=http://YOUR_VAST_AI_IP:5000" >> .env

# Start frontend
npm run dev
```

## Notes

- Server binds to `0.0.0.0:5000` (accessible from outside)
- CORS is enabled for remote access
- Model loads on first request (may take 30-60 seconds)
- Server will keep running in screen/nohup even after SSH disconnect

