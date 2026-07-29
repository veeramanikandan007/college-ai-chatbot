from __future__ import annotations

import os
from typing import List, Sequence

from langchain_huggingface import HuggingFaceEmbeddings

from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)

class EmbeddingService:
    """Provide embeddings for text chunks using LangChain and HuggingFace BGE."""

    def __init__(self, model_name: str | None = None) -> None:
        self.model_name = model_name or "BAAI/bge-small-en-v1.5"
        self.encode_kwargs = {'normalize_embeddings': True} # set True to compute cosine similarity
        self.embeddings = HuggingFaceEmbeddings(
            model_name=self.model_name,
            model_kwargs={'device': 'cpu'},
            encode_kwargs=self.encode_kwargs
        )

    def create_embeddings(self, texts: Sequence[str]) -> List[List[float]]:
        """Create embeddings for a list of input texts (used primarily for fallback or manual processing)."""
        if not texts:
            return []

        try:
            vectors = self.embeddings.embed_documents(list(texts))
            logger.info('Generated %s embedding(s) using model %s', len(vectors), self.model_name)
            return vectors
        except Exception as exc:
            logger.exception('Embedding generation failed')
            raise ValueError(f'Failed to generate embeddings: {exc}') from exc

