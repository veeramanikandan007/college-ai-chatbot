from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import DATABASE_URL

engine = create_engine(DATABASE_URL, future=True, echo=False, connect_args={'check_same_thread': False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

# Base class for all SQLAlchemy models
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables and seed initial data."""
    from models import Student, ChatSession, Message  # noqa: F401
    Base.metadata.create_all(bind=engine)
    seed_demo_data()


def seed_demo_data():
    """Seed the database with demo student records."""
    from models import Student
    from utils.security import hash_password

    db = SessionLocal()
    try:
        # Check if we already have data
        if db.query(Student).first():
            return

        demo_students = [
            {
                'student_id': '24CSE001',
                'name': 'Pandiyarajan',
                'email': 'pandiyarajan@campusmail.edu',
                'phone': '+91 98765 43210',
                'department': 'Computer Science and Engineering',
                'year': '3rd Year',
                'semester': '5',
                'attendance_percent': 87.0,
                'cgpa': 8.52,
                'fees_paid': 45000,
                'fees_total': 75000,
                'bus_no': '3',
                'library_books': 'Operating Systems, DBMS',
                'certificate': 'Bonafide - Available',
                'password': hash_password('password123'),
                'role': 'student',
            },
            {
                'student_id': '24CSE002',
                'name': 'Priya Sharma',
                'email': 'priya.sharma@campusmail.edu',
                'phone': '+91 98765 43211',
                'department': 'Computer Science and Engineering',
                'year': '3rd Year',
                'semester': '5',
                'attendance_percent': 92.0,
                'cgpa': 9.1,
                'fees_paid': 75000,
                'fees_total': 75000,
                'bus_no': '1',
                'library_books': 'Data Structures, Algorithms',
                'certificate': 'Bonafide - Available',
                'password': hash_password('password123'),
                'role': 'student',
            },
            {
                'student_id': '24CSE003',
                'name': 'Arjun Kumar',
                'email': 'arjun.kumar@campusmail.edu',
                'phone': '+91 98765 43212',
                'department': 'Computer Science and Engineering',
                'year': '3rd Year',
                'semester': '5',
                'attendance_percent': 78.0,
                'cgpa': 7.8,
                'fees_paid': 50000,
                'fees_total': 75000,
                'bus_no': '2',
                'library_books': 'Python Programming, OS',
                'certificate': 'Bonafide - Pending',
                'password': hash_password('password123'),
                'role': 'student',
            },
            {
                'student_id': '24ECE001',
                'name': 'Meera Patel',
                'email': 'meera.patel@campusmail.edu',
                'phone': '+91 98765 43213',
                'department': 'Electronics and Communication Engineering',
                'year': '3rd Year',
                'semester': '5',
                'attendance_percent': 85.0,
                'cgpa': 8.3,
                'fees_paid': 75000,
                'fees_total': 75000,
                'bus_no': '4',
                'library_books': 'Digital Logic, Signals & Systems',
                'certificate': 'Bonafide - Available',
                'password': hash_password('password123'),
                'role': 'student',
            },
            {
                'student_id': '24ME001',
                'name': 'Rohan Desai',
                'email': 'rohan.desai@campusmail.edu',
                'phone': '+91 98765 43214',
                'department': 'Mechanical Engineering',
                'year': '3rd Year',
                'semester': '5',
                'attendance_percent': 90.0,
                'cgpa': 8.7,
                'fees_paid': 75000,
                'fees_total': 75000,
                'bus_no': '5',
                'library_books': 'Thermodynamics, Manufacturing',
                'certificate': 'Bonafide - Available',
                'password': hash_password('password123'),
                'role': 'student',
            },
            {
                'student_id': 'admin',
                'name': 'Admin User',
                'email': 'admin@campusmail.edu',
                'phone': '+91 98765 00000',
                'department': 'Administration',
                'year': 'N/A',
                'semester': 'N/A',
                'attendance_percent': 100.0,
                'cgpa': 10.0,
                'fees_paid': 0,
                'fees_total': 0,
                'bus_no': 'N/A',
                'library_books': 'N/A',
                'certificate': 'N/A',
                'password': hash_password('admin123'),
                'role': 'admin',
            },
        ]

        for student_data in demo_students:
            student = Student(**student_data)
            db.add(student)

        db.commit()
    finally:
        db.close()
