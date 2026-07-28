from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Health ────────────────────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    project: str
    version: str


# ─── Auth ──────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    student_id: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    access_token: Optional[str] = None
    token_type: str = 'bearer'
    user: Optional[dict] = None


class StudentProfileResponse(BaseModel):
    student_id: str
    name: str
    initials: str
    department: str
    year: str
    semester: str
    email: str
    phone: str
    attendance_percent: float
    cgpa: float
    fees_paid: int
    fees_total: int
    bus_no: str
    library_books: str
    certificate: str


# ─── Chat ──────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    chat_id: Optional[int] = None


class ChatResponse(BaseModel):
    reply: str
    sources: Optional[List[str]] = None
    chat_id: Optional[int] = None


class ChatSessionResponse(BaseModel):
    id: int
    title: str
    pinned: bool
    favorite: bool
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    timestamp: datetime


# ─── Student Data ──────────────────────────────────────────────────────────
class AttendanceSubject(BaseModel):
    subject: str
    code: str
    attended: int
    total: int
    percentage: float


class AttendanceResponse(BaseModel):
    student_id: str
    name: str
    department: str
    semester: str
    overall_percentage: float
    subjects: List[AttendanceSubject]


class FeesResponse(BaseModel):
    student_id: str
    name: str
    semester: str
    fees_paid: int
    fees_total: int
    balance: int
    status: str


class TimetableResponse(BaseModel):
    student_id: str
    name: str
    department: str
    semester: str
    schedule: dict


class LibraryResponse(BaseModel):
    student_id: str
    name: str
    books_issued: List[str]
    max_books: int
    issue_period_days: int
    library_hours: dict


class BusResponse(BaseModel):
    student_id: str
    name: str
    bus_no: str
    route: str
    departure_time: str
    return_time: str


class CertificateResponse(BaseModel):
    student_id: str
    name: str
    certificate: str
    status: str


# ─── Admin ─────────────────────────────────────────────────────────────────
class RebuildResponse(BaseModel):
    status: str
    message: str


class UploadResponse(BaseModel):
    status: str
    message: str
