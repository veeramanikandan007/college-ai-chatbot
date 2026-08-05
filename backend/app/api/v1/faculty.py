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


def _get_or_create_faculty_profile(db: Session, user_id: int = 1) -> FacultyProfileModel:
    profile = db.query(FacultyProfileModel).filter(FacultyProfileModel.user_id == user_id).first()
    if not profile:
        profile = FacultyProfileModel(
            user_id=user_id,
            employee_id="FAC-2026-088",
            department="Computer Science & Engineering",
            designation="Senior Assistant Professor",
            office_room="Block B - 302",
            assigned_subjects="CS8591 Computer Networks, CS8492 Database Management Systems",
            assigned_sections="A, B",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# 1. Faculty Dashboard Overview
@router.get("/dashboard", response_model=FacultyDashboardResponse)
def get_faculty_dashboard(db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db)

    # Schedules
    schedules = db.query(FacultyScheduleModel).filter(FacultyScheduleModel.faculty_id == profile.id).all()
    today_schedule = [
        FacultyScheduleItem(
            id=s.id,
            day_of_week=s.day_of_week,
            period_number=s.period_number,
            start_time=s.start_time,
            end_time=s.end_time,
            subject_name=s.subject_name,
            subject_code=s.subject_code,
            section=s.section,
            classroom=s.classroom,
        )
        for s in schedules
    ]

    # Stats
    stats = FacultyDashboardStats(
        today_classes_count=len(today_schedule),
        total_assigned_students=64,
        pending_submissions_count=db.query(FacultySubmissionModel).filter(FacultySubmissionModel.status == "Submitted").count(),
        average_class_attendance=88.5,
        total_quizzes_created=db.query(FacultyQuizModel).filter(FacultyQuizModel.faculty_id == profile.id).count(),
        question_papers_uploaded=db.query(FacultyQuestionPaperModel).filter(FacultyQuestionPaperModel.faculty_id == profile.id).count(),
    )

    notifications = [
        {"id": 1, "title": "Assignment Submissions Pending", "message": "12 students submitted CS8591 Network Design assignment.", "time": "10 mins ago", "type": "info"},
        {"id": 2, "title": "Model Exam Schedule Published", "message": "Third year B.E. CS model exam commences next Monday.", "time": "1 hour ago", "type": "warning"},
        {"id": 3, "title": "Attendance Alert", "message": "Section A attendance report for July auto-generated.", "time": "3 hours ago", "type": "success"},
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
def mark_single_attendance(data: AttendanceMarkInput, db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db)
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
def mark_bulk_attendance(data: BulkAttendanceInput, db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db)
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
def edit_attendance_record(record_id: int, status_val: str = Query(...), remarks: Optional[str] = Query(None), db: Session = Depends(get_db)):
    record = db.query(FacultyAttendanceRecordModel).filter(FacultyAttendanceRecordModel.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    record.status = status_val
    if remarks is not None:
        record.remarks = remarks
    db.commit()
    db.refresh(record)
    return AttendanceRecordResponse.model_validate(record)


# 3. Assignment Management
@router.get("/assignments", response_model=List[FacultyAssignmentResponse])
def get_faculty_assignments(db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db)
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
def create_faculty_assignment(data: FacultyAssignmentInput, db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db)
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
def edit_faculty_assignment(assignment_id: int, data: FacultyAssignmentInput, db: Session = Depends(get_db)):
    assignment = db.query(FacultyAssignmentModel).filter(FacultyAssignmentModel.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    assignment.title = data.title
    assignment.subject_code = data.subject_code
    assignment.section = data.section
    assignment.description = data.description
    assignment.due_date = data.due_date
    assignment.max_marks = data.max_marks
    if data.attachment_url:
        assignment.attachment_url = data.attachment_url
    db.commit()
    db.refresh(assignment)
    res = FacultyAssignmentResponse.model_validate(assignment)
    res.submissions_count = db.query(FacultySubmissionModel).filter(FacultySubmissionModel.assignment_id == assignment.id).count()
    res.graded_count = db.query(FacultySubmissionModel).filter(FacultySubmissionModel.assignment_id == assignment.id, FacultySubmissionModel.status == "Graded").count()
    return res


@router.delete("/assignments/{assignment_id}")
def delete_faculty_assignment(assignment_id: int, db: Session = Depends(get_db)):
    assignment = db.query(FacultyAssignmentModel).filter(FacultyAssignmentModel.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted successfully"}


@router.get("/assignments/{assignment_id}/submissions", response_model=List[FacultySubmissionResponse])
def get_assignment_submissions(assignment_id: int, db: Session = Depends(get_db)):
    submissions = db.query(FacultySubmissionModel).filter(FacultySubmissionModel.assignment_id == assignment_id).all()
    return [FacultySubmissionResponse.model_validate(s) for s in submissions]


@router.post("/submissions/{submission_id}/grade", response_model=FacultySubmissionResponse)
def grade_student_submission(submission_id: int, data: GradeSubmissionInput, db: Session = Depends(get_db)):
    sub = db.query(FacultySubmissionModel).filter(FacultySubmissionModel.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub.grade = data.grade
    sub.remarks = data.remarks
    sub.status = "Graded"
    db.commit()
    db.refresh(sub)
    return FacultySubmissionResponse.model_validate(sub)


# 4. Question Paper Management
@router.get("/question-papers", response_model=List[FacultyQuestionPaperResponse])
def get_faculty_question_papers(db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db)
    papers = db.query(FacultyQuestionPaperModel).filter(FacultyQuestionPaperModel.faculty_id == profile.id).all()
    return [FacultyQuestionPaperResponse.model_validate(p) for p in papers]


@router.post("/question-papers", response_model=FacultyQuestionPaperResponse)
def upload_faculty_question_paper(data: FacultyQuestionPaperInput, db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db)
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
def delete_faculty_question_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(FacultyQuestionPaperModel).filter(FacultyQuestionPaperModel.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Question paper not found")
    db.delete(paper)
    db.commit()
    return {"message": "Question paper deleted successfully"}


# 5. Quiz Management
@router.get("/quizzes", response_model=List[FacultyQuizResponse])
def get_faculty_quizzes(db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db)
    quizzes = db.query(FacultyQuizModel).filter(FacultyQuizModel.faculty_id == profile.id).all()
    return [FacultyQuizResponse.model_validate(q) for q in quizzes]


@router.post("/quizzes", response_model=FacultyQuizResponse)
def create_faculty_quiz(data: FacultyQuizInput, db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db)
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
def toggle_publish_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(FacultyQuizModel).filter(FacultyQuizModel.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    quiz.is_published = not quiz.is_published
    db.commit()
    db.refresh(quiz)
    return FacultyQuizResponse.model_validate(quiz)


@router.delete("/quizzes/{quiz_id}")
def delete_faculty_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(FacultyQuizModel).filter(FacultyQuizModel.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully"}


@router.get("/quizzes/{quiz_id}/scores", response_model=List[FacultyQuizResultResponse])
def get_quiz_student_scores(quiz_id: int, db: Session = Depends(get_db)):
    results = db.query(FacultyQuizResultModel).filter(FacultyQuizResultModel.quiz_id == quiz_id).all()
    return [FacultyQuizResultResponse.model_validate(r) for r in results]


# 6. Timetable & Change Requests
@router.get("/timetable", response_model=List[FacultyScheduleItem])
def get_faculty_timetable(db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db)
    schedules = db.query(FacultyScheduleModel).filter(FacultyScheduleModel.faculty_id == profile.id).all()
    return [
        FacultyScheduleItem(
            id=s.id,
            day_of_week=s.day_of_week,
            period_number=s.period_number,
            start_time=s.start_time,
            end_time=s.end_time,
            subject_name=s.subject_name,
            subject_code=s.subject_code,
            section=s.section,
            classroom=s.classroom,
        )
        for s in schedules
    ]


@router.post("/timetable/change-request", response_model=FacultyTimetableRequestResponse)
def request_timetable_change(data: FacultyTimetableRequestInput, db: Session = Depends(get_db)):
    profile = _get_or_create_faculty_profile(db)
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
    db: Session = Depends(get_db),
):
    # Retrieve student users
    students = db.query(User).filter(User.role == "student").all()
    roster = []

    mock_roster = [
        {"id": 101, "student_name": "Arun Kumar", "register_number": "913221104001", "department": "Computer Science", "semester": 6, "section": "A", "attendance_percentage": 92.5, "assignment_status": "All Completed"},
        {"id": 102, "student_name": "Bhavya Sri", "register_number": "913221104002", "department": "Computer Science", "semester": 6, "section": "A", "attendance_percentage": 84.0, "assignment_status": "Pending"},
        {"id": 103, "student_name": "Deepak Raj", "register_number": "913221104003", "department": "Computer Science", "semester": 6, "section": "B", "attendance_percentage": 78.5, "assignment_status": "All Completed"},
        {"id": 104, "student_name": "Divya Dharshini", "register_number": "913221104004", "department": "Information Technology", "semester": 6, "section": "A", "attendance_percentage": 95.0, "assignment_status": "All Completed"},
        {"id": 105, "student_name": "Elango Pillai", "register_number": "913221104005", "department": "Computer Science", "semester": 6, "section": "B", "attendance_percentage": 68.0, "assignment_status": "Overdue"},
        {"id": 106, "student_name": "Gokul Nath", "register_number": "913221104006", "department": "Computer Science", "semester": 4, "section": "A", "attendance_percentage": 89.0, "assignment_status": "Pending"},
    ]

    for item in mock_roster:
        if department and item["department"] != department:
            continue
        if semester and item["semester"] != semester:
            continue
        if section and item["section"] != section:
            continue
        if search:
            q = search.lower()
            if q not in item["student_name"].lower() and q not in item["register_number"].lower():
                continue
        roster.append(StudentRosterItem(**item))

    return roster
