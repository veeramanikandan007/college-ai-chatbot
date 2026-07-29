from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List

from langchain_chroma import Chroma
from langchain_core.documents import Document

from app.rag.embedding_service import EmbeddingService
from app.core.logging import get_logger

logger = get_logger(__name__)


class VectorStore:
    """Persist and query a local Chroma vector database using LangChain."""

    def __init__(self, persist_directory: str | None = None, collection_name: str = 'campusmate_docs') -> None:
        self.persist_directory = Path(
            persist_directory or os.getenv('CHROMA_PERSIST_DIRECTORY', str(Path(__file__).resolve().parents[1] / '.chroma'))
        )
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        self.collection_name = collection_name
        self.embedding_service = EmbeddingService()
        self.db = None
        self._init_db()

    def _init_db(self):
        try:
            self.db = Chroma(
                collection_name=self.collection_name,
                embedding_function=self.embedding_service.embeddings,
                persist_directory=str(self.persist_directory)
            )
        except Exception as exc:
            logger.exception('Unable to initialize LangChain Chroma client: %s', exc)

    def reset(self) -> None:
        """Clear the existing collection before re-indexing."""
        if self.db is not None:
            self.db.delete_collection()
            self._init_db()

    def build_index(self, chunks: List[Dict[str, str]], embeddings: List[List[float]] = None) -> int:
        """Store chunk metadata in Chroma. (embeddings arg is ignored as LangChain handles it)"""
        if not chunks:
            logger.warning('No chunks available for indexing')
            return 0

        documents = []
        for chunk in chunks:
            doc = Document(
                page_content=chunk['content'],
                metadata={'source': chunk['source'], 'chunk_id': chunk['chunk_id']}
            )
            documents.append(doc)

        if self.db is not None:
            self.db.add_documents(documents)
            logger.info('Indexed %s chunk(s) in Chroma via LangChain', len(documents))
            return len(documents)
        return 0

    def query(self, query_text: str, n_results: int = 4) -> List[Dict[str, Any]]:
        """Retrieve the most relevant chunks using LangChain similarity search."""
        if self.db is not None:
            # similarity_search_with_score returns Tuple[Document, float]
            results = self.db.similarity_search_with_score(query_text, k=n_results)
            retrieved = []
            for doc, score in results:
                # In Chroma, lower score is usually better (distance), but we can normalize or pass it as distance
                retrieved.append({
                    'content': doc.page_content,
                    'source': doc.metadata.get('source', 'unknown'),
                    'distance': score
                })
            logger.info('Retrieved %s relevant chunk(s)', len(retrieved))
            return retrieved
        return []

    @property
    def collection(self):
        """Mock collection to support count checks in rag_service.py."""
        class MockCollection:
            def count(self2):
                if self.db is None:
                    return 0
                return len(self.db.get()['ids'])
        return MockCollection()
