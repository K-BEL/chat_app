# Complete Vast.ai Setup Guide - Automated

This guide will help you set up and run the Continue-TTS server on Vast.ai automatically, without manual intervention.

## Prerequisites

1. Vast.ai instance with SSH access
2. GPU instance (recommended for faster TTS generation)
3. At least 10GB disk space for the model

## Step 1: Upload Files to Vast.ai

### Option A: Using SCP (from your local machine)

```bash
# From your local machine, upload the backend folder
scp -r backend/ root@<vast-ai-ip>:/workspace/chat_app/
```

### Option B: Using Git (if you have a repository)

```bash
# On Vast.ai instance
cd /workspace
git clone <your-repo-url> chat_app
cd chat_app
```

### Option C: Manual Upload via Vast.ai Terminal

1. Open Vast.ai terminal
2. Create directory: `mkdir -p /workspace/chat_app/backend`
3. Upload files using Vast.ai file manager or copy-paste

## Step 2: Run Automated Setup

On your Vast.ai instance, run:

```bash
cd /workspace/chat_app/backend
chmod +x setup_vast_ai.sh
./setup_vast_ai.sh
```

This script will:
- ✅ Install all dependencies
- ✅ Set up Python environment
- ✅ Install Continue-TTS
- ✅ Create systemd service for auto-start
- ✅ Start the server automatically
- ✅ Show you the public IP and URL

## Step 3: Get Your Server URL

After setup completes, you'll see output like:

```
📋 Your server information:
   - Public IP: 116.109.111.188
   - Port: 5000
   - URL: http://116.109.111.188:5000
```

**Save this URL!** You'll need it for the frontend.

## Step 4: Configure Frontend

On your local machine:

### 4.1 Create .env file

Create `.env` file in your project root:

```env
VITE_TTS_API_URL=http://116.109.111.188:5000
```

**Replace `116.109.111.188` with your actual Vast.ai IP.**

### 4.2 Restart Frontend

```bash
npm run dev
```

### 4.3 Verify Connection

1. Open browser console (F12)
2. Look for: `✅ Continue-TTS service available: true`

## Step 5: Keep Server Running (Auto-Start)

### Option A: Systemd Service (Recommended)

The setup script creates a systemd service. Enable it:

```bash
# Enable auto-start on boot
systemctl enable tts-server

# Check status
systemctl status tts-server

# View logs
journalctl -u tts-server -f
```

### Option B: Screen Session

```bash
# Start server in screen
screen -dmS tts-server python3 /workspace/chat_app/backend/tts_server.py

# View logs
screen -r tts-server

# Detach: Ctrl+A then D
```

### Option C: nohup

```bash
# Start server with nohup
cd /workspace/chat_app/backend
nohup python3 tts_server.py > tts.log 2>&1 &

# View logs
tail -f tts.log
```

## Managing the Server

### Check if server is running

```bash
# Check process
ps aux | grep tts_server

# Check health
curl http://localhost:5000/health

# Check from outside (your local machine)
curl http://<vast-ai-ip>:5000/health
```

### Start/Stop Server

**Using systemd:**
```bash
systemctl start tts-server    # Start
systemctl stop tts-server     # Stop
systemctl restart tts-server  # Restart
systemctl status tts-server   # Status
```

**Using screen:**
```bash
screen -r tts-server  # View/attach
# Press Ctrl+A then D to detach
```

**Kill process:**
```bash
pkill -f tts_server.py
```

## Testing

### Test from Vast.ai

```bash
# Health check
curl http://localhost:5000/health

# Test TTS generation
curl -X POST http://localhost:5000/tts/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test.", "voice": "nova"}' \
  --output test.wav
```

### Test from Your Local Machine

```bash
# Health check
curl http://<vast-ai-ip>:5000/health

# Should return:
# {"status": "healthy", "model_loaded": false}
```

## Troubleshooting

### Server Won't Start

1. **Check dependencies:**
   ```bash
   pip3 list | grep continue-speech
   pip3 list | grep flask
   ```

2. **Check Python version:**
   ```bash
   python3 --version
   # Should be 3.8 or higher
   ```

3. **Check disk space:**
   ```bash
   df -h
   # Need at least 10GB free
   ```

4. **Check GPU:**
   ```bash
   nvidia-smi
   # Verify GPU is available
   ```

### Connection Issues

1. **Check firewall:**
   ```bash
   # Check if port is open
   netstat -tulpn | grep 5000
   
   # Open port if needed
   ufw allow 5000
   ```

2. **Check server logs:**
   ```bash
   # If using systemd
   journalctl -u tts-server -f
   
   # If using screen
   screen -r tts-server
   
   # If using nohup
   tail -f tts.log
   ```

3. **Verify IP address:**
   ```bash
   # Get public IP
   curl ifconfig.me
   
   # Get local IP
   hostname -I
   ```

### Model Loading Issues

1. **First request takes time:**
   - Model loads on first request (30-60 seconds)
   - This is normal, subsequent requests are fast

2. **Out of memory:**
   - Check GPU memory: `nvidia-smi`
   - May need to use CPU mode or smaller model

3. **Download issues:**
   - Model downloads automatically on first load
   - Ensure internet connection is stable
   - May take 5-10 minutes for first download

## Quick Reference

### Server Commands

```bash
# Setup (one-time)
cd /workspace/chat_app/backend
./setup_vast_ai.sh

# Start server
./start_tts_server.sh

# Or use systemd
systemctl start tts-server

# Check status
systemctl status tts-server
curl http://localhost:5000/health

# View logs
journalctl -u tts-server -f
# OR
screen -r tts-server
```

### Frontend Configuration

```env
# .env file
VITE_TTS_API_URL=http://<vast-ai-ip>:5000
```

### Test Commands

```bash
# From Vast.ai
curl http://localhost:5000/health

# From your local machine
curl http://<vast-ai-ip>:5000/health
```

## Complete Workflow

1. **On Vast.ai:**
   ```bash
   cd /workspace/chat_app/backend
   ./setup_vast_ai.sh
   # Note the IP address shown
   ```

2. **On Local Machine:**
   ```bash
   # Create .env file with Vast.ai IP
   echo "VITE_TTS_API_URL=http://<vast-ai-ip>:5000" > .env
   
   # Start frontend
   npm run dev
   ```

3. **Test:**
   - Open app in browser
   - Go to Voice Mode
   - Send a message
   - Click 🔊 button
   - Avatar should speak with Continue-TTS!

## Support

If you encounter issues:

1. Check server logs on Vast.ai
2. Check browser console for errors
3. Verify IP address is correct
4. Test health endpoint
5. Check firewall settings

The server should now run automatically and stay running even after you disconnect from SSH!

