# Backend Server Setup

## Quick Start for Vast.ai

### Step 1: Start Server on Vast.ai

```bash
cd /workspace/chat_app/backend
chmod +x start_server.sh
./start_server.sh
```

The script will:
- ✅ Install all dependencies automatically
- ✅ Show you the server IP and URL
- ✅ Start the server on port 5000

### Step 2: Get Server URL

After starting, you'll see:
```
🌐 Server Information:
   - IP: 116.109.111.188
   - Port: 5000
   - URL: http://116.109.111.188:5000
```

**Copy this URL!**

### Step 3: Configure Frontend

On your local machine, update `.env`:

```env
VITE_TTS_API_URL=http://116.109.111.188:5000
```

### Step 4: Start Frontend

```bash
npm run dev
```

### Step 5: Test

1. Open browser console (F12)
2. Look for: `✅ Continue-TTS service available: true`
3. Go to Voice Mode and test TTS

## Keep Server Running

### Using Screen (Recommended)

```bash
# Start in background
screen -dmS tts-server bash -c "cd /workspace/chat_app/backend && ./start_server.sh"

# View logs
screen -r tts-server

# Detach: Ctrl+A then D
```

### Using nohup

```bash
cd /workspace/chat_app/backend
nohup ./start_server.sh > tts.log 2>&1 &

# View logs
tail -f tts.log
```

## Testing

```bash
# From Vast.ai
curl http://localhost:5000/health

# From your local machine
curl http://YOUR_VAST_AI_IP:5000/health
```

## Troubleshooting

See `VAST_AI_SETUP.md` for detailed troubleshooting.

