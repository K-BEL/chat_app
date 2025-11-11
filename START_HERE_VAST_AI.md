# 🚀 Start Here - Vast.ai Backend Setup

## Quick Setup (3 Steps)

### Step 1: On Vast.ai Terminal

Copy and paste these commands:

```bash
cd /workspace/chat_app/backend
chmod +x start_server.sh
./start_server.sh
```

**Wait for the server to start and note the IP address shown!**

Example output:
```
🌐 Server Information:
   - IP: 116.109.111.188
   - Port: 5000
   - URL: http://116.109.111.188:5000
```

### Step 2: On Your Local Machine

Update your `.env` file with the IP from Step 1:

```env
VITE_TTS_API_URL=http://116.109.111.188:5000
```

Replace `116.109.111.188` with your actual Vast.ai IP.

### Step 3: Start Frontend

```bash
npm run dev
```

## ✅ Verify It's Working

1. Open browser console (F12)
2. Look for: `✅ Continue-TTS service available: true`
3. Go to Voice Mode
4. Send a message
5. Click 🔊 button
6. Avatar should speak! 🎉

## 🔄 Keep Server Running

To keep server running after disconnecting SSH:

```bash
# On Vast.ai terminal
screen -dmS tts-server bash -c "cd /workspace/chat_app/backend && ./start_server.sh"

# View logs
screen -r tts-server

# Detach: Press Ctrl+A then D
```

## 🧪 Test Connection

### From Vast.ai:
```bash
curl http://localhost:5000/health
```

### From Your Local Machine:
```bash
curl http://YOUR_VAST_AI_IP:5000/health
```

Both should return:
```json
{"status": "healthy", "model_loaded": false}
```

## 📋 Your Current Configuration

Based on your setup:
- **Vast.ai IP:** Get from server output
- **Port:** 5000
- **.env file:** Update with your Vast.ai IP

## 🐛 Troubleshooting

### Server Not Starting?
- Check Python is installed: `python3 --version`
- Check dependencies: `pip3 list | grep continue-speech`

### Can't Connect?
1. Test from Vast.ai: `curl http://localhost:5000/health`
2. Test from local: `curl http://YOUR_IP:5000/health`
3. Check `.env` file has correct IP
4. Check browser console for errors

### Server Stops After Disconnect?
Use screen to keep it running:
```bash
screen -dmS tts-server bash -c "cd /workspace/chat_app/backend && ./start_server.sh"
```

## 📚 More Info

- See `VAST_AI_SETUP.md` for detailed instructions
- See `README_BACKEND.md` for backend documentation
- See `README_TTS.md` for TTS features

---

That's it! Follow these 3 steps and you're done. 🚀

