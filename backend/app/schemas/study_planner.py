from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime, date

class StudyPlanBase(BaseModel):
    title: str = Field(..., description="Plan title e.g. Sem 5 Exam Master Plan")
    exam_name: str = Field(..., description="Exam name")
    exam_date: date = Field(..., description="Target exam date")
    available_hours_per_day: float = Field(4.0, description="Daily available study hours")
    preferred_study_time: str = Field("Evening", description="Preferred study time window")
    target_score_percentage: int = Field(90, description="Target score percentage")
    weak_subjects: List[str] = Field(default_factory=list, description="List of weak subjects")
    strong_subjects: List[str] = Field(default_factory=list, description="List of strong subjects")

class StudyPlanCreate(StudyPlanBase):
    pass

class StudyPlanResponse(StudyPlanBase):
    id: int
    user_id: int
    status: str = "Active"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StudyTaskBase(BaseModel):
    subject_code: str
    subject_name: str
    title: str
    description: Optional[str] = None
    task_type: str = "Study" # Study, Revision, Assignment, Quiz Practice, PYQP Analysis
    scheduled_date: date
    duration_minutes: int = 60
    priority: str = "Medium" # High, Medium, Low
    linked_module_type: Optional[str] = None
    linked_module_id: Optional[int] = None

class StudyTaskCreate(StudyTaskBase):
    plan_id: int

class StudyTaskResponse(StudyTaskBase):
    id: int
    plan_id: int
    user_id: int
    status: str = "Pending" # Pending, In Progress, Completed
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StudyTaskStatusUpdate(BaseModel):
    status: str = Field(..., description="Pending | In Progress | Completed")

class AiSuggestionItem(BaseModel):
    id: str
    title: str
    description: str
    subject_name: str
    suggestion_type: str # assignment, attendance, quiz, pyqp, document
    action_label: str
    priority: str = "High" # High, Medium, Low
    module_link: Optional[str] = None

class StudyAnalyticsResponse(BaseModel):
    days_to_exam: int
    daily_progress_percentage: float
    weekly_progress_percentage: float
    monthly_progress_percentage: float
    total_study_hours_allocated: float
    total_study_hours_completed: float
    completed_topics_count: int
    remaining_topics_count: int
    weak_subjects_status: List[Dict[str, Any]]

class StudyReminderResponse(BaseModel):
    id: int
    title: str
    reminder_type: str
    scheduled_time: datetime
    is_read: bool

    model_config = ConfigDict(from_attributes=True)
