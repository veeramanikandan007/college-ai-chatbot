from pathlib import Path
from typing import List, Optional

import chromadb
from langchain_core.documents import Document as LangchainDocument

try:
    from langchain_chroma import Chroma
except ImportError:  # pragma: no cover - fallback for compatibility
    try:
        from langchain_community.vectorstores import Chroma as Chroma
    except ImportError:  # pragma: no cover - final fallback
        Chroma = None

from ai import EmbeddingService
from rag import split_documents_to_chunks
from ingest import load_all_documents

VECTOR_DB_DIR = Path(__file__).resolve().parent.parent / 'vector_db'
VECTOR_DB_DIR.mkdir(parents=True, exist_ok=True)

COLLECTION_NAME = 'collegemate_documents'


def _get_chromadb_client() -> chromadb.PersistentClient:
    """Create a persistent ChromaDB client using the new API."""
    return chromadb.PersistentClient(path=str(VECTOR_DB_DIR))


def create_vector_store(documents: Optional[List[LangchainDocument]] = None):
    """Create or load a Chroma vector store with persisted embeddings."""
    embeddings = EmbeddingService()
    client = _get_chromadb_client()

    if documents is None:
        documents = split_documents_to_chunks(load_all_documents())

    if Chroma is None:
        raise RuntimeError('Chroma integration is unavailable. Install langchain-chroma or langchain-community.')

    return Chroma.from_documents(
        documents,
        embeddings._embeddings,
        collection_name=COLLECTION_NAME,
        client=client,
    )


def get_vector_store():
    """Load the existing vector store or create it if needed."""
    embeddings = EmbeddingService()
    client = _get_chromadb_client()

    # Check if collection already exists
    existing = [c.name for c in client.list_collections()]
    if COLLECTION_NAME not in existing:
        # Build from documents on first use
        return create_vector_store()

    return Chroma(
        embedding_function=embeddings._embeddings,
        client=client,
        collection_name=COLLECTION_NAME,
    )


def persist_vector_store(store) -> None:
    """No-op: ChromaDB PersistentClient auto-persists."""
    pass


def delete_vector_store() -> None:
    """Delete the persisted vector store directory."""
    import shutil
    if VECTOR_DB_DIR.exists():
        shutil.rmtree(VECTOR_DB_DIR)
    VECTOR_DB_DIR.mkdir(parents=True, exist_ok=True)


def rebuild_vector_store():
    """Rebuild the vector store from all documents."""
    # Delete the existing collection via client
    client = _get_chromadb_client()
    existing = [c.name for c in client.list_collections()]
    if COLLECTION_NAME in existing:
        client.delete_collection(COLLECTION_NAME)

    store = create_vector_store()
    return store
