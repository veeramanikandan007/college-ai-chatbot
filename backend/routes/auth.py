from fastapi import APIRouter, Depends, HTTPException, status

from models.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from services.auth_service import AuthService
from utils.jwt import decode_access_token

router = APIRouter(prefix='/auth', tags=['auth'])


def get_auth_service() -> AuthService:
    return AuthService()


@router.post('/register', response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, auth_service: AuthService = Depends(get_auth_service)) -> TokenResponse:
    return auth_service.register(payload)


@router.post('/login', response_model=TokenResponse)
async def login(payload: LoginRequest, auth_service: AuthService = Depends(get_auth_service)) -> TokenResponse:
    return auth_service.login(payload)


@router.post('/logout')
async def logout() -> dict:
    return {'message': 'Logout successful'}


@router.get('/me', response_model=UserResponse)
async def me(token: str) -> UserResponse:
    payload = decode_access_token(token)
    email = payload.get('sub')
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')

    auth_service = AuthService()
    user = auth_service.get_user(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return user
