import os
import shutil
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.services.ocr_service import OCRService
from app.schemas.ocr import OCRScanResponse, OCRScanListResponse, OCRActionRequest
from app.core.config import settings
from app.core.limiter import limiter

router = APIRouter()
ocr_service = OCRService()


@router.post("/upload", response_model=OCRScanResponse)
@router.post("/extract", response_model=OCRScanResponse)
@limiter.limit("15/minute")
async def upload_and_extract_ocr(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Upload image file (.jpg, .jpeg, .png, .webp, .heic) and extract text via AI Vision OCR.
    Extracted text is auto-indexed into ChromaDB vector store for AI Chat use.
    """
    ext = Path(file.filename).suffix.lower()
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic']
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format '{ext}'. Allowed: JPG, JPEG, PNG, WEBP, HEIC"
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    scan_record = await ocr_service.process_ocr_upload(
        db=db,
        user_id=current_user.id,
        file_bytes=file_bytes,
        image_name=file.filename
    )

    return OCRScanResponse.model_validate(scan_record)


@router.post("/action")
@limiter.limit("20/minute")
async def execute_ocr_ai_action(
    request: Request,
    payload: OCRActionRequest,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Execute AI actions (summary, explain, mcqs, flashcards, translate, questions) on extracted text.
    """
    return await ocr_service.execute_ai_action(
        action=payload.action,
        extracted_text=payload.extracted_text,
        target_lang=payload.target_language
    )


@router.get("/history", response_model=List[OCRScanListResponse])
def list_user_ocr_history(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Fetch OCR scan history for current user (or all if admin)."""
    is_admin = current_user.role == "admin"
    scans = ocr_service.get_user_scans(db, user_id=current_user.id, is_admin=is_admin)
    return scans


@router.get("/{scan_id}", response_model=OCRScanResponse)
def get_ocr_scan_detail(
    scan_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get single OCR scan detail by ID."""
    is_admin = current_user.role == "admin"
    scan_record = ocr_service.get_scan_by_id(db, scan_id=scan_id, user_id=current_user.id, is_admin=is_admin)
    return OCRScanResponse.model_validate(scan_record)


@router.delete("/{scan_id}")
def delete_ocr_scan(
    scan_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Delete OCR scan record."""
    is_admin = current_user.role == "admin"
    ocr_service.delete_scan(db, scan_id=scan_id, user_id=current_user.id, is_admin=is_admin)
    return {"message": "OCR scan deleted successfully", "id": scan_id}
