# Quick Start Guide

## Running Backend on Vast.ai

### Step 1: On Vast.ai Terminal

```bash
cd /workspace/chat_app/backend
chmod +x start_server.sh
./start_server.sh
```

**Note the IP address shown in the output!**

### Step 2: On Your Local Machine

1. **Update `.env` file:**
   ```env
   VITE_TTS_API_URL=http://YOUR_VAST_AI_IP:5000
   ```
   
   Replace `YOUR_VAST_AI_IP` with the IP from Step 1.

2. **Start frontend:**
   ```bash
   npm run dev
   ```

3. **Test it:**
   - Open browser console (F12)
   - Look for: `✅ Continue-TTS service available: true`
   - Go to Voice Mode
   - Send a message and click 🔊

## Keep Server Running

To keep server running after disconnecting SSH:

```bash
# On Vast.ai
screen -dmS tts-server bash -c "cd /workspace/chat_app/backend && ./start_server.sh"

# View logs
screen -r tts-server

# Detach: Press Ctrl+A then D
```

## Troubleshooting

### Can't Connect?

1. **Test server from Vast.ai:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Test from your local machine:**
   ```bash
   curl http://YOUR_VAST_AI_IP:5000/health
   ```

3. **Check .env file:**
   ```bash
   cat .env
   # Should show: VITE_TTS_API_URL=http://YOUR_IP:5000
   ```

### Server Stops?

Use screen to keep it running:
```bash
screen -dmS tts-server bash -c "cd /workspace/chat_app/backend && ./start_server.sh"
```

## That's It! 🚀

Your backend runs on Vast.ai and your frontend connects to it automatically.

