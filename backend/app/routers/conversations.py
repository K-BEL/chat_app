from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List
from datetime import datetime

from app.database import get_session
from app.models import Conversation, ConversationCreate, ConversationRead, ConversationWithMessages, Message, MessageBase, MessageRead

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("/", response_model=List[ConversationRead])
async def list_conversations(session: AsyncSession = Depends(get_session)):
    """List all conversations ordered by updated_at descending"""
    result = await session.execute(select(Conversation).order_by(Conversation.updated_at.desc()))
    return result.scalars().all()

@router.post("/", response_model=ConversationRead)
async def create_conversation(session: AsyncSession = Depends(get_session)):
    """Create a new empty conversation"""
    conv = Conversation()
    session.add(conv)
    await session.commit()
    await session.refresh(conv)
    return conv

@router.get("/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation(conversation_id: str, session: AsyncSession = Depends(get_session)):
    """Get a conversation with its messages"""
    result = await session.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conv = result.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    # Manually fetch messages since standard lazy loading might be tricky in async
    msg_result = await session.execute(
        select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc())
    )
    conv.messages = msg_result.scalars().all()
    return conv

@router.delete("/{conversation_id}", status_code=204)
async def delete_conversation(conversation_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = result.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await session.delete(conv)
    await session.commit()

@router.post("/{conversation_id}/messages", response_model=MessageRead)
async def add_message(conversation_id: str, message: MessageBase, session: AsyncSession = Depends(get_session)):
    """Add a message to a conversation and update conversation timestamp"""
    # Verify conv exists
    result = await session.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = result.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    # Update title if it's the first user message
    if conv.title == "New Chat" and message.role == "user":
        # Extract max 50 chars for title
        title_text = message.content[:50]
        if len(message.content) > 50:
            title_text += "..."
        conv.title = title_text
        
    conv.updated_at = datetime.utcnow()
    
    db_message = Message(**message.dict(), conversation_id=conversation_id)
    session.add(db_message)
    session.add(conv)
    
    await session.commit()
    await session.refresh(db_message)
    return db_message
