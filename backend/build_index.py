from __future__ import annotations

from pathlib import Path

from rag.rag_service import RAGService
from utils.logging import get_logger

logger = get_logger(__name__)


def main() -> None:
    """Rebuild the local vector index from all documents in the documents directory."""
    rag_service = RAGService(documents_dir=Path(__file__).resolve().parents[1] / 'documents')
    indexed_count = rag_service.build_index(reset=True)
    print(f'Indexed {indexed_count} chunk(s) into ChromaDB')


if __name__ == '__main__':
    main()
