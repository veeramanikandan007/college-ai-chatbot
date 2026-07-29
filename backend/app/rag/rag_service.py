from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List

from app.rag.document_loader import DocumentLoader
from app.rag.embedding_service import EmbeddingService
from app.rag.retriever import Retriever
from app.rag.text_splitter import TextSplitter
from app.rag.vector_store import VectorStore
from app.core.logging import get_logger

logger = get_logger(__name__)


class RAGService:
    """Coordinate document loading, indexing, and retrieval for the chat system."""

    def __init__(self, documents_dir: Path | None = None) -> None:
        self.documents_dir = documents_dir or Path(__file__).resolve().parents[2] / 'documents'
        self.document_loader = DocumentLoader(self.documents_dir)
        self.text_splitter = TextSplitter()
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStore()
        self.retriever = Retriever(self.embedding_service, self.vector_store)

    def build_index(self, reset: bool = False) -> int:
        """Build or rebuild the local Chroma index from all supported documents."""
        logger.info('Starting RAG index build from %s', self.documents_dir)
        documents = self.document_loader.load_documents()
        if not documents:
            logger.warning('No documents found to index')
            return 0

        chunks = self.text_splitter.split_documents(documents)
        if reset:
            self.vector_store.reset()

        indexed = self.vector_store.build_index(chunks)
        logger.info('RAG index build completed successfully')
        return indexed

    def ensure_index_ready(self) -> None:
        """Build the index on first use if the collection is empty and documents exist."""
        try:
            if self.vector_store.collection is None:
                return
            if self.vector_store.collection.count() > 0:
                return
        except Exception:
            return

        try:
            self.build_index(reset=False)
        except Exception as exc:
            logger.exception('Unable to initialize RAG index on demand: %s', exc)

    def retrieve_context(self, question: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """Retrieve relevant context chunks for a user question."""
        return self.retriever.retrieve(question, top_k=top_k)
