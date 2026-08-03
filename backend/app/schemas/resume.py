from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime


class PersonalInfo(BaseModel):
    fullName: str = "Rahul Verma"
    email: str = "rahul.verma@college.edu"
    phone: str = "+91 98765 43210"
    location: Optional[str] = "Chennai, India"
    linkedin: Optional[str] = "https://linkedin.com/in/rahulverma"
    github: Optional[str] = "https://github.com/rahulverma"
    portfolio: Optional[str] = "https://rahulverma.dev"
    careerObjective: Optional[str] = "Motivated Computer Science student looking for Software Engineering roles."


class EducationItem(BaseModel):
    institution: str
    degree: str
    fieldOfStudy: str
    startDate: str
    endDate: str
    grade: Optional[str] = ""


class SkillCategory(BaseModel):
    category: str  # e.g., "Languages", "Frameworks", "Tools"
    skills: List[str]


class ExperienceItem(BaseModel):
    company: str
    role: str
    location: Optional[str] = ""
    startDate: str
    endDate: str
    description: List[str]


class ProjectItem(BaseModel):
    title: str
    technologies: List[str]
    link: Optional[str] = ""
    description: List[str]


class CertificationItem(BaseModel):
    name: str
    issuer: str
    issueDate: Optional[str] = ""


class AchievementItem(BaseModel):
    title: str
    description: Optional[str] = ""


class ReferenceItem(BaseModel):
    name: str
    title: str
    company: str
    email: Optional[str] = ""
    phone: Optional[str] = ""


class ResumePayload(BaseModel):
    title: str = "My Primary Resume"
    template: str = "modern"  # modern, professional, minimal, corporate, student
    personalInfo: PersonalInfo
    education: List[EducationItem] = []
    skills: List[SkillCategory] = []
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    certifications: List[CertificationItem] = []
    achievements: List[AchievementItem] = []
    languages: List[str] = []
    hobbies: List[str] = []
    references: List[ReferenceItem] = []


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    template: str
    resume_data: ResumePayload
    ats_score: int
    grammar_score: int
    formatting_score: int
    missing_skills: List[str] = []
    suggestions: List[str] = []
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ATSEvaluationRequest(BaseModel):
    job_description: Optional[str] = ""
    resume_data: ResumePayload


class AIEnhanceRequest(BaseModel):
    section: str  # "careerObjective" | "experience" | "project" | "skills"
    content: str
    context: Optional[str] = ""
