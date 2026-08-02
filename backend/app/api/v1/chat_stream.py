from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json

from app.api import deps
from app.database.engine import SessionLocal
from app.schemas.chat import ChatRequest
from app.services import chat_service
from app.models.user import User
from app.services.ai_service import AIService
from app.core.limiter import limiter

router = APIRouter()
ai_service = AIService()

@router.post("")
@limiter.limit("20/minute")
async def stream_message(request: Request, payload: ChatRequest, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Send a message to the AI and receive a Server-Sent Events (SSE) stream."""
    
    # Extract plain dictionary representation of current_user before streaming starts
    user_dict = {
        "id": current_user.id,
        "name": getattr(current_user, "full_name", None) or getattr(current_user, "name", "Student"),
        "full_name": getattr(current_user, "full_name", None) or getattr(current_user, "name", "Student"),
        "email": current_user.email,
        "role": current_user.role,
        "department": getattr(current_user, "department", None),
        "semester": getattr(current_user, "semester", None),
        "year": getattr(current_user, "year", None),
        "student_id": getattr(current_user, "student_id", None)
    }

    session_id = payload.session_id
    if not session_id:
        title = payload.message[:30] + "..." if len(payload.message) > 30 else payload.message
        session = chat_service.create_session(db, user_dict["id"], title)
        session_id = session.id

    # Save user message
    chat_service.save_message(db, session_id, "user", payload.message)

    async def event_generator():
        full_response = ""
        try:
            # Yield metadata first (session_id)
            metadata = {"session_id": session_id}
            yield f"data: {json.dumps(metadata)}\n\n"
            
            async for chunk in ai_service.stream_chat_answer(payload.message, current_user=user_dict, db=None):
                full_response += chunk
                # Yield each token formatted as SSE
                data = json.dumps({"text": chunk})
                yield f"data: {data}\n\n"
                
            # After stream completes, save AI message using isolated DB session
            if full_response:
                try:
                    with SessionLocal() as db_session:
                        ai_msg = chat_service.save_message(db_session, session_id, "assistant", full_response)
                        final_meta = {"message_id": ai_msg.id}
                        yield f"data: {json.dumps(final_meta)}\n\n"
                except Exception:
                    pass
                
        except Exception as e:
            error_data = json.dumps({"error": str(e)})
            yield f"data: {error_data}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
