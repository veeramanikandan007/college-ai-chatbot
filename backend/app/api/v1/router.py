from fastapi import APIRouter
from app.api.v1 import (
    auth,
    chat,
    chat_stream,
    students,
    admin,
    health,
    notifications,
    voice,
    rag_router,
    documents,
    quiz,
    attendance,
    placement,
    timetable,
    assignments,
    question_papers,
    study_planner,
    mock_interviews,
    student_analytics,
    faculty,
    notes,
    ocr,
    resume,
    workspace
)

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
api_router.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
api_router.include_router(question_papers.router, prefix="/question-papers", tags=["question-papers"])
api_router.include_router(study_planner.router, prefix="/study-planner", tags=["study-planner"])
api_router.include_router(mock_interviews.router, prefix="/mock-interviews", tags=["mock-interviews"])
api_router.include_router(student_analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(faculty.router, prefix="/faculty", tags=["faculty"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
api_router.include_router(resume.router, prefix="/resume", tags=["resume"])
api_router.include_router(workspace.router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(rag_router.router, tags=["RAG"])


