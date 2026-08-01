from typing import Optional
from sqlalchemy.orm import Session
from app.database.engine import engine, SessionLocal
from app.database.base import Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.notification import Notification
from app.models.student import Attendance, TimetableEntry, Assignment, Fee, Event, Note, LibraryBook
from datetime import date, datetime, timedelta

def init_db(db: Optional[Session] = None):
    # Import all models to ensure they are registered with Base.metadata
    from app.models import user, chat, document, student, notification, quiz, attendance, placement, timetable
    
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

            db.commit()

    finally:
        if close_session:
            db.close()

