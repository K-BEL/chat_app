from fastapi import APIRouter
from app.services.tts_service import Continue1Model, tts_service

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": tts_service.model_loaded,
        "continue_tts_available": Continue1Model is not None,
    }
