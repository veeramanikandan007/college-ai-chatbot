from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/dashboard")
def get_student_dashboard(current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Get aggregated data for the student dashboard."""
    return {
        "attendance": 94,
        "cgpa": 8.9,
        "fees_status": "Clear",
        "recent_notices": [
            {"title": "Mid-Semester Exams", "date": "August 15th", "tag": "Exam"},
            {"title": "Library Extended Hours", "date": "Next week", "tag": "Library"}
        ]
    }
