# AI Chat App

A beautiful, modern chat interface for interacting with Groq AI (powered by Llama models).

## Features

- 🎨 Modern, clean UI with gradient design
- 💬 Real-time chat with Groq AI (ultra-fast inference)
- ⌨️ Smooth typing experience
- 📱 Responsive design
- ⚡ Powered by Llama 3.3 70B model

## Setup

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_TTS_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Backend Setup (Optional - for TTS)

The app includes an optional Continue-TTS backend for high-quality speech synthesis.

#### Option 1: Run Backend Locally

```bash
cd backend
pip install -r requirements.txt
pip install continue-speech
python tts_server.py
```

#### Option 2: Run Backend on Vast.ai (Recommended)

See `VAST_AI_SETUP.md` for detailed instructions.

Quick start:
1. On Vast.ai: `cd /workspace/chat_app/backend && ./start_server.sh`
2. Get IP address
3. Update `.env`: `VITE_TTS_API_URL=http://YOUR_VAST_AI_IP:5000`
4. Restart frontend: `npm run dev`

## Getting Your Groq API Key

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

## Project Structure

```
chat_app/
├── src/
│   ├── components/
│   │   ├── ChatBox.jsx      # Main chat component
│   │   └── ChatBox.css      # Chat styling
│   ├── hooks/
│   │   └── useGroq.js       # Groq API integration hook
│   ├── App.jsx              # Main app component
│   ├── App.css              # App styling
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Usage

1. Type your message in the input box at the bottom
2. Press Enter or click the send button
3. Wait for the AI response
4. Continue the conversation!

