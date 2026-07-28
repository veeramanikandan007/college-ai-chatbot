from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.models.user import User
from app.models.student import Event
from app.models.notification import Notification
from app.database.engine import SessionLocal
import os, shutil

router = APIRouter()

# ────────────────────────────────────────────
#  Dashboard Stats
# ────────────────────────────────────────────

@router.get("/stats")
def get_admin_stats(
    current_user: User = Depends(deps.require_admin),
    db: Session = Depends(deps.get_db),
):
    """Return high-level dashboard metrics."""
    from app.models.user import User as UserModel
    from app.models.chat import ChatSession, ChatMessage

    total_students = db.query(UserModel).filter(UserModel.role == "student").count()
    total_admins = db.query(UserModel).filter(UserModel.role == "admin").count()
    total_sessions = db.query(ChatSession).count()
    total_messages = db.query(ChatMessage).count()

    return {
        "total_students": total_students,
        "total_admins": total_admins,
        "total_sessions": total_sessions,
        "total_messages": total_messages,
    }


# ────────────────────────────────────────────
#  Student Management
# ────────────────────────────────────────────

@router.get("/students")
def list_all_students(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(deps.require_admin),
    db: Session = Depends(deps.get_db),
):
    """List all registered students."""
    students = (
        db.query(User)
        .filter(User.role == "student")
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "department": s.department,
            "is_active": s.is_active,
            "created_at": str(s.created_at),
        }
        for s in students
    ]


@router.patch("/students/{student_id}/toggle-active")
def toggle_student_active(
    student_id: int,
    current_user: User = Depends(deps.require_admin),
    db: Session = Depends(deps.get_db),
):
    """Activate or deactivate a student account."""
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.is_active = not student.is_active
    db.commit()
    db.refresh(student)
    return {"id": student.id, "is_active": student.is_active}


@router.delete("/students/{student_id}")
def delete_student(
    student_id: int,
    current_user: User = Depends(deps.require_admin),
    db: Session = Depends(deps.get_db),
):
    """Permanently delete a student account."""
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"message": f"Student {student_id} deleted."}


# ────────────────────────────────────────────
#  Document Management (RAG)
# ────────────────────────────────────────────

DOCUMENTS_DIR = "documents"

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.require_admin),
):
    """Upload a PDF document to be indexed by the RAG pipeline."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    os.makedirs(DOCUMENTS_DIR, exist_ok=True)
    dest = os.path.join(DOCUMENTS_DIR, file.filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"message": f"'{file.filename}' uploaded successfully.", "path": dest}


@router.get("/documents")
def list_documents(current_user: User = Depends(deps.require_admin)):
    """List all uploaded documents."""
    os.makedirs(DOCUMENTS_DIR, exist_ok=True)
    files = [f for f in os.listdir(DOCUMENTS_DIR) if f.endswith(".pdf")]
    return {"documents": files, "count": len(files)}


@router.delete("/documents/{filename}")
def delete_document(filename: str, current_user: User = Depends(deps.require_admin)):
    """Delete a specific document."""
    path = os.path.join(DOCUMENTS_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found.")
    os.remove(path)
    return {"message": f"'{filename}' deleted."}


# ────────────────────────────────────────────
#  RAG Management
# ────────────────────────────────────────────

@router.post("/rag/rebuild")
def rebuild_rag_index(
    current_user: User = Depends(deps.require_admin),
    db: Session = Depends(deps.get_db),
):
    """Trigger a full rebuild of the RAG vector index from all uploaded documents."""
    try:
        from app.rag.rag_service import RAGService
        rag = RAGService()
        count = rag.build_index(DOCUMENTS_DIR)
        return {"message": f"RAG index rebuilt successfully.", "documents_indexed": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG rebuild failed: {str(e)}")


# ────────────────────────────────────────────
#  Broadcast Notifications
# ────────────────────────────────────────────

@router.post("/notifications/broadcast")
def broadcast_notification(
    title: str,
    message: str,
    current_user: User = Depends(deps.require_admin),
    db: Session = Depends(deps.get_db),
):
    """Send a notification to all active students."""
    students = db.query(User).filter(User.role == "student", User.is_active == True).all()
    for student in students:
        notif = Notification(user_id=student.id, title=title, message=message, type="Announcement", priority="normal", icon="bell")
        db.add(notif)
    db.commit()
    return {"message": f"Notification broadcast to {len(students)} students."}


# ────────────────────────────────────────────
#  Analytics
# ────────────────────────────────────────────

@router.get("/analytics/chat")
def get_chat_analytics(
    current_user: User = Depends(deps.require_admin),
    db: Session = Depends(deps.get_db),
):
    """Get aggregated chat analytics."""
    from app.models.chat import ChatSession, ChatMessage
    from sqlalchemy import func

    sessions_by_day = (
        db.query(
            func.date(ChatSession.created_at).label("date"),
            func.count(ChatSession.id).label("count"),
        )
        .group_by(func.date(ChatSession.created_at))
        .order_by(func.date(ChatSession.created_at).desc())
        .limit(7)
        .all()
    )
    total_messages = db.query(ChatMessage).count()
    avg_per_session = (
        db.query(func.avg(
            db.query(func.count(ChatMessage.id))
            .filter(ChatMessage.session_id == ChatSession.id)
            .correlate(ChatSession)
            .scalar_subquery()
        )).scalar() or 0
    )

    return {
        "sessions_last_7_days": [
            {"date": str(row.date), "count": row.count} for row in sessions_by_day
        ],
        "total_messages": total_messages,
    }
