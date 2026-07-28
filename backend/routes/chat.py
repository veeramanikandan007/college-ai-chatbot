import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Student, ChatSession, Message
from schemas import ChatRequest, ChatResponse
from services.chat_service import ChatService
from routes.auth import get_current_student

router = APIRouter()
chat_service = ChatService()


@router.post('/chat', response_model=ChatResponse, tags=['Chat'])
async def chat(
    request: ChatRequest,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Send a message to the AI and get a response using RAG."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail='Message cannot be empty.')

    # Get or create chat session
    session = None
    if request.chat_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == request.chat_id,
            ChatSession.student_id == current_student.id,
        ).first()

    if not session:
        session = ChatSession(
            student_id=current_student.id,
            title='New Conversation',
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Save user message
    user_message = Message(
        session_id=session.id,
        role='user',
        content=request.message,
    )
    db.add(user_message)
    db.commit()

    # Get AI response
    reply = chat_service.ask(request.message, current_student)

    # Save AI response
    ai_message = Message(
        session_id=session.id,
        role='assistant',
        content=reply,
    )
    db.add(ai_message)
    db.commit()

    # Update session title if this is the first message
    if len(session.messages) <= 2:
        title = generate_title(request.message)
        session.title = title
        db.commit()

    return ChatResponse(
        reply=reply,
        sources=None,
        chat_id=session.id,
    )


@router.get('/sessions', tags=['Chat'])
async def get_sessions(
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Get all chat sessions for the current student."""
    sessions = db.query(ChatSession).filter(
        ChatSession.student_id == current_student.id
    ).order_by(ChatSession.updated_at.desc()).all()

    return [
        {
            'id': s.id,
            'title': s.title,
            'pinned': bool(s.pinned),
            'favorite': bool(s.favorite),
            'created_at': s.created_at.isoformat(),
            'updated_at': s.updated_at.isoformat(),
        }
        for s in sessions
    ]


@router.get('/sessions/{session_id}/messages', tags=['Chat'])
async def get_session_messages(
    session_id: int,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Get all messages in a chat session."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.student_id == current_student.id,
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail='Session not found.')

    messages = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.timestamp.asc()).all()

    return [
        {
            'id': m.id,
            'role': m.role,
            'content': m.content,
            'timestamp': m.timestamp.isoformat(),
        }
        for m in messages
    ]


@router.post('/sessions/{session_id}/pin', tags=['Chat'])
async def pin_session(
    session_id: int,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Toggle pin status of a chat session."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.student_id == current_student.id,
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail='Session not found.')

    session.pinned = 1 if session.pinned == 0 else 0
    db.commit()
    return {'pinned': bool(session.pinned)}


@router.post('/sessions/{session_id}/favorite', tags=['Chat'])
async def favorite_session(
    session_id: int,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Toggle favorite status of a chat session."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.student_id == current_student.id,
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail='Session not found.')

    session.favorite = 1 if session.favorite == 0 else 0
    db.commit()
    return {'favorite': bool(session.favorite)}


@router.delete('/sessions/{session_id}', tags=['Chat'])
async def delete_session(
    session_id: int,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Delete a chat session."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.student_id == current_student.id,
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail='Session not found.')

    db.delete(session)
    db.commit()
    return {'message': 'Session deleted successfully.'}


@router.post('/sessions', tags=['Chat'])
async def create_session(
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Create a new chat session."""
    session = ChatSession(
        student_id=current_student.id,
        title='New Conversation',
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {'id': session.id, 'title': session.title}


@router.post('/sessions/{session_id}/rename', tags=['Chat'])
async def rename_session(
    session_id: int,
    title: str,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Rename a chat session."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.student_id == current_student.id,
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail='Session not found.')

    session.title = title
    db.commit()
    return {'id': session.id, 'title': session.title}


def generate_title(message: str) -> str:
    """Generate a concise title from the first user message."""
    cleaned = re.sub(r'[^\w\s]', '', message).strip()
    words = cleaned.split()[:4]
    if not words:
        return 'New Conversation'
    return ' '.join(w.capitalize() for w in words)
