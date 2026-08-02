from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

class QuestionPaperBase(BaseModel):
    title: str = Field(..., description="Paper title")
    subject_code: str = Field(..., description="Subject code e.g. CS8591")
    subject_name: str = Field(..., description="Subject name")
    department: str = Field(..., description="Department e.g. CSE")
    semester: int = Field(..., description="Semester 1-8")
    academic_year: int = Field(..., description="Academic year e.g. 2023")
    regulation: str = Field(..., description="Regulation e.g. R2021")
    exam_type: str = Field("University Exam", description="Exam type: Internal | Model Exam | University Exam")
    faculty_name: Optional[str] = None
    file_name: str = Field(..., description="File name")
    file_url: str = Field(..., description="File download URL")
    file_size: Optional[str] = "1.5 MB"
    page_count: Optional[int] = 4

class QuestionPaperCreate(QuestionPaperBase):
    pass

class QuestionPaperUpdate(BaseModel):
    title: Optional[str] = None
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    academic_year: Optional[int] = None
    regulation: Optional[str] = None
    exam_type: Optional[str] = None
    faculty_name: Optional[str] = None

class QuestionPaperResponse(QuestionPaperBase):
    id: int
    view_count: int = 0
    download_count: int = 0
    is_pinned: bool = False
    is_bookmarked: bool = False
    uploaded_by: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FilterMetaResponse(BaseModel):
    departments: List[str]
    semesters: List[int]
    regulations: List[str]
    years: List[int]
    exam_types: List[str]
    subjects: List[Dict[str, str]]

class PaperAnalysisResponse(BaseModel):
    paper_id: int
    question_pattern: str
    important_units: List[str]
    repeated_questions: List[str]
    frequently_asked_topics: List[str]
    difficulty_analysis: Dict[str, Any]
    unit_wise_distribution: List[Dict[str, Any]]
    expected_questions: List[str]
    weightage_analysis: List[Dict[str, Any]]

class QuestionGenerateRequest(BaseModel):
    question_type: str = Field(..., description="Question type: mcqs | 2_marks | 5_marks | 10_marks | 16_marks | viva | similar")

class QuestionGenerateResponse(BaseModel):
    paper_id: int
    question_type: str
    questions: List[Dict[str, Any]]

class PaperRagChatRequest(BaseModel):
    question: str = Field(..., description="User query e.g. Explain Question 5")

class PaperRagChatResponse(BaseModel):
    paper_id: int
    question: str
    answer: str
    sources: List[str]
