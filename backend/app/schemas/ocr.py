from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class OCRActionRequest(BaseModel):
    action: str  # "summary" | "explain" | "mcqs" | "flashcards" | "translate" | "questions"
    extracted_text: str
    target_language: Optional[str] = "Tamil"  # for translation


class OCRScanResponse(BaseModel):
    id: int
    user_id: int
    image_name: str
    image_url: Optional[str] = None
    extracted_text: str
    language_detected: str
    confidence_score: float
    summary: Optional[str] = None
    flashcards: Optional[str] = None
    mcqs: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OCRScanListResponse(BaseModel):
    id: int
    user_id: int
    image_name: str
    language_detected: str
    created_at: datetime

    class Config:
        from_attributes = True
