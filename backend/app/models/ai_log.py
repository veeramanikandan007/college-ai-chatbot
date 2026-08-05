from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base

class AIRequestLog(Base):
    __tablename__ = "ai_request_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    question = Column(String(2000), nullable=False)
    model_used = Column(String(100), nullable=False)
    tokens = Column(Integer, nullable=True)
    latency = Column(Float, nullable=True)
    retrieval_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
