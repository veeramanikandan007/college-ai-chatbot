import unittest
import asyncio
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

from app.services.ai_service import AIService


class TestAIService(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.rag_patch = patch('app.services.ai_service.RAGService')
        self.conv_patch = patch('app.services.ai_service.ConversationService')
        self.groq_patch = patch('app.services.ai_service.ChatGroq')

        self.MockRAG = self.rag_patch.start()
        self.MockConv = self.conv_patch.start()
        self.MockGroq = self.groq_patch.start()

        self.MockRAG.return_value = MagicMock()
        mock_conv = MagicMock()
        self.MockConv.return_value = mock_conv

        self.service = AIService()
        self.service.llm = MagicMock()

        async def dummy_ainvoke(*args, **kwargs):
            mock_resp = MagicMock()
            mock_resp.content = "Mocked AI Greeting!"
            return mock_resp

        self.service.llm.ainvoke = dummy_ainvoke

    async def asyncTearDown(self):
        self.rag_patch.stop()
        self.conv_patch.stop()
        self.groq_patch.stop()

    async def test_get_chat_answer_empty(self):
        with self.assertRaises(HTTPException) as exc:
            await self.service.get_chat_answer("   ")
        self.assertEqual(exc.exception.status_code, 400)

    async def test_get_chat_answer_knowledge(self):
        self.service.query_router.route_query = MagicMock(return_value="CAMPUS_QUERY")
        self.service.rag_service.retrieve_context.return_value = [
            {"content": "Campus opens at 8am.", "distance": 0.5, "source": "handbook.pdf", "filename": "handbook.pdf"}
        ]

        response = await self.service.get_chat_answer("What time does campus open?")
        self.assertIn("Mocked AI Greeting!", response)
        self.assertIn("**Sources:**", response)
        self.assertIn("- handbook.pdf", response)


if __name__ == "__main__":
    unittest.main()
