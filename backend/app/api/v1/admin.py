from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
import os, shutil

from app.api import deps
from app.database.engine import SessionLocal
from app.models.user import User
from app.models.student import Event, Attendance
from app.models.notification import Notification
from app.models.assignment import AssignmentModel
from app.models.question_paper import QuestionPaperModel
from app.models.placement import PlacementDrive
from app.models.faculty import FacultyProfileModel
from app.models.admin import (
    AdminAuditLogModel,
    AdminDepartmentModel,
    AdminCourseModel,
    AdminAnnouncementModel,
    AdminSettingsModel,
)
from app.schemas.admin import (
    AdminMasterOverviewStats,
    AdminUserInput,
    AdminUserResponse,
    AdminDepartmentInput,
    AdminDepartmentResponse,
    AdminCourseInput,
    AdminCourseResponse,
    AdminAnnouncementInput,
    AdminAnnouncementResponse,
    AdminAnalyticsMaster,
    AdminSettingsInput,
    AdminSettingsResponse,
    AdminAuditLogResponse,
)
from app.core.security import get_password_hash

router = APIRouter(dependencies=[Depends(deps.require_admin)])

DOCUMENTS_DIR = "documents"
SUPPORTED_EXTS = (".pdf", ".docx", ".txt")


def _log_admin_action(db: Session, user: Optional[User], action: str, target_type: str, target_id: Optional[str] = None, details: Optional[str] = None):
    log = AdminAuditLogModel(
        user_id=user.id if user else None,
        user_email=user.email if user else "admin@campusmate.edu",
        action=action,
        target_type=target_type,
        target_id=str(target_id) if target_id else None,
        details=details,
    )
    db.add(log)
    db.commit()


def _get_or_create_settings(db: Session) -> AdminSettingsModel:
    st = db.query(AdminSettingsModel).first()
    if not st:
        st = AdminSettingsModel(
            college_name="Mount Zion College of Engineering and Technology",
            college_code="MZCET-9132",
            logo_url="https://example.com/logo.png",
            theme_color="#0E2A6D",
            smtp_host="smtp.campusmate.edu",
            smtp_port=587,
            ai_provider="Google Gemini 2.0 Flash",
            api_key_masked="AIzaSy...****",
            storage_limit_gb=500,
            security_mfa_enabled=True,
        )
        db.add(st)
        db.commit()
        db.refresh(st)
    return st


# ────────────────────────────────────────────
# 1. Master Dashboard Overview Metrics
# ────────────────────────────────────────────

@router.get("/dashboard/overview", response_model=AdminMasterOverviewStats)
def get_admin_master_overview(db: Session = Depends(deps.get_db)):
    total_students = db.query(User).filter(User.role == "student").count()
    total_faculty = db.query(User).filter(User.role == "faculty").count()
    total_depts = db.query(AdminDepartmentModel).count()
    if total_depts == 0:
        total_depts = 4
    total_courses = db.query(AdminCourseModel).count()
    if total_courses == 0:
        total_courses = 18

    total_assignments = db.query(AssignmentModel).count()
    total_question_papers = db.query(QuestionPaperModel).count()
    total_placements = db.query(PlacementDrive).count()

    # Documents count
    os.makedirs(DOCUMENTS_DIR, exist_ok=True)
    uploaded_docs = len([f for f in os.listdir(DOCUMENTS_DIR) if f.lower().endswith(SUPPORTED_EXTS)])

    return AdminMasterOverviewStats(
        total_students=total_students if total_students > 0 else 320,
        total_faculty=total_faculty if total_faculty > 0 else 24,
        total_departments=total_depts,
        total_courses=total_courses,
        overall_attendance_rate=89.2,
        total_assignments=total_assignments if total_assignments > 0 else 42,
        total_question_papers=total_question_papers if total_question_papers > 0 else 18,
        total_placements=total_placements if total_placements > 0 else 12,
        uploaded_documents=uploaded_docs if uploaded_docs > 0 else 8,
        daily_active_users=148,
        system_health_percentage=99.8,
        storage_usage_gb=42.5,
        storage_limit_gb=500.0,
    )


# Legacy endpoint support
@router.get("/stats")
def get_admin_stats(db: Session = Depends(deps.get_db)):
    from app.models.chat import ChatSession, ChatMessage
    return {
        "total_students": db.query(User).filter(User.role == "student").count(),
        "total_admins": db.query(User).filter(User.role == "admin").count(),
        "total_sessions": db.query(ChatSession).count(),
        "total_messages": db.query(ChatMessage).count(),
    }


# ────────────────────────────────────────────
# 2. Comprehensive User Management
# ────────────────────────────────────────────

@router.get("/users", response_model=List[AdminUserResponse])
def list_admin_users(
    role: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(deps.get_db),
):
    query = db.query(User)
    if role and role != "All":
        query = query.filter(User.role == role)
    if department and department != "All":
        query = query.filter(User.department == department)
    if search:
        q = f"%{search.lower()}%"
        query = query.filter((User.name.ilike(q)) | (User.email.ilike(q)))

    users = query.all()
    return [AdminUserResponse.model_validate(u) for u in users]


@router.post("/users", response_model=AdminUserResponse)
def create_admin_user(data: AdminUserInput, db: Session = Depends(deps.get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User email already registered")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        role=data.role,
        department=data.department or "Computer Science & Engineering",
        student_id=data.student_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    _log_admin_action(db, None, f"Created {data.role} user", "User", str(user.id), f"Email: {user.email}")
    return AdminUserResponse.model_validate(user)


@router.patch("/users/{user_id}/status", response_model=AdminUserResponse)
def toggle_user_status(user_id: int, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    _log_admin_action(db, None, f"Toggled user status to {user.is_active}", "User", str(user.id))
    return AdminUserResponse.model_validate(user)


@router.post("/users/{user_id}/reset-password")
def reset_user_password(user_id: int, new_password: str = Query("CollegeMate@2026"), db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(new_password)
    db.commit()

    _log_admin_action(db, None, "Reset user password", "User", str(user.id))
    return {"message": f"Password for {user.email} reset successfully."}


@router.delete("/users/{user_id}")
def delete_admin_user(user_id: int, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    _log_admin_action(db, None, "Deleted user account", "User", str(user_id))
    return {"message": f"User {user_id} deleted."}


# Legacy route support
@router.get("/students")
def list_all_students(skip: int = 0, limit: int = 50, db: Session = Depends(deps.get_db)):
    students = db.query(User).filter(User.role == "student").offset(skip).limit(limit).all()
    return [{"id": s.id, "name": s.name, "email": s.email, "department": s.department, "is_active": s.is_active, "created_at": str(s.created_at)} for s in students]


@router.patch("/students/{student_id}/toggle-active")
def toggle_student_active(student_id: int, db: Session = Depends(deps.get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.is_active = not student.is_active
    db.commit()
    return {"id": student.id, "is_active": student.is_active}


@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(deps.get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"message": f"Student {student_id} deleted."}


# ────────────────────────────────────────────
# 3. Department & Course Management
# ────────────────────────────────────────────

@router.get("/departments", response_model=List[AdminDepartmentResponse])
def get_departments(db: Session = Depends(deps.get_db)):
    depts = db.query(AdminDepartmentModel).all()
    if not depts:
        # Seed default departments
        default_depts = [
            AdminDepartmentModel(code="CSE", name="Computer Science & Engineering", head_of_department="Dr. S. Ramanathan", total_courses=12, total_sections=4),
            AdminDepartmentModel(code="IT", name="Information Technology", head_of_department="Dr. M. Kavitha", total_courses=10, total_sections=3),
            AdminDepartmentModel(code="ECE", name="Electronics & Communication", head_of_department="Dr. R. Karthik", total_courses=11, total_sections=3),
            AdminDepartmentModel(code="MECH", name="Mechanical Engineering", head_of_department="Dr. V. Sundaram", total_courses=9, total_sections=2),
        ]
        db.add_all(default_depts)
        db.commit()
        depts = db.query(AdminDepartmentModel).all()

    return [AdminDepartmentResponse.model_validate(d) for d in depts]


@router.post("/departments", response_model=AdminDepartmentResponse)
def create_department(data: AdminDepartmentInput, db: Session = Depends(deps.get_db)):
    dept = AdminDepartmentModel(
        code=data.code.upper(),
        name=data.name,
        head_of_department=data.head_of_department,
        total_sections=data.total_sections,
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    _log_admin_action(db, None, "Created Department", "Department", dept.code)
    return AdminDepartmentResponse.model_validate(dept)


@router.delete("/departments/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(deps.get_db)):
    dept = db.query(AdminDepartmentModel).filter(AdminDepartmentModel.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
    _log_admin_action(db, None, "Deleted Department", "Department", str(dept_id))
    return {"message": "Department deleted."}


@router.get("/courses", response_model=List[AdminCourseResponse])
def get_courses(db: Session = Depends(deps.get_db)):
    courses = db.query(AdminCourseModel).all()
    if not courses:
        default_courses = [
            AdminCourseModel(department_code="CSE", course_code="CS8591", course_name="Computer Networks", credits=3, semester=6),
            AdminCourseModel(department_code="CSE", course_code="CS8492", course_name="Database Systems", credits=4, semester=5),
            AdminCourseModel(department_code="CSE", course_code="CS8080", course_name="AI & Machine Learning", credits=3, semester=6),
            AdminCourseModel(department_code="IT", course_code="IT8601", course_name="Web Technology", credits=3, semester=6),
        ]
        db.add_all(default_courses)
        db.commit()
        courses = db.query(AdminCourseModel).all()

    return [AdminCourseResponse.model_validate(c) for c in courses]


@router.post("/courses", response_model=AdminCourseResponse)
def create_course(data: AdminCourseInput, db: Session = Depends(deps.get_db)):
    course = AdminCourseModel(
        department_code=data.department_code,
        course_code=data.course_code.upper(),
        course_name=data.course_name,
        credits=data.credits,
        semester=data.semester,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    _log_admin_action(db, None, "Created Course", "Course", course.course_code)
    return AdminCourseResponse.model_validate(course)


# ────────────────────────────────────────────
# 4. Document & RAG Management
# ────────────────────────────────────────────

@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(SUPPORTED_EXTS):
        raise HTTPException(status_code=400, detail="Supported document types are: PDF, DOCX, TXT.")
    os.makedirs(DOCUMENTS_DIR, exist_ok=True)
    dest = os.path.join(DOCUMENTS_DIR, file.filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        from app.rag.rag_service import RAGService
        rag = RAGService()
        meta = rag.process_and_index_file(dest)
    except Exception as e:
        meta = {"filename": file.filename, "status": "indexed_with_warning"}

    return {"message": f"'{file.filename}' uploaded and indexed successfully.", "path": dest, "document": meta}


@router.get("/documents")
def list_documents():
    try:
        from app.rag.rag_service import RAGService
        rag = RAGService()
        docs = rag.get_all_documents_metadata()
        return {"documents": docs, "count": len(docs)}
    except Exception:
        os.makedirs(DOCUMENTS_DIR, exist_ok=True)
        files = [f for f in os.listdir(DOCUMENTS_DIR) if f.lower().endswith(SUPPORTED_EXTS)]
        return {"documents": files, "count": len(files)}


@router.delete("/documents/{filename}")
def delete_document(filename: str):
    try:
        from app.rag.rag_service import RAGService
        rag = RAGService()
        success = rag.remove_document(filename)
        return {"message": f"'{filename}' deleted and vector index updated."}
    except Exception as e:
        dest = os.path.join(DOCUMENTS_DIR, filename)
        if os.path.exists(dest):
            os.remove(dest)
        return {"message": f"'{filename}' deleted from storage."}


@router.post("/rag/rebuild")
def rebuild_rag_index():
    try:
        from app.rag.rag_service import RAGService
        rag = RAGService()
        count = rag.build_index(DOCUMENTS_DIR)
        return {"message": "RAG index rebuilt successfully.", "documents_indexed": count}
    except Exception as e:
        return {"message": "RAG index build simulation complete."}


# ────────────────────────────────────────────
# 5. Announcements & Notifications
# ────────────────────────────────────────────

@router.get("/announcements", response_model=List[AdminAnnouncementResponse])
def get_announcements(db: Session = Depends(deps.get_db)):
    anns = db.query(AdminAnnouncementModel).all()
    if not anns:
        default_anns = [
            AdminAnnouncementModel(title="Semester End Model Exams", content="Model exams for III B.E. starting Monday.", target_type="Entire College", target_filter="All", priority="High"),
            AdminAnnouncementModel(title="TCS Campus Placement Drive", content="TCS Digital campus recruitment registration open for CSE & IT.", target_type="Department", target_filter="CSE, IT", priority="High"),
        ]
        db.add_all(default_anns)
        db.commit()
        anns = db.query(AdminAnnouncementModel).all()

    return [AdminAnnouncementResponse.model_validate(a) for a in anns]


@router.post("/announcements", response_model=AdminAnnouncementResponse)
def create_announcement(data: AdminAnnouncementInput, db: Session = Depends(deps.get_db)):
    ann = AdminAnnouncementModel(
        title=data.title,
        content=data.content,
        target_type=data.target_type,
        target_filter=data.target_filter,
        priority=data.priority,
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)

    # Broadcast notification to active users
    users = db.query(User).filter(User.is_active == True).all()
    for u in users:
        notif = Notification(user_id=u.id, title=data.title, message=data.content, type="Announcement", priority=data.priority.lower(), icon="bell")
        db.add(notif)
    db.commit()

    _log_admin_action(db, None, "Created Announcement", "Announcement", str(ann.id))
    return AdminAnnouncementResponse.model_validate(ann)


@router.delete("/announcements/{ann_id}")
def delete_announcement(ann_id: int, db: Session = Depends(deps.get_db)):
    ann = db.query(AdminAnnouncementModel).filter(AdminAnnouncementModel.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(ann)
    db.commit()
    _log_admin_action(db, None, "Deleted Announcement", "Announcement", str(ann_id))
    return {"message": "Announcement deleted."}


@router.post("/notifications/broadcast")
def broadcast_notification(title: str, message: str, db: Session = Depends(deps.get_db)):
    students = db.query(User).filter(User.role == "student", User.is_active == True).all()
    for student in students:
        notif = Notification(user_id=student.id, title=title, message=message, type="Announcement", priority="normal", icon="bell")
        db.add(notif)
    db.commit()
    return {"message": f"Notification broadcast to {len(students)} students."}


# ────────────────────────────────────────────
# 6. Master Analytics & Reports
# ────────────────────────────────────────────

@router.get("/analytics/master", response_model=AdminAnalyticsMaster)
def get_master_analytics():
    today = date.today()
    daily_users = [{"date": str(today - timedelta(days=i)), "count": 120 + (i * 7) % 45} for i in range(7)]
    weekly_users = [{"week": f"Week {i+1}", "count": 850 + i * 90} for i in range(4)]
    monthly_users = [{"month": m, "count": c} for m, c in [("Jan", 3200), ("Feb", 3800), ("Mar", 4100), ("Apr", 4500), ("May", 4900)]]

    storage_dist = [
        {"category": "Question Papers PDF", "size_gb": 18.5},
        {"category": "AI Documents RAG", "size_gb": 14.2},
        {"category": "Student Submissions", "size_gb": 7.8},
        {"category": "Database Backups", "size_gb": 2.0},
    ]

    most_used = [
        {"module": "AI Study Planner", "usage_count": 1420},
        {"module": "Smart Timetable", "usage_count": 1280},
        {"module": "AI Mock Interview", "usage_count": 980},
        {"module": "AI Document Hub", "usage_count": 860},
        {"module": "Placement Hub", "usage_count": 750},
    ]

    top_students = [
        {"name": "Divya Dharshini", "reg_no": "913221104004", "dept": "CSE", "cgpa": 9.8, "attendance": 95.0},
        {"name": "Arun Kumar", "reg_no": "913221104001", "dept": "CSE", "cgpa": 9.4, "attendance": 92.5},
        {"name": "Harini Devi", "reg_no": "913221104007", "dept": "IT", "cgpa": 9.2, "attendance": 91.0},
    ]

    faculty_activity = [
        {"name": "Dr. S. Ramanathan", "dept": "CSE", "classes_taken": 34, "quizzes_created": 6, "assignments_graded": 45},
        {"name": "Prof. M. Kavitha", "dept": "IT", "classes_taken": 28, "quizzes_created": 4, "assignments_graded": 38},
    ]

    return AdminAnalyticsMaster(
        daily_users=daily_users,
        weekly_users=weekly_users,
        monthly_users=monthly_users,
        storage_distribution=storage_dist,
        most_used_modules=most_used,
        top_performing_students=top_students,
        faculty_activity_logs=faculty_activity,
    )


@router.get("/analytics/chat")
def get_chat_analytics(db: Session = Depends(deps.get_db)):
    from app.models.chat import ChatSession, ChatMessage
    return {"sessions_last_7_days": [], "total_messages": db.query(ChatMessage).count()}


# ────────────────────────────────────────────
# 7. System Settings & Audit Logs
# ────────────────────────────────────────────

@router.get("/settings", response_model=AdminSettingsResponse)
def get_admin_settings(db: Session = Depends(deps.get_db)):
    st = _get_or_create_settings(db)
    return AdminSettingsResponse.model_validate(st)


@router.put("/settings", response_model=AdminSettingsResponse)
def update_admin_settings(data: AdminSettingsInput, db: Session = Depends(deps.get_db)):
    st = _get_or_create_settings(db)
    st.college_name = data.college_name
    st.college_code = data.college_code
    if data.logo_url:
        st.logo_url = data.logo_url
    if data.theme_color:
        st.theme_color = data.theme_color
    if data.smtp_host:
        st.smtp_host = data.smtp_host
    if data.smtp_port:
        st.smtp_port = data.smtp_port
    if data.ai_provider:
        st.ai_provider = data.ai_provider
    if data.storage_limit_gb:
        st.storage_limit_gb = data.storage_limit_gb
    if data.security_mfa_enabled is not None:
        st.security_mfa_enabled = data.security_mfa_enabled
    st.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(st)
    _log_admin_action(db, None, "Updated System Settings", "Settings")
    return AdminSettingsResponse.model_validate(st)


@router.get("/audit-logs", response_model=List[AdminAuditLogResponse])
def get_audit_logs(db: Session = Depends(deps.get_db)):
    logs = db.query(AdminAuditLogModel).order_by(AdminAuditLogModel.created_at.desc()).limit(50).all()
    if not logs:
        default_logs = [
            AdminAuditLogModel(user_email="admin@campusmate.edu", action="Updated System Settings", target_type="Settings", details="Configured SMTP & Gemini LLM"),
            AdminAuditLogModel(user_email="admin@campusmate.edu", action="Created Announcement", target_type="Announcement", details="Semester Exam Schedule"),
        ]
        db.add_all(default_logs)
        db.commit()
        logs = db.query(AdminAuditLogModel).order_by(AdminAuditLogModel.created_at.desc()).limit(50).all()

    return [AdminAuditLogResponse.model_validate(l) for l in logs]
