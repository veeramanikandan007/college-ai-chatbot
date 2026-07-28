from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from fastapi import HTTPException
from app.models.chat import ChatSession, ChatMessage

def create_session(db: Session, user_id: int, title: str):
    session = ChatSession(user_id=user_id, title=title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def list_sessions(db: Session, user_id: int):
    return db.query(ChatSession).filter(ChatSession.user_id == user_id).order_by(
        desc(ChatSession.is_pinned), desc(ChatSession.updated_at)
    ).all()

def get_session(db: Session, session_id: int, user_id: int):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return session

def update_session(db: Session, session_id: int, user_id: int, title: str = None, is_pinned: bool = None, is_favorite: bool = None):
    session = get_session(db, session_id, user_id)
    if title is not None:
        session.title = title
    if is_pinned is not None:
        session.is_pinned = is_pinned
    if is_favorite is not None:
        session.is_favorite = is_favorite
    db.commit()
    db.refresh(session)
    return session

def delete_session(db: Session, session_id: int, user_id: int):
    session = get_session(db, session_id, user_id)
    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}

def save_message(db: Session, session_id: int, role: str, content: str):
    message = ChatMessage(session_id=session_id, role=role, content=content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

def get_messages(db: Session, session_id: int, user_id: int):
    # Verify ownership
    get_session(db, session_id, user_id)
    return db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()

def toggle_bookmark(db: Session, message_id: int, user_id: int):
    message = db.query(ChatMessage).join(ChatSession).filter(ChatMessage.id == message_id, ChatSession.user_id == user_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    message.is_bookmarked = not message.is_bookmarked
    db.commit()
    db.refresh(message)
    return message

def set_reaction(db: Session, message_id: int, user_id: int, reaction: str):
    message = db.query(ChatMessage).join(ChatSession).filter(ChatMessage.id == message_id, ChatSession.user_id == user_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    message.reaction = reaction
    db.commit()
    db.refresh(message)
    return message

def get_bookmarked(db: Session, user_id: int):
    return db.query(ChatMessage).join(ChatSession).filter(
        ChatSession.user_id == user_id, 
        ChatMessage.is_bookmarked == True
    ).order_by(desc(ChatMessage.created_at)).all()

def get_recent_prompts(db: Session, user_id: int, limit: int = 4):
    messages = db.query(ChatMessage).join(ChatSession).filter(
        ChatSession.user_id == user_id,
        ChatMessage.role == "user"
    ).order_by(desc(ChatMessage.created_at)).limit(limit).all()
    return messages
