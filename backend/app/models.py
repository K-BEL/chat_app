from typing import List, Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
import uuid

class ConversationBase(SQLModel):
    title: str = "New Chat"

class Conversation(ConversationBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    messages: List["Message"] = Relationship(back_populates="conversation", cascade_delete=True)

class MessageBase(SQLModel):
    role: str # "user" or "assistant"
    content: str
    conversation_id: str = Field(foreign_key="conversation.id")

class Message(MessageBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    conversation: Conversation = Relationship(back_populates="messages")

class ConversationRead(ConversationBase):
    id: str
    created_at: datetime
    updated_at: datetime

class MessageRead(MessageBase):
    id: int
    created_at: datetime

class ConversationWithMessages(ConversationRead):
    messages: List[MessageRead] = []
