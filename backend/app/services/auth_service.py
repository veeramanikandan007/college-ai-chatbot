from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token

def register_user(db: Session, user_in: UserCreate):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user_role = getattr(user_in, 'role', 'student')
    if not user_role:
        user_role = 'student'
        
    db_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_role
    )
    db.add(db_user)
    db.flush() # Flush to get the ID without committing yet
    
    # Synchronize profiles locally
    if user_role == 'student':
        from app.models.student import StudentProfileModel
        profile = StudentProfileModel(user_id=db_user.id)
        db.add(profile)
    elif user_role == 'faculty':
        from app.models.faculty import FacultyProfileModel
        # Basic parsing or defaults for required faculty fields
        import uuid
        profile = FacultyProfileModel(
            user_id=db_user.id,
            employee_id=f"FAC-{str(uuid.uuid4())[:8].upper()}",
            department="Unassigned"
        )
        db.add(profile)
    elif user_role == 'admin':
        from app.models.admin import AdminProfileModel
        profile = AdminProfileModel(user_id=db_user.id)
        db.add(profile)

    db.commit()
    db.refresh(db_user)
    
    access_token = create_access_token(subject=db_user.id, role=db_user.role, email=db_user.email)
    return {"access_token": access_token, "token_type": "bearer"}

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user")
        
    access_token = create_access_token(subject=user.id, role=user.role, email=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

def get_user_profile(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def update_user_profile(db: Session, user_id: int, update_data: dict):
    user = get_user_profile(db, user_id)
    for key, value in update_data.items():
        if value is not None:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
