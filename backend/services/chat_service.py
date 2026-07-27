from typing import List

from services.llm_service import OllamaLLMService
from services.prompt_service import build_prompt
from services.rag_service import get_relevant_documents, has_documents


class ChatService:
    """Chat pipeline coordinating retrieval and LLM generation."""

    def __init__(self) -> None:
        self.llm_service = OllamaLLMService()

    def ask(self, question: str) -> str:
        """Return a response to the user question using RAG."""
        if not has_documents():
            return 'No documents found.'

        documents = get_relevant_documents(question)
        if not documents:
            return "I couldn't find this information in the college knowledge base."

        context_chunks: List[str] = [doc.page_content for doc in documents]
        prompt = build_prompt(question, context_chunks)
        response = self.llm_service.generate(prompt)
        return response.strip() or "I couldn't find this information in the college knowledge base."
