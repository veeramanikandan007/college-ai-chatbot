from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Date, Float
from sqlalchemy.sql import func
from app.database.base import Base

class StudyPlanModel(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    exam_name = Column(String(255), nullable=False)
    exam_date = Column(Date, nullable=False)
    available_hours_per_day = Column(Float, default=4.0)
    preferred_study_time = Column(String(50), default="Evening") # Morning, Afternoon, Evening, Night
    target_score_percentage = Column(Integer, default=90)
    weak_subjects = Column(Text, nullable=True) # JSON array
    strong_subjects = Column(Text, nullable=True) # JSON array
    status = Column(String(50), default="Active", index=True) # Active, Completed, Archived
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StudyTaskModel(Base):
    __tablename__ = "study_tasks"

    id = Column(Integer, primary_key=True)
    plan_id = Column(Integer, ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject_code = Column(String(50), nullable=False, index=True)
    subject_name = Column(String(150), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    task_type = Column(String(50), default="Study", index=True) # Study, Revision, Assignment, Quiz Practice, PYQP Analysis
    scheduled_date = Column(Date, nullable=False, index=True)
    duration_minutes = Column(Integer, default=60)
    priority = Column(String(20), default="Medium") # High, Medium, Low
    status = Column(String(50), default="Pending", index=True) # Pending, In Progress, Completed
    completed_at = Column(DateTime(timezone=True), nullable=True)
    linked_module_type = Column(String(50), nullable=True) # assignment, quiz, pyqp, document, attendance
    linked_module_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StudyReminderModel(Base):
    __tablename__ = "study_reminders"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    reminder_type = Column(String(50), default="Study Time") # Study Time, Assignment Due, Quiz Reminder, Exam Reminder
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
