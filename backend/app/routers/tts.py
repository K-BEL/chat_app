from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import Optional
from app.services.tts_service import tts_service, Continue1Model

router = APIRouter(prefix="/tts", tags=["TTS"])

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "nova"

valid_voices = ['nova', 'aurora', 'stellar', 'atlas', 'orion', 'luna', 'phoenix', 'ember']

@router.post("/generate")
async def generate_speech(request: TTSRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    if request.voice not in valid_voices:
        raise HTTPException(status_code=400, detail=f"Invalid voice. Must be one of: {', '.join(valid_voices)}")
        
    try:
        # Generate the WAV file buffer
        wav_buffer = tts_service.generate_speech_wav(text=request.text, voice=request.voice)
        
        # Return as an audio file response
        return Response(content=wav_buffer.read(), media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices")
async def get_voices():
    voices = [
        {'id': 'nova', 'name': 'Nova', 'gender': 'Female', 'description': 'Conversational and natural'},
        {'id': 'aurora', 'name': 'Aurora', 'gender': 'Female', 'description': 'Warm and friendly'},
        {'id': 'stellar', 'name': 'Stellar', 'gender': 'Female', 'description': 'Energetic and bright'},
        {'id': 'atlas', 'name': 'Atlas', 'gender': 'Male', 'description': 'Deep and authoritative'},
        {'id': 'orion', 'name': 'Orion', 'gender': 'Male', 'description': 'Friendly and casual'},
        {'id': 'luna', 'name': 'Luna', 'gender': 'Female', 'description': 'Soft and gentle'},
        {'id': 'phoenix', 'name': 'Phoenix', 'gender': 'Male', 'description': 'Dynamic and expressive'},
        {'id': 'ember', 'name': 'Ember', 'gender': 'Female', 'description': 'Warm and engaging'}
    ]
    return {"voices": voices}
