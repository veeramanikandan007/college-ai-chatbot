import json
from typing import Optional
from sqlalchemy.orm import Session
from app.database.engine import engine, SessionLocal
from app.database.base import Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.notification import Notification
from app.models.student import Attendance, TimetableEntry, Assignment, Fee, Event, Note, LibraryBook
from datetime import date, datetime, timedelta, timezone

def init_db(db: Optional[Session] = None):
    # Import all models to ensure they are registered with Base.metadata
    from app.models import user, chat, document, student, notification, quiz, attendance, placement, timetable, assignment, question_paper, study_planner, mock_interview, student_analytics, note, ocr, workspace
    from app.models.note import NoteModel
    from app.models.ocr import OCRScanModel
    from app.models.workspace import WorkspaceModel
    from app.models.assignment import AssignmentModel
    from app.models.question_paper import QuestionPaperModel
    from app.models.study_planner import StudyPlanModel, StudyTaskModel, StudyReminderModel
    from app.models.mock_interview import MockInterviewModel, InterviewQaLogModel
    from app.models.student_analytics import StudentGoalModel, StudentStreakModel

    # Check and migrate legacy assignments and subjects tables if missing new columns
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    if "assignments" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("assignments")]
        if "faculty" not in columns:
            with engine.connect() as conn:
                conn.execute(text("DROP TABLE assignments"))
                conn.commit()

    if "subjects" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("subjects")]
        if "department" not in columns:
            with engine.connect() as conn:
                conn.execute(text("DROP TABLE subjects"))
                conn.commit()

    if "resume_profiles" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("resume_profiles")]
        with engine.connect() as conn:
            if "template" not in columns:
                conn.execute(text("ALTER TABLE resume_profiles ADD COLUMN template VARCHAR DEFAULT 'modern'"))
            if "created_at" not in columns:
                conn.execute(text("ALTER TABLE resume_profiles ADD COLUMN created_at DATETIME"))
            if "suggestions" not in columns:
                conn.execute(text("ALTER TABLE resume_profiles ADD COLUMN suggestions TEXT"))
            conn.commit()

    if "uploaded_documents" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("uploaded_documents")]
        with engine.connect() as conn:
            if "folder_name" not in columns:
                conn.execute(text("ALTER TABLE uploaded_documents ADD COLUMN folder_name VARCHAR DEFAULT 'General'"))
            if "is_pinned" not in columns:
                conn.execute(text("ALTER TABLE uploaded_documents ADD COLUMN is_pinned BOOLEAN DEFAULT 0"))
            if "is_favorite" not in columns:
                conn.execute(text("ALTER TABLE uploaded_documents ADD COLUMN is_favorite BOOLEAN DEFAULT 0"))
            if "is_indexed" not in columns:
                conn.execute(text("ALTER TABLE uploaded_documents ADD COLUMN is_indexed BOOLEAN DEFAULT 0"))
            if "chunk_count" not in columns:
                conn.execute(text("ALTER TABLE uploaded_documents ADD COLUMN chunk_count INTEGER DEFAULT 0"))
            if "summary" not in columns:
                conn.execute(text("ALTER TABLE uploaded_documents ADD COLUMN summary TEXT"))
            if "keywords" not in columns:
                conn.execute(text("ALTER TABLE uploaded_documents ADD COLUMN keywords TEXT"))
            if "topics" not in columns:
                conn.execute(text("ALTER TABLE uploaded_documents ADD COLUMN topics TEXT"))
            if "estimated_reading_time" not in columns:
                conn.execute(text("ALTER TABLE uploaded_documents ADD COLUMN estimated_reading_time INTEGER DEFAULT 5"))
            if "difficulty" not in columns:
                conn.execute(text("ALTER TABLE uploaded_documents ADD COLUMN difficulty VARCHAR DEFAULT 'Intermediate'"))
            if "extracted_text" not in columns:
                conn.execute(text("ALTER TABLE uploaded_documents ADD COLUMN extracted_text TEXT"))
            conn.commit()

    Base.metadata.create_all(bind=engine)

    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@campusmate.edu").first()
        if not admin:
            admin_user = User(
                name="Admin User",
                email="admin@campusmate.edu",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            # Seed demo notifications for admin
            demo_notifications = [
                Notification(user_id=admin_user.id, title="Exam Tomorrow", message="Your final exam for CS101 starts at 9:00 AM.", type="Academic", priority="high", icon="book"),
                Notification(user_id=admin_user.id, title="Assignment Due", message="Machine Learning assignment is due in 2 hours.", type="Academic", priority="high", icon="file-text"),
                Notification(user_id=admin_user.id, title="AI Document Indexed", message="Your uploaded syllabus has been successfully indexed by CampusMate AI.", type="AI", priority="normal", icon="check-circle"),
                Notification(user_id=admin_user.id, title="Attendance Warning", message="Your attendance in Physics has dropped below 75%.", type="Alert", priority="high", icon="alert-triangle"),
                Notification(user_id=admin_user.id, title="Fee Reminder", message="Semester 4 tuition fee is due next week.", type="Administrative", priority="normal", icon="dollar-sign"),
                Notification(user_id=admin_user.id, title="Holiday Announcement", message="The campus will be closed on Friday for the public holiday.", type="Announcement", priority="low", icon="calendar")
            ]
            db.add_all(demo_notifications)
            db.commit()

        # Seed Demo Faculty
        demo_faculty = db.query(User).filter(User.email == "faculty@campusmate.edu").first()
        if not demo_faculty:
            demo_faculty = User(
                name="Dr. Aris Thorne",
                email="faculty@campusmate.edu",
                hashed_password=get_password_hash("faculty123"),
                role="faculty",
                department="Computer Science & Engineering",
                is_active=True
            )
            db.add(demo_faculty)
            db.commit()
            db.refresh(demo_faculty)

        # Seed Demo Student
        demo_student = db.query(User).filter(User.email == "student@campusmate.edu").first()
        if not demo_student:
            demo_student = User(
                name="Alex Johnson",
                email="student@campusmate.edu",
                hashed_password=get_password_hash("student123"),
                role="student",
                department="Computer Science & Engineering",
                year=3,
                semester=5,
                student_id="CSE2024042",
                phone="+1 (555) 234-5678",
                is_active=True
            )
            db.add(demo_student)
            db.commit()
            db.refresh(demo_student)

            # Seed Student Attendance
            attendances = [
                Attendance(user_id=demo_student.id, subject="Data Structures & Algorithms", date=date.today() - timedelta(days=1), status="present", semester=5),
                Attendance(user_id=demo_student.id, subject="Database Management Systems", date=date.today() - timedelta(days=2), status="present", semester=5),
                Attendance(user_id=demo_student.id, subject="Operating Systems", date=date.today() - timedelta(days=3), status="present", semester=5),
                Attendance(user_id=demo_student.id, subject="Computer Networks", date=date.today() - timedelta(days=4), status="absent", semester=5),
                Attendance(user_id=demo_student.id, subject="Machine Learning", date=date.today() - timedelta(days=5), status="present", semester=5),
            ]
            db.add_all(attendances)

            # Seed Student Timetable
            timetables = [
                TimetableEntry(department="Computer Science & Engineering", year=3, semester=5, day_of_week="Monday", period="9:00 AM - 10:00 AM", subject="Data Structures & Algorithms", faculty="Dr. Smith", room="Lab 3"),
                TimetableEntry(department="Computer Science & Engineering", year=3, semester=5, day_of_week="Monday", period="10:15 AM - 11:15 AM", subject="Operating Systems", faculty="Prof. Davis", room="Room 204"),
                TimetableEntry(department="Computer Science & Engineering", year=3, semester=5, day_of_week="Tuesday", period="9:00 AM - 10:00 AM", subject="Database Management Systems", faculty="Dr. Allen", room="Room 102"),
                TimetableEntry(department="Computer Science & Engineering", year=3, semester=5, day_of_week="Wednesday", period="11:30 AM - 12:30 PM", subject="Machine Learning", faculty="Dr. Patel", room="AI Lab"),
            ]
            db.add_all(timetables)

            # Seed Fees
            fees = [
                Fee(user_id=demo_student.id, semester=5, amount=4500.00, due_date=date.today() + timedelta(days=15), paid_amount=3000.00, status="partial"),
            ]
            db.add_all(fees)

            # Seed Library Books
            books = [
                LibraryBook(title="Introduction to Algorithms", author="Cormen, Leiserson, Rivest, Stein", isbn="9780262033848", category="Computer Science", available_copies=5, total_copies=10),
                LibraryBook(title="Database System Concepts", author="Silberschatz, Korth, Sudarshan", isbn="9780073523323", category="Computer Science", available_copies=3, total_copies=8),
                LibraryBook(title="Operating System Concepts", author="Silberschatz, Galvin, Gagne", isbn="9781118063330", category="Computer Science", available_copies=2, total_copies=6),
            ]
            db.add_all(books)

            # Seed Initial Assignments
            if db.query(AssignmentModel).count() == 0:
                now_dt = datetime.now()
                assignments_seed = [
                    AssignmentModel(
                        title="B-Tree & B+ Tree Implementation",
                        subject="Data Structures & Algorithms",
                        faculty="Dr. Aris Thorne",
                        description="Implement B-Tree and B+ Tree data structures in Python/C++ with search, insertion, and deletion algorithms.",
                        priority="High",
                        due_date=now_dt + timedelta(days=1),
                        status="Pending",
                        attachment_name="btree_assignment_spec.pdf",
                        attachment_url="/api/v1/assignments/download/btree_assignment_spec.pdf",
                        attachment_size="1.2 MB",
                        remarks="Focus on node splitting and merging edge cases.",
                        assigned_class="CSE-3A",
                        user_id=demo_student.id,
                        created_by=admin.id if admin else None
                    ),
                    AssignmentModel(
                        title="Virtual Memory Management & Page Replacement",
                        subject="Operating Systems",
                        faculty="Prof. Clara Vance",
                        description="Write a technical report evaluating FIFO, LRU, and Optimal page replacement algorithms under varying frame sizes.",
                        priority="High",
                        due_date=now_dt + timedelta(days=3),
                        status="Pending",
                        attachment_name="page_replacement_lab.docx",
                        attachment_url="/api/v1/assignments/download/page_replacement_lab.docx",
                        attachment_size="850 KB",
                        remarks="Include page fault graph comparison.",
                        assigned_class="CSE-3A",
                        user_id=demo_student.id,
                        created_by=admin.id if admin else None
                    ),
                    AssignmentModel(
                        title="Relational Schema Design & SQL Optimization",
                        subject="Database Systems",
                        faculty="Dr. Marcus Brody",
                        description="Design 3NF normalized schema for campus library system with indexes, trigger constraints, and query tuning.",
                        priority="Medium",
                        due_date=now_dt + timedelta(days=5),
                        status="Pending",
                        attachment_name="library_schema_spec.pdf",
                        attachment_url="/api/v1/assignments/download/library_schema_spec.pdf",
                        attachment_size="2.4 MB",
                        remarks="Use EXPLAIN ANALYZE on query plans.",
                        assigned_class="CSE-3A",
                        user_id=demo_student.id,
                        created_by=admin.id if admin else None
                    ),
                    AssignmentModel(
                        title="Gradient Descent & Loss Functions",
                        subject="Machine Learning",
                        faculty="Dr. Sophia Lin",
                        description="Notebook assignment implementing Stochastic Gradient Descent from scratch and comparing MSE vs Cross-Entropy loss.",
                        priority="Medium",
                        due_date=now_dt - timedelta(days=2),
                        status="Completed",
                        attachment_name="ml_lab_submission.ipynb",
                        attachment_url="/api/v1/assignments/download/ml_lab_submission.ipynb",
                        attachment_size="3.1 MB",
                        submission_time=now_dt - timedelta(days=2),
                        remarks="Graded 19/20 - Great hyperparameter tuning.",
                        assigned_class="CSE-3A",
                        user_id=demo_student.id,
                        created_by=admin.id if admin else None
                    ),
                    AssignmentModel(
                        title="TCP/IP Socket Chat Server",
                        subject="Computer Networks",
                        faculty="Prof. Robert Sterling",
                        description="Build a multi-threaded TCP socket server supporting room broadcasting and client heartbeat checks.",
                        priority="High",
                        due_date=now_dt - timedelta(days=1),
                        status="Overdue",
                        attachment_name="socket_server_guide.zip",
                        attachment_url="/api/v1/assignments/download/socket_server_guide.zip",
                        attachment_size="4.5 MB",
                        remarks="Late submission allowed with 10% penalty per day.",
                        assigned_class="CSE-3A",
                        user_id=demo_student.id,
                        created_by=admin.id if admin else None
                    )
                ]
                db.add_all(assignments_seed)

            # Seed Question Papers
            if db.query(QuestionPaperModel).count() == 0:
                pyqp_seed = [
                    QuestionPaperModel(
                        title="Data Structures & Algorithms - Nov/Dec 2023 University Exam",
                        subject_code="CS8391",
                        subject_name="Data Structures & Algorithms",
                        department="Computer Science & Engineering",
                        semester=3,
                        academic_year=2023,
                        regulation="R2021",
                        exam_type="University Exam",
                        faculty_name="Dr. Aris Thorne",
                        file_name="CS8391_NovDec_2023.pdf",
                        file_url="/api/v1/question-papers/download/CS8391_NovDec_2023.pdf",
                        file_size="1.8 MB",
                        page_count=5,
                        uploaded_by=admin.id if admin else None
                    ),
                    QuestionPaperModel(
                        title="Operating Systems - April/May 2023 Model Examination",
                        subject_code="CS8492",
                        subject_name="Operating Systems",
                        department="Computer Science & Engineering",
                        semester=4,
                        academic_year=2023,
                        regulation="R2021",
                        exam_type="Model Exam",
                        faculty_name="Prof. Clara Vance",
                        file_name="CS8492_Model_2023.pdf",
                        file_url="/api/v1/question-papers/download/CS8492_Model_2023.pdf",
                        file_size="1.2 MB",
                        page_count=4,
                        uploaded_by=admin.id if admin else None
                    ),
                    QuestionPaperModel(
                        title="Database Management Systems - Nov/Dec 2022 University Exam",
                        subject_code="CS8491",
                        subject_name="Database Management Systems",
                        department="Computer Science & Engineering",
                        semester=4,
                        academic_year=2022,
                        regulation="R2017",
                        exam_type="University Exam",
                        faculty_name="Dr. Marcus Brody",
                        file_name="CS8491_NovDec_2022.pdf",
                        file_url="/api/v1/question-papers/download/CS8491_NovDec_2022.pdf",
                        file_size="2.1 MB",
                        page_count=6,
                        uploaded_by=admin.id if admin else None
                    ),
                    QuestionPaperModel(
                        title="Computer Networks - Internal Assessment II 2024",
                        subject_code="CS8591",
                        subject_name="Computer Networks",
                        department="Computer Science & Engineering",
                        semester=5,
                        academic_year=2024,
                        regulation="R2021",
                        exam_type="Internal",
                        faculty_name="Prof. Robert Sterling",
                        file_name="CS8591_Internal2_2024.pdf",
                        file_url="/api/v1/question-papers/download/CS8591_Internal2_2024.pdf",
                        file_size="950 KB",
                        page_count=3,
                        uploaded_by=admin.id if admin else None
                    ),
                    QuestionPaperModel(
                        title="Machine Learning - Nov/Dec 2023 University Exam",
                        subject_code="AD8551",
                        subject_name="Machine Learning",
                        department="Artificial Intelligence & Data Science",
                        semester=5,
                        academic_year=2023,
                        regulation="R2021",
                        exam_type="University Exam",
                        faculty_name="Dr. Sophia Lin",
                        file_name="AD8551_NovDec_2023.pdf",
                        file_url="/api/v1/question-papers/download/AD8551_NovDec_2023.pdf",
                        file_size="2.4 MB",
                        page_count=5,
                        uploaded_by=admin.id if admin else None
                    )
                ]
                db.add_all(pyqp_seed)
                db.commit()

            # Seed Study Plan & Tasks
            if db.query(StudyPlanModel).count() == 0:
                demo_plan = StudyPlanModel(
                    user_id=demo_student.id,
                    title="Semester 5 End Semester Examination Master Plan",
                    exam_name="Anna University Nov/Dec 2024 Examinations",
                    exam_date=date.today() + timedelta(days=14),
                    available_hours_per_day=4.5,
                    preferred_study_time="Evening",
                    target_score_percentage=92,
                    weak_subjects=json.dumps(["Computer Networks", "Database Management Systems"]),
                    strong_subjects=json.dumps(["Operating Systems", "Data Structures & Algorithms"]),
                    status="Active"
                )
                db.add(demo_plan)
                db.commit()
                db.refresh(demo_plan)

                demo_tasks = [
                    StudyTaskModel(
                        plan_id=demo_plan.id,
                        user_id=demo_student.id,
                        subject_code="CS8591",
                        subject_name="Computer Networks",
                        title="Revise Unit 3: Flow Control & Sliding Window Protocols",
                        description="Review sliding window protocol mechanics, Go-Back-N, and Selective Repeat derivations.",
                        task_type="Revision",
                        scheduled_date=date.today(),
                        duration_minutes=90,
                        priority="High",
                        status="Pending"
                    ),
                    StudyTaskModel(
                        plan_id=demo_plan.id,
                        user_id=demo_student.id,
                        subject_code="CS8491",
                        subject_name="Database Management Systems",
                        title="Practice B+ Tree & Indexing PYQPs",
                        description="Solve 2022 and 2023 university exam questions on B+ tree insertion and deletion.",
                        task_type="PYQP Analysis",
                        scheduled_date=date.today(),
                        duration_minutes=60,
                        priority="High",
                        status="Completed",
                        completed_at=datetime.now(timezone.utc)
                    ),
                    StudyTaskModel(
                        plan_id=demo_plan.id,
                        user_id=demo_student.id,
                        subject_code="CS8492",
                        subject_name="Operating Systems",
                        title="Attempt Bankers Algorithm Interactive Quiz",
                        description="Practice deadlocks avoidance and system state evaluation MCQs.",
                        task_type="Quiz Practice",
                        scheduled_date=date.today(),
                        duration_minutes=45,
                        priority="Medium",
                        status="Pending"
                    ),
                    StudyTaskModel(
                        plan_id=demo_plan.id,
                        user_id=demo_student.id,
                        subject_code="CS8591",
                        subject_name="Computer Networks",
                        title="Complete Socket Server Programming Assignment",
                        description="Implement multi-threaded TCP server broadcast handler and heartbeat check.",
                        task_type="Assignment",
                        scheduled_date=date.today() + timedelta(days=1),
                        duration_minutes=120,
                        priority="High",
                        status="Pending"
                    ),
                    StudyTaskModel(
                        plan_id=demo_plan.id,
                        user_id=demo_student.id,
                        subject_code="AD8551",
                        subject_name="Machine Learning",
                        title="Study Unit 4: Support Vector Machines & Kernel Tricks",
                        description="Read lecture notes and derive dual formulation margin optimization.",
                        task_type="Study",
                        scheduled_date=date.today() + timedelta(days=2),
                        duration_minutes=90,
                        priority="Medium",
                        status="Pending"
                    )
                ]
                db.add_all(demo_tasks)
                db.commit()

            # Seed Mock Interview
            if db.query(MockInterviewModel).count() == 0:
                demo_interview = MockInterviewModel(
                    user_id=demo_student.id,
                    title="Full Stack React & FastAPI Technical Interview",
                    interview_type="Technical",
                    difficulty="Medium",
                    duration_minutes=20,
                    target_role="Full Stack Developer",
                    overall_score=88.5,
                    communication_score=90.0,
                    confidence_score=85.0,
                    grammar_score=92.0,
                    technical_accuracy_score=88.0,
                    fluency_score=86.0,
                    professionalism_score=94.0,
                    completeness_score=85.0,
                    status="Completed",
                    feedback_summary="Excellent understanding of React state management, virtual DOM reconciliation, and FastAPI async routing. Strong technical clarity.",
                    strengths=json.dumps(["Deep knowledge of hooks and custom middleware", "Clear explanation of REST vs GraphQL tradeoffs", "Polite professional demeanor"]),
                    weaknesses=json.dumps(["Slight hesitation on database connection pooling details", "Could elaborate more on CORS security headers"]),
                    improvements=json.dumps(["Review SQLAlchemy connection pool limits and async sessions", "Practice system architecture diagrams for microservices"]),
                    completed_at=datetime.now(timezone.utc)
                )
                db.add(demo_interview)
                db.commit()
                db.refresh(demo_interview)

                qa_seed = [
                    InterviewQaLogModel(
                        interview_id=demo_interview.id,
                        question_number=1,
                        question_text="Explain the Virtual DOM in React and how reconciliation works.",
                        student_answer="The Virtual DOM is an in-memory representation of the real DOM. React creates a lightweight tree object. When state changes, React compares the new Virtual DOM with the previous snapshot using diffing algorithm and updates only modified nodes.",
                        score=92.0,
                        feedback="Great explanation of Virtual DOM diffing algorithm and selective DOM updates.",
                        model_answer="The Virtual DOM is a lightweight JS object tree representing the UI. During state updates, React runs a heuristic O(n) diffing algorithm (reconciliation) comparing current and previous VDOM trees, then batches minimal DOM mutations to the real DOM."
                    ),
                    InterviewQaLogModel(
                        interview_id=demo_interview.id,
                        question_number=2,
                        question_text="How do async endpoints work in FastAPI and when should you use background tasks?",
                        student_answer="FastAPI uses ASGI with async def syntax for non-blocking I/O. Background tasks allow returning immediate HTTP 200 responses while executing long tasks like file processing or sending emails asynchronously.",
                        score=85.0,
                        feedback="Clear understanding of ASGI async concurrency and background task offloading.",
                        model_answer="FastAPI leverages Starlette and asyncio for non-blocking I/O operations. Endpoints declared with async def run directly on the event loop. BackgroundTasks class allows scheduling post-response tasks cleanly without blocking client response."
                    )
                ]
                db.add_all(qa_seed)

            # Seed Student Goals
            if db.query(StudentGoalModel).filter(StudentGoalModel.user_id == demo_student.id).count() == 0:
                goals_seed = [
                    StudentGoalModel(
                        user_id=demo_student.id,
                        title="Achieve 90%+ Attendance in Computer Networks",
                        category="Attendance",
                        target_metric="Attendance Rate",
                        target_value=90.0,
                        current_value=84.5,
                        unit="%",
                        deadline=date.today() + timedelta(days=30),
                        status="In Progress"
                    ),
                    StudentGoalModel(
                        user_id=demo_student.id,
                        title="Score 95%+ on Database Systems Quiz",
                        category="Academic",
                        target_metric="Quiz Score",
                        target_value=95.0,
                        current_value=92.0,
                        unit="%",
                        deadline=date.today() + timedelta(days=14),
                        status="In Progress"
                    ),
                    StudentGoalModel(
                        user_id=demo_student.id,
                        title="Complete All 5 Assignments On Time",
                        category="Assignment",
                        target_metric="Assignments Done",
                        target_value=5.0,
                        current_value=3.0,
                        unit="tasks",
                        deadline=date.today() + timedelta(days=7),
                        status="In Progress"
                    ),
                    StudentGoalModel(
                        user_id=demo_student.id,
                        title="Score 90%+ in Technical AI Mock Interview",
                        category="Interview",
                        target_metric="Mock Interview Score",
                        target_value=90.0,
                        current_value=88.5,
                        unit="%",
                        deadline=date.today() + timedelta(days=10),
                        status="In Progress"
                    ),
                ]
                db.add_all(goals_seed)

            # Seed Student Streaks
            if db.query(StudentStreakModel).filter(StudentStreakModel.user_id == demo_student.id).count() == 0:
                streak_seed = StudentStreakModel(
                    user_id=demo_student.id,
                    daily_study_streak=7,
                    quiz_streak=4,
                    attendance_streak=14,
                    assignment_streak=5,
                    last_activity_date=date.today()
                )
                db.add(streak_seed)

            # Seed Faculty Profile & Related Data
            from app.models.faculty import FacultyProfileModel, FacultyScheduleModel, FacultyAssignmentModel, FacultySubmissionModel, FacultyQuizModel, FacultyQuestionPaperModel
            fac_profile = db.query(FacultyProfileModel).first()
            if not fac_profile:
                fac_profile = FacultyProfileModel(
                    user_id=demo_faculty.id if 'demo_faculty' in locals() and demo_faculty else (admin.id if admin else 1),
                    employee_id="FAC-2026-088",
                    department="Computer Science & Engineering",
                    designation="Associate Professor",
                    office_room="Block B - 302",
                    assigned_subjects="CS8591 Computer Networks, CS8492 Database Systems",
                    assigned_sections="A, B"
                )
                db.add(fac_profile)
                db.commit()
                db.refresh(fac_profile)

                # Seed Faculty Schedules
                schedules_seed = [
                    FacultyScheduleModel(faculty_id=fac_profile.id, day_of_week="Monday", period_number=1, start_time="09:00 AM", end_time="09:50 AM", subject_name="Computer Networks", subject_code="CS8591", section="A", classroom="LH-101"),
                    FacultyScheduleModel(faculty_id=fac_profile.id, day_of_week="Monday", period_number=3, start_time="11:00 AM", end_time="11:50 AM", subject_name="Database Management", subject_code="CS8492", section="B", classroom="LH-204"),
                    FacultyScheduleModel(faculty_id=fac_profile.id, day_of_week="Tuesday", period_number=2, start_time="09:50 AM", end_time="10:40 AM", subject_name="Computer Networks Lab", subject_code="CS8591L", section="A", classroom="CL-301"),
                ]
                db.add_all(schedules_seed)

                # Seed Faculty Assignment & Submissions
                fac_assg = FacultyAssignmentModel(
                    faculty_id=fac_profile.id,
                    title="TCP/IP Protocol Suite Analysis",
                    subject_code="CS8591",
                    section="A",
                    description="Analyze TCP vs UDP header structures and packet trace logs.",
                    due_date="2026-08-15",
                    max_marks=100
                )
                db.add(fac_assg)
                db.commit()
                db.refresh(fac_assg)

                fac_sub = FacultySubmissionModel(
                    assignment_id=fac_assg.id,
                    student_id=demo_student.id,
                    student_name=demo_student.name,
                    register_number="913221104042",
                    submission_text="Submitted TCP/IP packet structure analysis report.",
                    file_url="https://example.com/submissions/tcp_ip_report.pdf",
                    status="Submitted"
                )
                db.add(fac_sub)

                # Seed Faculty Quiz
                fac_quiz = FacultyQuizModel(
                    faculty_id=fac_profile.id,
                    title="Database Systems Mid-Term Quiz",
                    subject_code="CS8492",
                    section="A",
                    num_questions=5,
                    duration_minutes=15,
                    total_marks=50,
                    is_published=True
                )
                db.add(fac_quiz)

                # Seed Faculty Question Paper
                fac_paper = FacultyQuestionPaperModel(
                    faculty_id=fac_profile.id,
                    title="Computer Networks Model Exam 2026",
                    subject_name="Computer Networks",
                    subject_code="CS8591",
                    department="Computer Science & Engineering",
                    semester=6,
                    academic_year="2025-2026",
                    exam_type="Model Exam",
                    pdf_url="https://example.com/papers/cs8591_model_2026.pdf"
                )
                db.add(fac_paper)

            db.commit()

    finally:
        if close_session:
            db.close()

