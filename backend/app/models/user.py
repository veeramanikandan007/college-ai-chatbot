from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="student") # student, faculty, admin
    
    # Student specific fields
    department = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    semester = Column(Integer, nullable=True)
    student_id = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    chat_sessions = relationship("ChatSession", back_populates="user")
    documents = relationship("UploadedDocument", back_populates="uploader")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
