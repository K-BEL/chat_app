from fastapi import APIRouter, UploadFile, File, HTTPException
import io

router = APIRouter(prefix="/asr", tags=["ASR"])

@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Mock endpoint for ASR transcription to satisfy the frontend.
    In a complete implementation, this would use Whisper or a similar model.
    """
    if not audio.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not audio.")
    
    # Read the audio (just to consume the stream, we don't process it actually here)
    byte_data = await audio.read()
    
    # Returning a fixed text (fallback/mock) or error if empty
    if len(byte_data) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")
        
    import logging
    logging.getLogger(__name__).info(f"Received audio of {len(byte_data)} bytes for transcription")
    
    return {"text": "(ASR functionality needs a Whisper integration on backend)"}
