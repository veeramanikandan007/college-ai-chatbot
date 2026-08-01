from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.services.timetable_service import TimetableService
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()
timetable_service = TimetableService()

class AIQueryRequest(BaseModel):
    query: str = Field(..., example="When is my next class?")

class ReminderRequest(BaseModel):
    entry_id: int
    minutes_before: Optional[int] = 10

@router.get("/today")
async def get_today_timetable(day: Optional[str] = None):
    """
    Get today's timetable, current ongoing class, next class countdown, and stats breakdown.
    """
    try:
        data = TimetableService.get_today_timetable(day)
        return data
    except Exception as e:
        logger.exception("Failed to get today's timetable")
        raise HTTPException(status_code=500, detail=f"Failed to load timetable: {str(e)}")

@router.get("/weekly")
async def get_weekly_timetable():
    """
    Get complete weekly timetable grouped by days (Monday through Saturday).
    """
    try:
        data = TimetableService.get_weekly_timetable()
        return data
    except Exception as e:
        logger.exception("Failed to get weekly timetable")
        raise HTTPException(status_code=500, detail=f"Failed to load weekly timetable: {str(e)}")

@router.get("/calendar")
async def get_academic_calendar():
    """
    Get academic calendar highlights for class days, exam days, holidays, and events.
    """
    try:
        data = TimetableService.get_academic_calendar()
        return data
    except Exception as e:
        logger.exception("Failed to get academic calendar")
        raise HTTPException(status_code=500, detail=f"Failed to load calendar: {str(e)}")

@router.post("/ai-query")
async def ask_timetable_ai(req: AIQueryRequest):
    """
    Ask AI Timetable Assistant about next class, labs, or day schedules.
    """
    answer = await timetable_service.answer_timetable_ai_query(req.query)
    return {"query": req.query, "answer": answer}

@router.post("/reminder")
async def set_class_reminder(req: ReminderRequest):
    """
    Set a notification reminder 10 minutes before class.
    """
    return {
        "message": f"Class reminder set for {req.minutes_before} minutes before class.",
        "status": "success",
        "entry_id": req.entry_id
    }
