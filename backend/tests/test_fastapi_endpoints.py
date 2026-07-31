import os
import sys
import unittest
from pathlib import Path

backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

import httpx
from app.main import app


class TestFastAPIEndpoints(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        transport = httpx.ASGITransport(app=app)
        self.client = httpx.AsyncClient(transport=transport, base_url="http://testserver")

    async def test_01_health_check(self):
        response = await self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)

    async def test_02_get_documents(self):
        response = await self.client.get("/documents")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("documents", data)

    async def test_03_upload_document_validation(self):
        response = await self.client.post(
            "/upload-document",
            files={"file": ("malicious.exe", b"binary content", "application/octet-stream")}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Unsupported file type", response.json()["detail"])

        response = await self.client.post(
            "/upload-document",
            files={"file": ("empty.txt", b"", "text/plain")}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("empty", response.json()["detail"])

    async def test_04_upload_and_chat_and_delete_flow(self):
        test_content = b"College Mate AI Attendance Policy: Mandatory 75% attendance for end semester exams."
        upload_res = await self.client.post(
            "/upload-document",
            files={"file": ("test_policy.txt", test_content, "text/plain")}
        )
        self.assertEqual(upload_res.status_code, 200)
        self.assertEqual(upload_res.json()["status"], "success")

        chat_res = await self.client.post(
            "/chat",
            json={"message": "What is the mandatory attendance policy?"}
        )
        self.assertEqual(chat_res.status_code, 200)
        data = chat_res.json()
        self.assertIn("response", data)

        del_res = await self.client.delete("/document/test_policy.txt")
        self.assertEqual(del_res.status_code, 200)
        self.assertEqual(del_res.json()["status"], "success")

    async def asyncTearDown(self):
        await self.client.aclose()


if __name__ == "__main__":
    unittest.main()
