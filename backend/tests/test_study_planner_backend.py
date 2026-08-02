import unittest
import os
import sys
import json
from pathlib import Path
from datetime import date, timedelta

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import httpx
from app.main import app
from app.database.engine import SessionLocal
from app.database.init_db import init_db
from app.models.study_planner import StudyPlanModel, StudyTaskModel

class TestStudyPlannerBackend(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        init_db()
        transport = httpx.ASGITransport(app=app)
        self.client = httpx.AsyncClient(transport=transport, base_url="http://testserver")
        self.db = SessionLocal()

    async def asyncTearDown(self):
        self.db.close()
        await self.client.aclose()

    async def test_01_get_plans_analytics_and_suggestions(self):
        # Ensure a plan exists in db
        if self.db.query(StudyPlanModel).count() == 0:
            plan = StudyPlanModel(
                user_id=1,
                title="Semester 5 Exam Master Plan",
                exam_name="Anna University Exams",
                exam_date=date.today() + timedelta(days=14),
                available_hours_per_day=4.5,
                preferred_study_time="Evening",
                target_score_percentage=90,
                weak_subjects=json.dumps(["Computer Networks"]),
                strong_subjects=json.dumps(["Operating Systems"]),
                status="Active"
            )
            self.db.add(plan)
            self.db.commit()

        # Fetch study plans
        res_plans = await self.client.get("/api/v1/study-planner/plans")
        self.assertEqual(res_plans.status_code, 200)
        plans = res_plans.json()
        self.assertIsInstance(plans, list)
        self.assertGreaterEqual(len(plans), 1)

        # Fetch analytics
        res_analytics = await self.client.get("/api/v1/study-planner/analytics")
        self.assertEqual(res_analytics.status_code, 200)
        analytics = res_analytics.json()
        self.assertIn("days_to_exam", analytics)
        self.assertIn("daily_progress_percentage", analytics)
        self.assertIn("total_study_hours_allocated", analytics)

        # Fetch AI suggestions
        res_sug = await self.client.get("/api/v1/study-planner/suggestions")
        self.assertEqual(res_sug.status_code, 200)
        suggestions = res_sug.json()
        self.assertIsInstance(suggestions, list)
        self.assertGreaterEqual(len(suggestions), 1)

    async def test_02_generate_ai_study_plan(self):
        target_exam_date = (date.today() + timedelta(days=10)).isoformat()
        payload = {
            "title": "Unit Test Revision Master Plan",
            "exam_name": "UnitTest Semester Exams",
            "exam_date": target_exam_date,
            "available_hours_per_day": 5.0,
            "preferred_study_time": "Night",
            "target_score_percentage": 95,
            "weak_subjects": ["Computer Networks"],
            "strong_subjects": ["Operating Systems"]
        }
        res = await self.client.post("/api/v1/study-planner/generate", json=payload)
        self.assertEqual(res.status_code, 201)
        plan_data = res.json()
        self.assertEqual(plan_data["title"], "Unit Test Revision Master Plan")
        self.assertEqual(plan_data["status"], "Active")

    async def test_03_query_and_filter_tasks(self):
        res = await self.client.get("/api/v1/study-planner/tasks?date_filter=today")
        self.assertEqual(res.status_code, 200)
        tasks = res.json()
        self.assertIsInstance(tasks, list)

    async def test_04_toggle_task_status(self):
        task = self.db.query(StudyTaskModel).first()
        self.assertIsNotNone(task)
        assert task is not None
        task_id = int(getattr(task, "id"))

        # Toggle to Completed
        res = await self.client.patch(
            f"/api/v1/study-planner/tasks/{task_id}/status",
            json={"status": "Completed"}
        )
        self.assertEqual(res.status_code, 200)
        updated = res.json()
        self.assertEqual(updated["status"], "Completed")

        # Toggle back to Pending
        res_back = await self.client.patch(
            f"/api/v1/study-planner/tasks/{task_id}/status",
            json={"status": "Pending"}
        )
        self.assertEqual(res_back.status_code, 200)
        updated_back = res_back.json()
        self.assertEqual(updated_back["status"], "Pending")

    async def test_05_create_and_delete_custom_task(self):
        plan = self.db.query(StudyPlanModel).first()
        self.assertIsNotNone(plan)
        assert plan is not None
        plan_id = int(getattr(plan, "id"))

        payload = {
            "plan_id": plan_id,
            "subject_code": "CS8591",
            "subject_name": "Computer Networks",
            "title": "Custom Practice Task",
            "description": "Manual testing task creation",
            "task_type": "Study",
            "scheduled_date": date.today().isoformat(),
            "duration_minutes": 45,
            "priority": "High"
        }
        res = await self.client.post("/api/v1/study-planner/tasks", json=payload)
        self.assertEqual(res.status_code, 201)
        created_task = res.json()
        created_id = created_task["id"]

        # Delete task
        res_del = await self.client.delete(f"/api/v1/study-planner/tasks/{created_id}")
        self.assertEqual(res_del.status_code, 200)

if __name__ == "__main__":
    unittest.main()
