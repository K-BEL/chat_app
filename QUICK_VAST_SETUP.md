# Quick Vast.ai Setup - Your Server is Running! ✅

Your TTS server is now running on Vast.ai. Follow these steps to connect your frontend:

## Step 1: Get Your Vast.ai Public IP

On your Vast.ai instance, run:

```bash
# Get the public IP address
curl ifconfig.me

# Or check Vast.ai dashboard for the instance IP
```

You'll get an IP like: `123.45.67.89`

## Step 2: Configure Frontend

### Option A: Using .env file (Recommended)

Create `.env` file in your project root:

```env
VITE_TTS_API_URL=http://<your-vast-ai-ip>:5000
```

**Example:**
```env
VITE_TTS_API_URL=http://123.45.67.89:5000
```

### Option B: Check Vast.ai Port Forwarding

Some Vast.ai instances use port forwarding. Check your Vast.ai dashboard:
- Look for "Port Forwarding" or "Public Port"
- It might be something like: `http://<vast-ai-ip>:<forwarded-port>`

If port forwarding is set up, use that URL instead.

## Step 3: Restart Frontend

After creating/updating `.env`:

```bash
npm run dev
```

## Step 4: Verify Connection

1. Open your app in browser
2. Open browser console (F12)
3. Look for these messages:
   - ✅ `🔧 TTS API URL: http://<your-ip>:5000`
   - ✅ `🔍 Checking Continue-TTS service at: http://<your-ip>:5000`
   - ✅ `✅ Continue-TTS service available: true`
   - ✅ `✅ Model is loaded and ready`

## Step 5: Test TTS

1. Go to Voice Mode
2. Send a message
3. Click 🔊 button on AI response
4. Avatar should speak with Continue-TTS!

## Troubleshooting

### Connection Timeout

If you see timeout errors:

1. **Check if port 5000 is accessible:**
   ```bash
   # From your local machine (not Vast.ai)
   curl http://<vast-ai-ip>:5000/health
   ```

2. **Check Vast.ai firewall:**
   - Some instances require opening ports in Vast.ai dashboard
   - Check "Network" or "Firewall" settings

3. **Check if server is still running:**
   ```bash
   # On Vast.ai terminal
   ps aux | grep tts_server
   ```

### CORS Errors

The server is already configured for CORS. If you still see errors:
- Make sure you're using `http://` not `https://` (unless you set up SSL)
- Check browser console for specific error messages

### Model Not Loading

The model loads on first request. First TTS request may take 30-60 seconds.

You'll see in Vast.ai terminal:
```
INFO:__main__:Loading Continue-TTS model...
INFO:__main__:✅ Continue-TTS model loaded successfully!
```

## Keep Server Running

To keep the server running after disconnecting SSH:

### Using Screen (Recommended)

```bash
# Start screen session
screen -S tts-server

# Run server
python tts_server.py

# Detach: Press Ctrl+A then D
# Reattach later: screen -r tts-server
```

### Using nohup

```bash
nohup python tts_server.py > tts.log 2>&1 &
```

## Quick Test Commands

```bash
# Test from Vast.ai instance
curl http://localhost:5000/health

# Test from your local machine
curl http://<vast-ai-ip>:5000/health

# Test TTS generation
curl -X POST http://<vast-ai-ip>:5000/tts/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test.", "voice": "nova"}' \
  --output test.wav
```

## Your Server Status

✅ Server is running on port 5000
✅ Bound to 0.0.0.0 (accessible from outside)
✅ Model will load on first request
✅ CORS is enabled for remote access

Just get the IP and configure your frontend!

