from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    original_name = Column(String)
    file_type = Column(String) # pdf, docx, pptx, txt, csv
    file_size = Column(Integer)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    category = Column(String) # syllabus, notice, timetable, general
    is_indexed = Column(Boolean, default=False)
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploader = relationship("User", back_populates="documents")
