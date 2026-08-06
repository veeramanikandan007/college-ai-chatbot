from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database.base import Base


class NoteModel(Base):
    __tablename__ = "ai_notes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("uploaded_documents.id"), nullable=True, index=True)
    document_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    
    # Detailed structured fields stored as JSON or Text
    summary = Column(Text, nullable=True) # Executive & Chapter summary
    key_concepts = Column(Text, nullable=True)
    definitions = Column(Text, nullable=True)
    formulae = Column(Text, nullable=True)
    important_dates = Column(Text, nullable=True)
    questions = Column(Text, nullable=True) # 2M, 5M, 10M, Viva questions
    flashcards = Column(Text, nullable=True) # Flashcard array
    mcqs = Column(Text, nullable=True) # MCQs array
    checklist = Column(Text, nullable=True) # Revision checklist items
    
    full_content_json = Column(Text, nullable=True) # Complete unified JSON output

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", backref="notes")
    document = relationship("UploadedDocument", backref="notes")
