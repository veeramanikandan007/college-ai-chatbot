from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.auth import UserCreate, UserLogin, Token, UserProfile, UserUpdate
from app.services import auth_service
from app.models.user import User

# Add Limiter import
from app.core.limiter import limiter

router = APIRouter()

@router.post("/register", response_model=Token)
@limiter.limit("5/minute")
def register(request: Request, user_in: UserCreate, db: Session = Depends(deps.get_db)):
    """Register a new user."""
    return auth_service.register_user(db, user_in)

from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, user_in: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(deps.get_db)):
    """Login and get access token."""
    return auth_service.authenticate_user(db, email=user_in.username, password=user_in.password)

@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(deps.get_current_user)):
    """Get current user profile."""
    return current_user

@router.post("/logout")
def logout():
    """Logout endpoint. Actually handled client-side by deleting token."""
    return {"message": "Logged out successfully"}

@router.put("/me", response_model=UserProfile)
def update_me(request: UserUpdate, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Update current user profile."""
    return auth_service.update_user_profile(db, current_user.id, request.model_dump(exclude_unset=True))
