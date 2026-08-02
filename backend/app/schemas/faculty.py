from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import date, datetime


# Faculty Profile
class FacultyProfileResponse(BaseModel):
    id: int
    user_id: int
    employee_id: str
    department: str
    designation: str
    office_room: str
    assigned_subjects: str
    assigned_sections: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Schedule Item
class FacultyScheduleItem(BaseModel):
    id: int
    day_of_week: str
    period_number: int
    start_time: str
    end_time: str
    subject_name: str
    subject_code: str
    section: str
    classroom: str
    model_config = ConfigDict(from_attributes=True)


# Stats & Dashboard Overview
class FacultyDashboardStats(BaseModel):
    today_classes_count: int
    total_assigned_students: int
    pending_submissions_count: int
    average_class_attendance: float
    total_quizzes_created: int
    question_papers_uploaded: int


class FacultyDashboardResponse(BaseModel):
    profile: FacultyProfileResponse
    stats: FacultyDashboardStats
    today_schedule: List[FacultyScheduleItem]
    upcoming_classes: List[FacultyScheduleItem]
    assigned_subjects: List[str]
    assigned_sections: List[str]
    notifications: List[dict]


# Attendance
class AttendanceMarkInput(BaseModel):
    student_id: Optional[int] = None
    student_name: str
    register_number: str
    subject_code: str
    section: str
    date: date
    status: str  # Present, Absent, Late, Leave
    remarks: Optional[str] = None


class BulkAttendanceInput(BaseModel):
    subject_code: str
    section: str
    date: date
    records: List[AttendanceMarkInput]


class AttendanceRecordResponse(BaseModel):
    id: int
    student_id: Optional[int]
    student_name: str
    register_number: str
    subject_code: str
    section: str
    date: date
    status: str
    remarks: Optional[str]
    model_config = ConfigDict(from_attributes=True)


# Assignments
class FacultyAssignmentInput(BaseModel):
    title: str
    subject_code: str
    section: str
    description: Optional[str] = None
    due_date: str
    max_marks: int = 100
    attachment_url: Optional[str] = None


class FacultyAssignmentResponse(BaseModel):
    id: int
    faculty_id: int
    title: str
    subject_code: str
    section: str
    description: Optional[str]
    due_date: str
    max_marks: int
    attachment_url: Optional[str]
    submissions_count: int = 0
    graded_count: int = 0
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class GradeSubmissionInput(BaseModel):
    grade: str
    remarks: Optional[str] = None


class FacultySubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    student_id: Optional[int]
    student_name: str
    register_number: str
    submission_text: Optional[str]
    file_url: Optional[str]
    submitted_at: datetime
    grade: Optional[str]
    remarks: Optional[str]
    status: str
    model_config = ConfigDict(from_attributes=True)


# Question Papers
class FacultyQuestionPaperInput(BaseModel):
    title: str
    subject_name: str
    subject_code: str
    department: str
    semester: int
    academic_year: str
    exam_type: str
    pdf_url: Optional[str] = None


class FacultyQuestionPaperResponse(BaseModel):
    id: int
    faculty_id: int
    title: str
    subject_name: str
    subject_code: str
    department: str
    semester: int
    academic_year: str
    exam_type: str
    pdf_url: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Quizzes
class FacultyQuizInput(BaseModel):
    title: str
    subject_code: str
    section: str
    num_questions: int = 5
    duration_minutes: int = 15
    total_marks: int = 50
    questions_json: Optional[Any] = None


class FacultyQuizResponse(BaseModel):
    id: int
    faculty_id: int
    title: str
    subject_code: str
    section: str
    num_questions: int
    duration_minutes: int
    total_marks: int
    is_published: bool
    questions_json: Optional[Any]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class FacultyQuizResultResponse(BaseModel):
    id: int
    quiz_id: int
    student_id: Optional[int]
    student_name: str
    score: int
    total_marks: int
    submitted_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Timetable
class FacultyTimetableRequestInput(BaseModel):
    request_date: date
    current_period: int
    requested_period: int
    reason: str


class FacultyTimetableRequestResponse(BaseModel):
    id: int
    faculty_id: int
    request_date: date
    current_period: int
    requested_period: int
    reason: str
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Student Roster
class StudentRosterItem(BaseModel):
    id: int
    student_name: str
    register_number: str
    department: str
    semester: int
    section: str
    attendance_percentage: float
    assignment_status: str  # All Completed, Pending, Overdue
