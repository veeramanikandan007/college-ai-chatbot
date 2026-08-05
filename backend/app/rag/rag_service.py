from __future__ import annotations

import os
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime

from app.rag.document_loader import DocumentLoader
from app.rag.embedding_service import EmbeddingService
from app.rag.hybrid_retriever import HybridRetriever
from app.rag.text_splitter import TextSplitter
from app.rag.vector_store import VectorStore
from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)


class RAGService:
    """Coordinate document loading, cleaning, chunking, embedding generation, ChromaDB persistence, and top-5 retrieval."""

    def __init__(self, documents_dir: Path | str | None = None) -> None:
        self.documents_dir = Path(documents_dir or getattr(settings, 'DOCUMENTS_DIR', './documents'))
        self.uploads_dir = Path(getattr(settings, 'UPLOAD_DIR', './uploads'))
        
        self.documents_dir.mkdir(parents=True, exist_ok=True)
        self.uploads_dir.mkdir(parents=True, exist_ok=True)

        self.document_loader = DocumentLoader(self.documents_dir)
        self.text_splitter = TextSplitter(chunk_size=1000, chunk_overlap=200)
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStore()
        self.retriever = HybridRetriever(self.embedding_service, self.vector_store)

    def process_and_index_file(self, file_path: Path | str) -> Dict[str, Any]:
        """Read single file, clean text, chunk (1000/200), generate embeddings, update ChromaDB."""
        path = Path(file_path)
        logger.info("Processing document for RAG indexing: %s", path.name)
        
        doc = self.document_loader.load_single_document(path)
        chunks = self.text_splitter.split_single_document(doc)
        
        if not chunks:
            raise ValueError(f"No chunks generated for file '{path.name}'. Content might be empty.")

        # Add to persistent ChromaDB
        count = self.vector_store.add_chunks(chunks)

        metadata = {
            "id": path.name,
            "filename": path.name,
            "file_type": doc['file_type'],
            "file_size": path.stat().st_size,
            "upload_date": datetime.fromtimestamp(path.stat().st_mtime).isoformat(),
            "chunks_count": len(chunks),
            "status": "indexed"
        }
        logger.info("Document '%s' successfully indexed with %s chunks into ChromaDB.", path.name, count)
        return metadata

    def remove_document(self, filename: str) -> bool:
        """Remove document file from uploads/documents directory and delete its vectors from ChromaDB."""
        target_found = False

        # Search in uploads and documents directory
        for search_dir in [self.uploads_dir, self.documents_dir]:
            file_path = search_dir / filename
            if file_path.exists():
                try:
                    file_path.unlink()
                    target_found = True
                    logger.info("Deleted physical file: %s", file_path)
                except Exception as e:
                    logger.error("Failed to delete file %s: %s", file_path, e)

        # Delete embeddings from vector store
        deleted_chunks = self.vector_store.delete_document_chunks(filename)
        logger.info("Removed %s vector chunks for '%s'", deleted_chunks, filename)
        return target_found or (deleted_chunks > 0)

    def get_all_documents_metadata(self) -> List[Dict[str, Any]]:
        """Return list of all uploaded documents with status and metadata."""
        docs_map: Dict[str, Dict[str, Any]] = {}
        
        # Scan directories
        for search_dir in [self.uploads_dir, self.documents_dir]:
            if not search_dir.exists():
                continue
            for file_path in search_dir.iterdir():
                if file_path.is_file() and file_path.suffix.lower() in ['.pdf', '.docx', '.txt']:
                    fname = file_path.name
                    if fname not in docs_map:
                        stat = file_path.stat()
                        docs_map[fname] = {
                            "id": fname,
                            "filename": fname,
                            "file_type": file_path.suffix.lstrip('.').lower(),
                            "file_size": stat.st_size,
                            "upload_date": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                            "status": "indexed" if self.vector_store.count() > 0 else "pending"
                        }

        return list(docs_map.values())

    def build_index(self, reset: bool = False) -> int:
        """Build or rebuild Chroma index from all supported documents in documents_dir & uploads_dir."""
        logger.info('Starting full RAG index build')
        if reset:
            self.vector_store.reset()

        total_chunks = 0
        for search_dir in [self.documents_dir, self.uploads_dir]:
            if not search_dir.exists():
                continue
            loader = DocumentLoader(search_dir)
            documents = loader.load_documents()
            if documents:
                chunks = self.text_splitter.split_documents(documents)
                indexed = self.vector_store.add_chunks(chunks)
                total_chunks += indexed

        if total_chunks > 0:
            self.retriever._init_bm25()

        logger.info('RAG index build completed. Total chunks indexed: %s', total_chunks)
        return total_chunks

    def ensure_index_ready(self) -> None:
        """Load existing vector DB or create it if empty and files exist."""
        try:
            if self.vector_store.count() > 0:
                return
        except Exception:
            pass

        try:
            self.build_index(reset=False)
        except Exception as exc:
            logger.exception('Unable to auto-build RAG index on startup: %s', exc)

    def retrieve_context(self, question: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve top-k relevant context chunks for a user question."""
        return self.retriever.retrieve(question, top_k=top_k)

    def retrieve_context_with_confidence(self, question: str, top_k: int = 5):
        """
        Phase 3 & 4: Retrieve chunks AND overall confidence label.

        Returns:
            (chunks: List[Dict], overall_confidence: str)
            overall_confidence is one of: HIGH, MEDIUM, LOW, NONE
        """
        return self.retriever.retrieve_with_summary(question, top_k=top_k)


