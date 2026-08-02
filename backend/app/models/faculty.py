from sqlalchemy import Column, Integer, String, Text, Float, Boolean, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


class FacultyProfileModel(Base):
    __tablename__ = "faculty_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(String(50), unique=True, nullable=False)
    department = Column(String(100), nullable=False)
    designation = Column(String(100), default="Assistant Professor")
    office_room = Column(String(50), default="Block A - 204")
    assigned_subjects = Column(Text, default="CS8591 Computer Networks, CS8492 Database Management")
    assigned_sections = Column(Text, default="A, B")
    created_at = Column(DateTime, default=datetime.utcnow)


class FacultyScheduleModel(Base):
    __tablename__ = "faculty_schedules"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty_profiles.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(String(20), nullable=False)
    period_number = Column(Integer, nullable=False)
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)
    subject_name = Column(String(150), nullable=False)
    subject_code = Column(String(50), nullable=False)
    section = Column(String(20), nullable=False)
    classroom = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class FacultyAttendanceRecordModel(Base):
    __tablename__ = "faculty_attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty_profiles.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    student_name = Column(String(150), nullable=False)
    register_number = Column(String(50), nullable=False)
    subject_code = Column(String(50), nullable=False)
    section = Column(String(20), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String(20), default="Present")
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class FacultyAssignmentModel(Base):
    __tablename__ = "faculty_assignments"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    subject_code = Column(String(50), nullable=False)
    section = Column(String(20), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(String(50), nullable=False)
    max_marks = Column(Integer, default=100)
    attachment_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class FacultySubmissionModel(Base):
    __tablename__ = "faculty_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("faculty_assignments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    student_name = Column(String(150), nullable=False)
    register_number = Column(String(50), nullable=False)
    submission_text = Column(Text, nullable=True)
    file_url = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    grade = Column(String(20), nullable=True)
    remarks = Column(Text, nullable=True)
    status = Column(String(30), default="Submitted")


class FacultyQuestionPaperModel(Base):
    __tablename__ = "faculty_question_papers"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    subject_name = Column(String(150), nullable=False)
    subject_code = Column(String(50), nullable=False)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=False)
    academic_year = Column(String(30), nullable=False)
    exam_type = Column(String(50), nullable=False)
    pdf_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class FacultyQuizModel(Base):
    __tablename__ = "faculty_quizzes"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    subject_code = Column(String(50), nullable=False)
    section = Column(String(20), nullable=False)
    num_questions = Column(Integer, default=5)
    duration_minutes = Column(Integer, default=15)
    total_marks = Column(Integer, default=50)
    is_published = Column(Boolean, default=False)
    questions_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class FacultyQuizResultModel(Base):
    __tablename__ = "faculty_quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("faculty_quizzes.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    student_name = Column(String(150), nullable=False)
    score = Column(Integer, nullable=False)
    total_marks = Column(Integer, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)


class FacultyTimetableRequestModel(Base):
    __tablename__ = "faculty_timetable_change_requests"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty_profiles.id", ondelete="CASCADE"), nullable=False)
    request_date = Column(Date, nullable=False)
    current_period = Column(Integer, nullable=False)
    requested_period = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(30), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
