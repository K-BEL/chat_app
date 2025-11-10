# Vast.ai Setup Guide for Continue-TTS

This guide explains how to run the Continue-TTS server on Vast.ai and connect your frontend to it.

## Prerequisites

1. Vast.ai account
2. GPU instance rented on Vast.ai
3. SSH access to the instance

## Step 1: Setup on Vast.ai Instance

### 1.1 Connect to Your Instance

```bash
ssh root@<vast-ai-instance-ip>
```

### 1.2 Install Dependencies

```bash
# Update system
apt-get update

# Install Python and pip
apt-get install -y python3 python3-pip

# Install backend dependencies
cd /path/to/your/backend
pip install -r requirements.txt
pip install continue-speech
```

### 1.3 Run the Server

The server needs to be accessible from the internet. Run it with:

```bash
python tts_server.py
```

**Important:** The server will bind to `0.0.0.0:5000` by default, making it accessible from outside the instance.

### 1.4 Verify Server is Running

Check if the server is accessible:

```bash
curl http://localhost:5000/health
```

You should see:
```json
{"status": "healthy", "model_loaded": true}
```

## Step 2: Configure Frontend

### 2.1 Get Your Vast.ai Instance URL

Your Vast.ai instance URL will be in the format:
- `http://<vast-ai-instance-ip>:5000`
- Or if using a custom domain/port: `http://your-domain.com:5000`

### 2.2 Update Frontend Configuration

Create or update `.env` file in the project root:

```env
VITE_TTS_API_URL=http://<vast-ai-instance-ip>:5000
```

**Example:**
```env
VITE_TTS_API_URL=http://123.45.67.89:5000
```

### 2.3 Restart Frontend

After updating `.env`, restart your frontend:

```bash
npm run dev
```

## Step 3: Test Connection

1. Open your app in the browser
2. Open browser console (F12)
3. Look for: `✅ Continue-TTS service available: true`
4. Send a message in Voice Mode
5. The avatar should use Continue-TTS for speech

## Troubleshooting

### Server Not Accessible

**Check firewall:**
```bash
# Check if port 5000 is open
netstat -tulpn | grep 5000

# If using UFW firewall
ufw allow 5000
```

**Check Vast.ai networking:**
- Ensure your Vast.ai instance allows incoming connections on port 5000
- Some Vast.ai instances may require port forwarding configuration

### CORS Errors

If you see CORS errors in the browser console:

1. Check backend `tts_server.py` has CORS enabled:
```python
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
```

2. Verify the server is running and accessible:
```bash
curl -X GET http://<vast-ai-instance-ip>:5000/health
```

### Connection Timeout

If the frontend can't connect:

1. **Check server is running:**
   ```bash
   # On Vast.ai instance
   ps aux | grep tts_server
   ```

2. **Check port is accessible:**
   ```bash
   # From your local machine
   curl http://<vast-ai-instance-ip>:5000/health
   ```

3. **Check network connectivity:**
   - Verify Vast.ai instance IP is correct
   - Check if port 5000 is blocked by firewall
   - Verify Vast.ai instance allows external connections

### Model Loading Issues

If the model fails to load:

1. **Check GPU availability:**
   ```bash
   nvidia-smi
   ```

2. **Check disk space:**
   ```bash
   df -h
   ```
   Model requires ~4GB disk space

3. **Check memory:**
   ```bash
   free -h
   ```
   Model requires ~7GB GPU RAM (FP16) or ~14GB (FP32)

## Production Considerations

### Security

For production, consider:

1. **Restrict CORS origins:**
   ```python
   CORS(app, resources={
       r"/*": {
           "origins": ["https://yourdomain.com"],  # Your frontend URL
           "methods": ["GET", "POST", "OPTIONS"],
           "allow_headers": ["Content-Type"]
       }
   })
   ```

2. **Add authentication:**
   - API keys
   - JWT tokens
   - Rate limiting

3. **Use HTTPS:**
   - Set up SSL certificate
   - Use reverse proxy (nginx, Caddy)

### Performance

1. **Keep server running:**
   - Use `screen` or `tmux` to keep server running after SSH disconnect
   - Use systemd service for auto-start

2. **Monitor resources:**
   - Monitor GPU usage
   - Monitor memory usage
   - Set up logging

### Using Screen (Recommended)

```bash
# Start a screen session
screen -S tts-server

# Run the server
python tts_server.py

# Detach: Press Ctrl+A then D
# Reattach: screen -r tts-server
```

## Example Vast.ai Setup Script

Create a setup script on your Vast.ai instance:

```bash
#!/bin/bash
# setup_tts.sh

# Install dependencies
pip install -r requirements.txt
pip install continue-speech

# Run server in screen session
screen -dmS tts-server python tts_server.py

echo "TTS server started in screen session 'tts-server'"
echo "To view: screen -r tts-server"
echo "To detach: Ctrl+A then D"
```

## Quick Reference

### Server Commands

```bash
# Start server
python tts_server.py

# Start in background (screen)
screen -dmS tts-server python tts_server.py

# View server logs
screen -r tts-server

# Check server health
curl http://localhost:5000/health

# Check if server is running
ps aux | grep tts_server
```

### Frontend Configuration

```env
# .env file
VITE_TTS_API_URL=http://<vast-ai-instance-ip>:5000
```

### Testing

```bash
# Test from local machine
curl http://<vast-ai-instance-ip>:5000/health

# Test TTS generation
curl -X POST http://<vast-ai-instance-ip>:5000/tts/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test.", "voice": "nova"}' \
  --output test.wav
```

## Support

If you encounter issues:

1. Check server logs on Vast.ai instance
2. Check browser console for errors
3. Verify network connectivity
4. Check firewall settings
5. Verify model is loaded (check `/health` endpoint)

