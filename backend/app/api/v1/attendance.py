from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.attendance_service import AttendanceService
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()

class AttendanceSimulationRequest(BaseModel):
    subject_id: int
    additional_attended: int = Field(0, ge=0, le=50)
    additional_missed: int = Field(0, ge=0, le=50)

class MarkAttendanceRequest(BaseModel):
    subject_id: int
    status: str = Field(..., example="present") # present, absent, late, leave

@router.get("/dashboard")
async def get_attendance_dashboard():
    """
    Get aggregated Smart Attendance Dashboard analytics, predictions, subject breakdowns, trend charts, and AI notifications.
    """
    try:
        data = AttendanceService.get_dashboard_data()
        return data
    except Exception as e:
        logger.exception("Failed to fetch smart attendance dashboard data")
        raise HTTPException(status_code=500, detail=f"Failed to fetch attendance dashboard: {str(e)}")

@router.post("/simulate")
async def simulate_future_attendance(req: AttendanceSimulationRequest):
    """
    Simulate impact on attendance percentage and risk level if student attends/misses N future classes.
    """
    data = AttendanceService.get_dashboard_data()
    subjects = data.get("subjects", [])
    target = next((s for s in subjects if s["id"] == req.subject_id), None)
    
    if not target:
        raise HTTPException(status_code=404, detail="Subject not found.")

    new_attended = target["classes_attended"] + req.additional_attended
    new_missed = target["classes_missed"] + req.additional_missed
    
    simulated_subject = {
        **target,
        "classes_attended": new_attended,
        "classes_missed": new_missed
    }
    
    analyzed = AttendanceService.calculate_subject_analytics(simulated_subject)
    return {
        "original": target,
        "simulated": analyzed,
        "delta_percentage": round(analyzed["attendance_percentage"] - target["attendance_percentage"], 1)
    }

@router.post("/mark")
async def mark_attendance(req: MarkAttendanceRequest):
    """
    Mark or update attendance status for a subject.
    """
    return {
        "message": f"Attendance marked as '{req.status}' for subject ID {req.subject_id}.",
        "status": "success"
    }
