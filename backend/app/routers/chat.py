from fastapi import APIRouter, HTTPException, Depends
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel
from typing import List, Dict, Optional

from app.services.llm_service import generate_chat_stream

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatMessage(BaseModel):
    role: str
    content: str
    
class ChatRequest(BaseModel):
    provider: str
    model: str
    messages: List[ChatMessage]
    conversation_id: Optional[str] = None

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """
    Stream chat response using Server-Sent Events (SSE).
    """
    messages_dict = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    
    async def event_generator():
        async for chunk in generate_chat_stream(request.provider, request.model, messages_dict):
            # SSE format requires sending "data: <content>\n\n"
            # Using sse_starlette, we can just yield strings or dicts
            yield {
                "event": "message",
                "data": chunk
            }
        # Send an explicit "[DONE]" message to signal completion to frontend if needed
        # Or just let connection close naturally
            
    return EventSourceResponse(event_generator())
