from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    title = Column(String, index=True)
    document_id = Column(Integer, nullable=True)
    document_name = Column(String)
    subject = Column(String, default="General")
    difficulty = Column(String, default="Medium")
    quiz_type = Column(String, default="MCQ")
    num_questions = Column(Integer, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True)
    quiz_id = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    title = Column(String, default="AI Generated Quiz")
    document_name = Column(String, default="Document")
    subject = Column(String, default="General")
    difficulty = Column(String, default="Medium")
    quiz_type = Column(String, default="MCQ")
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    percentage = Column(Float, default=0.0)
    correct_answers = Column(Integer, default=0)
    wrong_answers = Column(Integer, default=0)
    time_taken_seconds = Column(Integer, default=0)
    questions_data = Column(Text, nullable=True) # JSON string of questions, user choices, explanations
    created_at = Column(DateTime(timezone=True), server_default=func.now())
