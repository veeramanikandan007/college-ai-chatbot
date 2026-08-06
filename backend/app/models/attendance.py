from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class SubjectAttendance(Base):
    __tablename__ = "subject_attendance"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    subject_name = Column(String, index=True)
    subject_code = Column(String, nullable=True)
    faculty_name = Column(String, nullable=True)
    department = Column(String, default="Computer Science & Engineering")
    semester = Column(Integer, default=5)
    classes_attended = Column(Integer, default=0)
    classes_missed = Column(Integer, default=0)
    classes_late = Column(Integer, default=0)
    medical_leave = Column(Integer, default=0)
    required_percentage = Column(Float, default=75.0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    subject_name = Column(String)
    date = Column(Date)
    day_of_week = Column(String) # Monday, Tuesday, etc.
    status = Column(String) # present, absent, late, leave
    period = Column(String, nullable=True) # e.g. "09:00 AM - 10:00 AM"
