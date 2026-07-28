from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text, Date
from sqlalchemy.sql import func
from app.database.base import Base

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String)
    date = Column(Date)
    status = Column(String) # present, absent, leave
    semester = Column(Integer)

class TimetableEntry(Base):
    __tablename__ = "timetable"
    id = Column(Integer, primary_key=True, index=True)
    department = Column(String)
    year = Column(Integer)
    semester = Column(Integer)
    day_of_week = Column(String)
    period = Column(String)
    subject = Column(String)
    faculty = Column(String)
    room = Column(String)

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    subject = Column(String)
    department = Column(String)
    year = Column(Integer)
    semester = Column(Integer)
    due_date = Column(DateTime)
    created_by = Column(Integer, ForeignKey("users.id"))
    file_url = Column(String, nullable=True)

class Fee(Base):
    __tablename__ = "fees"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    semester = Column(Integer)
    amount = Column(Float)
    due_date = Column(Date)
    paid_amount = Column(Float, default=0.0)
    status = Column(String) # pending, partial, paid
    paid_at = Column(DateTime, nullable=True)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    event_date = Column(DateTime)
    category = Column(String)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    content = Column(Text)
    subject = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class LibraryBook(Base):
    __tablename__ = "library_books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    author = Column(String)
    isbn = Column(String)
    category = Column(String)
    available_copies = Column(Integer)
    total_copies = Column(Integer)

class BookIssue(Base):
    __tablename__ = "book_issues"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    book_id = Column(Integer, ForeignKey("library_books.id"))
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    due_date = Column(DateTime)
    returned_at = Column(DateTime, nullable=True)
    fine = Column(Float, default=0.0)
