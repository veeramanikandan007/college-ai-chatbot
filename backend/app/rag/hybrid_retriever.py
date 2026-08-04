from __future__ import annotations

import os
from typing import Any, Dict, List, Tuple
from rank_bm25 import BM25Okapi

from langchain_core.documents import Document
from app.rag.embedding_service import EmbeddingService
from app.rag.vector_store import VectorStore
from app.core.logging import get_logger
from app.rag.retriever import _score_to_confidence, _mmr_deduplicate

logger = get_logger(__name__)

class HybridRetriever:
    """
    Phase 3: Hybrid Search (Vector + BM25 Keyword Search) + Reciprocal Rank Fusion (RRF)
    Combines semantic understanding with exact keyword matches.
    """

    def __init__(
        self,
        embedding_service: EmbeddingService | None = None,
        vector_store: VectorStore | None = None,
    ) -> None:
        self.embedding_service = embedding_service or EmbeddingService()
        self.vector_store = vector_store or VectorStore()
        self.bm25: BM25Okapi | None = None
        self.corpus_chunks: List[Dict[str, Any]] = []
        
        self._init_bm25()

    def _init_bm25(self) -> None:
        """Initialize BM25 corpus from existing vector store documents."""
        if not self.vector_store.db:
            return

        try:
            stored = self.vector_store.db.get()
            documents = stored.get('documents', [])
            metadatas = stored.get('metadatas', [])
            
            if not documents:
                return

            self.corpus_chunks = []
            tokenized_corpus = []

            for doc, meta in zip(documents, metadatas):
                chunk_dict = {
                    'content': doc,
                    'source': meta.get('source', 'unknown'),
                    'filename': meta.get('filename', ''),
                    'file_type': meta.get('file_type', ''),
                    'doc_title': meta.get('doc_title', ''),
                    'page': meta.get('page', 1)
                }
                self.corpus_chunks.append(chunk_dict)
                # Simple tokenization for BM25
                tokenized_corpus.append(doc.lower().split())

            self.bm25 = BM25Okapi(tokenized_corpus)
            logger.info("BM25 Keyword index initialized with %d chunks.", len(self.corpus_chunks))
        except Exception as e:
            logger.error("Failed to initialize BM25 index: %s", e)

    def retrieve(self, question: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Hybrid Retrieval combining Vector (Chroma) and Keyword (BM25) via RRF.
        """
        if not question or not question.strip():
            return []

        try:
            # 1. Vector Search
            raw_vector_results = self.vector_store.query(query_text=question, n_results=top_k * 2)
            
            # 2. Keyword Search (BM25)
            bm25_results = []
            if self.bm25:
                tokenized_query = question.lower().split()
                # Get top K indices
                scores = self.bm25.get_scores(tokenized_query)
                # Sort indices by score descending
                top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k * 2]
                
                for idx in top_indices:
                    if scores[idx] > 0:
                        chunk = self.corpus_chunks[idx].copy()
                        chunk['bm25_score'] = float(scores[idx])
                        bm25_results.append(chunk)

            # 3. Reciprocal Rank Fusion (RRF)
            fused_results = self._reciprocal_rank_fusion(raw_vector_results, bm25_results, top_k=top_k + 5)
            
            # 4. Enrich & Deduplicate
            enriched = self._enrich_fused(fused_results)
            deduplicated = _mmr_deduplicate(enriched)
            
            return deduplicated[:top_k]
        except Exception as exc:
            logger.exception("Hybrid Retrieval failed for question: %s", question)
            return []

    def retrieve_with_summary(self, question: str, top_k: int = 5) -> Tuple[List[Dict[str, Any]], str]:
        """Returns (chunks, overall_confidence_label)."""
        chunks = self.retrieve(question, top_k=top_k)
        if not chunks:
            return [], "NONE"
            
        # In fused results, we use a normalized distance for confidence
        best_distance = min(c.get("distance", 1.0) for c in chunks)
        overall = _score_to_confidence(best_distance)
        return chunks, overall

    def _reciprocal_rank_fusion(
        self, 
        vector_results: List[Dict[str, Any]], 
        bm25_results: List[Dict[str, Any]], 
        top_k: int = 10,
        k_param: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Combines two ranked lists using Reciprocal Rank Fusion (RRF).
        """
        rrf_scores: Dict[str, float] = {}
        chunk_map: Dict[str, Dict[str, Any]] = {}

        # Process Vector Results
        for rank, chunk in enumerate(vector_results):
            content = chunk.get('content', '')
            if content not in chunk_map:
                chunk_map[content] = chunk.copy()
            rrf_scores[content] = rrf_scores.get(content, 0.0) + 1.0 / (k_param + rank + 1)

        # Process BM25 Results
        for rank, chunk in enumerate(bm25_results):
            content = chunk.get('content', '')
            if content not in chunk_map:
                chunk_map[content] = chunk.copy()
            rrf_scores[content] = rrf_scores.get(content, 0.0) + 1.0 / (k_param + rank + 1)

        # Sort by RRF score descending
        sorted_items = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
        
        fused = []
        for content, score in sorted_items[:top_k]:
            chunk = chunk_map[content]
            chunk['rrf_score'] = score
            # Approximate distance mapping for downstream confidence evaluator
            # RRF scores are usually between 0.0 and 0.033.
            # We map higher RRF score to lower "distance".
            chunk['distance'] = max(0.0, 1.0 - (score * 30))
            fused.append(chunk)

        return fused

    def _enrich_fused(self, fused_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Add confidence label to fused chunks based on approximate distance."""
        for chunk in fused_chunks:
            chunk["confidence"] = _score_to_confidence(chunk.get("distance", 1.0))
        return fused_chunks
