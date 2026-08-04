from __future__ import annotations

import os
from typing import List, Sequence

from app.core.logging import get_logger

logger = get_logger(__name__)


_GLOBAL_EMBEDDINGS_CACHE = {}

class EmbeddingService:
    """Provide embeddings for text chunks using Sentence Transformers (all-MiniLM-L6-v2)."""

    def __init__(self, model_name: str | None = None) -> None:
        self.model_name = model_name or "sentence-transformers/all-MiniLM-L6-v2"
        self._embeddings = None

    @property
    def embeddings(self):
        """Lazy load HuggingFaceEmbeddings model for memory performance."""
        if self._embeddings is None:
            cached = _GLOBAL_EMBEDDINGS_CACHE.get(self.model_name)
            if cached is not None:
                self._embeddings = cached
            else:
                logger.info("Initializing HuggingFaceEmbeddings with model: %s", self.model_name)
                embeddings_instance = None
                try:
                    from langchain_huggingface import HuggingFaceEmbeddings
                    embeddings_instance = HuggingFaceEmbeddings(
                        model_name=self.model_name,
                        model_kwargs={'device': 'cpu'},
                        encode_kwargs={'normalize_embeddings': True}
                    )
                except Exception as exc:
                    logger.warning("langchain_huggingface failed (%s), attempting langchain_community fallback.", exc)
                    try:
                        from langchain_community.embeddings import HuggingFaceEmbeddings as CommunityHuggingFaceEmbeddings
                        embeddings_instance = CommunityHuggingFaceEmbeddings(
                            model_name=self.model_name,
                            model_kwargs={'device': 'cpu'},
                            encode_kwargs={'normalize_embeddings': True}
                        )
                    except Exception as exc2:
                        logger.exception("Failed to initialize embedding model: %s", exc2)
                        raise RuntimeError(f"Embedding model initialization failed: {exc2}") from exc2
                
                if embeddings_instance is None:
                    raise RuntimeError(f"Embedding model initialization failed for {self.model_name}")

                self._embeddings = embeddings_instance
                _GLOBAL_EMBEDDINGS_CACHE[self.model_name] = self._embeddings
        return self._embeddings

    def create_embeddings(self, texts: Sequence[str]) -> List[List[float]]:
        """Create embeddings for a list of input texts."""
        if not texts:
            return []

        embeddings_model = self.embeddings
        if embeddings_model is None:
            raise ValueError("Embedding model is not initialized.")

        try:
            vectors = embeddings_model.embed_documents(list(texts))
            logger.info('Generated %s embedding(s) using model %s', len(vectors), self.model_name)
            return vectors
        except Exception as exc:
            logger.exception('Embedding generation failed')
            raise ValueError(f'Failed to generate embeddings: {exc}') from exc



