from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel


# ── Overview Metrics ──────────────────────────────────────────────────────────

class AnalyticsOverview(BaseModel):
    study_hours_week: float
    study_hours_month: float
    attendance_percentage: float
    quiz_average: float
    assignments_completed: int
    assignments_total: int
    interview_score: float
    documents_uploaded: int
    question_papers_solved: int
    placement_readiness: float
    weekly_progress: float
    monthly_progress: float


# ── AI Insights ───────────────────────────────────────────────────────────────

class AiInsightItem(BaseModel):
    type: str  # warning, tip, success, info
    title: str
    message: str
    subject: Optional[str] = None
    action_label: Optional[str] = None
    action_url: Optional[str] = None


class AiInsightsResponse(BaseModel):
    insights: List[AiInsightItem]
    generated_at: datetime


# ── Chart Data ────────────────────────────────────────────────────────────────

class ChartDataPoint(BaseModel):
    label: str
    value: float
    secondary_value: Optional[float] = None


class SubjectPerformancePoint(BaseModel):
    subject: str
    quiz_score: float
    attendance: float
    assignments: float


class AnalyticsChartsData(BaseModel):
    weekly_study_hours: List[ChartDataPoint]
    monthly_study_hours: List[ChartDataPoint]
    quiz_performance: List[ChartDataPoint]
    attendance_trend: List[ChartDataPoint]
    assignment_completion: List[ChartDataPoint]
    interview_scores: List[ChartDataPoint]
    subject_progress: List[SubjectPerformancePoint]


# ── Streaks ───────────────────────────────────────────────────────────────────

class StreakResponse(BaseModel):
    daily_study_streak: int
    quiz_streak: int
    attendance_streak: int
    assignment_streak: int
    last_activity_date: Optional[date] = None


# ── Goals ─────────────────────────────────────────────────────────────────────

class GoalCreateRequest(BaseModel):
    title: str
    category: str = "Academic"
    target_metric: str
    target_value: float
    current_value: float = 0.0
    unit: str = "%"
    deadline: Optional[date] = None


class GoalUpdateRequest(BaseModel):
    title: Optional[str] = None
    current_value: Optional[float] = None
    target_value: Optional[float] = None
    status: Optional[str] = None
    deadline: Optional[date] = None


class GoalResponse(BaseModel):
    id: int
    user_id: int
    title: str
    category: str
    target_metric: str
    target_value: float
    current_value: float
    unit: str
    deadline: Optional[date] = None
    status: str
    progress_percentage: float
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Export ────────────────────────────────────────────────────────────────────

class AnalyticsExportPayload(BaseModel):
    student_name: str
    export_date: datetime
    overview: AnalyticsOverview
    charts: AnalyticsChartsData
    goals: List[GoalResponse]
    streaks: StreakResponse
    insights: List[AiInsightItem]
