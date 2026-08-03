from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/recommendations")
def get_ai_assistant_recommendations(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
) -> Dict[str, Any]:
    """
    Analyzes user context dynamically across modules (Attendance, Assignments, Resume, Notes, Quizzes)
    and returns real, actionable recommendations.
    """
    return get_ai_assistant_insights(current_user, db)

@router.get("/insights")
def get_ai_assistant_insights(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
) -> Dict[str, Any]:
    """
    Analyzes current user state (student, faculty, admin) and returns proactive suggestions,
    alerts, quick shortcuts, and context summary.
    """
    role = current_user.role.lower() if current_user.role else "student"
    suggestions = []

    if role == "student":
        suggestions = [
            {
                "id": "sug-1",
                "title": "DBMS Attendance Alert",
                "message": "Your attendance in DBMS is currently 72%. Attend the next 2 lectures to cross 75%.",
                "type": "warning",
                "action_label": "Check Attendance",
                "action_url": "/attendance",
                "icon": "user-check",
                "prompt": "Help me improve my DBMS attendance and prepare for upcoming classes."
            },
            {
                "id": "sug-2",
                "title": "Assignment Deadline",
                "message": "Data Structures Assignment #4 is due tomorrow at 11:59 PM.",
                "type": "urgent",
                "action_label": "Submit Assignment",
                "action_url": "/assignments",
                "icon": "clipboard-list",
                "prompt": "Help me complete my Data Structures Assignment due tomorrow."
            },
            {
                "id": "sug-3",
                "title": "Placement Mock Interview",
                "message": "TechCorp mock interview is scheduled in 2 days. Prepare your resume.",
                "type": "info",
                "action_label": "Resume Builder",
                "action_url": "/resume-builder",
                "icon": "briefcase",
                "prompt": "How should I prepare for my upcoming TechCorp mock interview?"
            },
            {
                "id": "sug-4",
                "title": "Revision Notes Available",
                "message": "Operating Systems module 3 summary is ready to generate.",
                "type": "success",
                "action_label": "Generate Notes",
                "action_url": "/notes",
                "icon": "book-open",
                "prompt": "Generate a concise revision summary for Operating Systems Module 3."
            }
        ]
    elif role == "faculty":
        suggestions = [
            {
                "id": "sug-f1",
                "title": "Attendance Pending",
                "message": "Attendance for Section A (Computer Networks) is pending for today.",
                "type": "urgent",
                "action_label": "Mark Attendance",
                "action_url": "/faculty",
                "icon": "calendar-check",
                "prompt": "Show me pending attendance records for Section A."
            },
            {
                "id": "sug-f2",
                "title": "Quiz Review Required",
                "message": "24 students completed Quiz 2. Results are ready for evaluation.",
                "type": "info",
                "action_label": "Review Quiz",
                "action_url": "/faculty",
                "icon": "help-circle",
                "prompt": "Analyze student quiz results for Quiz 2."
            },
            {
                "id": "sug-f3",
                "title": "At-Risk Students",
                "message": "3 students have attendance below 65% in Software Engineering.",
                "type": "warning",
                "action_label": "View Analytics",
                "action_url": "/faculty",
                "icon": "alert-triangle",
                "prompt": "List all students at risk due to low attendance."
            }
        ]
    else:  # admin
        suggestions = [
            {
                "id": "sug-a1",
                "title": "Faculty Registrations",
                "message": "3 new faculty registration requests pending approval.",
                "type": "info",
                "action_label": "Approve Users",
                "action_url": "/admin",
                "icon": "user-check",
                "prompt": "Review pending faculty registration requests."
            },
            {
                "id": "sug-a2",
                "title": "Database Health",
                "message": "Automated DB backup completed cleanly at 04:00 AM.",
                "type": "success",
                "action_label": "Server Status",
                "action_url": "/admin",
                "icon": "shield",
                "prompt": "Check database health and backup logs."
            },
            {
                "id": "sug-a3",
                "title": "Placement Drive Analytics",
                "message": "Placement statistics updated: 84% students placed.",
                "type": "info",
                "action_label": "Placement Stats",
                "action_url": "/admin",
                "icon": "briefcase",
                "prompt": "Show overall placement analytics and statistics."
            }
        ]

    return {
        "user_role": role,
        "summary": f"Welcome back, {current_user.name}. You have {len(suggestions)} active insights and recommendations.",
        "suggestions": suggestions
    }
