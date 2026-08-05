from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime, date


# Master Overview Stats
class AdminMasterOverviewStats(BaseModel):
    total_students: int
    total_faculty: int
    total_departments: int
    total_courses: int
    overall_attendance_rate: float
    total_assignments: int
    total_question_papers: int
    total_placements: int
    uploaded_documents: int
    daily_active_users: int
    system_health_percentage: float
    storage_usage_gb: float
    storage_limit_gb: float


# User Management Schemas
class AdminUserInput(BaseModel):
    name: str
    email: str
    password: str
    role: str  # student, faculty, admin
    department: Optional[str] = None
    student_id: Optional[str] = None


class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: Optional[str]
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Department & Course Schemas
class AdminDepartmentInput(BaseModel):
    code: str
    name: str
    head_of_department: Optional[str] = "Dr. S. Ramanathan"
    total_sections: int = 4


class AdminDepartmentResponse(BaseModel):
    id: int
    code: str
    name: str
    head_of_department: str
    total_courses: int
    total_sections: int
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AdminCourseInput(BaseModel):
    department_code: str
    course_code: str
    course_name: str
    credits: int = 3
    semester: int


class AdminCourseResponse(BaseModel):
    id: int
    department_code: str
    course_code: str
    course_name: str
    credits: int
    semester: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Announcement Schemas
class AdminAnnouncementInput(BaseModel):
    title: str
    content: str
    target_type: str = "Entire College"  # Entire College, Department, Semester, Section, Faculty
    target_filter: str = "All"
    priority: str = "Normal"  # High, Normal, Low


class AdminAnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    target_type: str
    target_filter: str
    priority: str
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Analytics Schemas
class AdminAnalyticsMaster(BaseModel):
    daily_users: List[dict]
    weekly_users: List[dict]
    monthly_users: List[dict]
    storage_distribution: List[dict]
    most_used_modules: List[dict]
    top_performing_students: List[dict]
    faculty_activity_logs: List[dict]


# Settings & Security Schemas
class AdminSettingsInput(BaseModel):
    college_name: str
    college_code: str
    logo_url: Optional[str] = None
    theme_color: Optional[str] = "#0E2A6D"
    smtp_host: Optional[str] = "smtp.collegemate.edu"
    smtp_port: Optional[int] = 587
    ai_provider: Optional[str] = "Google Gemini 2.0 Flash"
    storage_limit_gb: Optional[int] = 500
    security_mfa_enabled: Optional[bool] = True


class AdminSettingsResponse(BaseModel):
    id: int
    college_name: str
    college_code: str
    logo_url: Optional[str]
    theme_color: str
    smtp_host: str
    smtp_port: int
    ai_provider: str
    api_key_masked: str
    storage_limit_gb: int
    security_mfa_enabled: bool
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Audit Log Response
class AdminAuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    user_email: Optional[str]
    action: str
    target_type: str
    target_id: Optional[str]
    details: Optional[str]
    ip_address: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
