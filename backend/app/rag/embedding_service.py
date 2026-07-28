from __future__ import annotations

import os
from typing import List, Sequence

from google import genai

from app.core.logging import get_logger

logger = get_logger(__name__)


from app.core.config import settings

class EmbeddingService:
    """Generate embeddings for text chunks using Google GenAI embeddings."""

    def __init__(self, model: str | None = None) -> None:
        self.model = model or os.getenv('GEMINI_EMBEDDING_MODEL', 'models/gemini-embedding-2')
        api_key = settings.GEMINI_API_KEY
        self.client = genai.Client(api_key=api_key) if api_key else None

    def create_embeddings(self, texts: Sequence[str]) -> List[List[float]]:
        """Create embeddings for a list of input texts using Gemini."""
        if not texts:
            return []

        if not self.client:
            raise ValueError('GEMINI_API_KEY is not configured for embeddings')

        try:
            response = self.client.models.embed_content(
                model=self.model,
                contents=list(texts),
            )
            
            if not response.embeddings:
                raise ValueError('Empty embeddings response returned from Gemini API')
                
            embeddings = [x.values for x in response.embeddings]
            logger.info('Generated %s embedding(s) using model %s', len(embeddings), self.model)
            return embeddings
        except Exception as exc:
            logger.exception('Gemini embedding generation failed')
            raise ValueError(f'Failed to generate embeddings: {exc}') from exc
