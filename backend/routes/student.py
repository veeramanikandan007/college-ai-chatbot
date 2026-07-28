from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Student, CertificateRequest
from schemas import (
    AttendanceResponse, AttendanceSubject,
    FeesResponse, TimetableResponse,
    LibraryResponse, BusResponse, CertificateResponse,
)
from routes.auth import get_current_student

router = APIRouter()


# ─── Attendance ────────────────────────────────────────────────────────────
@router.get('/attendance', response_model=AttendanceResponse)
async def get_attendance(
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Get the current student's attendance breakdown."""
    # Demo attendance data per subject
    demo_attendance = {
        '24CSE001': [
            {'subject': 'Operating Systems', 'code': 'CSE301', 'attended': 42, 'total': 48, 'percentage': 87.5},
            {'subject': 'Database Management Systems', 'code': 'CSE302', 'attended': 38, 'total': 44, 'percentage': 86.4},
            {'subject': 'Computer Networks', 'code': 'CSE303', 'attended': 40, 'total': 45, 'percentage': 88.9},
            {'subject': 'Data Structures & Algorithms', 'code': 'CSE304', 'attended': 44, 'total': 50, 'percentage': 88.0},
            {'subject': 'Artificial Intelligence', 'code': 'CSE305', 'attended': 36, 'total': 42, 'percentage': 85.7},
            {'subject': 'Software Engineering', 'code': 'CSE306', 'attended': 39, 'total': 44, 'percentage': 88.6},
        ],
        '24CSE002': [
            {'subject': 'Operating Systems', 'code': 'CSE301', 'attended': 46, 'total': 48, 'percentage': 95.8},
            {'subject': 'Database Management Systems', 'code': 'CSE302', 'attended': 43, 'total': 44, 'percentage': 97.7},
            {'subject': 'Computer Networks', 'code': 'CSE303', 'attended': 44, 'total': 45, 'percentage': 97.8},
            {'subject': 'Data Structures & Algorithms', 'code': 'CSE304', 'attended': 48, 'total': 50, 'percentage': 96.0},
            {'subject': 'Artificial Intelligence', 'code': 'CSE305', 'attended': 40, 'total': 42, 'percentage': 95.2},
            {'subject': 'Software Engineering', 'code': 'CSE306', 'attended': 43, 'total': 44, 'percentage': 97.7},
        ],
        '24CSE003': [
            {'subject': 'Operating Systems', 'code': 'CSE301', 'attended': 36, 'total': 48, 'percentage': 75.0},
            {'subject': 'Database Management Systems', 'code': 'CSE302', 'attended': 33, 'total': 44, 'percentage': 75.0},
            {'subject': 'Computer Networks', 'code': 'CSE303', 'attended': 37, 'total': 45, 'percentage': 82.2},
            {'subject': 'Data Structures & Algorithms', 'code': 'CSE304', 'attended': 39, 'total': 50, 'percentage': 78.0},
            {'subject': 'Artificial Intelligence', 'code': 'CSE305', 'attended': 32, 'total': 42, 'percentage': 76.2},
            {'subject': 'Software Engineering', 'code': 'CSE306', 'attended': 34, 'total': 44, 'percentage': 77.3},
        ],
    }

    subjects_data = demo_attendance.get(
        current_student.student_id,
        demo_attendance['24CSE001'],
    )

    subjects = [
        AttendanceSubject(
            subject=s['subject'],
            code=s['code'],
            attended=s['attended'],
            total=s['total'],
            percentage=s['percentage'],
        )
        for s in subjects_data
    ]

    overall = sum(s['percentage'] for s in subjects_data) / len(subjects_data)

    return AttendanceResponse(
        student_id=current_student.student_id,
        name=current_student.name,
        department=current_student.department,
        semester=current_student.semester,
        overall_percentage=round(overall, 1),
        subjects=subjects,
    )


# ─── Fees ──────────────────────────────────────────────────────────────────
@router.get('/fees', response_model=FeesResponse)
async def get_fees(current_student: Student = Depends(get_current_student)):
    """Get the current student's fee details."""
    balance = current_student.fees_total - current_student.fees_paid
    status = 'Clear' if balance == 0 else 'Pending' if balance > 0 else 'Overpaid'

    return FeesResponse(
        student_id=current_student.student_id,
        name=current_student.name,
        semester=current_student.semester,
        fees_paid=current_student.fees_paid,
        fees_total=current_student.fees_total,
        balance=balance,
        status=status,
    )


# ─── Timetable ─────────────────────────────────────────────────────────────
@router.get('/timetable', response_model=TimetableResponse)
async def get_timetable(current_student: Student = Depends(get_current_student)):
    """Get the current student's class timetable."""
    schedule = {
        'Monday': {
            '9:00-10:00': 'Operating Systems',
            '10:00-11:00': 'DBMS',
            '11:15-12:15': 'Computer Networks',
            '12:15-1:15': 'Lunch Break',
            '2:15-3:15': 'AI Lab',
        },
        'Tuesday': {
            '9:00-10:00': 'Data Structures',
            '10:00-11:00': 'Artificial Intelligence',
            '11:15-12:15': 'Operating Systems',
            '12:15-1:15': 'Lunch Break',
            '2:15-3:15': 'DBMS Lab',
        },
        'Wednesday': {
            '9:00-10:00': 'DBMS',
            '10:00-11:00': 'Computer Networks',
            '11:15-12:15': 'Operating Systems',
            '12:15-1:15': 'Lunch Break',
            '2:15-3:15': 'Data Structures Lab',
        },
        'Thursday': {
            '9:00-10:00': 'Artificial Intelligence',
            '10:00-11:00': 'Data Structures',
            '11:15-12:15': 'Computer Networks',
            '12:15-1:15': 'Lunch Break',
            '2:15-3:15': 'Software Engineering',
        },
        'Friday': {
            '9:00-10:00': 'Operating Systems',
            '10:00-11:00': 'DBMS',
            '11:15-12:15': 'Artificial Intelligence',
            '12:15-1:15': 'Lunch Break',
            '2:15-3:15': 'Mini Project',
        },
    }

    return TimetableResponse(
        student_id=current_student.student_id,
        name=current_student.name,
        department=current_student.department,
        semester=current_student.semester,
        schedule=schedule,
    )


# ─── Library ───────────────────────────────────────────────────────────────
@router.get('/library', response_model=LibraryResponse)
async def get_library(current_student: Student = Depends(get_current_student)):
    """Get the current student's library information."""
    books = [b.strip() for b in current_student.library_books.split(',') if b.strip()] if current_student.library_books else []

    library_hours = {
        'Monday-Friday': '8:00 AM - 8:00 PM',
        'Saturday': '9:00 AM - 6:00 PM',
        'Sunday': 'Closed',
    }

    return LibraryResponse(
        student_id=current_student.student_id,
        name=current_student.name,
        books_issued=books,
        max_books=4,
        issue_period_days=15,
        library_hours=library_hours,
    )


# ─── Bus ───────────────────────────────────────────────────────────────────
@router.get('/bus', response_model=BusResponse)
async def get_bus(current_student: Student = Depends(get_current_student)):
    """Get the current student's bus information."""
    bus_routes = {
        '1': {'route': 'City Center - Main Campus', 'departure': '7:45 AM', 'return': '5:30 PM'},
        '2': {'route': 'North Campus - Main Campus', 'departure': '7:30 AM', 'return': '5:45 PM'},
        '3': {'route': 'East Zone - Main Campus', 'departure': '7:50 AM', 'return': '5:15 PM'},
        '4': {'route': 'South Bay - Main Campus', 'departure': '7:40 AM', 'return': '5:30 PM'},
        '5': {'route': 'West Side - Main Campus', 'departure': '7:35 AM', 'return': '5:50 PM'},
    }

    route_info = bus_routes.get(current_student.bus_no, bus_routes['3'])

    return BusResponse(
        student_id=current_student.student_id,
        name=current_student.name,
        bus_no=current_student.bus_no,
        route=route_info['route'],
        departure_time=route_info['departure'],
        return_time=route_info['return'],
    )


# ─── Certificate ───────────────────────────────────────────────────────────
@router.get('/certificate', response_model=CertificateResponse)
async def get_certificate(current_student: Student = Depends(get_current_student)):
    """Get the current student's certificate status."""
    return CertificateResponse(
        student_id=current_student.student_id,
        name=current_student.name,
        certificate=current_student.certificate,
        status='Available' if 'Available' in current_student.certificate else 'Pending',
    )


# ─── Profile ───────────────────────────────────────────────────────────────
@router.get('/profile', response_model=dict)
async def get_profile(current_student: Student = Depends(get_current_student)):
    """Get the current student's full profile."""
    return {
        'student_id': current_student.student_id,
        'name': current_student.name,
        'initials': ''.join(current_student.name.split(' ')[:2]).upper()[:2],
        'department': current_student.department,
        'year': current_student.year,
        'semester': current_student.semester,
        'email': current_student.email,
        'phone': current_student.phone,
        'attendance_percent': current_student.attendance_percent,
        'cgpa': current_student.cgpa,
        'fees_paid': current_student.fees_paid,
        'fees_total': current_student.fees_total,
        'bus_no': current_student.bus_no,
        'library_books': current_student.library_books,
        'certificate': current_student.certificate,
        'role': current_student.role,
    }
