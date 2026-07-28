from __future__ import annotations

import json
import math
import os
from pathlib import Path
from typing import Any, Dict, List

try:
    import chromadb
except ImportError:  # pragma: no cover - import guard for optional runtime dependencies
    chromadb = None

from app.core.logging import get_logger

logger = get_logger(__name__)


class VectorStore:
    """Persist and query a local Chroma vector database."""

    def __init__(self, persist_directory: str | None = None, collection_name: str = 'campusmate_docs') -> None:
        self.persist_directory = Path(
            persist_directory or os.getenv('CHROMA_PERSIST_DIRECTORY', str(Path(__file__).resolve().parents[1] / '.chroma'))
        )
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        self.client = None
        self.collection = None
        self.collection_name = collection_name
        self.fallback_store_path = self.persist_directory / 'fallback_index.json'
        self._fallback_store: List[Dict[str, Any]] = self._load_fallback_store()

        if chromadb is None:
            logger.warning('ChromaDB is not installed; vector retrieval will be unavailable until dependencies are installed')
            return

        try:
            self.client = chromadb.PersistentClient(path=str(self.persist_directory))
            self.collection = self.client.get_or_create_collection(name=self.collection_name)
        except Exception as exc:
            logger.exception('Unable to initialize ChromaDB client: %s', exc)
            self.client = None
            self.collection = None

    def _load_fallback_store(self) -> List[Dict[str, Any]]:
        """Load any previously persisted fallback index entries from disk."""
        if not self.fallback_store_path.exists():
            return []

        try:
            with self.fallback_store_path.open('r', encoding='utf-8') as handle:
                return json.load(handle)
        except Exception as exc:
            logger.exception('Failed to load fallback vector index: %s', exc)
            return []

    def _save_fallback_store(self) -> None:
        """Persist the fallback index to disk as JSON."""
        with self.fallback_store_path.open('w', encoding='utf-8') as handle:
            json.dump(self._fallback_store, handle, indent=2)

    def reset(self) -> None:
        """Clear the existing collection before re-indexing."""
        if self.client is not None:
            try:
                self.client.delete_collection(name=self.collection_name)
            except Exception:
                logger.debug('Collection not found before reset; creating a new one')

            self.collection = self.client.get_or_create_collection(name=self.collection_name)

        self._fallback_store = []
        self._save_fallback_store()

    def build_index(self, chunks: List[Dict[str, str]], embeddings: List[List[float]]) -> int:
        """Store chunk embeddings and metadata in Chroma."""
        if not chunks:
            logger.warning('No chunks available for indexing')
            return 0

        if self.collection is not None:
            ids = [chunk['chunk_id'] for chunk in chunks]
            documents = [chunk['content'] for chunk in chunks]
            metadatas = [
                {'source': chunk['source'], 'chunk_id': chunk['chunk_id']} for chunk in chunks
            ]

            self.collection.add(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)
            logger.info('Indexed %s chunk(s) in Chroma', len(chunks))
            return len(chunks)

        self._fallback_store = [
            {
                'id': chunk['chunk_id'],
                'document': chunk['content'],
                'metadata': {'source': chunk['source'], 'chunk_id': chunk['chunk_id']},
                'embedding': embedding,
            }
            for chunk, embedding in zip(chunks, embeddings)
        ]
        self._save_fallback_store()
        logger.info('Indexed %s chunk(s) in fallback local store', len(chunks))
        return len(chunks)

    def query(self, query_embedding: List[float], n_results: int = 4) -> List[Dict[str, Any]]:
        """Retrieve the most relevant chunks for a query embedding."""
        if self.collection is not None:
            results = self.collection.query(query_embeddings=[query_embedding], n_results=n_results)
            documents = results.get('documents', [[]])[0]
            metadatas = results.get('metadatas', [[]])[0]
            distances = results.get('distances', [[]])[0]

            retrieved: List[Dict[str, Any]] = []
            for index, document in enumerate(documents):
                if not document:
                    continue
                retrieved.append(
                    {
                        'content': document,
                        'source': metadatas[index].get('source', 'unknown') if index < len(metadatas) else 'unknown',
                        'distance': distances[index] if index < len(distances) else None,
                    }
                )

            logger.info('Retrieved %s relevant chunk(s)', len(retrieved))
            return retrieved

        scored_entries = []
        for entry in self._fallback_store:
            similarity = self._cosine_similarity(query_embedding, entry.get('embedding', []))
            if similarity <= 0:
                continue
            scored_entries.append((similarity, entry))

        scored_entries.sort(key=lambda item: item[0], reverse=True)
        retrieved = []
        for similarity, entry in scored_entries[:n_results]:
            retrieved.append(
                {
                    'content': entry.get('document', ''),
                    'source': entry.get('metadata', {}).get('source', 'unknown'),
                    'distance': 1 - similarity,
                }
            )

        logger.info('Retrieved %s relevant chunk(s) from fallback store', len(retrieved))
        return retrieved

    def _cosine_similarity(self, left: List[float], right: List[float]) -> float:
        """Compute cosine similarity between two embedding vectors."""
        if not left or not right:
            return 0.0

        combined_length = min(len(left), len(right))
        if combined_length == 0:
            return 0.0

        dot_product = sum(left[index] * right[index] for index in range(combined_length))
        left_norm = math.sqrt(sum(value * value for value in left[:combined_length]))
        right_norm = math.sqrt(sum(value * value for value in right[:combined_length]))
        if left_norm == 0 or right_norm == 0:
            return 0.0

        return dot_product / (left_norm * right_norm)
