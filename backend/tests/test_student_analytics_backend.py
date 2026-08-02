"""
Backend test suite for AI Student Analytics Dashboard.
Tests: overview aggregation, AI insights, chart data, goals CRUD, streaks, and export endpoints.
"""
import sys
import os
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.engine import engine, SessionLocal
from app.database.base import Base
from app.database.init_db import init_db


class TestStudentAnalyticsBackend(unittest.TestCase):
    """Integration tests for /api/v1/analytics endpoints."""

    @classmethod
    def setUpClass(cls):
        """Initialize test database and seed data."""
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()
        init_db(cls.db)

        from app.models.user import User
        cls.user = cls.db.query(User).filter(User.email == "student@campusmate.edu").first()
        user_id_val: int = int(getattr(cls.user, 'id', 1) or 1)
        cls.user_id: int = user_id_val

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_overview_aggregation(self):
        """Test cross-module analytics overview returns all required metrics."""
        from app.api.v1.student_analytics import _get_overview_metrics
        overview = _get_overview_metrics(self.user_id, self.db)
        self.assertIsNotNone(overview)
        self.assertGreaterEqual(overview.attendance_percentage, 0.0)
        self.assertLessEqual(overview.attendance_percentage, 100.0)
        self.assertGreaterEqual(overview.quiz_average, 0.0)
        self.assertLessEqual(overview.quiz_average, 100.0)
        self.assertGreaterEqual(overview.study_hours_week, 0.0)
        self.assertGreaterEqual(overview.assignments_completed, 0)
        self.assertGreaterEqual(overview.placement_readiness, 0.0)
        self.assertLessEqual(overview.placement_readiness, 100.0)
        self.assertGreaterEqual(overview.weekly_progress, 0.0)
        self.assertLessEqual(overview.weekly_progress, 100.0)
        self.assertGreaterEqual(overview.monthly_progress, 0.0)
        print(f"  [PASS] Overview: Attendance={overview.attendance_percentage}%, Quiz={overview.quiz_average}%")

    def test_02_ai_insights_generation(self):
        """Test AI insights generation returns at least one insight."""
        from app.api.v1.student_analytics import _get_overview_metrics, _generate_ai_insights
        overview = _get_overview_metrics(self.user_id, self.db)
        insights = _generate_ai_insights(self.user_id, self.db, overview)
        self.assertIsInstance(insights, list)
        self.assertGreater(len(insights), 0)
        for insight in insights:
            self.assertIn(insight.type, ['warning', 'tip', 'success', 'info'])
            self.assertIsInstance(insight.title, str)
            self.assertGreater(len(insight.title), 0)
            self.assertIsInstance(insight.message, str)
        print(f"  [PASS] AI Insights: {len(insights)} insights generated")

    def test_03_chart_data_structure(self):
        """Test chart data returns all 7 expected datasets."""
        from app.api.v1.student_analytics import _get_chart_data
        charts = _get_chart_data(self.user_id, self.db)
        self.assertIsNotNone(charts)
        self.assertEqual(len(charts.weekly_study_hours), 7, "Weekly study hours must have 7 data points (Mon-Sun)")
        self.assertEqual(len(charts.monthly_study_hours), 4, "Monthly study hours must have 4 weekly points")
        self.assertGreater(len(charts.quiz_performance), 0)
        self.assertGreater(len(charts.attendance_trend), 0)
        self.assertGreater(len(charts.assignment_completion), 0)
        self.assertGreater(len(charts.interview_scores), 0)
        self.assertGreater(len(charts.subject_progress), 0)
        print(f"  [PASS] Charts: 7 datasets confirmed")

    def test_04_goals_crud(self):
        """Test goals create, read, update, and delete lifecycle."""
        from app.models.student_analytics import StudentGoalModel

        # Create
        goal = StudentGoalModel(
            user_id=self.user_id,
            title="Test Goal: Score 95% in AI Quiz",
            category="Academic",
            target_metric="Quiz Score",
            target_value=95.0,
            current_value=80.0,
            unit="%",
            status="In Progress"
        )
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        goal_id = goal.id
        self.assertIsNotNone(goal_id)
        print(f"  [PASS] Goal Created: id={goal_id}")

        # Update progress
        setattr(goal, "current_value", 90.0)
        self.db.commit()
        self.db.refresh(goal)
        self.assertEqual(float(getattr(goal, "current_value")), 90.0)
        print(f"  [PASS] Goal Updated: current_value=90.0")

        # Mark complete
        setattr(goal, "status", "Completed")
        setattr(goal, "current_value", 95.0)
        self.db.commit()
        self.db.refresh(goal)
        self.assertEqual(str(getattr(goal, "status")), "Completed")
        print(f"  [PASS] Goal Completed: status=Completed")

        # Delete
        self.db.delete(goal)
        self.db.commit()
        deleted = self.db.query(StudentGoalModel).filter(StudentGoalModel.id == goal_id).first()
        self.assertIsNone(deleted)
        print(f"  [PASS] Goal Deleted: id={goal_id}")

    def test_05_streaks_retrieval(self):
        """Test streaks record is retrievable or creatable for the student."""
        from app.models.student_analytics import StudentStreakModel
        streak = self.db.query(StudentStreakModel).filter(StudentStreakModel.user_id == self.user_id).first()
        if not streak:
            streak = StudentStreakModel(
                user_id=self.user_id,
                daily_study_streak=5,
                quiz_streak=3,
                attendance_streak=10,
                assignment_streak=2
            )
            self.db.add(streak)
            self.db.commit()
            self.db.refresh(streak)

        self.assertIsNotNone(streak)
        self.assertGreaterEqual(int(getattr(streak, "daily_study_streak") or 0), 0)
        self.assertGreaterEqual(int(getattr(streak, "quiz_streak") or 0), 0)
        self.assertGreaterEqual(int(getattr(streak, "attendance_streak") or 0), 0)
        self.assertGreaterEqual(int(getattr(streak, "assignment_streak") or 0), 0)
        print(f"  [PASS] Streaks: daily={getattr(streak, 'daily_study_streak')}, quiz={getattr(streak, 'quiz_streak')}, attendance={getattr(streak, 'attendance_streak')}, assignment={getattr(streak, 'assignment_streak')}")

    def test_06_export_payload_completeness(self):
        """Test export payload returns all required sections."""
        from app.api.v1.student_analytics import _get_overview_metrics, _get_chart_data, _generate_ai_insights
        from app.models.student_analytics import StudentGoalModel, StudentStreakModel

        overview = _get_overview_metrics(self.user_id, self.db)
        charts = _get_chart_data(self.user_id, self.db)
        insights = _generate_ai_insights(self.user_id, self.db, overview)
        goals = self.db.query(StudentGoalModel).filter(StudentGoalModel.user_id == self.user_id).all()
        streak = self.db.query(StudentStreakModel).filter(StudentStreakModel.user_id == self.user_id).first()

        self.assertIsNotNone(overview)
        self.assertIsNotNone(charts)
        self.assertIsInstance(insights, list)
        self.assertIsInstance(goals, list)
        print(f"  [PASS] Export Payload: overview, charts, {len(insights)} insights, {len(goals)} goals")


if __name__ == "__main__":
    print("=" * 60)
    print("AI Student Analytics — Backend Test Suite")
    print("=" * 60)
    loader = unittest.TestLoader()
    loader.sortTestMethodsUsing = lambda a, b: (int(a[5:7]) - int(b[5:7]))
    suite = loader.loadTestsFromTestCase(TestStudentAnalyticsBackend)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    print("\n" + "=" * 60)
    passed = result.testsRun - len(result.failures) - len(result.errors)
    print(f"Results: {passed}/{result.testsRun} PASSED")
    print("=" * 60)
    sys.exit(0 if result.wasSuccessful() else 1)
