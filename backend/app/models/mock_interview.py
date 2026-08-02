from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from app.database.base import Base

class MockInterviewModel(Base):
    __tablename__ = "mock_interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    interview_type = Column(String(50), default="Technical", index=True) # HR, Technical, Coding, Aptitude, Group Discussion
    difficulty = Column(String(20), default="Medium") # Easy, Medium, Hard
    duration_minutes = Column(Integer, default=20)
    target_role = Column(String(150), default="Software Engineer")
    
    overall_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    grammar_score = Column(Float, default=0.0)
    technical_accuracy_score = Column(Float, default=0.0)
    fluency_score = Column(Float, default=0.0)
    professionalism_score = Column(Float, default=0.0)
    completeness_score = Column(Float, default=0.0)
    
    status = Column(String(50), default="In Progress", index=True) # In Progress, Completed, Abandoned
    feedback_summary = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True) # JSON list
    weaknesses = Column(Text, nullable=True) # JSON list
    improvements = Column(Text, nullable=True) # JSON list
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

class InterviewQaLogModel(Base):
    __tablename__ = "interview_qa_logs"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("mock_interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    question_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    student_answer = Column(Text, nullable=True)
    audio_url = Column(Text, nullable=True)
    score = Column(Float, default=0.0)
    feedback = Column(Text, nullable=True)
    model_answer = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
