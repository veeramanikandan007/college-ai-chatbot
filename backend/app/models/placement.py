from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Date, Boolean
from sqlalchemy.sql import func
from app.database.base import Base

class PlacementDrive(Base):
    __tablename__ = "placement_drives"

    id = Column(Integer, primary_key=True)
    company_name = Column(String, index=True)
    logo_url = Column(String, nullable=True)
    role = Column(String) # e.g. "Software Development Engineer"
    package_ctc = Column(String) # e.g. "14.5 LPA"
    eligibility_cgpa = Column(Float, default=7.0)
    min_backlogs = Column(Integer, default=0)
    last_date = Column(Date)
    drive_date = Column(Date)
    selection_process = Column(Text) # JSON or bullet string
    skills_required = Column(String) # comma separated e.g. "Java, Spring Boot, SQL, DSA"
    category = Column(String, default="Dream") # Dream, Super Dream, Core, Mass
    location = Column(String, default="Bangalore / Hybrid")
    job_description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    drive_id = Column(Integer, ForeignKey("placement_drives.id"))
    company_name = Column(String)
    role = Column(String)
    stage = Column(String, default="Applied") # Applied, Shortlisted, Technical Interview, HR Round, Selected, Rejected
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text, nullable=True)

class CodingQuestion(Base):
    __tablename__ = "coding_questions"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    difficulty = Column(String) # Easy, Medium, Hard
    category = Column(String) # Arrays, Strings, Linked List, Trees, Graphs, Dynamic Programming
    description = Column(Text)
    sample_input = Column(Text, nullable=True)
    sample_output = Column(Text, nullable=True)
    hints = Column(Text, nullable=True)
    solution_code = Column(Text, nullable=True)

class UserCodingProgress(Base):
    __tablename__ = "user_coding_progress"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    question_id = Column(Integer, ForeignKey("coding_questions.id"))
    status = Column(String, default="Solved") # Solved, Attempted
    submitted_code = Column(Text, nullable=True)
    solved_at = Column(DateTime(timezone=True), server_default=func.now())

class ResumeProfile(Base):
    __tablename__ = "resume_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    title = Column(String, default="Primary SDE Resume")
    ats_score = Column(Integer, default=85)
    grammar_score = Column(Integer, default=90)
    formatting_score = Column(Integer, default=88)
    missing_skills = Column(String, nullable=True)
    suggestions = Column(Text, nullable=True)
    template = Column(String, default="modern")
    resume_data = Column(Text, nullable=True) # JSON payload of resume fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    title = Column(String) # e.g. "Full Stack Developer Internship"
    issuer = Column(String) # e.g. "Amazon / NPTEL / Coursera"
    category = Column(String) # Internship, Hackathon, Workshop, NPTEL, Coursera
    issue_date = Column(Date)
    credential_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
