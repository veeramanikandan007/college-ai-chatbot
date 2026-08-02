from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

class MockInterviewStartRequest(BaseModel):
    title: str = Field(..., description="Interview session title")
    interview_type: str = Field("Technical", description="HR | Technical | Coding | Aptitude | Group Discussion")
    difficulty: str = Field("Medium", description="Easy | Medium | Hard")
    duration_minutes: int = Field(20, description="10 | 20 | 30")
    target_role: str = Field("Software Engineer", description="Target job role")

class InterviewQaLogResponse(BaseModel):
    id: int
    interview_id: int
    question_number: int
    question_text: str
    student_answer: Optional[str] = None
    audio_url: Optional[str] = None
    score: float = 0.0
    feedback: Optional[str] = None
    model_answer: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MockInterviewResponse(BaseModel):
    id: int
    user_id: int
    title: str
    interview_type: str
    difficulty: str
    duration_minutes: int
    target_role: str
    overall_score: float = 0.0
    communication_score: float = 0.0
    confidence_score: float = 0.0
    grammar_score: float = 0.0
    technical_accuracy_score: float = 0.0
    fluency_score: float = 0.0
    professionalism_score: float = 0.0
    completeness_score: float = 0.0
    status: str = "In Progress"
    feedback_summary: Optional[str] = None
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AnswerSubmitRequest(BaseModel):
    student_answer: str = Field(..., description="Student text or speech-to-text transcript answer")
    audio_url: Optional[str] = Field(None, description="Recorded voice audio URL")

class AnswerSubmitResponse(BaseModel):
    interview_id: int
    question_number: int
    evaluation_score: float
    feedback: str
    model_answer: str
    next_question: Optional[str] = None
    is_finished: bool = False

class InterviewEvaluationResponse(BaseModel):
    interview_id: int
    overall_score: float
    communication_score: float
    confidence_score: float
    grammar_score: float
    technical_accuracy_score: float
    fluency_score: float
    professionalism_score: float
    completeness_score: float
    feedback_summary: str
    strengths: List[str]
    weaknesses: List[str]
    improvements: List[str]
    qa_logs: List[InterviewQaLogResponse]

class MockInterviewDashboardStats(BaseModel):
    total_interviews: int
    average_score: float
    best_score: float
    completed_count: int
    recent_interviews: List[MockInterviewResponse]

class InterviewReportResponse(BaseModel):
    interview: MockInterviewResponse
    qa_logs: List[InterviewQaLogResponse]
    student_name: str = "Demo Student"
    college_name: str = "Anna University Affiliated Engineering College"
