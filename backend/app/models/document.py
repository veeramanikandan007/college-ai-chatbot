from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    original_name = Column(String)
    file_type = Column(String) # pdf, docx, pptx, txt, csv, md, jpeg, png, webp, zip
    file_size = Column(Integer)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    category = Column(String, default="General")
    folder_name = Column(String, default="General")
    is_pinned = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False)
    is_indexed = Column(Boolean, default=False)
    chunk_count = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    keywords = Column(String, nullable=True)
    topics = Column(String, nullable=True)
    estimated_reading_time = Column(Integer, default=5)
    difficulty = Column(String, default="Intermediate")
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploader = relationship("User", back_populates="documents")
