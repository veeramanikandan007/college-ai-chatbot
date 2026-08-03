import os
import shutil
import uuid
import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.services.notes_service import NotesService
from app.schemas.notes import NoteResponse, NoteListResponse, NoteContentSchema
from app.core.config import settings
from app.core.limiter import limiter

router = APIRouter()
notes_service = NotesService()


@router.post("/generate", response_model=NoteResponse)
@limiter.limit("10/minute")
async def generate_ai_notes(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Upload document (.pdf, .docx, .pptx, .txt) and generate structured AI Study Notes.
    """
    ext = Path(file.filename).suffix.lower()
    allowed_extensions = ['.pdf', '.docx', '.pptx', '.txt']
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: PDF, DOCX, PPTX, TXT"
        )

    # Save temp file into uploads directory
    temp_name = f"notes_upload_{uuid.uuid4().hex}_{file.filename}"
    upload_path = Path(settings.UPLOAD_DIR) / temp_name

    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        note_record = await notes_service.generate_notes(
            db=db,
            user_id=current_user.id,
            file_path=upload_path,
            document_name=file.filename
        )

        parsed_content = None
        if note_record.full_content_json:
            try:
                parsed_content = NoteContentSchema(**json.loads(note_record.full_content_json))
            except Exception:
                pass

        return NoteResponse(
            id=note_record.id,
            user_id=note_record.user_id,
            document_id=note_record.document_id,
            document_name=note_record.document_name,
            title=note_record.title,
            created_at=note_record.created_at,
            content=parsed_content,
            summary=note_record.summary,
            key_concepts=note_record.key_concepts,
            definitions=note_record.definitions,
            formulae=note_record.formulae,
            important_dates=note_record.important_dates,
            questions=note_record.questions,
            flashcards=note_record.flashcards,
            mcqs=note_record.mcqs,
            checklist=note_record.checklist
        )
    finally:
        if upload_path.exists():
            try:
                os.remove(upload_path)
            except Exception:
                pass


@router.get("", response_model=List[NoteListResponse])
def list_user_notes(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get history of generated notes for current user (or all if admin)."""
    is_admin = current_user.role == "admin"
    notes = notes_service.get_user_notes(db, user_id=current_user.id, is_admin=is_admin)
    return notes


@router.get("/{note_id}", response_model=NoteResponse)
def get_note_detail(
    note_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get single note details."""
    is_admin = current_user.role == "admin"
    note_record = notes_service.get_note_by_id(db, note_id=note_id, user_id=current_user.id, is_admin=is_admin)

    parsed_content = None
    if note_record.full_content_json:
        try:
            parsed_content = NoteContentSchema(**json.loads(note_record.full_content_json))
        except Exception:
            pass

    return NoteResponse(
        id=note_record.id,
        user_id=note_record.user_id,
        document_id=note_record.document_id,
        document_name=note_record.document_name,
        title=note_record.title,
        created_at=note_record.created_at,
        content=parsed_content,
        summary=note_record.summary,
        key_concepts=note_record.key_concepts,
        definitions=note_record.definitions,
        formulae=note_record.formulae,
        important_dates=note_record.important_dates,
        questions=note_record.questions,
        flashcards=note_record.flashcards,
        mcqs=note_record.mcqs,
        checklist=note_record.checklist
    )


@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Delete specific note."""
    is_admin = current_user.role == "admin"
    notes_service.delete_note(db, note_id=note_id, user_id=current_user.id, is_admin=is_admin)
    return {"message": "Note deleted successfully", "id": note_id}
