from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class AssignmentBase(BaseModel):
    title: str = Field(..., description="Assignment title")
    subject: str = Field(..., description="Subject name")
    faculty: str = Field(..., description="Faculty/Instructor name")
    description: Optional[str] = Field(None, description="Detailed description")
    priority: str = Field("Medium", description="Priority level: High, Medium, Low")
    due_date: datetime = Field(..., description="Due date timestamp")
    status: str = Field("Pending", description="Status: Pending, Completed, Overdue")
    attachment_name: Optional[str] = None
    attachment_url: Optional[str] = None
    attachment_size: Optional[str] = None
    remarks: Optional[str] = None
    assigned_class: Optional[str] = "All Classes"

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    faculty: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    attachment_name: Optional[str] = None
    attachment_url: Optional[str] = None
    attachment_size: Optional[str] = None
    submission_time: Optional[datetime] = None
    remarks: Optional[str] = None
    assigned_class: Optional[str] = None

class AssignmentResponse(AssignmentBase):
    id: int
    created_at: datetime
    submission_time: Optional[datetime] = None
    user_id: Optional[int] = None
    created_by: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class AssignmentStats(BaseModel):
    total: int
    pending: int
    completed: int
    overdue: int
    upcoming: int

class AssignmentReminder(BaseModel):
    id: int
    title: str
    subject: str
    due_date: datetime
    reminder_type: str # '7 Days Before', '3 Days Before', '1 Day Before', 'On Due Date'
    days_left: int
    priority: str

class AssignmentAiRequest(BaseModel):
    action: str = Field(..., description="AI action: summarize | explain | solution_outline | checklist | estimate_time | study_plan")

class AssignmentAiResponse(BaseModel):
    action: str
    assignment_id: int
    result: str
    checklist: Optional[List[str]] = None
    study_plan: Optional[List[dict]] = None
    estimated_minutes: Optional[int] = None
