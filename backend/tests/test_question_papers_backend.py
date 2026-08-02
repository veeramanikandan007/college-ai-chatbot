import unittest
import os
import sys
import json
from pathlib import Path
from io import BytesIO

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import httpx
from app.main import app
from app.database.engine import SessionLocal
from app.database.init_db import init_db
from app.models.question_paper import QuestionPaperModel, PaperBookmarkModel

class TestQuestionPapersBackend(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        init_db()
        transport = httpx.ASGITransport(app=app)
        self.client = httpx.AsyncClient(transport=transport, base_url="http://testserver")
        self.db = SessionLocal()

    async def asyncTearDown(self):
        self.db.close()
        await self.client.aclose()

    async def test_01_get_papers_and_filter_meta(self):
        res = await self.client.get("/api/v1/question-papers/filters/meta")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("departments", data)
        self.assertIn("semesters", data)
        self.assertIn("regulations", data)

        res_list = await self.client.get("/api/v1/question-papers")
        self.assertEqual(res_list.status_code, 200)
        papers = res_list.json()
        self.assertIsInstance(papers, list)
        self.assertGreaterEqual(len(papers), 1)

    async def test_02_upload_pdf_question_paper(self):
        pdf_content = b"%PDF-1.4 sample question paper text content"
        files = {
            "files": ("sample_network_2024.pdf", BytesIO(pdf_content), "application/pdf")
        }
        data = {
            "department": "Computer Science & Engineering",
            "semester": "5",
            "subject_code": "CS8591",
            "subject_name": "Computer Networks",
            "academic_year": "2024",
            "regulation": "R2021",
            "exam_type": "University Exam",
            "faculty_name": "Dr. Aris Thorne"
        }
        res = await self.client.post("/api/v1/question-papers/upload", files=files, data=data)
        self.assertEqual(res.status_code, 201)
        created = res.json()
        self.assertEqual(len(created), 1)
        self.assertEqual(created[0]["subject_code"], "CS8591")

    async def test_03_get_paper_details_and_history(self):
        paper = self.db.query(QuestionPaperModel).first()
        self.assertIsNotNone(paper)
        assert paper is not None
        paper_id = int(getattr(paper, "id"))

        res = await self.client.get(f"/api/v1/question-papers/{paper_id}")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["id"], paper_id)

        res_hist = await self.client.get("/api/v1/question-papers/user/history")
        self.assertEqual(res_hist.status_code, 200)
        hist_data = res_hist.json()
        self.assertTrue(any(p["id"] == paper_id for p in hist_data))

    async def test_04_toggle_bookmark(self):
        paper = self.db.query(QuestionPaperModel).first()
        self.assertIsNotNone(paper)
        assert paper is not None
        paper_id = int(getattr(paper, "id"))

        # Ensure clean initial bookmark state
        self.db.query(PaperBookmarkModel).filter(
            PaperBookmarkModel.user_id == 1,
            PaperBookmarkModel.paper_id == paper_id
        ).delete()
        self.db.commit()

        # Toggle ON
        res = await self.client.post(f"/api/v1/question-papers/{paper_id}/bookmark")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_bookmarked"])

        res_bm = await self.client.get("/api/v1/question-papers/user/bookmarks")
        self.assertEqual(res_bm.status_code, 200)
        bm_data = res_bm.json()
        self.assertTrue(any(p["id"] == paper_id for p in bm_data))

    async def test_05_ai_analysis_and_question_generation(self):
        paper = self.db.query(QuestionPaperModel).first()
        self.assertIsNotNone(paper)
        assert paper is not None
        paper_id = int(getattr(paper, "id"))

        res_analysis = await self.client.get(f"/api/v1/question-papers/{paper_id}/analysis")
        self.assertEqual(res_analysis.status_code, 200)
        analysis_data = res_analysis.json()
        self.assertIn("question_pattern", analysis_data)
        self.assertIn("important_units", analysis_data)

        res_gen = await self.client.post(
            f"/api/v1/question-papers/{paper_id}/generate-questions",
            json={"question_type": "2_marks"}
        )
        self.assertEqual(res_gen.status_code, 200)
        gen_data = res_gen.json()
        self.assertIn("questions", gen_data)
        self.assertGreater(len(gen_data["questions"]), 0)

    async def test_06_rag_chat(self):
        paper = self.db.query(QuestionPaperModel).first()
        self.assertIsNotNone(paper)
        assert paper is not None
        paper_id = int(getattr(paper, "id"))

        res_chat = await self.client.post(
            f"/api/v1/question-papers/{paper_id}/rag-chat",
            json={"question": "Explain sliding window protocol in question 3"}
        )
        self.assertEqual(res_chat.status_code, 200)
        chat_data = res_chat.json()
        self.assertIn("answer", chat_data)
        self.assertTrue(len(chat_data["answer"]) > 10)

if __name__ == "__main__":
    unittest.main()
