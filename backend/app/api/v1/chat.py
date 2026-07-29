from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api import deps
from app.schemas.chat import ChatRequest, ChatResponse, ChatSessionResponse, ChatMessageResponse, ChatSessionBase
from app.services import chat_service
from app.models.user import User
from app.services.ai_service import AIService
from app.core.limiter import limiter

router = APIRouter()
ai_service = AIService()

@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
async def send_message(request: Request, payload: ChatRequest, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Send a message to the AI and get a response."""
    # Create session if not provided
    session_id = payload.session_id
    if not session_id:
        title = payload.message[:30] + "..." if len(payload.message) > 30 else payload.message
        session = chat_service.create_session(db, current_user.id, title)
        session_id = session.id

    # Save user message
    chat_service.save_message(db, session_id, "user", payload.message)

    # Get history for context (ignoring for now as get_chat_answer doesn't use it yet)
    
    # Get AI response
    try:
        ai_response_text = await ai_service.get_chat_answer(payload.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Save AI message
    ai_msg = chat_service.save_message(db, session_id, "assistant", ai_response_text)

    return ChatResponse(
        answer=ai_response_text,
        session_id=session_id,
        message_id=ai_msg.id
    )

@router.get("/sessions", response_model=List[ChatSessionResponse])
def list_sessions(current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """List all chat sessions for the current user."""
    return chat_service.list_sessions(db, current_user.id)

@router.post("/sessions", response_model=ChatSessionResponse)
def create_session(request: ChatSessionBase, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Create a new chat session."""
    return chat_service.create_session(db, current_user.id, request.title)

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
def get_session_messages(session_id: int, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Get all messages for a specific chat session."""
    return chat_service.get_messages(db, session_id, current_user.id)

@router.delete("/sessions/{session_id}")
def delete_session(session_id: int, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Delete a chat session."""
    return chat_service.delete_session(db, session_id, current_user.id)

from app.schemas.chat import ChatSessionUpdate, MessageReactionUpdate

@router.put("/sessions/{session_id}", response_model=ChatSessionResponse)
def update_session(session_id: int, request: ChatSessionUpdate, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Update a chat session (rename, pin, favorite)."""
    return chat_service.update_session(
        db, session_id, current_user.id, 
        title=request.title, 
        is_pinned=request.is_pinned, 
        is_favorite=request.is_favorite
    )

@router.put("/sessions/{session_id}/messages/{message_id}/reaction", response_model=ChatMessageResponse)
def update_message_reaction(session_id: int, message_id: int, request: MessageReactionUpdate, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Like or dislike a message."""
    # Verify session ownership
    chat_service.get_session(db, session_id, current_user.id)
    return chat_service.set_reaction(db, message_id, current_user.id, request.reaction)

@router.post("/sessions/{session_id}/favorite", response_model=ChatSessionResponse)
def favorite_session(session_id: int, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Mark a chat session as favorite."""
    return chat_service.update_session(db, session_id, current_user.id, is_favorite=True)

@router.delete("/sessions/{session_id}/favorite", response_model=ChatSessionResponse)
def unfavorite_session(session_id: int, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Remove a chat session from favorites."""
    return chat_service.update_session(db, session_id, current_user.id, is_favorite=False)

