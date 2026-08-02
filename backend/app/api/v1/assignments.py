import os
import shutil
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Any, cast

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc

from app.api import deps
from app.core.config import settings
from app.models.assignment import AssignmentModel
from app.models.user import User
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentUpdate,
    AssignmentResponse,
    AssignmentStats,
    AssignmentReminder,
    AssignmentAiRequest,
    AssignmentAiResponse,
)

router = APIRouter()

ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".doc", ".ppt", ".pptx", ".zip", ".rar", 
    ".png", ".jpg", ".jpeg", ".webp"
}

ASSIGNMENT_UPLOAD_DIR = os.path.join(settings.UPLOAD_DIR, "assignments")
os.makedirs(ASSIGNMENT_UPLOAD_DIR, exist_ok=True)

def update_overdue_statuses(db: Session):
    """Utility to auto update pending assignments past due date to Overdue."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    overdue_items = db.query(AssignmentModel).filter(
        AssignmentModel.status == "Pending",
        AssignmentModel.due_date < now
    ).all()
    if overdue_items:
        for item in overdue_items:
            setattr(item, "status", "Overdue")
        db.commit()

@router.get("", response_model=List[AssignmentResponse])
def get_assignments(
    filter_by: Optional[str] = Query("all", description="Filter: all | pending | completed | today | this_week | high_priority"),
    search: Optional[str] = Query(None, description="Search term for title, subject, faculty, status"),
    sort_by: Optional[str] = Query("due_date", description="Sort field: due_date | priority | title | created_at"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc | desc"),
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Retrieve assignments with search, filtering, and sorting."""
    update_overdue_statuses(db)
    query = db.query(AssignmentModel)

    # Search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                AssignmentModel.title.ilike(search_pattern),
                AssignmentModel.subject.ilike(search_pattern),
                AssignmentModel.faculty.ilike(search_pattern),
                AssignmentModel.status.ilike(search_pattern),
                AssignmentModel.description.ilike(search_pattern)
            )
        )

    # Filter preset
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    today_start = datetime(now.year, now.month, now.day)
    today_end = today_start + timedelta(days=1)
    week_end = today_start + timedelta(days=7)

    if filter_by == "pending":
        query = query.filter(AssignmentModel.status == "Pending")
    elif filter_by == "completed":
        query = query.filter(AssignmentModel.status == "Completed")
    elif filter_by == "today":
        query = query.filter(
            and_(
                AssignmentModel.due_date >= today_start,
                AssignmentModel.due_date < today_end
            )
        )
    elif filter_by == "this_week":
        query = query.filter(
            and_(
                AssignmentModel.due_date >= today_start,
                AssignmentModel.due_date < week_end
            )
        )
    elif filter_by == "high_priority":
        query = query.filter(AssignmentModel.priority == "High")

    # Sorting
    effective_sort_by = sort_by or "due_date"
    sort_col = getattr(AssignmentModel, effective_sort_by, AssignmentModel.due_date)
    if sort_order == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(asc(sort_col))

    return query.all()


@router.get("/stats", response_model=AssignmentStats)
def get_assignment_stats(
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Get dashboard stats summary."""
    update_overdue_statuses(db)
    total = db.query(AssignmentModel).count()
    pending = db.query(AssignmentModel).filter(AssignmentModel.status == "Pending").count()
    completed = db.query(AssignmentModel).filter(AssignmentModel.status == "Completed").count()
    overdue = db.query(AssignmentModel).filter(AssignmentModel.status == "Overdue").count()

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    next_week = now + timedelta(days=7)
    upcoming = db.query(AssignmentModel).filter(
        AssignmentModel.status == "Pending",
        AssignmentModel.due_date >= now,
        AssignmentModel.due_date <= next_week
    ).count()

    return AssignmentStats(
        total=total,
        pending=pending,
        completed=completed,
        overdue=overdue,
        upcoming=upcoming
    )


@router.get("/reminders", response_model=List[AssignmentReminder])
def get_assignment_reminders(
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Retrieve automated due date reminders (7 days, 3 days, 1 day, on due date)."""
    update_overdue_statuses(db)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    pending_assignments = db.query(AssignmentModel).filter(
        AssignmentModel.status == "Pending",
        AssignmentModel.due_date >= now - timedelta(hours=12)
    ).all()

    reminders = []
    for assg in pending_assignments:
        assg_due_date = getattr(assg, "due_date")
        delta = assg_due_date - now
        days_left = delta.days if delta.days >= 0 else 0

        reminder_type = None
        if days_left == 0:
            reminder_type = "On Due Date"
        elif days_left == 1:
            reminder_type = "1 Day Before"
        elif days_left in (2, 3):
            reminder_type = "3 Days Before"
        elif days_left in (6, 7):
            reminder_type = "7 Days Before"

        if reminder_type:
            reminders.append(
                AssignmentReminder(
                    id=int(getattr(assg, "id")),
                    title=str(getattr(assg, "title")),
                    subject=str(getattr(assg, "subject")),
                    due_date=assg_due_date,
                    reminder_type=reminder_type,
                    days_left=days_left,
                    priority=str(getattr(assg, "priority"))
                )
            )

    return reminders


@router.post("", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(
    payload: AssignmentCreate,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Create a new assignment (Admin/Faculty/Student)."""
    user_id = current_user.id if current_user else None
    
    # Clean naive datetime if provided
    due_dt = payload.due_date
    if due_dt.tzinfo is not None:
        due_dt = due_dt.astimezone(timezone.utc).replace(tzinfo=None)

    assignment = AssignmentModel(
        title=payload.title,
        subject=payload.subject,
        faculty=payload.faculty,
        description=payload.description,
        priority=payload.priority,
        due_date=due_dt,
        status=payload.status,
        attachment_name=payload.attachment_name,
        attachment_url=payload.attachment_url,
        attachment_size=payload.attachment_size,
        remarks=payload.remarks,
        assigned_class=payload.assigned_class or "All Classes",
        user_id=user_id,
        created_by=user_id
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.get("/{id}", response_model=AssignmentResponse)
def get_assignment_by_id(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Get single assignment by ID."""
    assignment = db.query(AssignmentModel).filter(AssignmentModel.id == id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment


@router.put("/{id}", response_model=AssignmentResponse)
def update_assignment(
    id: int,
    payload: AssignmentUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Update existing assignment."""
    assignment = db.query(AssignmentModel).filter(AssignmentModel.id == id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "due_date" in update_data and update_data["due_date"]:
        due_dt = update_data["due_date"]
        if due_dt.tzinfo is not None:
            due_dt = due_dt.astimezone(timezone.utc).replace(tzinfo=None)
        update_data["due_date"] = due_dt

    for key, value in update_data.items():
        setattr(assignment, key, value)

    db.commit()
    db.refresh(assignment)
    return assignment


@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_assignment(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Delete an assignment."""
    assignment = db.query(AssignmentModel).filter(AssignmentModel.id == id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted successfully", "id": id}


@router.patch("/{id}/status", response_model=AssignmentResponse)
def toggle_assignment_status(
    id: int,
    status_value: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Toggle or update status between Completed and Pending."""
    assignment = db.query(AssignmentModel).filter(AssignmentModel.id == id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    current_status = str(getattr(assignment, "status"))
    new_status = status_value if status_value else ("Completed" if current_status != "Completed" else "Pending")
    setattr(assignment, "status", new_status)

    if new_status == "Completed":
        setattr(assignment, "submission_time", datetime.now(timezone.utc).replace(tzinfo=None))
    else:
        setattr(assignment, "submission_time", None)

    db.commit()
    db.refresh(assignment)
    return assignment


@router.post("/upload")
async def upload_assignment_file(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Upload assignment files with format & 10MB size validation."""
    filename = file.filename or "file"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed: PDF, DOCX, PPT, ZIP, Images."
        )

    # Read content to check file size
    contents = await file.read()
    file_size_bytes = len(contents)
    max_size = getattr(settings, "MAX_UPLOAD_SIZE", 10485760) # 10MB

    if file_size_bytes > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {max_size / (1024*1024):.1f}MB."
        )

    # Format human readable size
    if file_size_bytes >= 1048576:
        formatted_size = f"{file_size_bytes / 1048576:.1f} MB"
    else:
        formatted_size = f"{file_size_bytes / 1024:.0f} KB"

    # Save file safely
    safe_filename = f"{int(datetime.now().timestamp())}_{filename.replace(' ', '_')}"
    save_path = os.path.join(ASSIGNMENT_UPLOAD_DIR, safe_filename)

    with open(save_path, "wb") as f:
        f.write(contents)

    file_url = f"/api/v1/assignments/download/{safe_filename}"

    return {
        "attachment_name": filename,
        "attachment_url": file_url,
        "attachment_size": formatted_size,
        "filename": safe_filename
    }


@router.get("/download/{filename}")
def download_assignment_file(filename: str):
    """Download uploaded assignment file."""
    file_path = os.path.join(ASSIGNMENT_UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File attachment not found")
    return FileResponse(file_path, filename=filename)


@router.post("/{id}/ai-action", response_model=AssignmentAiResponse)
def run_assignment_ai_action(
    id: int,
    payload: AssignmentAiRequest,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Run AI capabilities: summarize, explain, solution_outline, checklist, estimate_time, study_plan."""
    assignment = db.query(AssignmentModel).filter(AssignmentModel.id == id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    action = payload.action.lower()
    title = str(getattr(assignment, "title"))
    subject = str(getattr(assignment, "subject"))
    description = str(getattr(assignment, "description") or "No detailed description provided.")

    # Try LLM engine if key exists
    llm_output = None
    if settings.GEMINI_API_KEY:
        try:
            from llm_engine import get_llm_response
            prompt = f"Assignment Title: {title}\nSubject: {subject}\nDescription: {description}\nTask: Perform '{action}' for this assignment."
            llm_output = get_llm_response(prompt)
        except Exception:
            llm_output = None

    result_text = ""
    checklist_items = None
    study_plan_items = None
    estimated_mins = None

    if action == "summarize":
        result_text = llm_output or (
            f"Assignment Summary for '{title}' ({subject}):\n\n"
            f"This assignment requires a comprehensive solution focusing on {title}. "
            f"Key objective: {description}. Make sure to cover core theoretical concepts, "
            f"practical implementation steps, and verify edge cases before submission."
        )

    elif action == "explain":
        result_text = llm_output or (
            f"Question Explanation for '{title}':\n\n"
            f"1. Core Problem: {title} in {subject} explores essential principles.\n"
            f"2. Objective: Understand how data/logic flows in {description}.\n"
            f"3. Practical Relevance: Mastery of this topic is critical for real-world software design and exams."
        )

    elif action == "solution_outline":
        result_text = llm_output or (
            f"Solution Outline for '{title}':\n\n"
            f"Step 1: Problem Definition & Requirement Analysis\n"
            f"Step 2: Architecture & Algorithm Design\n"
            f"Step 3: Implementation & Code Structuring\n"
            f"Step 4: Unit Testing & Boundary Case Handling\n"
            f"Step 5: Documentation & Performance Benchmark Report"
        )

    elif action == "checklist":
        checklist_items = [
            f"Read assignment requirements for {title}",
            "Set up development environment and project files",
            "Draft initial architecture/algorithm logic",
            "Implement primary functionality and core functions",
            "Perform unit testing with sample inputs",
            "Prepare final report and code attachment for upload"
        ]
        result_text = f"Generated {len(checklist_items)}-step completion checklist."

    elif action == "estimate_time":
        estimated_mins = 150 # 2 hours 30 mins
        result_text = (
            f"Estimated Completion Time: 2 Hours 30 Minutes\n\n"
            f"- Planning & Analysis: 30 mins\n"
            f"- Core Implementation: 90 mins\n"
            f"- Testing & Formatting: 30 mins"
        )

    elif action == "study_plan":
        study_plan_items = [
            {"day": "Day 1", "task": "Review lecture slides and core theoretical concepts."},
            {"day": "Day 2", "task": "Write pseudo-code and build project outline."},
            {"day": "Day 3", "task": "Implement main logic and test with test cases."},
            {"day": "Day 4", "task": "Format code, write documentation, and upload final files."}
        ]
        result_text = "Structured 4-day milestone study plan generated."

    else:
        raise HTTPException(status_code=400, detail=f"Invalid AI action '{action}'")

    return AssignmentAiResponse(
        action=action,
        assignment_id=int(getattr(assignment, "id")),
        result=result_text,
        checklist=checklist_items,
        study_plan=study_plan_items,
        estimated_minutes=estimated_mins
    )
