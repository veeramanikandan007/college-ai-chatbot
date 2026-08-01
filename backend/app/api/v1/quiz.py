import json
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

from sqlalchemy.orm import Session
from app.database.engine import get_db
from app.models.quiz import QuizAttempt
from app.services.quiz_generator_service import QuizGeneratorService
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()
quiz_service = QuizGeneratorService()

# In-memory backup store for seamless persistence fallback if database session is absent
_QUIZ_ATTEMPTS_STORE: List[Dict[str, Any]] = [
    {
        "id": 1,
        "title": "Operating Systems Quiz - Module 3",
        "document_name": "Operating_Systems_Module_3.pdf",
        "subject": "Operating Systems",
        "difficulty": "Medium",
        "quiz_type": "MCQ",
        "score": 4,
        "total_questions": 5,
        "percentage": 80.0,
        "correct_answers": 4,
        "wrong_answers": 1,
        "time_taken_seconds": 145,
        "created_at": "2026-08-01T14:30:00Z",
        "questions_data": [
            {
                "id": 1,
                "type": "MCQ",
                "question": "Which algorithm is primarily used for deadlock avoidance in Operating Systems?",
                "options": ["Round Robin", "Banker's Algorithm", "First-Come First-Served", "Elevator Algorithm"],
                "user_answer": "Banker's Algorithm",
                "correct_answer": "Banker's Algorithm",
                "is_correct": True,
                "explanation": "Banker's Algorithm tests for safe states before allocating resources to prevent deadlocks."
            },
            {
                "id": 2,
                "type": "MCQ",
                "question": "Which condition is NOT a necessary condition for a deadlock?",
                "options": ["Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"],
                "user_answer": "Preemption Allowed",
                "correct_answer": "Preemption Allowed",
                "is_correct": True,
                "explanation": "No Preemption is the necessary condition. Preemption allowed prevents deadlocks."
            },
            {
                "id": 3,
                "type": "MCQ",
                "question": "What is the primary function of a semaphore in concurrent execution?",
                "options": ["Process Synchronization", "Disk Partitioning", "Compiler Optimization", "Virtual Memory Paging"],
                "user_answer": "Process Synchronization",
                "correct_answer": "Process Synchronization",
                "is_correct": True,
                "explanation": "Semaphores synchronize process execution and control access to shared critical sections."
            },
            {
                "id": 4,
                "type": "MCQ",
                "question": "Which primitive operations are performed on integer semaphores?",
                "options": ["wait() and signal()", "push() and pop()", "lock() and release()", "start() and stop()"],
                "user_answer": "lock() and release()",
                "correct_answer": "wait() and signal()",
                "is_correct": False,
                "explanation": "Dijkstra defined semaphores using atomic wait() [P] and signal() [V] operations."
            },
            {
                "id": 5,
                "type": "MCQ",
                "question": "What does a Resource Allocation Graph (RAG) detect when a cycle exists in single-resource instances?",
                "options": ["Deadlock", "Livelock", "Thrashing", "Fragmentation"],
                "user_answer": "Deadlock",
                "correct_answer": "Deadlock",
                "is_correct": True,
                "explanation": "In single-resource instance RAGs, a cycle indicates a deadlock condition."
            }
        ]
    }
]

# Request Schemas
class QuizGenerateRequest(BaseModel):
    document_name: str = Field(..., example="Operating_Systems_Module_3.pdf")
    document_id: Optional[int] = None
    num_questions: int = Field(5, ge=1, le=20)
    difficulty: str = Field("Medium", example="Medium") # Easy, Medium, Hard
    quiz_type: str = Field("MCQ", example="MCQ") # MCQ, True/False, Fill in the Blanks, Short Answer, Mixed
    subject: Optional[str] = "General"

class QuizSubmissionItem(BaseModel):
    question_id: int
    question: str
    user_answer: str
    correct_answer: str
    explanation: str
    type: Optional[str] = "MCQ"
    options: Optional[List[str]] = []

class QuizSubmitRequest(BaseModel):
    document_name: str
    subject: str = "General"
    difficulty: str = "Medium"
    quiz_type: str = "MCQ"
    time_taken_seconds: int = 0
    submissions: List[QuizSubmissionItem]

# Endpoints
@router.post("/generate")
async def generate_quiz(req: QuizGenerateRequest):
    """
    Generate an AI Quiz grounded strictly in uploaded document text.
    """
    if not req.document_name:
        raise HTTPException(status_code=400, detail="Document name is required.")

    try:
        quiz = await quiz_service.generate_quiz(
            document_name=req.document_name,
            num_questions=req.num_questions,
            difficulty=req.difficulty,
            quiz_type=req.quiz_type,
            subject=req.subject or "General",
            document_id=req.document_id
        )
        return quiz
    except Exception as e:
        logger.exception("Failed to generate quiz")
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

@router.post("/submit")
async def submit_quiz(req: QuizSubmitRequest, db: Session = Depends(get_db)):
    """
    Submit completed quiz answers, evaluate score, compute statistics, generate explanations, and save attempt.
    """
    if not req.submissions:
        raise HTTPException(status_code=400, detail="Submissions list cannot be empty.")

    total = len(req.submissions)
    correct_count = 0
    questions_eval = []

    for item in req.submissions:
        user_ans = item.user_answer.strip()
        corr_ans = item.correct_answer.strip()

        # Normalization check
        is_corr = False
        if item.type == "Short Answer":
            # For short answer, perform soft key concept match
            is_corr = len(user_ans) > 2 and (user_ans.lower() in corr_ans.lower() or corr_ans.lower() in user_ans.lower())
        else:
            is_corr = user_ans.strip().lower() == corr_ans.strip().lower()

        if is_corr:
            correct_count += 1

        questions_eval.append({
            "id": item.question_id,
            "type": item.type or "MCQ",
            "question": item.question,
            "options": item.options or [],
            "user_answer": item.user_answer,
            "correct_answer": item.correct_answer,
            "is_correct": is_corr,
            "explanation": item.explanation
        })

    wrong_count = total - correct_count
    percentage = round((correct_count / total) * 100, 1) if total > 0 else 0.0

    new_id = len(_QUIZ_ATTEMPTS_STORE) + 1
    attempt_record = {
        "id": new_id,
        "title": f"{req.subject} Quiz - {req.document_name}",
        "document_name": req.document_name,
        "subject": req.subject,
        "difficulty": req.difficulty,
        "quiz_type": req.quiz_type,
        "score": correct_count,
        "total_questions": total,
        "percentage": percentage,
        "correct_answers": correct_count,
        "wrong_answers": wrong_count,
        "time_taken_seconds": req.time_taken_seconds,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "questions_data": questions_eval
    }

    _QUIZ_ATTEMPTS_STORE.insert(0, attempt_record)

    # Save to SQLite Database if DB session available
    try:
        db_attempt = QuizAttempt(
            title=f"{req.subject} Quiz - {req.document_name}",
            document_name=req.document_name,
            subject=req.subject,
            difficulty=req.difficulty,
            quiz_type=req.quiz_type,
            score=correct_count,
            total_questions=total,
            percentage=percentage,
            correct_answers=correct_count,
            wrong_answers=wrong_count,
            time_taken_seconds=req.time_taken_seconds,
            questions_data=json.dumps(questions_eval)
        )
        db.add(db_attempt)
        db.commit()
        db.refresh(db_attempt)
        attempt_record["db_id"] = db_attempt.id
    except Exception as dbe:
        logger.warning(f"Could not persist quiz attempt to SQLite DB: {dbe}")

    return attempt_record

@router.get("/history")
async def get_quiz_history(db: Session = Depends(get_db)):
    """
    Retrieve list of past saved quiz attempts.
    """
    db_attempts = []
    try:
        records = db.query(QuizAttempt).order_by(QuizAttempt.created_at.desc()).all()
        for r in records:
            q_data = []
            if r.questions_data:
                try:
                    q_data = json.loads(r.questions_data)
                except Exception:
                    pass
            db_attempts.append({
                "id": r.id,
                "title": r.title,
                "document_name": r.document_name,
                "subject": r.subject,
                "difficulty": r.difficulty,
                "quiz_type": r.quiz_type,
                "score": r.score,
                "total_questions": r.total_questions,
                "percentage": r.percentage,
                "correct_answers": r.correct_answers,
                "wrong_answers": r.wrong_answers,
                "time_taken_seconds": r.time_taken_seconds,
                "created_at": r.created_at.isoformat() if hasattr(r.created_at, 'isoformat') else str(r.created_at),
                "questions_data": q_data
            })
    except Exception as e:
        logger.warning(f"DB query for quiz history failed: {e}")

    combined = db_attempts + [a for a in _QUIZ_ATTEMPTS_STORE if a["id"] not in [d["id"] for d in db_attempts]]
    return {"history": combined, "total": len(combined)}

@router.get("/history/{attempt_id}")
async def get_quiz_attempt_detail(attempt_id: int, db: Session = Depends(get_db)):
    """
    Retrieve detailed breakdown for a specific historical quiz attempt.
    """
    # 1. Search in DB
    try:
        r = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
        if r:
            q_data = []
            if r.questions_data:
                q_data = json.loads(r.questions_data)
            return {
                "id": r.id,
                "title": r.title,
                "document_name": r.document_name,
                "subject": r.subject,
                "difficulty": r.difficulty,
                "quiz_type": r.quiz_type,
                "score": r.score,
                "total_questions": r.total_questions,
                "percentage": r.percentage,
                "correct_answers": r.correct_answers,
                "wrong_answers": r.wrong_answers,
                "time_taken_seconds": r.time_taken_seconds,
                "created_at": r.created_at.isoformat() if hasattr(r.created_at, 'isoformat') else str(r.created_at),
                "questions_data": q_data
            }
    except Exception:
        pass

    # 2. Search in memory store
    attempt = next((a for a in _QUIZ_ATTEMPTS_STORE if a["id"] == attempt_id), None)
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt not found.")
    return attempt

@router.delete("/history/{attempt_id}")
async def delete_quiz_attempt(attempt_id: int, db: Session = Depends(get_db)):
    """
    Delete a past quiz attempt.
    """
    global _QUIZ_ATTEMPTS_STORE
    _QUIZ_ATTEMPTS_STORE = [a for a in _QUIZ_ATTEMPTS_STORE if a["id"] != attempt_id]
    
    try:
        r = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
        if r:
            db.delete(r)
            db.commit()
    except Exception:
        pass

    return {"message": "Quiz attempt deleted successfully."}
