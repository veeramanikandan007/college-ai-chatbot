import sys
import os
import asyncio

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.engine import SessionLocal
from app.database.init_db import init_db
from app.models.user import User
from app.services.resume_service import ResumeService
from app.schemas.resume import ResumePayload, PersonalInfo, EducationItem, SkillCategory, ExperienceItem, ProjectItem


async def run_test():
    print("--- 1. Initializing Database & Resume Table ---")
    init_db()
    
    db = SessionLocal()
    try:
        student = db.query(User).filter(User.role == "student").first()
        if not student:
            print("ERROR: Student not found in DB.")
            return

        print(f"Testing with Student: {student.name} (ID: {student.id})")

        resume_service = ResumeService()

        # 2. Get/Create Resume
        print("\n--- 2. Fetching / Creating User Resume ---")
        resume = resume_service.get_or_create_user_resume(db, user_id=student.id)
        print(f"Resume ID: {resume.id}, Title: '{resume.title}', ATS Score: {resume.ats_score}")

        # 3. Save Resume
        print("\n--- 3. Saving Resume Payload ---")
        payload = ResumePayload(
            title="SDE Resume 2026",
            template="modern",
            personalInfo=PersonalInfo(
                fullName="Rahul Verma",
                email="rahul.verma@college.edu",
                phone="+91 98765 43210",
                location="Chennai, India",
                linkedin="https://linkedin.com/in/rahulverma",
                github="https://github.com/rahulverma",
                careerObjective="Motivated Software Engineer looking for Full Stack opportunities."
            ),
            education=[
                EducationItem(
                    institution="Campus Institute of Technology",
                    degree="B.Tech",
                    fieldOfStudy="Computer Science",
                    startDate="2021",
                    endDate="2025",
                    grade="8.8 CGPA"
                )
            ],
            skills=[
                SkillCategory(category="Languages", skills=["Python", "TypeScript", "C++"])
            ],
            experience=[
                ExperienceItem(
                    company="Tech Corp",
                    role="Software Intern",
                    startDate="Jun 2024",
                    endDate="Aug 2024",
                    description=["Built REST APIs with FastAPI.", "Optimized SQL queries."]
                )
            ],
            projects=[
                ProjectItem(
                    title="CollegeMate AI",
                    technologies=["FastAPI", "React", "ChromaDB"],
                    description=["Developed AI Chat with RAG search."]
                )
            ]
        )

        updated_resume = resume_service.save_resume(db, user_id=student.id, payload=payload)
        print(f"SUCCESS: Saved Resume Title: '{updated_resume.title}', Template: '{updated_resume.template}'")

        # 4. Test AI Section Enhancement
        print("\n--- 4. Testing AI Content Enhancer ---")
        enhanced = await resume_service.enhance_content(
            section="careerObjective",
            content="I am a CS student wanting a coding job."
        )
        print(f"Enhanced Objective:\n{enhanced}")

        # 5. Test ATS Evaluation
        print("\n--- 5. Testing ATS Score Calculation ---")
        ats_eval = await resume_service.calculate_ats_score(payload)
        print(f"ATS Evaluation Score: {ats_eval.get('overall_score')}%")
        print(f"Missing Skills: {ats_eval.get('missing_skills')}")
        print(f"Suggestions: {ats_eval.get('suggestions')}")

        print("\n=== ALL BACKEND AI RESUME BUILDER TESTS PASSED SUCCESSFULLY! ===")

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(run_test())
