# Exact Steps to Setup TTS on Vast.ai

## 🎯 Quick Setup (Copy-Paste These Commands)

### Step 1: On Vast.ai Terminal

Copy and paste these commands one by one:

```bash
# 1. Navigate to your workspace
cd /workspace/chat_app/backend

# 2. Make setup script executable
chmod +x setup_vast_ai.sh

# 3. Run the automated setup
./setup_vast_ai.sh
```

**That's it for Vast.ai!** The script will:
- Install everything automatically
- Start the server
- Show you the IP address

### Step 2: Get Your Server URL

After the setup completes, you'll see:
```
📋 Your server information:
   - Public IP: 116.109.111.188
   - URL: http://116.109.111.188:5000
```

**Copy this URL!**

### Step 3: On Your Local Machine

```bash
# 1. Navigate to your project
cd /Users/kirihata/Desktop/chat_app

# 2. Create .env file with your Vast.ai IP
echo "VITE_TTS_API_URL=http://116.109.111.188:5000" > .env

# 3. Verify the file was created
cat .env

# 4. Start your frontend
npm run dev
```

### Step 4: Test It

1. Open your app in browser (usually `http://localhost:5173`)
2. Open browser console (F12)
3. Look for: `✅ Continue-TTS service available: true`
4. Go to Voice Mode
5. Send a message
6. Click 🔊 button
7. Avatar should speak! 🎉

---

## 🔧 Manual Setup (If Script Doesn't Work)

If the automated script doesn't work, follow these manual steps:

### On Vast.ai Terminal:

```bash
# 1. Go to backend directory
cd /workspace/chat_app/backend

# 2. Install Python dependencies
pip3 install -r requirements.txt
pip3 install continue-speech

# 3. Start server in screen (keeps running after disconnect)
screen -dmS tts-server python3 tts_server.py

# 4. Get your IP address
curl ifconfig.me

# 5. Test server (should show: {"status": "healthy", "model_loaded": false})
curl http://localhost:5000/health
```

### On Your Local Machine:

```bash
# 1. Create .env file
cd /Users/kirihata/Desktop/chat_app
echo "VITE_TTS_API_URL=http://YOUR_VAST_AI_IP:5000" > .env

# Replace YOUR_VAST_AI_IP with the IP from step 4 above

# 2. Start frontend
npm run dev
```

---

## 📋 Complete Command List

### Vast.ai Setup (One-Time)

```bash
cd /workspace/chat_app/backend
chmod +x setup_vast_ai.sh
./setup_vast_ai.sh
```

### Get Server Info

```bash
# Get IP
curl ifconfig.me

# Test server
curl http://localhost:5000/health
```

### Manage Server

```bash
# View server logs
screen -r tts-server

# Stop server
pkill -f tts_server.py

# Start server again
screen -dmS tts-server python3 /workspace/chat_app/backend/tts_server.py

# Or use systemd (if setup script created it)
systemctl start tts-server
systemctl status tts-server
systemctl stop tts-server
```

### Local Machine Setup

```bash
# Create .env file
echo "VITE_TTS_API_URL=http://116.109.111.188:5000" > .env

# Start frontend
npm run dev
```

---

## ✅ Verification Checklist

- [ ] Server is running on Vast.ai
- [ ] Health check works: `curl http://localhost:5000/health`
- [ ] `.env` file created with correct IP
- [ ] Frontend shows: `✅ Continue-TTS service available: true`
- [ ] Avatar speaks when you click 🔊 button

---

## 🐛 Troubleshooting

### Server Not Starting?

```bash
# Check if Python is installed
python3 --version

# Check if dependencies are installed
pip3 list | grep continue-speech
pip3 list | grep flask

# Check server logs
screen -r tts-server
```

### Can't Connect from Frontend?

1. **Check IP is correct:**
   ```bash
   # On Vast.ai
   curl ifconfig.me
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

4. **Restart frontend:**
   ```bash
   # Stop frontend (Ctrl+C)
   # Start again
   npm run dev
   ```

### Server Stops After Disconnect?

Use screen or systemd to keep it running:

```bash
# Using screen (recommended)
screen -dmS tts-server python3 /workspace/chat_app/backend/tts_server.py

# Or enable systemd service
systemctl enable tts-server
systemctl start tts-server
```

---

## 🎯 Your Current Configuration

Based on your setup:
- **Vast.ai IP:** 116.109.111.188
- **Port:** 5000
- **URL:** http://116.109.111.188:5000
- **.env file:** Already created ✅

**You just need to:**
1. Run the setup script on Vast.ai
2. Restart your frontend
3. Test it!

---

## 📞 Quick Test

### On Vast.ai:
```bash
curl http://localhost:5000/health
```

### On Your Local Machine:
```bash
curl http://116.109.111.188:5000/health
```

Both should return:
```json
{"status": "healthy", "model_loaded": false}
```

---

That's it! Follow these exact steps and your TTS will work automatically. 🚀

