from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.database.base import Base
from sqlalchemy.orm import relationship

class AdminProfileModel(Base):
    __tablename__ = "admin_profiles"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    department = Column(String(100), nullable=True)
    access_level = Column(String(50), default="Superadmin")
    
    user = relationship("app.models.user.User", back_populates="admin_profile")


class AdminAuditLogModel(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String(150), nullable=True)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False)
    target_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow)


class AdminDepartmentModel(Base):
    __tablename__ = "admin_departments"

    id = Column(Integer, primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(150), nullable=False)
    head_of_department = Column(String(150), default="Dr. S. Ramanathan")
    total_courses = Column(Integer, default=0)
    total_sections = Column(Integer, default=4)
    status = Column(String(20), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)


class AdminCourseModel(Base):
    __tablename__ = "admin_courses"

    id = Column(Integer, primary_key=True)
    department_code = Column(String(50), nullable=False)
    course_code = Column(String(50), unique=True, nullable=False)
    course_name = Column(String(150), nullable=False)
    credits = Column(Integer, default=3)
    semester = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AdminAnnouncementModel(Base):
    __tablename__ = "admin_announcements"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    target_type = Column(String(50), default="Entire College")
    target_filter = Column(String(100), default="All")
    priority = Column(String(20), default="Normal")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AdminSettingsModel(Base):
    __tablename__ = "admin_settings"

    id = Column(Integer, primary_key=True)
    college_name = Column(String(200), default="Mount Zion College of Engineering and Technology")
    college_code = Column(String(50), default="MZCET-9132")
    logo_url = Column(Text, default="https://example.com/logo.png")
    theme_color = Column(String(30), default="#0E2A6D")
    smtp_host = Column(String(100), default="smtp.campusmate.edu")
    smtp_port = Column(Integer, default=587)
    ai_provider = Column(String(50), default="Google Gemini 2.0 Flash")
    api_key_masked = Column(String(50), default="AIzaSy...****")
    storage_limit_gb = Column(Integer, default=500)
    security_mfa_enabled = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
