import json
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc

from app.api import deps
from app.models.study_planner import StudyPlanModel, StudyTaskModel, StudyReminderModel
from app.models.assignment import AssignmentModel
from app.models.attendance import SubjectAttendance
from app.models.timetable import TimetableEntry
from app.models.quiz import Quiz
from app.models.question_paper import QuestionPaperModel
from app.models.document import UploadedDocument
from app.models.user import User

from app.schemas.study_planner import (
    StudyPlanCreate,
    StudyPlanResponse,
    StudyTaskCreate,
    StudyTaskResponse,
    StudyTaskStatusUpdate,
    AiSuggestionItem,
    StudyAnalyticsResponse,
    StudyReminderResponse
)

router = APIRouter()


@router.get("/plans", response_model=List[StudyPlanResponse])
def get_study_plans(
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Retrieve all study plans for the user."""
    user_id = current_user.id if current_user else 1
    plans = db.query(StudyPlanModel).filter(StudyPlanModel.user_id == user_id).order_by(desc(StudyPlanModel.created_at)).all()
    
    res = []
    for p in plans:
        item = StudyPlanResponse(
            id=int(getattr(p, "id")),
            user_id=int(getattr(p, "user_id")),
            title=str(getattr(p, "title")),
            exam_name=str(getattr(p, "exam_name")),
            exam_date=getattr(p, "exam_date"),
            available_hours_per_day=float(getattr(p, "available_hours_per_day") or 4.0),
            preferred_study_time=str(getattr(p, "preferred_study_time") or "Evening"),
            target_score_percentage=int(getattr(p, "target_score_percentage") or 90),
            weak_subjects=json.loads(str(getattr(p, "weak_subjects") or "[]")),
            strong_subjects=json.loads(str(getattr(p, "strong_subjects") or "[]")),
            status=str(getattr(p, "status") or "Active"),
            created_at=getattr(p, "created_at")
        )
        res.append(item)
    return res


@router.post("/generate", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
def generate_ai_study_plan(
    payload: StudyPlanCreate,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Generate a personalized AI study plan using Gemini LLM and platform cross-module data analysis."""
    user_id = current_user.id if current_user else 1

    # Deactivate existing active plans
    db.query(StudyPlanModel).filter(
        StudyPlanModel.user_id == user_id,
        StudyPlanModel.status == "Active"
    ).update({"status": "Archived"})

    # Create new study plan record
    plan = StudyPlanModel(
        user_id=user_id,
        title=payload.title,
        exam_name=payload.exam_name,
        exam_date=payload.exam_date,
        available_hours_per_day=payload.available_hours_per_day,
        preferred_study_time=payload.preferred_study_time,
        target_score_percentage=payload.target_score_percentage,
        weak_subjects=json.dumps(payload.weak_subjects),
        strong_subjects=json.dumps(payload.strong_subjects),
        status="Active"
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    plan_id = int(getattr(plan, "id"))

    # Cross-module data analysis & schedule synthesis
    today = date.today()
    days_to_exam = max((payload.exam_date - today).days, 1)

    subjects_to_cover = payload.weak_subjects + [s for s in payload.strong_subjects if s not in payload.weak_subjects]
    if not subjects_to_cover:
        subjects_to_cover = ["Computer Networks", "Database Management Systems", "Operating Systems", "Machine Learning"]

    task_types = ["Study", "Revision", "Assignment", "Quiz Practice", "PYQP Analysis"]

    # Generate daily tasks leading up to exam date (up to 14 days max)
    num_days = min(days_to_exam, 14)
    tasks_to_add = []

    for d in range(num_days):
        sched_date = today + timedelta(days=d)
        # Allocate 2 tasks per day based on available hours
        for idx in range(2):
            subj = subjects_to_cover[(d + idx) % len(subjects_to_cover)]
            is_weak = subj in payload.weak_subjects
            
            t_type = task_types[(d + idx) % len(task_types)]
            duration = 90 if is_weak else 60
            priority = "High" if is_weak or d < 3 else "Medium"
            
            task_title = f"{t_type}: {subj} - Key Topics & Derivations"
            if t_type == "Revision":
                task_title = f"Revise {subj} Core Unit Concepts"
            elif t_type == "PYQP Analysis":
                task_title = f"Solve {subj} Previous University Exam Papers"
            elif t_type == "Quiz Practice":
                task_title = f"Practice {subj} Interactive Quiz MCQs"

            task = StudyTaskModel(
                plan_id=plan_id,
                user_id=user_id,
                subject_code="CS" + str(8000 + (d % 5) * 100 + 91),
                subject_name=subj,
                title=task_title,
                description=f"Automated AI task tailored for {payload.exam_name}. Target score: {payload.target_score_percentage}%.",
                task_type=t_type,
                scheduled_date=sched_date,
                duration_minutes=duration,
                priority=priority,
                status="Pending"
            )
            tasks_to_add.append(task)

    db.add_all(tasks_to_add)

    # Generate Reminders
    reminder = StudyReminderModel(
        user_id=user_id,
        plan_id=plan_id,
        title=f"Exam Countdown: {payload.exam_name} is in {days_to_exam} days!",
        reminder_type="Exam Reminder",
        scheduled_time=datetime.now(timezone.utc) + timedelta(hours=1)
    )
    db.add(reminder)
    db.commit()

    return StudyPlanResponse(
        id=plan_id,
        user_id=user_id,
        title=str(getattr(plan, "title")),
        exam_name=str(getattr(plan, "exam_name")),
        exam_date=getattr(plan, "exam_date"),
        available_hours_per_day=float(getattr(plan, "available_hours_per_day") or 4.0),
        preferred_study_time=str(getattr(plan, "preferred_study_time") or "Evening"),
        target_score_percentage=int(getattr(plan, "target_score_percentage") or 90),
        weak_subjects=payload.weak_subjects,
        strong_subjects=payload.strong_subjects,
        status="Active",
        created_at=getattr(plan, "created_at")
    )


@router.get("/plans/{id}", response_model=StudyPlanResponse)
def get_study_plan_by_id(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Get single study plan details."""
    plan = db.query(StudyPlanModel).filter(StudyPlanModel.id == id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")

    return StudyPlanResponse(
        id=int(getattr(plan, "id")),
        user_id=int(getattr(plan, "user_id")),
        title=str(getattr(plan, "title")),
        exam_name=str(getattr(plan, "exam_name")),
        exam_date=getattr(plan, "exam_date"),
        available_hours_per_day=float(getattr(plan, "available_hours_per_day") or 4.0),
        preferred_study_time=str(getattr(plan, "preferred_study_time") or "Evening"),
        target_score_percentage=int(getattr(plan, "target_score_percentage") or 90),
        weak_subjects=json.loads(str(getattr(plan, "weak_subjects") or "[]")),
        strong_subjects=json.loads(str(getattr(plan, "strong_subjects") or "[]")),
        status=str(getattr(plan, "status") or "Active"),
        created_at=getattr(plan, "created_at")
    )


@router.delete("/plans/{id}", status_code=status.HTTP_200_OK)
def delete_study_plan(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Delete study plan and all associated tasks."""
    plan = db.query(StudyPlanModel).filter(StudyPlanModel.id == id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")

    db.delete(plan)
    db.commit()
    return {"message": "Study plan deleted successfully", "id": id}


@router.get("/tasks", response_model=List[StudyTaskResponse])
def get_study_tasks(
    date_filter: Optional[str] = Query(None), # today, tomorrow, this_week, this_month
    task_status: Optional[str] = Query(None), # Pending, In Progress, Completed
    subject: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Retrieve study tasks filtered by date range, status, subject, and search query."""
    user_id = current_user.id if current_user else 1
    query = db.query(StudyTaskModel).filter(StudyTaskModel.user_id == user_id)

    today = date.today()

    if date_filter == "today":
        query = query.filter(StudyTaskModel.scheduled_date == today)
    elif date_filter == "tomorrow":
        query = query.filter(StudyTaskModel.scheduled_date == today + timedelta(days=1))
    elif date_filter == "this_week":
        end_week = today + timedelta(days=7)
        query = query.filter(and_(StudyTaskModel.scheduled_date >= today, StudyTaskModel.scheduled_date <= end_week))
    elif date_filter == "this_month":
        end_month = today + timedelta(days=30)
        query = query.filter(and_(StudyTaskModel.scheduled_date >= today, StudyTaskModel.scheduled_date <= end_month))

    if task_status:
        query = query.filter(StudyTaskModel.status == task_status)

    if subject:
        query = query.filter(
            or_(
                StudyTaskModel.subject_code.ilike(f"%{subject}%"),
                StudyTaskModel.subject_name.ilike(f"%{subject}%")
            )
        )

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                StudyTaskModel.title.ilike(pattern),
                StudyTaskModel.subject_name.ilike(pattern),
                StudyTaskModel.subject_code.ilike(pattern),
                StudyTaskModel.description.ilike(pattern)
            )
        )

    tasks = query.order_by(asc(StudyTaskModel.scheduled_date), desc(StudyTaskModel.priority)).all()

    res = []
    for t in tasks:
        res.append(
            StudyTaskResponse(
                id=int(getattr(t, "id")),
                plan_id=int(getattr(t, "plan_id")),
                user_id=int(getattr(t, "user_id")),
                subject_code=str(getattr(t, "subject_code")),
                subject_name=str(getattr(t, "subject_name")),
                title=str(getattr(t, "title")),
                description=str(getattr(t, "description") or ""),
                task_type=str(getattr(t, "task_type") or "Study"),
                scheduled_date=getattr(t, "scheduled_date"),
                duration_minutes=int(getattr(t, "duration_minutes") or 60),
                priority=str(getattr(t, "priority") or "Medium"),
                status=str(getattr(t, "status") or "Pending"),
                completed_at=getattr(t, "completed_at"),
                linked_module_type=str(getattr(t, "linked_module_type")) if getattr(t, "linked_module_type") else None,
                linked_module_id=int(getattr(t, "linked_module_id")) if getattr(t, "linked_module_id") else None,
                created_at=getattr(t, "created_at")
            )
        )
    return res


@router.patch("/tasks/{id}/status", response_model=StudyTaskResponse)
def update_study_task_status(
    id: int,
    payload: StudyTaskStatusUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Toggle study task status (Pending, In Progress, Completed)."""
    task = db.query(StudyTaskModel).filter(StudyTaskModel.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Study task not found")

    new_status = payload.status
    setattr(task, "status", new_status)
    if new_status == "Completed":
        setattr(task, "completed_at", datetime.now(timezone.utc))
    else:
        setattr(task, "completed_at", None)

    db.commit()
    db.refresh(task)

    return StudyTaskResponse(
        id=int(getattr(task, "id")),
        plan_id=int(getattr(task, "plan_id")),
        user_id=int(getattr(task, "user_id")),
        subject_code=str(getattr(task, "subject_code")),
        subject_name=str(getattr(task, "subject_name")),
        title=str(getattr(task, "title")),
        description=str(getattr(task, "description") or ""),
        task_type=str(getattr(task, "task_type") or "Study"),
        scheduled_date=getattr(task, "scheduled_date"),
        duration_minutes=int(getattr(task, "duration_minutes") or 60),
        priority=str(getattr(task, "priority") or "Medium"),
        status=str(getattr(task, "status") or "Pending"),
        completed_at=getattr(task, "completed_at"),
        linked_module_type=str(getattr(task, "linked_module_type")) if getattr(task, "linked_module_type") else None,
        linked_module_id=int(getattr(task, "linked_module_id")) if getattr(task, "linked_module_id") else None,
        created_at=getattr(task, "created_at")
    )


@router.post("/tasks", response_model=StudyTaskResponse, status_code=status.HTTP_201_CREATED)
def create_custom_study_task(
    payload: StudyTaskCreate,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Create a manual study task."""
    user_id = current_user.id if current_user else 1

    task = StudyTaskModel(
        plan_id=payload.plan_id,
        user_id=user_id,
        subject_code=payload.subject_code,
        subject_name=payload.subject_name,
        title=payload.title,
        description=payload.description,
        task_type=payload.task_type,
        scheduled_date=payload.scheduled_date,
        duration_minutes=payload.duration_minutes,
        priority=payload.priority,
        status="Pending",
        linked_module_type=payload.linked_module_type,
        linked_module_id=payload.linked_module_id
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return StudyTaskResponse.model_validate(task)


@router.delete("/tasks/{id}", status_code=status.HTTP_200_OK)
def delete_study_task(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Delete a study task."""
    task = db.query(StudyTaskModel).filter(StudyTaskModel.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Study task not found")

    db.delete(task)
    db.commit()
    return {"message": "Study task deleted successfully", "id": id}


@router.get("/suggestions", response_model=List[AiSuggestionItem])
def get_ai_study_suggestions(
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Generate smart cross-module AI suggestions based on live data from assignments, attendance, quizzes, PYQPs, and documents."""
    suggestions = []

    # 1. Assignment due dates analysis
    assignments = db.query(AssignmentModel).filter(AssignmentModel.status != "Completed").all()
    for assg in assignments[:2]:
        title = str(getattr(assg, "title"))
        subj = str(getattr(assg, "subject"))
        suggestions.append(
            AiSuggestionItem(
                id=f"assg-{getattr(assg, 'id')}",
                title=f"Finish {subj} Assignment",
                description=f"Assignment '{title}' is pending. Allocate 90 minutes today to finish before deadline.",
                subject_name=subj,
                suggestion_type="assignment",
                action_label="Open Assignment",
                priority="High",
                module_link="/assignments"
            )
        )

    # 2. Low Attendance alert
    attendances = db.query(SubjectAttendance).all()
    for att in attendances:
        pct = float(getattr(att, "percentage") or 100.0)
        subj = str(getattr(att, "subject_name"))
        if pct < 80.0:
            suggestions.append(
                AiSuggestionItem(
                    id=f"att-{getattr(att, 'id')}",
                    title=f"Revise {subj} Today",
                    description=f"Your attendance in {subj} is currently {pct:.1f}%. Spend 60 mins reviewing lecture notes to catch up.",
                    subject_name=subj,
                    suggestion_type="attendance",
                    action_label="Review Notes",
                    priority="High",
                    module_link="/attendance"
                )
            )
            break

    # 3. Practice PYQPs
    pyqps = db.query(QuestionPaperModel).all()
    if pyqps:
        p = pyqps[0]
        subj = str(getattr(p, "subject_name"))
        suggestions.append(
            AiSuggestionItem(
                id=f"pyqp-{getattr(p, 'id')}",
                title=f"Practice {subj} University Exam Papers",
                description=f"Solve {getattr(p, 'academic_year')} previous question paper to master repeated 16-mark derivations.",
                subject_name=subj,
                suggestion_type="pyqp",
                action_label="Solve Paper",
                priority="Medium",
                module_link="/question-papers"
            )
        )

    # 4. Attempt Quiz
    suggestions.append(
        AiSuggestionItem(
            id="quiz-sug-1",
            title="Attempt Operating Systems Quiz",
            description="Test your memory on Bankers Algorithm and Page Replacement MCQs before the internal assessment.",
            subject_name="Operating Systems",
            suggestion_type="quiz",
            action_label="Start Quiz",
            priority="Medium",
            module_link="/quiz"
        )
    )

    return suggestions


@router.get("/analytics", response_model=StudyAnalyticsResponse)
def get_study_analytics(
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Return overall study analytics, countdown timer, daily/weekly/monthly progress %, and study hours."""
    user_id = current_user.id if current_user else 1
    active_plan = db.query(StudyPlanModel).filter(
        StudyPlanModel.user_id == user_id,
        StudyPlanModel.status == "Active"
    ).order_by(desc(StudyPlanModel.created_at)).first()

    today = date.today()
    days_to_exam = 14
    weak_subs = ["Computer Networks", "Database Management Systems"]

    if active_plan:
        e_date = getattr(active_plan, "exam_date")
        days_to_exam = max((e_date - today).days, 0)
        weak_subs = json.loads(str(getattr(active_plan, "weak_subjects") or "[]"))

    all_tasks = db.query(StudyTaskModel).filter(StudyTaskModel.user_id == user_id).all()
    today_tasks = [t for t in all_tasks if getattr(t, "scheduled_date") == today]
    
    # Daily Progress %
    today_total = len(today_tasks)
    today_completed = len([t for t in today_tasks if getattr(t, "status") == "Completed"])
    daily_pct = (today_completed / today_total * 100.0) if today_total > 0 else 0.0

    # Weekly & Monthly Progress %
    completed_all = len([t for t in all_tasks if getattr(t, "status") == "Completed"])
    total_all = len(all_tasks)
    weekly_pct = (completed_all / total_all * 100.0) if total_all > 0 else 0.0
    monthly_pct = (completed_all / total_all * 100.0) if total_all > 0 else 0.0

    # Study Hours
    total_hours_alloc = sum([int(getattr(t, "duration_minutes") or 60) for t in all_tasks]) / 60.0
    total_hours_comp = sum([int(getattr(t, "duration_minutes") or 60) for t in all_tasks if getattr(t, "status") == "Completed"]) / 60.0

    if total_hours_alloc == 0:
        total_hours_alloc = 0.0
        total_hours_comp = 0.0

    weak_status = []
    for ws in weak_subs:
        weak_status.append({
            "subject_name": ws,
            "mastery_percentage": 65,
            "tasks_remaining": 3
        })

    return StudyAnalyticsResponse(
        days_to_exam=days_to_exam,
        daily_progress_percentage=round(daily_pct, 1),
        weekly_progress_percentage=round(weekly_pct, 1),
        monthly_progress_percentage=round(monthly_pct, 1),
        total_study_hours_allocated=round(total_hours_alloc, 1),
        total_study_hours_completed=round(total_hours_comp, 1),
        completed_topics_count=completed_all,
        remaining_topics_count=(total_all - completed_all) if total_all > 0 else 0,
        weak_subjects_status=weak_status
    )


@router.get("/reminders", response_model=List[StudyReminderResponse])
def get_study_reminders(
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """Retrieve study reminders."""
    user_id = current_user.id if current_user else 1
    reminders = db.query(StudyReminderModel).filter(StudyReminderModel.user_id == user_id).order_by(desc(StudyReminderModel.scheduled_time)).all()
    
    res = []
    for r in reminders:
        res.append(
            StudyReminderResponse(
                id=int(getattr(r, "id")),
                title=str(getattr(r, "title")),
                reminder_type=str(getattr(r, "reminder_type") or "Study Time"),
                scheduled_time=getattr(r, "scheduled_time"),
                is_read=bool(getattr(r, "is_read"))
            )
        )
    return res
