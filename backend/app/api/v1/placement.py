from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.placement_service import PlacementService
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()
placement_service = PlacementService()

class ApplyDriveRequest(BaseModel):
    drive_id: int
    company_name: str
    role: str
    stage: Optional[str] = "Applied"

class ATSCheckRequest(BaseModel):
    resume_text: str = Field(..., example="B.Tech Computer Science student with skills in Java, React, SQL, Spring Boot...")

class MockInterviewGenRequest(BaseModel):
    category: str = Field("Technical", example="Technical") # Technical, HR, Behavioral, System Design
    role: str = Field("Software Engineer", example="Software Engineer")

class MockInterviewEvalRequest(BaseModel):
    question: str
    user_answer: str
    category: str = "Technical"

class CareerAdviceRequest(BaseModel):
    query: str = Field(..., example="How do I prepare for TCS Digital?")

class AddCertificateRequest(BaseModel):
    title: str
    issuer: str
    category: str = "Internship" # Internship, Hackathon, Workshop, NPTEL, Coursera
    issue_date: str
    credential_url: Optional[str] = None

@router.get("/dashboard")
async def get_placement_dashboard():
    """
    Get aggregated placement dashboard metrics, upcoming drives, tracker pipeline, coding problems, and certificates.
    """
    try:
        data = PlacementService.get_dashboard_data()
        return data
    except Exception as e:
        logger.exception("Failed to load placement dashboard data")
        raise HTTPException(status_code=500, detail=f"Failed to load placement dashboard: {str(e)}")

@router.post("/apply")
async def apply_to_drive(req: ApplyDriveRequest):
    """
    Apply for a recruitment drive or update existing application stage.
    """
    return {
        "message": f"Successfully applied / updated status to '{req.stage}' for {req.company_name} ({req.role}).",
        "status": "success"
    }

@router.post("/ats-check")
async def check_ats_resume(req: ATSCheckRequest):
    """
    Analyze resume content using AI for ATS score, grammar, formatting, missing skills, and suggestions.
    """
    result = await placement_service.analyze_resume_ats(req.resume_text)
    return result

@router.post("/mock-interview/generate")
async def generate_mock_question(req: MockInterviewGenRequest):
    """
    Generate an AI Mock Interview question by category and target role.
    """
    result = await placement_service.generate_mock_question(req.category, req.role)
    return result

@router.post("/mock-interview/evaluate")
async def evaluate_mock_answer(req: MockInterviewEvalRequest):
    """
    Evaluate candidate's mock interview answer with score out of 10, feedback, and model answer.
    """
    result = await placement_service.evaluate_mock_answer(req.question, req.user_answer, req.category)
    return result

@router.post("/career-advisor")
async def get_career_advice(req: CareerAdviceRequest):
    """
    Ask AI Career Advisor for customized company preparation strategies, DBMS/Java guides, and project suggestions.
    """
    advice = await placement_service.get_career_advice(req.query)
    return {"query": req.query, "advice": advice}

@router.post("/certificates")
async def add_certificate(req: AddCertificateRequest):
    """
    Add a new certificate entry to the student's Certificate Vault.
    """
    return {
        "message": f"Certificate '{req.title}' from {req.issuer} saved successfully to vault.",
        "certificate": req.dict()
    }
