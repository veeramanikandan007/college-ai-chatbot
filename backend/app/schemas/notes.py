from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class FlashcardItem(BaseModel):
    front: str
    back: str


class MCQItem(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None


class QuestionsGroup(BaseModel):
    two_marks: List[str] = []
    five_marks: List[str] = []
    ten_marks: List[str] = []
    viva_questions: List[str] = []


class NoteContentSchema(BaseModel):
    title: str
    executive_summary: str
    chapter_summary: str
    key_concepts: List[str] = []
    definitions: List[Dict[str, str]] = [] # [{"term": "...", "definition": "..."}]
    formulae: List[Dict[str, str]] = [] # [{"formula": "...", "description": "..."}]
    important_dates: List[Dict[str, str]] = [] # [{"date_or_event": "...", "significance": "..."}]
    questions: QuestionsGroup = QuestionsGroup()
    flashcards: List[FlashcardItem] = []
    mcqs: List[MCQItem] = []
    checklist: List[str] = []


class NoteResponse(BaseModel):
    id: int
    user_id: int
    document_id: Optional[int] = None
    document_name: str
    title: str
    created_at: datetime
    content: Optional[NoteContentSchema] = None
    
    # Raw JSON fields fallback
    summary: Optional[str] = None
    key_concepts: Optional[str] = None
    definitions: Optional[str] = None
    formulae: Optional[str] = None
    important_dates: Optional[str] = None
    questions: Optional[str] = None
    flashcards: Optional[str] = None
    mcqs: Optional[str] = None
    checklist: Optional[str] = None

    class Config:
        from_attributes = True


class NoteListResponse(BaseModel):
    id: int
    user_id: int
    document_name: str
    title: str
    created_at: datetime

    class Config:
        from_attributes = True
