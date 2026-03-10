# AI Chat App

A premium, glassmorphic chat application built with **React**, **Tailwind CSS v4**, and **Lucide React** icons. Supports multiple LLM providers out of the box — Groq, OpenAI, Anthropic, and local Ollama models — with an optional cloud-based TTS backend.

---

## ✨ Features

- 🧠 **Multi-Provider Support** — Groq, OpenAI, Anthropic, and Local Ollama
- 🎨 **Premium Glassmorphic UI** — Dark mode, gradient glows, smooth animations
- 🔄 **Model Switcher Pill** — Quick-switch between providers and models from the header
- 🚀 **Quick Start Cards** — Interactive onboarding cards (Analyze Code, Draft Content, Summarize, Brainstorm)
- 🎤 **Voice Mode / TTS** — Text-to-speech with automatic browser fallback
- ✍️ **Multi-line Input** — Expandable textarea with glassmorphism effect
- 📱 **Fully Responsive** — Works on desktop and mobile

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- An API Key from at least one provider (see below)

### 1. Install Dependencies

```bash
cd chat_app
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your API key(s):

```env
# Required: Add at least one provider key
VITE_GROQ_API_KEY=gsk_your_groq_key_here
VITE_OPENAI_API_KEY=sk-your_openai_key_here
VITE_ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here

# Optional: TTS backend URL (see Section 3 below)
# VITE_TTS_API_URL=http://localhost:5001
```

### 3. Start the Dev Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Where to Get API Keys

| Provider  | URL                                        |
|-----------|--------------------------------------------|
| Groq      | https://console.groq.com/keys              |
| OpenAI    | https://platform.openai.com/api-keys       |
| Anthropic | https://console.anthropic.com/settings/keys|

### Using Local Ollama (No API Key Needed)

If you have [Ollama](https://ollama.com/) installed and running, the app auto-detects your local models on startup. Just select **Local (Ollama)** from the Model Switcher.

---

## 🎙️ TTS Backend (Optional — Vast.ai)

The app includes a high-fidelity TTS backend powered by the `SVECTOR-CORPORATION/Continue-TTS` model. This requires an Nvidia GPU, so the recommended method is to rent one on [Vast.ai](https://vast.ai/).

> **Without the backend**, TTS falls back gracefully to your browser's built-in `speechSynthesis` — everything still works!

### Setup on Vast.ai

#### 1. Add Your SSH Key to Vast.ai

```bash
# Copy your public key
cat *.pub
```

Paste it into your [Vast.ai Account Settings → SSH Keys](https://console.vast.ai/account).

#### 2. Rent a GPU Instance

- Go to the **Create** tab on Vast.ai
- Select the **PyTorch** template
- Choose a GPU with **16GB+ VRAM** (e.g., RTX 3090, 4090, A5000)
- Ensure **30GB+ disk space**
- Click **Rent**

#### 3. Transfer & Run the Backend

```bash
# From your Mac — copy backend files to the instance
scp -P <PORT> -r backend root@<IP>:/root/backend

# SSH into the instance
ssh -p <PORT> root@<IP> -L 8080:localhost:8080

# On the remote machine
cd backend
pip install flask flask-cors numpy continue-speech
PORT=8080 python3 tts_server.py
```

> First run downloads the ~7GB model from HuggingFace.

#### 4. Point Your Frontend to the Cloud

Find the external URL mapped to port 8080 on your Vast.ai instance dashboard, then update your `.env`:

```env
VITE_TTS_API_URL=http://<VAST_IP>:<MAPPED_PORT>
```

Restart Vite (`npm run dev`) and test Voice Mode with the 🎤 button!

---

## 📁 Project Structure

```
chat_app/
├── src/
│   ├── components/
│   │   ├── ChatBox.jsx        # Main chat UI component
│   │   └── ChatBox.css        # Legacy styles (Tailwind used inline)
│   ├── hooks/
│   │   ├── useChatModel.js    # Multi-provider chat hook
│   │   └── useTTS.js          # Text-to-speech hook
│   ├── config/
│   │   ├── models.js          # Provider & model definitions
│   │   └── tts.js             # TTS configuration
│   ├── utils/
│   │   └── markdown.js        # Markdown parsing utility
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css              # Tailwind v4 import + base styles
├── backend/
│   ├── tts_server.py          # Flask TTS server (Continue-TTS)
│   ├── start_server.sh        # One-click server launcher
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Backend-specific docs
├── .env.example
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## 🛠️ Tech Stack

| Layer     | Technology                                     |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Vite 5, Tailwind CSS v4, Lucide React |
| LLM APIs  | Groq, OpenAI, Anthropic, Ollama (local)         |
| TTS       | Continue-TTS (cloud), Browser SpeechSynthesis    |
| Backend   | Python Flask, PyTorch, vLLM                      |
