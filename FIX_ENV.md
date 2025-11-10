# Fix .env File

Your `.env` file needs to have `http://` in the URL.

## Current (Wrong):
```
VITE_TTS_API_URL=116.109.111.188:5000
```

## Should Be (Correct):
```
VITE_TTS_API_URL=http://116.109.111.188:5000
```

## How to Fix

### Option 1: Edit the file manually
Open `.env` file and change:
```
VITE_TTS_API_URL=116.109.111.188:5000
```
To:
```
VITE_TTS_API_URL=http://116.109.111.188:5000
```

### Option 2: Use terminal command
```bash
cd /Users/kirihata/Desktop/chat_app
echo "VITE_TTS_API_URL=http://116.109.111.188:5000" > .env
cat .env
```

After fixing, restart your frontend: `npm run dev`

