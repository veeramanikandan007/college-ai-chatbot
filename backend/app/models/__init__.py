"""Models package."""
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.models.document import UploadedDocument
from app.models.notification import Notification
from app.models.student import Attendance, Fee, Event, Note, LibraryBook, BookIssue
from app.models.quiz import Quiz, QuizAttempt
from app.models.attendance import SubjectAttendance, AttendanceLog
from app.models.placement import PlacementDrive, JobApplication, CodingQuestion, UserCodingProgress, ResumeProfile, Certificate
from app.models.timetable import Department, Subject, Faculty, TimetableEntry
from app.models.assignment import AssignmentModel
from app.models.question_paper import (
    QuestionPaperModel,
    PaperSubjectModel,
    PaperDepartmentModel,
    PaperRegulationModel,
    PaperBookmarkModel,
    PaperHistoryModel,
    PaperAnalysisModel,
)
from app.models.study_planner import StudyPlanModel, StudyTaskModel, StudyReminderModel
from app.models.mock_interview import MockInterviewModel, InterviewQaLogModel
from app.models.student_analytics import StudentGoalModel, StudentStreakModel
from app.models.faculty import (
    FacultyProfileModel,
    FacultyScheduleModel,
    FacultyAttendanceRecordModel,
    FacultyAssignmentModel,
    FacultySubmissionModel,
    FacultyQuestionPaperModel,
    FacultyQuizModel,
    FacultyQuizResultModel,
    FacultyTimetableRequestModel,
)
from app.models.note import NoteModel
from app.models.ocr import OCRScanModel
from app.models.workspace import WorkspaceModel
from app.models.admin import (
    AdminAuditLogModel,
    AdminDepartmentModel,
    AdminCourseModel,
    AdminAnnouncementModel,
    AdminSettingsModel,
)

__all__ = [
    "NoteModel",
    "OCRScanModel",
    "WorkspaceModel",
    "User",
    "ChatSession",
    "ChatMessage",
    "UploadedDocument",
    "Notification",
    "Attendance",
    "Fee",
    "Event",
    "Note",
    "LibraryBook",
    "BookIssue",
    "Quiz",
    "QuizAttempt",
    "SubjectAttendance",
    "AttendanceLog",
    "PlacementDrive",
    "JobApplication",
    "CodingQuestion",
    "UserCodingProgress",
    "ResumeProfile",
    "Certificate",
    "Department",
    "Subject",
    "Faculty",
    "TimetableEntry",
    "AssignmentModel",
    "QuestionPaperModel",
    "PaperSubjectModel",
    "PaperDepartmentModel",
    "PaperRegulationModel",
    "PaperBookmarkModel",
    "PaperHistoryModel",
    "PaperAnalysisModel",
    "StudyPlanModel",
    "StudyTaskModel",
    "StudyReminderModel",
    "MockInterviewModel",
    "InterviewQaLogModel",
    "StudentGoalModel",
    "StudentStreakModel",
    "FacultyProfileModel",
    "FacultyScheduleModel",
    "FacultyAttendanceRecordModel",
    "FacultyAssignmentModel",
    "FacultySubmissionModel",
    "FacultyQuestionPaperModel",
    "FacultyQuizModel",
    "FacultyQuizResultModel",
    "FacultyTimetableRequestModel",
    "AdminAuditLogModel",
    "AdminDepartmentModel",
    "AdminCourseModel",
    "AdminAnnouncementModel",
    "AdminSettingsModel",
]
