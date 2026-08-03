from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class WorkspaceCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    color: Optional[str] = "#1E4DB7"
    icon: Optional[str] = "Folder"
    is_pinned: Optional[bool] = False
    is_favorite: Optional[bool] = False


class WorkspaceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None
    is_favorite: Optional[bool] = None


class WorkspaceItemLinkRequest(BaseModel):
    item_type: str  # "document" | "chat" | "note" | "quiz"
    item_id: Any    # int or string (chat session_id)


class WorkspaceListItem(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    color: str
    icon: str
    is_pinned: bool
    is_archived: bool
    is_favorite: bool
    document_count: int = 0
    chat_count: int = 0
    note_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkspaceDetailResponse(WorkspaceListItem):
    documents: List[Any] = []
    chats: List[Any] = []
    notes: List[Any] = []
    quizzes: List[Any] = []
