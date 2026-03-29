# AI Chat App

A premium, glassmorphic chat application built with **React**, **Tailwind CSS v4**, and **Lucide React** icons. Supports multiple LLM providers out of the box — Groq, OpenAI, Anthropic, and local Ollama models — with an optional cloud-based TTS backend.

---

## ✨ Features

- 🧠 **Multi-Provider Support** — Groq, OpenAI, Anthropic, and Local Ollama
- 🎨 **Premium Glassmorphic UI** — Dark mode, gradient glows, smooth animations
- 🔄 **Model Switcher Pill** — Quick-switch between providers and models from the header
- 🎤 **Voice Mode / TTS** — Cloud-powered AI voices (8 voices) with automatic browser fallback
- 🗣️ **Voice Picker** — Choose between Nova, Orion, Aurora, Ember, and more from Settings
- 🎙️ **Voice Input / ASR** — Record speech → transcribe with Qwen3-ASR-1.7B on GPU
- 💬 **Conversation History** — Auto-saved to localStorage with sidebar navigation
- 📌 **Sidebar** — Slide-out panel listing all past chats with timestamps and delete
- 🚀 **Quick Start Cards** — Interactive onboarding cards (Analyze Code, Draft Content, Summarize, Brainstorm)
- ✍️ **Multi-line Input** — Expandable textarea with glassmorphism effect
- 📱 **Fully Responsive** — Works on desktop and mobile

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://python.org/) (v3.10+)
- An API Key from at least one provider (see below)

### 1. Setup the Backend (FastAPI + SQLite)

The chat application now features a robust FastAPI backend to securely handle API keys, database storage, and LLM streaming.

```bash
cd chat_app/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Start the FastAPI server:
```bash
# Set your API keys in the environment or create a backend/.env file
export GROQ_API_KEY="your_key"
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```
The backend will run on `http://localhost:8080`.

### 2. Configure Frontend Environment

```bash
cd chat_app
cp .env.example .env
```

Edit `.env` and set the frontend API URL (API keys are no longer needed in the frontend):

```env
# Frontend Environment Variables (Vite)
VITE_API_URL=http://localhost:8080
```

### 3. Start the Frontend Dev Server

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Using Docker (Alternative Setup)
You can launch both the frontend (served via FastAPI static optionally or a separate container) and the backend easily via `docker-compose`:
```bash
docker-compose up -d --build
```
This requires a created `.env` file in the root directory formatted like `.env.example`.

### Where to Get API Keys

| Provider  | URL                                        |
|-----------|--------------------------------------------|
| Groq      | https://console.groq.com/keys              |
| OpenAI    | https://platform.openai.com/api-keys       |
| Anthropic | https://console.anthropic.com/settings/keys|

### Using Local Ollama (No API Key Needed)

If you have [Ollama](https://ollama.com/) installed and running, the app auto-detects your local models on startup. Just select **Local (Ollama)** from the Model Switcher.

---

## 🎙️ TTS Backend (Cloud GPU — Vast.ai)

The app includes a high-fidelity TTS backend powered by the `SVECTOR-CORPORATION/Continue-TTS` model (~15 GB). This requires an Nvidia GPU, so the recommended method is to rent one on [Vast.ai](https://vast.ai/).

> **Without the backend**, TTS falls back gracefully to your browser's built-in `speechSynthesis` — everything still works!

> **⚠️ Important:** The original `continue-tts` library uses **vLLM** for inference, which crashes on many Vast.ai instances due to GPU memory/IPC issues. This project uses a **custom PyTorch + SNAC decoder** that bypasses vLLM entirely. The custom server lives in `backend/tts_server.py` (based on `tts_server_hf.py`).

---

### Quick Start (If You've Done This Before)

```bash
# 1. SSH into Vast.ai with port forwarding
ssh -p <PORT> root@<IP> -L 8080:localhost:8080

# 2. On the remote machine — start the TTS server (one-click)
bash /workspace/chat_app/backend/start_server.sh

# OR manually:
PORT=8080 /venv/main/bin/python3 /workspace/chat_app/backend/tts_server_hf.py

# 3. On your Mac — update .env and start Vite
echo "VITE_TTS_API_URL=http://localhost:8080" >> .env
npm run dev
```

> The first TTS request takes ~20-30s (model loads into GPU). Subsequent requests are fast (~5s).

---

### Full Setup on Vast.ai (First Time)

#### 1. Add Your SSH Key to Vast.ai

```bash
cat ~/.ssh/id_rsa.pub
```

Paste it into your [Vast.ai Account Settings → SSH Keys](https://console.vast.ai/account).

#### 2. Rent a GPU Instance

- Go to the **Create** tab on Vast.ai
- Select the **PyTorch** template
- Choose a GPU with **16 GB+ VRAM** (e.g., RTX 3090, 4090, A5000)
- Ensure **50 GB+ disk space** (model weights are ~15 GB)
- Click **Rent**

#### 3. Transfer Backend Files to the Instance

```bash
# From your Mac
scp -P <PORT> -r backend root@<IP>:/workspace/chat_app/backend
```

#### 4. Install Python Dependencies on the Remote Machine

```bash
# SSH into Vast.ai
ssh -p <PORT> root@<IP>

# Install required packages
/venv/main/bin/pip install flask flask-cors numpy snac accelerate hf_transfer
```

| Package       | Why                                                     |
|---------------|----------------------------------------------------------|
| `flask`       | HTTP server                                              |
| `flask-cors`  | CORS headers for browser requests                        |
| `numpy`       | Audio PCM array conversion                               |
| `snac`        | SNAC 24kHz neural audio codec (decodes model tokens → WAV) |
| `accelerate`  | HuggingFace `device_map="auto"` GPU placement             |
| `hf_transfer` | Fast Rust-based model weight downloader                   |

#### 5. Download the Model Weights (One-Time, ~10 min)

```bash
HF_HUB_ENABLE_HF_TRANSFER=1 /venv/main/bin/python3 -c "
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
m = AutoModelForCausalLM.from_pretrained('SVECTOR-CORPORATION/Continue-TTS', device_map='auto', dtype=torch.float16, trust_remote_code=True)
print('✅ Model downloaded and loaded successfully')
print('Devices:', m.hf_device_map)
"
```

> Weights are cached in `/workspace/.hf_home/hub/` (~15 GB). Subsequent loads take ~2 seconds.

#### 6. Start the TTS Server

```bash
PORT=8080 /venv/main/bin/python3 /workspace/chat_app/backend/tts_server.py
```

You should see:
```
 * Serving Flask app 'tts_server'
 * Running on http://127.0.0.1:8080
```

#### 7. Set Up SSH Tunnel (From Your Mac)

Open a **separate terminal** on your Mac:

```bash
ssh -p <PORT> root@<IP> -L 8080:localhost:8080
```

This tunnels `localhost:8080` on your Mac → port `8080` on the Vast.ai GPU.

#### 8. Configure & Run the Frontend

```bash
# Set the TTS URL in .env
# (already done if you followed the quick start)
VITE_TTS_API_URL=http://localhost:8080

# Start Vite
npm run dev
```

Open `http://localhost:5173`, send a message, and click the **🎤 Read** button on any assistant response!

---

### Testing TTS From the Command Line

A test script is available in `backend/generate/test_tts.sh`:

```bash
cd backend/generate
bash test_tts.sh
```

This generates `test_orion.wav` and `test_nova.wav` in the `generate/` folder. Valid files are ~500-700 KB. If you see 44-93 byte files, the server has an error — check its terminal output.

```bash
# Play a test file on macOS
open backend/generate/test_orion.wav
```

---

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `Port 8080 is in use` | Run on Vast.ai: `fuser -k 8080/tcp` then restart the server |
| `model_loaded: false` in health check | This is normal — model loads on first TTS request (~20s) |
| `Engine core initialization failed` | You're running the old vLLM-based server. Use `tts_server_hf.py` instead |
| `accelerate` not found | Run: `/venv/main/bin/pip install accelerate` |
| Model download stuck at 25% | Clear cache: `rm -rf /workspace/.hf_home/hub/models--SVECTOR*` and re-download with `HF_HUB_ENABLE_HF_TRANSFER=1` |
| Browser uses robotic voice | Check browser console — if it says `Continue-TTS service available: false`, the SSH tunnel or server is down |
| SSH tunnel drops | Re-run: `ssh -p <PORT> root@<IP> -L 8080:localhost:8080` |

---

## 🎙️ Speech-to-Text (Qwen3-ASR)

The app includes a **mic button** 🎙️ in the input area that records your voice and transcribes it using [Qwen3-ASR-1.7B](https://huggingface.co/Qwen/Qwen3-ASR-1.7B) (~3.5 GB model, 52 languages supported).

### How It Works

1. Click the **🎙️ mic button** (left of the send button) to start recording
2. The button turns **red and pulses** while recording
3. Click again to **stop** — audio is sent to the backend `/asr/transcribe` endpoint
4. Transcribed text appears in the input box, ready to send

### Deployment

The ASR model runs alongside the TTS model on the same GPU. It's included in `start_server.sh` automatically:

```bash
# qwen-asr is installed by start_server.sh
# The model downloads (~3.5 GB) on first mic use
```

To test ASR from the command line:

```bash
curl -X POST http://localhost:8080/asr/transcribe \
  -F "audio=@recording.wav"
# Returns: {"text": "Hello world", "language": "English"}
```

> **Without the GPU backend**, the mic button will show an error in the console. A future update could add browser-based `SpeechRecognition` as a fallback.

---

## 📁 Project Structure

```
chat_app/
├── src/
│   ├── components/
│   │   ├── ChatBox.jsx        # Main chat UI (messages, input, settings)
│   │   ├── Sidebar.jsx        # Conversation history sidebar
│   │   └── ChatBox.css        # Legacy styles (Tailwind used inline)
│   ├── hooks/
│   │   ├── useChatModel.js    # Multi-provider SSE chat hook
│   │   ├── useConversations.js # Conversation CRUD (FastAPI/SQLite integration)
│   │   ├── useASR.js          # Mic recording + backend transcription
│   │   └── useTTS.js          # TTS hook (cloud + browser fallback)
│   ├── config/
│   │   ├── models.js          # Provider & model definitions
│   │   └── tts.js             # General backend API config
│   ├── App.jsx                # Root layout (sidebar + chat)
│   └── index.css              # Tailwind v4 import + base styles
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI Entrypoint
│   │   ├── config.py          # Pydantic secure settings (API keys)
│   │   ├── database.py        # aiosqlite connection setup
│   │   ├── models.py          # SQLModel definitions (Conversation, Message)
│   │   ├── routers/           # Dedicated routers (/chat, /tts, /asr, /conversations)
│   │   └── services/          # Business logic (`llm_service`, `tts_service`)
│   ├── tests/                 # Pytest suite
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Backend-specific docs
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # 1-click orchestration
├── .env                       # Backend Secure Config (API keys) + VITE_API_URL
└── package.json
```

## 🛠️ Tech Stack

| Layer     | Technology                                                |
|-----------|-----------------------------------------------------------|
| Frontend  | React 18, Vite 5, Tailwind CSS v4, Lucide React          |
| Backend   | Python FastAPI, WebSockets/SSE, Pydantic, SQLModel          |
| Database  | SQLite (`aiosqlite` asynchronous engine)                 |
| LLM APIs  | Groq, OpenAI, Anthropic, Ollama (local) via server proxy  |
| TTS       | Continue-TTS (cloud GPU), Browser SpeechSynthesis (fallback) |
| ASR       | Qwen3-ASR-1.7B (cloud GPU), 52 languages                    |
| DevOps    | Docker, Docker Compose, Pre-commit hooks                    |


