from typing import List

from langchain_core.embeddings import Embeddings

from config import EMBEDDING_MODEL, FALLBACK_EMBEDDING_MODEL


class EmbeddingService:
    """Embedding service with fallback model selection."""

    def __init__(self) -> None:
        self.model_name = EMBEDDING_MODEL
        self.fallback_model_name = FALLBACK_EMBEDDING_MODEL
        self._embeddings = self._load_embeddings_model()

    def _load_embeddings_model(self) -> Embeddings:
        """Load the primary embedding model, fallback if it fails."""
        try:
            from langchain_huggingface import HuggingFaceEmbeddings

            return HuggingFaceEmbeddings(model_name=self.model_name)
        except Exception:
            try:
                from langchain_community.embeddings import SentenceTransformerEmbeddings

                return SentenceTransformerEmbeddings(model_name=self.fallback_model_name)
            except Exception:
                from langchain_huggingface import HuggingFaceEmbeddings

                return HuggingFaceEmbeddings(model_name=self.fallback_model_name)

    def embed_text(self, text: str) -> List[float]:
        """Embed a single query or piece of text."""
        return self._embeddings.embed_query(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of documents or text chunks."""
        return self._embeddings.embed_documents(texts)
