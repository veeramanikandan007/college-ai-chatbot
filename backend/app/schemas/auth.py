from pydantic import BaseModel, EmailStr
from typing import Optional

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "student"

class Token(BaseModel):
    access_token: str
    token_type: str

class UserProfile(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    department: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    student_id: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    student_id: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
