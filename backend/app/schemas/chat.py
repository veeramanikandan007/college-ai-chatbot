from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatMessageBase(BaseModel):
    role: str
    content: str
    is_bookmarked: bool = False
    reaction: Optional[str] = None

class ChatMessageResponse(ChatMessageBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatSessionBase(BaseModel):
    title: str

class ChatSessionUpdate(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_favorite: Optional[bool] = None

class MessageReactionUpdate(BaseModel):
    reaction: Optional[str] = None

class ChatSessionResponse(ChatSessionBase):
    id: int
    is_pinned: bool
    is_favorite: bool
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str
    session_id: int
    message_id: int
