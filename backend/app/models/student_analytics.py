from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Date
from sqlalchemy.sql import func
from app.database.base import Base


class StudentGoalModel(Base):
    __tablename__ = "student_goals"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), default="Academic")  # Academic, Attendance, Assignment, Interview, Placement
    target_metric = Column(String(100), nullable=False)
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0)
    unit = Column(String(20), default="%")
    deadline = Column(Date, nullable=True)
    status = Column(String(50), default="In Progress", index=True)  # In Progress, Completed, Overdue
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class StudentStreakModel(Base):
    __tablename__ = "student_streaks"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    daily_study_streak = Column(Integer, default=0)
    quiz_streak = Column(Integer, default=0)
    attendance_streak = Column(Integer, default=0)
    assignment_streak = Column(Integer, default=0)
    last_activity_date = Column(Date, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
