from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Student
from schemas import LoginRequest, LoginResponse
from utils.security import verify_password, create_access_token, get_student_id_from_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()


def get_current_student(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Student:
    """Dependency to get the current authenticated student from JWT token."""
    student_id = get_student_id_from_token(credentials.credentials)
    if not student_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid or expired token.',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Student not found.',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    return student


def student_to_dict(student: Student) -> dict:
    """Convert a Student model to a dictionary for API responses."""
    return {
        'student_id': student.student_id,
        'name': student.name,
        'initials': ''.join(student.name.split(' ')[:2]).upper()[:2],
        'department': student.department,
        'year': student.year,
        'semester': student.semester,
        'email': student.email,
        'phone': student.phone,
        'attendance_percent': student.attendance_percent,
        'cgpa': student.cgpa,
        'fees_paid': student.fees_paid,
        'fees_total': student.fees_total,
        'bus_no': student.bus_no,
        'library_books': student.library_books,
        'certificate': student.certificate,
        'role': student.role,
    }


@router.post('/login', response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a student and return a JWT token."""
    student = db.query(Student).filter(Student.student_id == request.student_id).first()
    if not student or not verify_password(request.password, student.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid Student ID or password.',
        )

    access_token = create_access_token(data={'sub': student.student_id, 'role': student.role})
    return LoginResponse(
        success=True,
        access_token=access_token,
        user=student_to_dict(student),
    )


@router.post('/logout')
async def logout():
    """Logout endpoint (token is invalidated client-side)."""
    return {'message': 'Logged out successfully.'}


@router.get('/me', response_model=dict)
async def get_current_user(current_student: Student = Depends(get_current_student)):
    """Get the current authenticated student's profile."""
    return student_to_dict(current_student)
