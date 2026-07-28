from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Student(Base):
    """Student user account with profile and academic data."""
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), default='')
    department = Column(String(255), default='')
    year = Column(String(50), default='')
    semester = Column(String(50), default='')
    attendance_percent = Column(Float, default=0.0)
    cgpa = Column(Float, default=0.0)
    fees_paid = Column(Integer, default=0)
    fees_total = Column(Integer, default=0)
    bus_no = Column(String(20), default='')
    library_books = Column(Text, default='')
    certificate = Column(String(255), default='')
    password = Column(String(255), nullable=False)
    role = Column(String(50), default='student')
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("ChatSession", back_populates="student", cascade="all, delete-orphan")


class ChatSession(Base):
    """A conversation session between a student and the AI."""
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    title = Column(String(255), default="New Conversation")
    pinned = Column(Integer, default=0)  # 0 = false, 1 = true
    favorite = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="sessions")
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")


class Message(Base):
    """A single message within a chat session."""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")


class CertificateRequest(Base):
    """Certificate application requests."""
    __tablename__ = "certificate_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    certificate_type = Column(String(100), nullable=False)  # Bonafide, Transfer, Character, Migration
    status = Column(String(50), default='pending')  # pending, approved, rejected
    requested_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
    fee_paid = Column(Integer, default=50)
