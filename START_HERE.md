# 🚀 START HERE - Complete Setup Guide

## ✅ What You Have

- ✅ Vast.ai instance running
- ✅ TTS server files ready
- ✅ Frontend configured
- ✅ .env file created with your IP

## 🎯 What You Need to Do (3 Steps)

### Step 1: On Vast.ai Terminal (Copy-Paste)

```bash
cd /workspace/chat_app/backend
chmod +x QUICK_START.sh
./QUICK_START.sh
```

**OR** if that doesn't work, run these commands:

```bash
cd /workspace/chat_app/backend
pip3 install -r requirements.txt
pip3 install continue-speech
screen -dmS tts-server python3 tts_server.py
curl ifconfig.me
```

**Save the IP address that's shown!**

### Step 2: Verify Server is Running

On Vast.ai, test the server:

```bash
curl http://localhost:5000/health
```

You should see:
```json
{"status": "healthy", "model_loaded": false}
```

### Step 3: On Your Local Machine

Your `.env` file is already configured! Just restart your frontend:

```bash
# Stop frontend if running (Ctrl+C)
# Then start it:
npm run dev
```

## 🧪 Test It

1. Open browser: `http://localhost:5173`
2. Open console (F12)
3. Look for: `✅ Continue-TTS service available: true`
4. Go to Voice Mode
5. Send a message
6. Click 🔊 button
7. Avatar speaks! 🎉

## 📋 Quick Reference

### Vast.ai Commands

```bash
# Start server
cd /workspace/chat_app/backend
screen -dmS tts-server python3 tts_server.py

# View logs
screen -r tts-server

# Stop server
pkill -f tts_server.py

# Check if running
curl http://localhost:5000/health
```

### Local Machine

```bash
# .env file (already created)
VITE_TTS_API_URL=http://116.109.111.188:5000

# Start frontend
npm run dev
```

## 🐛 Troubleshooting

### Server Not Running?

```bash
# On Vast.ai, check if server is running
ps aux | grep tts_server

# If not running, start it:
cd /workspace/chat_app/backend
screen -dmS tts-server python3 tts_server.py
```

### Can't Connect?

1. Check IP is correct in `.env` file
2. Test from local machine: `curl http://116.109.111.188:5000/health`
3. Check browser console for errors
4. Make sure server is running on Vast.ai

### Server Stops After Disconnect?

Use screen to keep it running:

```bash
screen -dmS tts-server python3 /workspace/chat_app/backend/tts_server.py
```

Then you can disconnect SSH and server will keep running.

## ✅ Checklist

- [ ] Server running on Vast.ai
- [ ] Health check works: `curl http://localhost:5000/health`
- [ ] `.env` file has correct URL: `http://116.109.111.188:5000`
- [ ] Frontend shows: `✅ Continue-TTS service available: true`
- [ ] Avatar speaks when clicking 🔊 button

## 🎯 That's It!

Follow these 3 steps and you're done. The server will run automatically on Vast.ai and your frontend will connect to it.

For detailed instructions, see: `EXACT_STEPS_VAST_AI.md`

