from __future__ import annotations

from typing import Any, Dict, List

from app.rag.embedding_service import EmbeddingService
from app.rag.vector_store import VectorStore
from app.core.logging import get_logger

logger = get_logger(__name__)


class Retriever:
    """Retrieve the most relevant document chunks for a user question."""

    def __init__(self, embedding_service: EmbeddingService | None = None, vector_store: VectorStore | None = None) -> None:
        self.embedding_service = embedding_service or EmbeddingService()
        self.vector_store = vector_store or VectorStore()

    def retrieve(self, question: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve top_k (default 5) nearest chunks from ChromaDB via similarity search."""
        if not question or not question.strip():
            return []

        try:
            return self.vector_store.query(query_text=question, n_results=top_k)
        except Exception as exc:
            logger.exception('Retrieval failed for question: %s', question)
            return []

