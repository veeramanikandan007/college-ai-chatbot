from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post('/register')
async def register(request: RegisterRequest):
    return {'message': 'Registration endpoint is available.'}


@router.post('/login')
async def login(request: LoginRequest):
    return {'message': 'Login endpoint is available.'}


@router.post('/logout')
async def logout():
    return {'message': 'Logout endpoint is available.'}
