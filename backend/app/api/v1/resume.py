import json
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.services.resume_service import ResumeService
from app.schemas.resume import (
    ResumePayload,
    ResumeResponse,
    ATSEvaluationRequest,
    AIEnhanceRequest
)
from app.core.limiter import limiter

router = APIRouter()
resume_service = ResumeService()


@router.get("", response_model=ResumeResponse)
@router.get("/", response_model=ResumeResponse)
def get_resume(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Fetch current user's saved resume profile."""
    resume = resume_service.get_or_create_user_resume(db, user_id=current_user.id)
    resume_data = json.loads(resume.resume_data) if resume.resume_data else {}
    missing_skills = json.loads(resume.missing_skills) if resume.missing_skills else []
    suggestions = json.loads(resume.suggestions) if resume.suggestions else []

    return ResumeResponse(
        id=resume.id,
        user_id=resume.user_id,
        title=resume.title or "My Primary Resume",
        template=resume.template or "modern",
        resume_data=resume_data,
        ats_score=resume.ats_score or 85,
        grammar_score=resume.grammar_score or 90,
        formatting_score=resume.formatting_score or 88,
        missing_skills=missing_skills,
        suggestions=suggestions,
        updated_at=resume.updated_at
    )


@router.post("/create", response_model=ResumeResponse)
@router.put("/update", response_model=ResumeResponse)
@router.post("/save", response_model=ResumeResponse)
def save_resume(
    payload: ResumePayload,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Save or update student resume profile."""
    resume = resume_service.save_resume(db, user_id=current_user.id, payload=payload)
    resume_data = json.loads(resume.resume_data) if resume.resume_data else {}
    missing_skills = json.loads(resume.missing_skills) if resume.missing_skills else []
    suggestions = json.loads(resume.suggestions) if resume.suggestions else []

    return ResumeResponse(
        id=resume.id,
        user_id=resume.user_id,
        title=resume.title,
        template=resume.template,
        resume_data=resume_data,
        ats_score=resume.ats_score or 85,
        grammar_score=resume.grammar_score or 90,
        formatting_score=resume.formatting_score or 88,
        missing_skills=missing_skills,
        suggestions=suggestions,
        updated_at=resume.updated_at
    )


@router.delete("")
@router.delete("/")
def delete_resume(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Delete user's resume profile."""
    success = resume_service.delete_resume(db, user_id=current_user.id)
    return {"message": "Resume profile deleted successfully.", "success": success}


@router.post("/enhance")
@limiter.limit("20/minute")
async def enhance_section(
    request: Request,
    payload: AIEnhanceRequest,
    current_user: User = Depends(deps.get_current_user)
):
    """AI endpoint to improve grammar, action verbs, and impact of a resume section."""
    enhanced_text = await resume_service.enhance_content(
        section=payload.section,
        content=payload.content,
        context=payload.context
    )
    return {"enhanced_text": enhanced_text}


@router.post("/ats")
@limiter.limit("10/minute")
async def evaluate_ats_score(
    request: Request,
    payload: ATSEvaluationRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Evaluate ATS compatibility score and generate recommendations."""
    res = await resume_service.calculate_ats_score(
        resume_data=payload.resume_data,
        job_description=payload.job_description
    )

    # Persist scores in DB
    resume = resume_service.get_or_create_user_resume(db, user_id=current_user.id)
    resume.ats_score = res.get("overall_score", 88)
    resume.grammar_score = res.get("grammar_score", 90)
    resume.formatting_score = res.get("formatting_score", 92)
    resume.missing_skills = json.dumps(res.get("missing_skills", []))
    resume.suggestions = json.dumps(res.get("suggestions", []))
    db.commit()

    return res


@router.post("/pdf")
def generate_resume_pdf(
    payload: ResumePayload,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Backend endpoint for PDF export metadata or HTML document stream for printing.
    """
    return {
        "status": "ready",
        "title": payload.title,
        "template": payload.template,
        "filename": f"{payload.personalInfo.fullName.replace(' ', '_')}_Resume.pdf"
    }
