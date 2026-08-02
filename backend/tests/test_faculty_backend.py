import sys
import os
import unittest
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.engine import engine, SessionLocal
from app.database.base import Base
from app.database.init_db import init_db
from app.models.faculty import FacultyProfileModel, FacultyAssignmentModel, FacultyQuestionPaperModel, FacultyQuizModel


class TestFacultyBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()
        init_db(cls.db)

        from app.models.user import User
        user = cls.db.query(User).first()
        if not user:
            user = User(name="Faculty Test", email="faculty_test@campusmate.edu", role="faculty")
            cls.db.add(user)
            cls.db.commit()
            cls.db.refresh(user)

        profile = cls.db.query(FacultyProfileModel).first()
        if not profile:
            profile = FacultyProfileModel(
                user_id=user.id,
                employee_id="FAC-2026-088",
                department="Computer Science & Engineering",
                designation="Associate Professor",
                office_room="Block B - 302",
                assigned_subjects="CS8591 Computer Networks, CS8492 Database Systems",
                assigned_sections="A, B"
            )
            cls.db.add(profile)
            cls.db.commit()
            cls.db.refresh(profile)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_faculty_profile_seeded(self):
        profile = self.db.query(FacultyProfileModel).first()
        self.assertIsNotNone(profile)
        self.assertEqual(profile.employee_id, "FAC-2026-088")
        print(f"  [PASS] Faculty Profile: id={profile.id}, department={profile.department}")

    def test_02_faculty_assignments_crud(self):
        profile = self.db.query(FacultyProfileModel).first()
        self.assertIsNotNone(profile)

        # Create
        assg = FacultyAssignmentModel(
            faculty_id=profile.id,
            title="Unit Test Assignment",
            subject_code="CS8080",
            section="A",
            description="Testing assignment creation",
            due_date="2026-09-01",
            max_marks=100
        )
        self.db.add(assg)
        self.db.commit()
        self.db.refresh(assg)
        self.assertIsNotNone(assg.id)

        # Read
        fetched = self.db.query(FacultyAssignmentModel).filter(FacultyAssignmentModel.id == assg.id).first()
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.title, "Unit Test Assignment")

        # Delete
        self.db.delete(fetched)
        self.db.commit()
        deleted = self.db.query(FacultyAssignmentModel).filter(FacultyAssignmentModel.id == assg.id).first()
        self.assertIsNone(deleted)
        print("  [PASS] Faculty Assignments CRUD")

    def test_03_faculty_question_papers_crud(self):
        profile = self.db.query(FacultyProfileModel).first()
        self.assertIsNotNone(profile)

        paper = FacultyQuestionPaperModel(
            faculty_id=profile.id,
            title="Unit Test Model Paper",
            subject_name="AI & Robotics",
            subject_code="CS8090",
            department="Computer Science",
            semester=6,
            academic_year="2025-2026",
            exam_type="Model Exam"
        )
        self.db.add(paper)
        self.db.commit()
        self.db.refresh(paper)
        self.assertIsNotNone(paper.id)

        self.db.delete(paper)
        self.db.commit()
        print("  [PASS] Faculty Question Papers CRUD")

    def test_04_faculty_quizzes_crud(self):
        profile = self.db.query(FacultyProfileModel).first()
        self.assertIsNotNone(profile)

        quiz = FacultyQuizModel(
            faculty_id=profile.id,
            title="Unit Test Quiz",
            subject_code="CS8492",
            section="A",
            num_questions=5,
            duration_minutes=15,
            total_marks=50,
            is_published=False
        )
        self.db.add(quiz)
        self.db.commit()
        self.db.refresh(quiz)
        self.assertIsNotNone(quiz.id)

        quiz.is_published = True
        self.db.commit()
        self.assertTrue(quiz.is_published)

        self.db.delete(quiz)
        self.db.commit()
        print("  [PASS] Faculty Quizzes CRUD & Publish Toggle")


if __name__ == "__main__":
    unittest.main()
