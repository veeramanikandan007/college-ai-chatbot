from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List

from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.logging import get_logger

logger = get_logger(__name__)


class TextSplitter:
    """Split large documents into smaller, context-rich chunks using LangChain."""

    def __init__(self, chunk_size: int = 600, chunk_overlap: int = 120) -> None:
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )

    def split_documents(self, documents: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Split each document into overlapping chunks with metadata."""
        chunks: List[Dict[str, str]] = []
        for document in documents:
            text = document['content']
            split_chunks = self.splitter.split_text(text)
            for index, chunk_text in enumerate(split_chunks):
                chunks.append(
                    {
                        'source': document['source'],
                        'content': chunk_text.strip(),
                        'chunk_id': f"{Path(document['source']).name}:{index}",
                    }
                )

        logger.info('Created %s text chunk(s) for indexing', len(chunks))
        return chunks
