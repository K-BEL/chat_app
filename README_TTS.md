# Continue-TTS Integration Guide

This guide explains how to set up and use the Continue-TTS model from Hugging Face for high-quality text-to-speech in your chat app.

## Overview

The app now uses [Continue-TTS](https://huggingface.co/SVECTOR-CORPORATION/Continue-TTS) from Hugging Face, which provides:
- **8 unique voices** (Nova, Aurora, Stellar, Atlas, Orion, Luna, Phoenix, Ember)
- **Natural speech** with human-like intonation
- **Real-time generation** (~200ms latency on GPU)
- **Emotional expression** support (laugh, sigh, gasp, etc.)
- **High quality** 24kHz audio

## Setup Instructions

### 1. Backend Setup

The Continue-TTS model requires a Python backend server.

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
pip install continue-speech
```

#### Run the Server

```bash
python tts_server.py
```

The server will start on `http://localhost:5000`

**Note:** First run will download the model (~4GB), which may take time.

### 2. Frontend Configuration

The frontend automatically detects if the Continue-TTS service is available. If the backend is not running, it falls back to browser SpeechSynthesis.

#### Environment Variables (Optional)

Create a `.env` file in the project root:

```env
VITE_TTS_API_URL=http://localhost:5000
```

If not set, defaults to `http://localhost:5000`

### 3. Usage

The TTS system works automatically in Voice Mode:

1. **Start the backend server** (if using Continue-TTS)
2. **Start the frontend**: `npm run dev`
3. **Select Voice Mode** in the app
4. **Send a message** - AI responses will use Continue-TTS (or fallback)

## Available Voices

| Voice | Gender | Description |
|-------|--------|-------------|
| **nova** | Female | Conversational and natural (default) |
| **aurora** | Female | Warm and friendly |
| **stellar** | Female | Energetic and bright |
| **atlas** | Male | Deep and authoritative |
| **orion** | Male | Friendly and casual |
| **luna** | Female | Soft and gentle |
| **phoenix** | Male | Dynamic and expressive |
| **ember** | Female | Warm and engaging |

## Features

### Real-time Audio Volume Analysis

The system analyzes audio volume in real-time using Web Audio API, providing accurate mouth animation data for the avatar.

### Automatic Fallback

If the Continue-TTS backend is unavailable, the app automatically falls back to browser SpeechSynthesis, ensuring the app always works.

### Emotion Support

Continue-TTS supports emotion tags in text:
- `<laugh>` - Natural laughter
- `<sigh>` - Expressive sigh
- `<gasp>` - Surprised gasp
- `<chuckle>`, `<cough>`, `<yawn>`, etc.

Example:
```javascript
speak("This is incredible! <laugh> I can't believe it. <gasp>")
```

## API Endpoints

### `GET /health`
Check if the TTS service is available.

### `POST /tts/generate`
Generate speech from text.

**Request:**
```json
{
  "text": "Hello, this is a test.",
  "voice": "nova"
}
```

**Response:** WAV audio file (24kHz, mono)

### `GET /tts/voices`
Get list of available voices.

## System Requirements

### Backend
- Python 3.8+
- GPU recommended (~7GB VRAM for FP16, ~14GB for FP32)
- ~4GB disk space for model

### Frontend
- Modern browser with Web Audio API support
- No additional requirements

## Troubleshooting

### Backend Issues

1. **Model not loading:**
   - Check GPU availability
   - Verify `continue-speech` package is installed
   - Check console for error messages

2. **Slow generation:**
   - Use GPU for faster generation
   - CPU is slower but works

3. **Out of memory:**
   - Use FP16 instead of FP32
   - Reduce `max_model_len` in server config

### Frontend Issues

1. **Falling back to SpeechSynthesis:**
   - Check if backend is running
   - Verify `VITE_TTS_API_URL` is correct
   - Check browser console for errors

2. **No audio volume data:**
   - Ensure Web Audio API is supported
   - Check browser permissions
   - Verify audio context is not suspended

## Architecture

```
Frontend (React)
    ↓
useTTS Hook
    ↓
Continue-TTS API (if available)
    ↓
Backend Server (Flask)
    ↓
Continue-TTS Model (Python)
    ↓
Audio Generation
    ↓
Web Audio API
    ↓
Avatar Mouth Animation
```

## References

- [Continue-TTS Model](https://huggingface.co/SVECTOR-CORPORATION/Continue-TTS)
- [Continue-1-OSS Architecture](https://huggingface.co/SVECTOR-CORPORATION/Continue-1-OSS)

