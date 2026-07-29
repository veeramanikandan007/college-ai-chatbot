import os
import shutil
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.services.speech_service import SpeechService
from app.services.ai_service import AIService
from app.services import chat_service
from app.services.voice_language_router import VoiceLanguageRouter
from app.schemas.chat import ChatResponse
from pydantic import BaseModel
from app.core.config import settings
from app.core.limiter import limiter

router = APIRouter()
speech_service = SpeechService()
ai_service = AIService()
voice_router = VoiceLanguageRouter()

class NormalizeRequest(BaseModel):
    text: str

@router.post("/normalize")
@limiter.limit("30/minute")
async def normalize_text_for_voice(
    request: Request,
    payload: NormalizeRequest
):
    """Normalize text (Tanglish -> Tamil) before TTS"""
    return await voice_router.process_voice_text(payload.text)

@router.post("", response_model=ChatResponse)
@limiter.limit("10/minute")
async def handle_voice_chat(
    request: Request,
    audio: UploadFile = File(...),
    session_id: Optional[int] = None,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Handle incoming voice message, process via STT -> AI -> TTS"""
    # 1. Save uploaded file temporarily
    temp_filename = f"upload_{uuid.uuid4().hex}_{audio.filename}"
    temp_path = os.path.join(speech_service.audio_dir, temp_filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
            
        # 2. STT: Transcribe Audio
        transcription = await speech_service.transcribe_audio(temp_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Audio processing failed")
    finally:
        # Clean up the incoming audio file
        if os.path.exists(temp_path):
            os.remove(temp_path)

    if not transcription or not transcription.strip():
        raise HTTPException(status_code=400, detail="Could not transcribe audio")

    # 3. Create or fetch session
    if not session_id:
        title = transcription[:30] + "..." if len(transcription) > 30 else transcription
        session = chat_service.create_session(db, current_user.id, title)
        session_id = session.id

    # 4. Save transcribed user message
    chat_service.save_message(db, session_id, "user", transcription)

    # 5. Get AI Response (Handles Language Detection & Intent & Slang)
    try:
        ai_response_text = await ai_service.get_chat_answer(transcription)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 6. Save AI message
    ai_msg = chat_service.save_message(db, session_id, "assistant", ai_response_text)

    # 7. TTS: Generate Audio Response
    from app.services.language_service import LanguageService
    detected_lang = LanguageService.detect_language(ai_response_text)
    
    audio_url = await speech_service.generate_speech(ai_response_text, lang=detected_lang)

    # We return the text answer, but in a real app you might extend ChatResponse schema to include audio_url
    # For now, we prepend or append the audio URL so the frontend can play it
    return ChatResponse(
        answer=f"{ai_response_text}\n\n[Voice Audio: {audio_url}]",
        session_id=session_id,
        message_id=ai_msg.id
    )

@router.get("/audio/{filename}")
def get_audio_file(filename: str):
    """Serve the generated TTS audio file"""
    file_path = os.path.join(speech_service.audio_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path, media_type="audio/mpeg")
