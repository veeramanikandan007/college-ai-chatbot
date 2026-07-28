from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List

from app.core.logging import get_logger

logger = get_logger(__name__)


class TextSplitter:
    """Split large documents into smaller, context-rich chunks."""

    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 120) -> None:
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_documents(self, documents: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Split each document into overlapping chunks with metadata."""
        chunks: List[Dict[str, str]] = []
        for document in documents:
            text = document['content']
            split_chunks = self._split_text(text)
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

    def _split_text(self, text: str) -> List[str]:
        """Split text into chunks while preserving paragraph boundaries when possible."""
        if len(text) <= self.chunk_size:
            return [text]

        paragraphs = [paragraph.strip() for paragraph in re.split(r'\n\s*\n', text) if paragraph.strip()]
        if not paragraphs:
            return [text]

        chunks: List[str] = []
        current_chunk = ''
        for paragraph in paragraphs:
            candidate = f'{current_chunk}\n\n{paragraph}'.strip() if current_chunk else paragraph
            if len(candidate) <= self.chunk_size:
                current_chunk = candidate
                continue

            if current_chunk:
                chunks.append(current_chunk)
            if len(paragraph) > self.chunk_size:
                chunks.extend(self._split_long_paragraph(paragraph))
                current_chunk = ''
            else:
                current_chunk = paragraph

        if current_chunk:
            chunks.append(current_chunk)

        return self._apply_overlap(chunks)

    def _split_long_paragraph(self, paragraph: str) -> List[str]:
        """Fallback split for paragraphs exceeding the chunk size."""
        sentences = [sentence.strip() for sentence in re.split(r'(?<=[.!?])\s+', paragraph) if sentence.strip()]
        if len(sentences) == 1:
            return [paragraph[: self.chunk_size]]

        chunks: List[str] = []
        current_chunk = ''
        for sentence in sentences:
            candidate = f'{current_chunk} {sentence}'.strip() if current_chunk else sentence
            if len(candidate) <= self.chunk_size:
                current_chunk = candidate
                continue
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = sentence

        if current_chunk:
            chunks.append(current_chunk)
        return chunks

    def _apply_overlap(self, chunks: List[str]) -> List[str]:
        """Preserve a small overlap between adjacent chunks for better retrieval."""
        if len(chunks) <= 1:
            return chunks

        overlapped_chunks: List[str] = []
        for index, chunk in enumerate(chunks):
            if index == 0:
                overlapped_chunks.append(chunk)
                continue

            previous_chunk = overlapped_chunks[-1]
            overlap_text = previous_chunk[-self.chunk_overlap:] if self.chunk_overlap < len(previous_chunk) else previous_chunk
            overlapped_chunks.append(f'{overlap_text}\n\n{chunk}'.strip())

        return overlapped_chunks
