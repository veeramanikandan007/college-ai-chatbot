from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from langchain_chroma import Chroma
from langchain_core.documents import Document

from app.rag.embedding_service import EmbeddingService
from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)


class VectorStore:
    """Persist and query local Chroma vector database in vector_db/ directory using LangChain."""

    def __init__(self, persist_directory: str | None = None, collection_name: str = 'collegemate_docs') -> None:
        if persist_directory:
            self.persist_directory = Path(persist_directory)
        else:
            self.persist_directory = Path(getattr(settings, 'VECTOR_DB_DIR', './vector_db'))
        
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
                persist_directory=str(self.persist_directory),
                collection_metadata={"hnsw:space": "cosine"}
            )
            logger.info("ChromaDB vector database initialized at: %s", self.persist_directory)
        except Exception as exc:
            logger.exception('Unable to initialize ChromaDB vector store: %s', exc)

    def reset(self) -> None:
        """Clear the existing collection before re-indexing."""
        if self.db is not None:
            try:
                self.db.delete_collection()
            except Exception as e:
                logger.warning("Error deleting collection during reset: %s", e)
            self._init_db()

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """Store chunk metadata and content into ChromaDB."""
        if not chunks:
            logger.warning('No chunks provided for indexing')
            return 0

        documents = []
        ids = []
        for index, chunk in enumerate(chunks):
            doc = Document(
                page_content=chunk['content'],
                metadata={
                    'source': chunk.get('source', ''),
                    'filename': chunk.get('filename', ''),
                    'file_type': chunk.get('file_type', ''),
                    'doc_title': chunk.get('doc_title', chunk.get('filename', '')),
                    'page': chunk.get('page', 1),
                    'chunk_id': chunk.get('chunk_id', f"chunk_{index}"),
                    'chunk_index': chunk.get('chunk_index', index)
                }
            )
            documents.append(doc)
            chunk_unique_id = f"{chunk.get('filename', 'doc')}_{chunk.get('chunk_index', index)}"
            ids.append(chunk_unique_id)

        if self.db is not None:
            self.db.add_documents(documents=documents, ids=ids)
            logger.info('Indexed %s chunk(s) into ChromaDB', len(documents))
            return len(documents)
        return 0

    def build_index(self, chunks: List[Dict[str, Any]], embeddings: List[List[float]] = None) -> int:
        """Compatibility wrapper for build_index."""
        return self.add_chunks(chunks)

    def delete_document_chunks(self, filename: str) -> int:
        """Delete all vectors matching a specific filename from ChromaDB."""
        if self.db is None:
            return 0
        try:
            stored = self.db.get()
            ids_to_delete = []
            metadatas = stored.get('metadatas', [])
            all_ids = stored.get('ids', [])

            for doc_id, meta in zip(all_ids, metadatas):
                if meta and (meta.get('filename') == filename or Path(meta.get('source', '')).name == filename):
                    ids_to_delete.append(doc_id)

            if ids_to_delete:
                self.db.delete(ids=ids_to_delete)
                logger.info("Deleted %s vector chunk(s) for document '%s'", len(ids_to_delete), filename)
                return len(ids_to_delete)
        except Exception as exc:
            logger.exception("Failed to delete document chunks for %s: %s", filename, exc)
        return 0

    def query(self, query_text: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Retrieve top-k most relevant chunks using Cosine Similarity."""
        if not self.db or not query_text.strip():
            return []

        try:
            # similarity_search_with_score returns Tuple[Document, float]
            results = self.db.similarity_search_with_score(query_text, k=n_results)
            retrieved = []
            for doc, score in results:
                retrieved.append({
                    'content': doc.page_content,
                    'source': doc.metadata.get('source', 'unknown'),
                    'filename': doc.metadata.get('filename', os.path.basename(doc.metadata.get('source', ''))),
                    'file_type': doc.metadata.get('file_type', ''),
                    'doc_title': doc.metadata.get('doc_title') or os.path.basename(doc.metadata.get('source', '')),
                    'page': doc.metadata.get('page', 1),
                    'distance': float(score),
                    'score': float(score)
                })
            logger.info('Retrieved %s chunk(s) for query: "%s"', len(retrieved), query_text[:30])
            return retrieved
        except Exception as exc:
            logger.exception('Vector query search failed: %s', exc)
            return []

    def count(self) -> int:
        """Return total document chunks in ChromaDB."""
        if self.db is None:
            return 0
        try:
            stored = self.db.get()
            return len(stored.get('ids', []))
        except Exception:
            return 0

    @property
    def collection(self):
        """Mock collection to support legacy count checks."""
        class MockCollection:
            def __init__(self_mock, outer):
                self_mock.outer = outer
            def count(self_mock):
                return self_mock.outer.count()
        return MockCollection(self)

