from fastapi import APIRouter
from app.api.v1 import auth, chat, chat_stream, students, admin, health, notifications, voice, rag_router, documents, quiz, attendance, placement, timetable

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(chat_stream.router, prefix="/chat/stream", tags=["chat_stream"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(students.router, prefix="/students", tags=["students"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
api_router.include_router(placement.router, prefix="/placement", tags=["placement"])
api_router.include_router(timetable.router, prefix="/timetable", tags=["timetable"])
api_router.include_router(rag_router.router, tags=["RAG"])

