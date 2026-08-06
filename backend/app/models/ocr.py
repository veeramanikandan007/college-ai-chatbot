from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database.base import Base


class OCRScanModel(Base):
    __tablename__ = "ocr_scans"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    image_name = Column(String(255), nullable=False)
    image_path = Column(String(500), nullable=True)
    extracted_text = Column(Text, nullable=False)
    language_detected = Column(String(50), default="English")
    confidence_score = Column(Float, default=95.0)

    # Cached AI Action Outputs
    summary = Column(Text, nullable=True)
    flashcards = Column(Text, nullable=True)
    mcqs = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", backref="ocr_scans")
