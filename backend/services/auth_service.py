from typing import Dict, Optional

from fastapi import HTTPException, status

from models.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from utils.jwt import create_access_token


class AuthService:
    def __init__(self) -> None:
        self._users: Dict[str, Dict[str, str]] = {}

    def register(self, payload: RegisterRequest) -> TokenResponse:
        email = str(payload.email)
        if email in self._users:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='User already exists')

        self._users[email] = {
            'name': payload.name,
            'password': payload.password,
        }

        token = create_access_token(subject=email, extra_claims={'role': 'student'})
        return TokenResponse(access_token=token, message='Registration successful')

    def login(self, payload: LoginRequest) -> TokenResponse:
        email = str(payload.email)
        user = self._users.get(email)
        if not user or user['password'] != payload.password:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')

        token = create_access_token(subject=email, extra_claims={'role': 'student'})
        return TokenResponse(access_token=token, message='Login successful')

    def get_user(self, email: str) -> Optional[UserResponse]:
        user = self._users.get(email)
        if not user:
            return None
        return UserResponse(id=email, name=user['name'], email=email)
