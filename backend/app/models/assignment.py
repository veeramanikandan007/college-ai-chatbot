from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.base import Base

class AssignmentModel(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    subject = Column(String(150), nullable=False, index=True)
    faculty = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=True)
    priority = Column(String(20), default="Medium", index=True) # High, Medium, Low
    due_date = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(30), default="Pending", index=True) # Pending, Completed, Overdue
    attachment_name = Column(String(255), nullable=True)
    attachment_url = Column(Text, nullable=True)
    attachment_size = Column(String(50), nullable=True)
    submission_time = Column(DateTime(timezone=True), nullable=True)
    remarks = Column(Text, nullable=True)
    assigned_class = Column(String(100), default="All Classes", index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
