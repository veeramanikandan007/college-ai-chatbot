from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime

from app.api.deps import get_db, require_faculty
from app.models.faculty import (
    FacultyProfileModel,
    FacultyScheduleModel,
    FacultyAttendanceRecordModel,
    FacultyAssignmentModel,
    FacultySubmissionModel,
    FacultyQuestionPaperModel,
    FacultyQuizModel,
    FacultyQuizResultModel,
    FacultyTimetableRequestModel,
)
from app.models.user import User
from app.models.notification import Notification
from app.models.student import StudentProfileModel
from app.schemas.faculty import (
    FacultyProfileResponse,
    FacultyScheduleItem,
    FacultyDashboardResponse,
    FacultyDashboardStats,
    AttendanceMarkInput,
    BulkAttendanceInput,
    AttendanceRecordResponse,
    FacultyAssignmentInput,
    FacultyAssignmentResponse,
    GradeSubmissionInput,
    FacultySubmissionResponse,
    FacultyQuestionPaperInput,
    FacultyQuestionPaperResponse,
    FacultyQuizInput,
    FacultyQuizResponse,
    FacultyQuizResultResponse,
    FacultyTimetableRequestInput,
    FacultyTimetableRequestResponse,
    StudentRosterItem,
)

router = APIRouter(dependencies=[Depends(require_faculty)])


def _get_or_create_faculty_profile(db: Session, user: User) -> FacultyProfileModel:
    profile = db.query(FacultyProfileModel).filter(FacultyProfileModel.user_id == user.id).first()
    if not profile:
        emp_id = getattr(user, 'employee_id', None) or f"FAC-{user.id:04d}"
        profile = FacultyProfileModel(
            user_id=user.id,
            employee_id=emp_id,
            department=getattr(user, 'department', None) or "Computer Science & Engineering",
            designation=getattr(user, 'designation', None) or "Senior Assistant Professor",
            office_room=getattr(user, 'office_location', None) or "Block B - 302",
            assigned_subjects="CS8591 Computer Networks, CS8492 Database Management Systems",
            assigned_sections="A, B",
        )
        try:
            db.add(profile)
            db.commit()
            db.refresh(profile)
        except Exception:
            db.rollback()
            profile = db.query(FacultyProfileModel).filter(FacultyProfileModel.user_id == user.id).first()
            if not profile:
                profile = db.query(FacultyProfileModel).first()
    return profile


# 1. Faculty Dashboard Overview
@router.get("/dashboard", response_model=FacultyDashboardResponse)
def get_faculty_dashboard(current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db, current_user)

    # Schedules
    schedules = db.query(FacultyScheduleModel).filter(FacultyScheduleModel.faculty_id == profile.id).all()
    today_schedule = [
        FacultyScheduleItem(
            id=s.id, # type: ignore
            day_of_week=s.day_of_week, # type: ignore
            period_number=s.period_number, # type: ignore
            start_time=s.start_time, # type: ignore
            end_time=s.end_time, # type: ignore
            subject_name=s.subject_name, # type: ignore
            subject_code=s.subject_code, # type: ignore
            section=s.section, # type: ignore
            classroom=s.classroom, # type: ignore
        )
        for s in schedules
    ]

    # Stats
    total_assigned_students = db.query(User).filter(User.role == "student").count()
    
    # Calculate average class attendance realistically
    total_attendance_records = db.query(FacultyAttendanceRecordModel).filter(FacultyAttendanceRecordModel.faculty_id == profile.id).count()
    present_records = db.query(FacultyAttendanceRecordModel).filter(FacultyAttendanceRecordModel.faculty_id == profile.id, FacultyAttendanceRecordModel.status == "Present").count()
    average_attendance = (present_records / total_attendance_records * 100) if total_attendance_records > 0 else 0.0

    stats = FacultyDashboardStats(
        today_classes_count=len(today_schedule),
        total_assigned_students=total_assigned_students,
        pending_submissions_count=db.query(FacultySubmissionModel).filter(FacultySubmissionModel.status == "Submitted").count(),
        average_class_attendance=round(average_attendance, 1),
        total_quizzes_created=db.query(FacultyQuizModel).filter(FacultyQuizModel.faculty_id == profile.id).count(),
        question_papers_uploaded=db.query(FacultyQuestionPaperModel).filter(FacultyQuestionPaperModel.faculty_id == profile.id).count(),
    )

    db_notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(3).all()
    notifications = []
    for idx, n in enumerate(db_notifications):
        notifications.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "time": n.created_at.strftime("%I:%M %p") if n.created_at else "Just now",
            "type": n.type if n.type else "info"
        })
    
    if not notifications:
        notifications = [
            {"id": 1, "title": "System Update", "message": "Welcome to the new Faculty Portal.", "time": "Just now", "type": "info"}
        ]


    return FacultyDashboardResponse(
        profile=FacultyProfileResponse.model_validate(profile),
        stats=stats,
        today_schedule=today_schedule,
        upcoming_classes=today_schedule[:2],
        assigned_subjects=["CS8591 Computer Networks", "CS8492 Database Systems", "CS8080 AI & Machine Learning"],
        assigned_sections=["A", "B", "C"],
        notifications=notifications,
    )


# 2. Attendance Management
@router.get("/attendance", response_model=List[AttendanceRecordResponse])
def get_faculty_attendance(
    subject_code: Optional[str] = None,
    section: Optional[str] = None,
    attendance_date: Optional[date] = None,
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db),
):
    query = db.query(FacultyAttendanceRecordModel)
    if subject_code:
        query = query.filter(FacultyAttendanceRecordModel.subject_code == subject_code)
    if section:
        query = query.filter(FacultyAttendanceRecordModel.section == section)
    if attendance_date:
        query = query.filter(FacultyAttendanceRecordModel.date == attendance_date)

    records = query.all()
    return [AttendanceRecordResponse.model_validate(r) for r in records]


@router.post("/attendance", response_model=AttendanceRecordResponse)
def mark_single_attendance(data: AttendanceMarkInput, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db, current_user)
    record = FacultyAttendanceRecordModel(
        faculty_id=profile.id,
        student_id=data.student_id,
        student_name=data.student_name,
        register_number=data.register_number,
        subject_code=data.subject_code,
        section=data.section,
        date=data.date,
        status=data.status,
        remarks=data.remarks,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return AttendanceRecordResponse.model_validate(record)


@router.post("/attendance/bulk", response_model=List[AttendanceRecordResponse])
def mark_bulk_attendance(data: BulkAttendanceInput, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db, current_user)
    result = []
    for item in data.records:
        record = FacultyAttendanceRecordModel(
            faculty_id=profile.id,
            student_id=item.student_id,
            student_name=item.student_name,
            register_number=item.register_number,
            subject_code=data.subject_code,
            section=data.section,
            date=data.date,
            status=item.status,
            remarks=item.remarks,
        )
        db.add(record)
        result.append(record)
    db.commit()
    for r in result:
        db.refresh(r)
    return [AttendanceRecordResponse.model_validate(r) for r in result]


@router.put("/attendance/{record_id}", response_model=AttendanceRecordResponse)
def edit_attendance_record(record_id: int, status_val: str = Query(...), remarks: Optional[str] = Query(None), current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    record = db.query(FacultyAttendanceRecordModel).filter(FacultyAttendanceRecordModel.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    record.status = status_val # type: ignore
    if remarks is not None:
        record.remarks = remarks # type: ignore
    db.commit()
    db.refresh(record)
    return AttendanceRecordResponse.model_validate(record)


# 3. Assignment Management
@router.get("/assignments", response_model=List[FacultyAssignmentResponse])
def get_faculty_assignments(current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db, current_user)
    assignments = db.query(FacultyAssignmentModel).filter(FacultyAssignmentModel.faculty_id == profile.id).all()
    result = []
    for a in assignments:
        sub_count = db.query(FacultySubmissionModel).filter(FacultySubmissionModel.assignment_id == a.id).count()
        graded_count = db.query(FacultySubmissionModel).filter(FacultySubmissionModel.assignment_id == a.id, FacultySubmissionModel.status == "Graded").count()
        res = FacultyAssignmentResponse.model_validate(a)
        res.submissions_count = sub_count
        res.graded_count = graded_count
        result.append(res)
    return result


@router.post("/assignments", response_model=FacultyAssignmentResponse)
def create_faculty_assignment(data: FacultyAssignmentInput, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db, current_user)
    assignment = FacultyAssignmentModel(
        faculty_id=profile.id,
        title=data.title,
        subject_code=data.subject_code,
        section=data.section,
        description=data.description,
        due_date=data.due_date,
        max_marks=data.max_marks,
        attachment_url=data.attachment_url,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    res = FacultyAssignmentResponse.model_validate(assignment)
    res.submissions_count = 0
    res.graded_count = 0
    return res


@router.put("/assignments/{assignment_id}", response_model=FacultyAssignmentResponse)
def edit_faculty_assignment(assignment_id: int, data: FacultyAssignmentInput, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    assignment = db.query(FacultyAssignmentModel).filter(FacultyAssignmentModel.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    assignment.title = data.title # type: ignore
    assignment.subject_code = data.subject_code # type: ignore
    assignment.section = data.section # type: ignore
    assignment.description = data.description # type: ignore
    assignment.due_date = data.due_date # type: ignore
    assignment.max_marks = data.max_marks # type: ignore
    if data.attachment_url:
        assignment.attachment_url = data.attachment_url # type: ignore
    db.commit()
    db.refresh(assignment)
    res = FacultyAssignmentResponse.model_validate(assignment)
    res.submissions_count = db.query(FacultySubmissionModel).filter(FacultySubmissionModel.assignment_id == assignment.id).count()
    res.graded_count = db.query(FacultySubmissionModel).filter(FacultySubmissionModel.assignment_id == assignment.id, FacultySubmissionModel.status == "Graded").count()
    return res


@router.delete("/assignments/{assignment_id}")
def delete_faculty_assignment(assignment_id: int, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    assignment = db.query(FacultyAssignmentModel).filter(FacultyAssignmentModel.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted successfully"}


@router.get("/assignments/{assignment_id}/submissions", response_model=List[FacultySubmissionResponse])
def get_assignment_submissions(assignment_id: int, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    submissions = db.query(FacultySubmissionModel).filter(FacultySubmissionModel.assignment_id == assignment_id).all()
    return [FacultySubmissionResponse.model_validate(s) for s in submissions]


@router.post("/submissions/{submission_id}/grade", response_model=FacultySubmissionResponse)
def grade_student_submission(submission_id: int, data: GradeSubmissionInput, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    sub = db.query(FacultySubmissionModel).filter(FacultySubmissionModel.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub.grade = data.grade # type: ignore
    sub.remarks = data.remarks # type: ignore
    sub.status = "Graded" # type: ignore
    db.commit()
    db.refresh(sub)
    return FacultySubmissionResponse.model_validate(sub)


# 4. Question Paper Management
@router.get("/question-papers", response_model=List[FacultyQuestionPaperResponse])
def get_faculty_question_papers(current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db, current_user)
    papers = db.query(FacultyQuestionPaperModel).filter(FacultyQuestionPaperModel.faculty_id == profile.id).all()
    return [FacultyQuestionPaperResponse.model_validate(p) for p in papers]


@router.post("/question-papers", response_model=FacultyQuestionPaperResponse)
def upload_faculty_question_paper(data: FacultyQuestionPaperInput, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db, current_user)
    paper = FacultyQuestionPaperModel(
        faculty_id=profile.id,
        title=data.title,
        subject_name=data.subject_name,
        subject_code=data.subject_code,
        department=data.department,
        semester=data.semester,
        academic_year=data.academic_year,
        exam_type=data.exam_type,
        pdf_url=data.pdf_url,
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return FacultyQuestionPaperResponse.model_validate(paper)


@router.delete("/question-papers/{paper_id}")
def delete_faculty_question_paper(paper_id: int, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    paper = db.query(FacultyQuestionPaperModel).filter(FacultyQuestionPaperModel.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Question paper not found")
    db.delete(paper)
    db.commit()
    return {"message": "Question paper deleted successfully"}


# 5. Quiz Management
@router.get("/quizzes", response_model=List[FacultyQuizResponse])
def get_faculty_quizzes(current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db, current_user)
    quizzes = db.query(FacultyQuizModel).filter(FacultyQuizModel.faculty_id == profile.id).all()
    return [FacultyQuizResponse.model_validate(q) for q in quizzes]


@router.post("/quizzes", response_model=FacultyQuizResponse)
def create_faculty_quiz(data: FacultyQuizInput, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db, current_user)
    quiz = FacultyQuizModel(
        faculty_id=profile.id,
        title=data.title,
        subject_code=data.subject_code,
        section=data.section,
        num_questions=data.num_questions,
        duration_minutes=data.duration_minutes,
        total_marks=data.total_marks,
        is_published=False,
        questions_json=data.questions_json,
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return FacultyQuizResponse.model_validate(quiz)


@router.put("/quizzes/{quiz_id}/publish", response_model=FacultyQuizResponse)
def toggle_publish_quiz(quiz_id: int, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    quiz = db.query(FacultyQuizModel).filter(FacultyQuizModel.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    quiz.is_published = not quiz.is_published # type: ignore
    db.commit()
    db.refresh(quiz)
    return FacultyQuizResponse.model_validate(quiz)


@router.delete("/quizzes/{quiz_id}")
def delete_faculty_quiz(quiz_id: int, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    quiz = db.query(FacultyQuizModel).filter(FacultyQuizModel.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully"}


@router.get("/quizzes/{quiz_id}/scores", response_model=List[FacultyQuizResultResponse])
def get_quiz_student_scores(quiz_id: int, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    results = db.query(FacultyQuizResultModel).filter(FacultyQuizResultModel.quiz_id == quiz_id).all()
    return [FacultyQuizResultResponse.model_validate(r) for r in results]


# 6. Timetable & Change Requests
@router.get("/timetable", response_model=List[FacultyScheduleItem])
def get_faculty_timetable(current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db, current_user)
    schedules = db.query(FacultyScheduleModel).filter(FacultyScheduleModel.faculty_id == profile.id).all()
    return [
        FacultyScheduleItem(
            id=s.id, # type: ignore
            day_of_week=s.day_of_week, # type: ignore
            period_number=s.period_number, # type: ignore
            start_time=s.start_time, # type: ignore
            end_time=s.end_time, # type: ignore
            subject_name=s.subject_name, # type: ignore
            subject_code=s.subject_code, # type: ignore
            section=s.section, # type: ignore
            classroom=s.classroom, # type: ignore
        )
        for s in schedules
    ]


@router.post("/timetable/change-request", response_model=FacultyTimetableRequestResponse)
def request_timetable_change(data: FacultyTimetableRequestInput, current_user: User = Depends(require_faculty), db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db, current_user)
    req = FacultyTimetableRequestModel(
        faculty_id=profile.id,
        request_date=data.request_date,
        current_period=data.current_period,
        requested_period=data.requested_period,
        reason=data.reason,
        status="Pending",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return FacultyTimetableRequestResponse.model_validate(req)


# 7. Student Roster
@router.get("/students", response_model=List[StudentRosterItem])
def get_student_roster(
    department: Optional[str] = None,
    semester: Optional[int] = None,
    section: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db),
):
    # Retrieve student users dynamically
    students = db.query(User).filter(User.role == "student").all()
    roster = []

    for student in students:
        s_profile = db.query(StudentProfileModel).filter(StudentProfileModel.user_id == student.id).first()
        dept = s_profile.department if s_profile and s_profile.department else "Computer Science"
        sem = s_profile.semester if s_profile and s_profile.semester else 6
        reg_no = s_profile.student_id if s_profile and s_profile.student_id else f"REG-{student.id:04d}"
        
        # Hardcoding section to "A" if missing for simplicity
        sec = "A"

        # Apply filters
        if department and dept != department:
            continue
        if semester and sem != semester:
            continue
        if section and sec != section:
            continue
        if search:
            q = search.lower()
            if q not in student.name.lower() and q not in reg_no.lower():
                continue
                
        # Calculate attendance percentage for this student
        total_att = db.query(FacultyAttendanceRecordModel).filter(FacultyAttendanceRecordModel.student_id == student.id).count()
        present_att = db.query(FacultyAttendanceRecordModel).filter(FacultyAttendanceRecordModel.student_id == student.id, FacultyAttendanceRecordModel.status == "Present").count()
        att_pct = (present_att / total_att * 100) if total_att > 0 else 100.0
        
        # Calculate assignment status
        pending_assg = db.query(FacultySubmissionModel).filter(FacultySubmissionModel.student_id == student.id, FacultySubmissionModel.status != "Graded").count()
        assg_status = "Pending" if pending_assg > 0 else "All Completed"

        roster.append(StudentRosterItem(
            id=student.id, # type: ignore
            student_name=student.name, # type: ignore
            register_number=reg_no, # type: ignore
            department=dept, # type: ignore
            semester=sem, # type: ignore
            section=sec,
            attendance_percentage=round(att_pct, 1),
            assignment_status=assg_status
        ))

    return roster
