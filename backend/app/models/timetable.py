from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Time
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_order=True, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    code = Column(String, unique=True, index=True)

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    subject_code = Column(String, unique=True, index=True)
    subject_name = Column(String, index=True)
    subject_type = Column(String, default="Theory") # Theory, Lab
    color_code = Column(String, default="#1E4DB7")

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, nullable=True)
    department = Column(String, index=True)

class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String, default="Computer Science & Engineering")
    semester = Column(Integer, default=6)
    section = Column(String, default="A")
    day_of_week = Column(String, index=True) # Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
    period_number = Column(Integer)
    start_time = Column(String) # e.g. "09:00 AM"
    end_time = Column(String)   # e.g. "10:00 AM"
    subject_name = Column(String, index=True)
    subject_code = Column(String)
    subject_type = Column(String, default="Theory") # Theory, Lab
    faculty_name = Column(String)
    classroom = Column(String)
    color_code = Column(String, default="#1E4DB7")
    created_at = Column(DateTime, default=datetime.utcnow)
