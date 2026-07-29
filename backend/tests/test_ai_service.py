import pytest
import asyncio
from unittest.mock import MagicMock, patch
from app.services.ai_service import AIService
from app.services.conversation_service import Intent

@pytest.fixture
def mock_ai_service():
    with patch('app.services.ai_service.RAGService') as MockRAG, \
         patch('app.services.ai_service.ConversationService') as MockConv, \
         patch('app.services.ai_service.ChatGroq') as MockGroq:
         
         # Mock dependencies to avoid real API calls and slow DB/Embedding loads
         MockRAG.return_value = MagicMock()
         
         mock_conv = MagicMock()
         # By default, classify as GREETING
         mock_conv.classify_message.return_value = (Intent.GREETING, "")
         MockConv.return_value = mock_conv
         
         service = AIService()
         service.llm = MagicMock()
         
         # Mock ainvoke to return a dummy response
         async def dummy_ainvoke(*args, **kwargs):
             mock_resp = MagicMock()
             mock_resp.content = "Mocked AI Greeting!"
             return mock_resp
         
         service.llm.ainvoke = dummy_ainvoke
         
         yield service

@pytest.mark.asyncio
async def test_get_chat_answer_greeting(mock_ai_service):
    # The fixture already mocks classify_message to return Intent.GREETING
    response = await mock_ai_service.get_chat_answer("hi")
    assert response == "Mocked AI Greeting!"
    
@pytest.mark.asyncio
async def test_get_chat_answer_empty(mock_ai_service):
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc:
        await mock_ai_service.get_chat_answer("   ")
    assert exc.value.status_code == 400

@pytest.mark.asyncio
async def test_get_chat_answer_knowledge(mock_ai_service):
    # Change intent to knowledge
    mock_ai_service.conversation_service.classify_message.return_value = (Intent.CAMPUS_KNOWLEDGE, "")
    
    # Mock RAG retrieval
    mock_ai_service.rag_service.retrieve_context.return_value = [
        {"content": "Campus opens at 8am.", "distance": 0.5, "source": "handbook.pdf"}
    ]
    
    response = await mock_ai_service.get_chat_answer("What time does campus open?")
    
    assert "Mocked AI Greeting!" in response
    assert "**Sources:**" in response
    assert "- handbook.pdf" in response
