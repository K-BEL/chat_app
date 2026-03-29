# Chat App Backend (FastAPI)

This backend provides a high-performance REST API built with **FastAPI**, **SQLite**, and **Server-Sent Events (SSE)**. It replaces the legacy Flask monolithic server.

## 🚀 Features

- **Multi-Provider LLM Proxy**: Connects to Groq, OpenAI, Anthropic, and Local Ollama via a unified streaming interface (`/chat/stream`). API keys are kept secure server-side.
- **SQLite Database**: Uses `aiosqlite` and `SQLModel` to persist conversation history locally.
- **TTS Generation**: Wraps the Hugging Face `Continue-TTS` model (via `/tts/generate`).
- **Modular Routers**: Functionality split across well-defined FastAPI routers.

---

## ⚙️ Setup

1. **Create a Virtual Environment:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

2. **Install Dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure Environment Variables:**
Create a `.env` file in the root directory (or set them in your environment):
```env
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
DATABASE_URL=sqlite+aiosqlite:///./chat_app.db # Optional (defaults to this)
```

4. **Run the Server:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```
The server will start on `http://localhost:8080`.

Interactive Swagger UI docs are available at: `http://localhost:8080/docs`

---

## 📡 Core API Endpoints

### `GET /health`
Health check endpoint to verify TTS model loading and DB.

### `POST /chat/stream`
Send messages to an LLM provider (Groq, OpenAI, Anthropic, Local) and receive Server-Sent Events (SSE) streaming back.

### `GET /conversations` & `POST /conversations`
Retrieve all conversations or create a new empty conversation snippet.

### `GET /conversations/{id}`
Retrieve a specific conversation history including all messages.

### `POST /tts/generate`
Generate speech from text via the `Continue-TTS` model.
* **Payload:** `{"text": "Hello world", "voice": "nova"}`
* **Returns:** `.wav` audio buffer.

---

## 🐳 Docker Deployment

To launch the backend (and an optional frontend container) without manual setup, run the multi-stage Docker file from the project root:

```bash
cd ..
docker-compose up -d --build
```

---

## 📝 Testing

We use `pytest` for backend unit tests:
```bash
pytest tests/
```

