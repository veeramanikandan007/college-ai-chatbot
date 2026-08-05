from __future__ import annotations

from typing import Any, Dict, List, Tuple
import difflib

from app.rag.embedding_service import EmbeddingService
from app.rag.vector_store import VectorStore
from app.core.logging import get_logger

logger = get_logger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Phase 3: Smart RAG — Confidence thresholds for cosine distance
# ChromaDB cosine scores: 0.0 = identical, 2.0 = completely opposite
# ─────────────────────────────────────────────────────────────────────────────
CONFIDENCE_HIGH_THRESHOLD   = 0.35   # score ≤ 0.35  → HIGH
CONFIDENCE_MEDIUM_THRESHOLD = 0.70   # score ≤ 0.70  → MEDIUM
# anything above 0.70 is LOW


def _score_to_confidence(score: float) -> str:
    """Convert cosine distance to a human-readable confidence label."""
    if score <= CONFIDENCE_HIGH_THRESHOLD:
        return "HIGH"
    if score <= CONFIDENCE_MEDIUM_THRESHOLD:
        return "MEDIUM"
    return "LOW"


def _mmr_deduplicate(results: List[Dict[str, Any]], similarity_threshold: float = 0.85) -> List[Dict[str, Any]]:
    """
    Semantic MMR-style deduplication: drop chunks whose content is highly similar
    to a previously selected chunk using SequenceMatcher to avoid redundant context.
    """
    unique: List[Dict[str, Any]] = []
    
    for chunk in results:
        content = chunk.get("content", "").strip()
        if not content:
            continue
            
        is_duplicate = False
        for u in unique:
            u_content = u.get("content", "")
            # Quick check if exact match
            if content == u_content:
                is_duplicate = True
                break
                
            # Semantic similarity check using SequenceMatcher
            similarity = difflib.SequenceMatcher(None, content[:200], u_content[:200]).ratio()
            if similarity > similarity_threshold:
                is_duplicate = True
                break
                
        if not is_duplicate:
            unique.append(chunk)
            
    return unique


class Retriever:
    """
    Phase 3 Smart RAG Retriever.

    Responsibilities:
    - Cosine-similarity vector search via ChromaDB
    - Per-chunk confidence labelling (HIGH / MEDIUM / LOW)
    - MMR-style duplicate suppression for diverse evidence
    - Structured retrieval metadata (source, page, confidence, score)
    """

    def __init__(
        self,
        embedding_service: EmbeddingService | None = None,
        vector_store: VectorStore | None = None,
    ) -> None:
        self.embedding_service = embedding_service or EmbeddingService()
        self.vector_store = vector_store or VectorStore()

    # ── public API ────────────────────────────────────────────────────────────

    def retrieve(self, question: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieve top_k relevant chunks with confidence labels.

        Returns a list of dicts, each containing:
            content, source, filename, file_type, doc_title, page,
            distance (cosine), score (same value), confidence (HIGH/MEDIUM/LOW)
        """
        if not question or not question.strip():
            return []

        try:
            raw = self.vector_store.query(query_text=question, n_results=top_k + 5)
            enriched = self._enrich(raw)
            deduplicated = _mmr_deduplicate(enriched)
            return deduplicated[:top_k]
        except Exception as exc:
            logger.exception("Retrieval failed for question: %s", question)
            return []

    def retrieve_with_summary(self, question: str, top_k: int = 5) -> Tuple[List[Dict[str, Any]], str]:
        """
        Convenience wrapper that returns (chunks, overall_confidence_label).
        overall_confidence is the best (lowest) distance chunk's label.
        """
        chunks = self.retrieve(question, top_k=top_k)
        if not chunks:
            return [], "NONE"
        best_score = min(c.get("distance", 1.0) for c in chunks)
        overall = _score_to_confidence(best_score)
        return chunks, overall

    # ── private helpers ───────────────────────────────────────────────────────

    def _enrich(self, raw_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Add confidence label to each chunk."""
        for chunk in raw_chunks:
            score = float(chunk.get("distance", chunk.get("score", 1.0)))
            chunk["confidence"] = _score_to_confidence(score)
        # Sort ascending by distance (best first)
        return sorted(raw_chunks, key=lambda c: c.get("distance", 1.0))

