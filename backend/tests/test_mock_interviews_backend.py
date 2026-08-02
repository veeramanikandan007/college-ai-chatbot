import unittest
import os
import sys
import json
from pathlib import Path
from datetime import datetime

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import httpx
from app.main import app
from app.database.engine import SessionLocal
from app.database.init_db import init_db
from app.models.mock_interview import MockInterviewModel, InterviewQaLogModel

class TestMockInterviewsBackend(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        init_db()
        transport = httpx.ASGITransport(app=app)
        self.client = httpx.AsyncClient(transport=transport, base_url="http://testserver")
        self.db = SessionLocal()

    async def asyncTearDown(self):
        self.db.close()
        await self.client.aclose()

    async def test_01_get_mock_interviews_and_stats(self):
        # Ensure a mock interview exists in db
        if self.db.query(MockInterviewModel).count() == 0:
            demo_interview = MockInterviewModel(
                user_id=1,
                title="Full Stack React & FastAPI Technical Interview",
                interview_type="Technical",
                difficulty="Medium",
                duration_minutes=20,
                target_role="Full Stack Developer",
                overall_score=88.5,
                status="Completed",
                strengths=json.dumps(["Knowledge of hooks"]),
                weaknesses=json.dumps(["Database pooling"]),
                improvements=json.dumps(["Review connection limits"])
            )
            self.db.add(demo_interview)
            self.db.commit()

        # Fetch interview history
        res = await self.client.get("/api/v1/mock-interviews")
        self.assertEqual(res.status_code, 200)
        history = res.json()
        self.assertIsInstance(history, list)
        self.assertGreaterEqual(len(history), 1)

        # Fetch dashboard stats
        res_stats = await self.client.get("/api/v1/mock-interviews/dashboard/stats")
        self.assertEqual(res_stats.status_code, 200)
        stats_data = res_stats.json()
        self.assertIn("total_interviews", stats_data)
        self.assertIn("average_score", stats_data)
        self.assertIn("best_score", stats_data)

    async def test_02_start_interview_and_submit_answer(self):
        # Start interview session
        payload_start = {
            "title": "Backend Python Developer Interview",
            "interview_type": "Technical",
            "difficulty": "Medium",
            "duration_minutes": 20,
            "target_role": "Backend Engineer"
        }
        res_start = await self.client.post("/api/v1/mock-interviews/start", json=payload_start)
        self.assertEqual(res_start.status_code, 201)
        session = res_start.json()
        session_id = session["id"]

        # Submit answer to Q1
        payload_ans = {
            "student_answer": "In Python, decorators are functions that wrap other functions to modify their behavior cleanly using standard @syntax."
        }
        res_ans = await self.client.post(f"/api/v1/mock-interviews/{session_id}/submit-answer", json=payload_ans)
        self.assertEqual(res_ans.status_code, 200)
        ans_data = res_ans.json()
        self.assertIn("evaluation_score", ans_data)
        self.assertIn("model_answer", ans_data)

        # Evaluate session
        res_eval = await self.client.post(f"/api/v1/mock-interviews/{session_id}/evaluate")
        self.assertEqual(res_eval.status_code, 200)
        eval_data = res_eval.json()
        self.assertIn("overall_score", eval_data)
        self.assertIn("technical_accuracy_score", eval_data)
        self.assertIn("communication_score", eval_data)

        # Fetch report
        res_rep = await self.client.get(f"/api/v1/mock-interviews/{session_id}/report")
        self.assertEqual(res_rep.status_code, 200)
        rep_data = res_rep.json()
        self.assertIn("interview", rep_data)
        self.assertIn("qa_logs", rep_data)

    async def test_03_delete_interview_session(self):
        interview = self.db.query(MockInterviewModel).first()
        self.assertIsNotNone(interview)
        assert interview is not None
        i_id = int(getattr(interview, "id"))

        res = await self.client.delete(f"/api/v1/mock-interviews/{i_id}")
        self.assertEqual(res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
