from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json

from app.api import deps
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
    
    session_id = payload.session_id
    if not session_id:
        title = payload.message[:30] + "..." if len(payload.message) > 30 else payload.message
        session = chat_service.create_session(db, current_user.id, title)
        session_id = session.id

    # Save user message
    chat_service.save_message(db, session_id, "user", payload.message)

    async def event_generator():
        full_response = ""
        try:
            # Yield metadata first (session_id)
            metadata = {"session_id": session_id}
            yield f"data: {json.dumps(metadata)}\n\n"
            
            async for chunk in ai_service.stream_chat_answer(payload.message):
                full_response += chunk
                # Yield each token formatted as SSE
                data = json.dumps({"text": chunk})
                yield f"data: {data}\n\n"
                
            # After stream completes, save AI message
            if full_response:
                ai_msg = chat_service.save_message(db, session_id, "assistant", full_response)
                # Send final metadata with message_id
                final_meta = {"message_id": ai_msg.id}
                yield f"data: {json.dumps(final_meta)}\n\n"
                
        except Exception as e:
            error_data = json.dumps({"error": str(e)})
            yield f"data: {error_data}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
