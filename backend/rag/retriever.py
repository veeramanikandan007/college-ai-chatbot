from __future__ import annotations

from typing import Any, Dict, List

from rag.embedding_service import EmbeddingService
from rag.vector_store import VectorStore
from utils.logging import get_logger

logger = get_logger(__name__)


class Retriever:
    """Retrieve the most relevant document chunks for a user question."""

    def __init__(self, embedding_service: EmbeddingService | None = None, vector_store: VectorStore | None = None) -> None:
        self.embedding_service = embedding_service or EmbeddingService()
        self.vector_store = vector_store or VectorStore()

    def retrieve(self, question: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """Embed the user question and retrieve the nearest chunks from Chroma."""
        if not question or not question.strip():
            return []

        try:
            embedding = self.embedding_service.create_embeddings([question])[0]
            return self.vector_store.query(query_embedding=embedding, n_results=top_k)
        except Exception as exc:
            logger.exception('Retrieval failed for question: %s', question)
            return []
