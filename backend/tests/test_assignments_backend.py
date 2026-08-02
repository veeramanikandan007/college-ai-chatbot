import os
import sys
import unittest
from pathlib import Path
from datetime import datetime, timedelta

backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

import httpx
from app.main import app

class TestAssignmentsBackend(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        from app.database.init_db import init_db
        init_db()
        transport = httpx.ASGITransport(app=app)
        self.client = httpx.AsyncClient(transport=transport, base_url="http://testserver")

    async def test_01_create_assignment(self):
        due_date_str = (datetime.now() + timedelta(days=2)).isoformat()
        payload = {
            "title": "Pytest Data Structures Assignment",
            "subject": "Data Structures",
            "faculty": "Dr. pytest",
            "description": "Implement Binary Search Tree",
            "priority": "High",
            "due_date": due_date_str,
            "status": "Pending",
            "remarks": "Test run",
            "assigned_class": "CSE-3A"
        }

        res = await self.client.post("/api/v1/assignments", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["title"], "Pytest Data Structures Assignment")
        self.assertEqual(data["priority"], "High")
        self.assertIn("id", data)
        self.created_id = data["id"]

    async def test_02_get_assignments_list_and_stats(self):
        res = await self.client.get("/api/v1/assignments")
        self.assertEqual(res.status_code, 200)
        items = res.json()
        self.assertIsInstance(items, list)

        stats_res = await self.client.get("/api/v1/assignments/stats")
        self.assertEqual(stats_res.status_code, 200)
        stats = stats_res.json()
        self.assertIn("total", stats)
        self.assertIn("pending", stats)
        self.assertIn("completed", stats)
        self.assertIn("overdue", stats)

    async def test_03_get_reminders(self):
        res = await self.client.get("/api/v1/assignments/reminders")
        self.assertEqual(res.status_code, 200)
        reminders = res.json()
        self.assertIsInstance(reminders, list)

    async def test_04_upload_and_download_file(self):
        file_content = b"Mock PDF assignment instruction content for testing file upload."
        upload_res = await self.client.post(
            "/api/v1/assignments/upload",
            files={"file": ("test_assignment.pdf", file_content, "application/pdf")}
        )
        self.assertEqual(upload_res.status_code, 200)
        file_info = upload_res.json()
        self.assertEqual(file_info["attachment_name"], "test_assignment.pdf")
        self.assertIn("filename", file_info)

        # Download test
        filename = file_info["filename"]
        down_res = await self.client.get(f"/api/v1/assignments/download/{filename}")
        self.assertEqual(down_res.status_code, 200)
        self.assertEqual(down_res.content, file_content)

    async def test_05_ai_action_endpoints(self):
        # Create an assignment first
        due_date_str = (datetime.now() + timedelta(days=3)).isoformat()
        create_res = await self.client.post("/api/v1/assignments", json={
            "title": "AI Test Assignment",
            "subject": "Machine Learning",
            "faculty": "Dr. AI",
            "description": "Build Convolutional Neural Network for Image Classification",
            "priority": "Medium",
            "due_date": due_date_str
        })
        assg_id = create_res.json()["id"]

        actions = ["summarize", "explain", "solution_outline", "checklist", "estimate_time", "study_plan"]
        for act in actions:
            ai_res = await self.client.post(
                f"/api/v1/assignments/{assg_id}/ai-action",
                json={"action": act}
            )
            self.assertEqual(ai_res.status_code, 200)
            data = ai_res.json()
            self.assertEqual(data["action"], act)
            self.assertEqual(data["assignment_id"], assg_id)

    async def test_06_toggle_status_and_delete(self):
        due_date_str = (datetime.now() + timedelta(days=4)).isoformat()
        create_res = await self.client.post("/api/v1/assignments", json={
            "title": "Delete Target Assignment",
            "subject": "Networks",
            "faculty": "Prof. Test",
            "due_date": due_date_str
        })
        assg_id = create_res.json()["id"]

        # Toggle status
        status_res = await self.client.patch(f"/api/v1/assignments/{assg_id}/status")
        self.assertEqual(status_res.status_code, 200)
        self.assertEqual(status_res.json()["status"], "Completed")

        # Delete
        del_res = await self.client.delete(f"/api/v1/assignments/{assg_id}")
        self.assertEqual(del_res.status_code, 200)

        # Confirm 404 on get
        get_res = await self.client.get(f"/api/v1/assignments/{assg_id}")
        self.assertEqual(get_res.status_code, 404)

    async def asyncTearDown(self):
        await self.client.aclose()

if __name__ == "__main__":
    unittest.main()
