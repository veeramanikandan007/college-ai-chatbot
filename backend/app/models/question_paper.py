from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.database.base import Base

class PaperDepartmentModel(Base):
    __tablename__ = "departments"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, index=True, nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)

class PaperRegulationModel(Base):
    __tablename__ = "regulations"

    id = Column(Integer, primary_key=True, index=True)
    year_name = Column(String(20), unique=True, index=True, nullable=False)

class PaperSubjectModel(Base):
    __tablename__ = "subjects"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    subject_code = Column(String(50), unique=True, index=True, nullable=False)
    subject_name = Column(String(150), index=True, nullable=False)
    department = Column(String(150), index=True, nullable=False)
    semester = Column(Integer, index=True, nullable=False)
    regulation = Column(String(20), index=True, nullable=False)

class QuestionPaperModel(Base):
    __tablename__ = "question_papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    subject_code = Column(String(50), nullable=False, index=True)
    subject_name = Column(String(150), nullable=False, index=True)
    department = Column(String(150), nullable=False, index=True)
    semester = Column(Integer, nullable=False, index=True)
    academic_year = Column(Integer, nullable=False, index=True)
    regulation = Column(String(20), nullable=False, index=True)
    exam_type = Column(String(50), default="University Exam", index=True) # Internal, Model Exam, University Exam
    faculty_name = Column(String(150), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_url = Column(Text, nullable=False)
    file_size = Column(String(50), default="1.5 MB")
    page_count = Column(Integer, default=4)
    view_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    is_pinned = Column(Boolean, default=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PaperBookmarkModel(Base):
    __tablename__ = "paper_bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    paper_id = Column(Integer, ForeignKey("question_papers.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PaperHistoryModel(Base):
    __tablename__ = "paper_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    paper_id = Column(Integer, ForeignKey("question_papers.id"), nullable=False, index=True)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())

class PaperAnalysisModel(Base):
    __tablename__ = "paper_analysis"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("question_papers.id"), unique=True, nullable=False, index=True)
    question_pattern = Column(Text, nullable=True)
    important_units = Column(Text, nullable=True)
    repeated_questions = Column(Text, nullable=True)
    frequently_asked_topics = Column(Text, nullable=True)
    difficulty_analysis = Column(Text, nullable=True)
    unit_wise_distribution = Column(Text, nullable=True)
    expected_questions = Column(Text, nullable=True)
    weightage_analysis = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
