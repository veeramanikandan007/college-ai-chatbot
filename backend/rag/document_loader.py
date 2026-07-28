from __future__ import annotations

from pathlib import Path
from typing import List, Dict

try:
    from docx import Document as DocxDocument
except ImportError:  # pragma: no cover - import guard for optional runtime dependencies
    DocxDocument = None

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover - import guard for optional runtime dependencies
    PdfReader = None

from utils.logging import get_logger

logger = get_logger(__name__)

SUPPORTED_EXTENSIONS = {'.pdf': 'pdf', '.docx': 'docx', '.txt': 'txt'}


class DocumentLoader:
    """Load and normalize supported college documents into plain text."""

    def __init__(self, documents_dir: Path | None = None) -> None:
        self.documents_dir = documents_dir or Path(__file__).resolve().parents[2] / 'documents'

    def load_documents(self) -> List[Dict[str, str]]:
        """Read all supported files from the documents directory."""
        if not self.documents_dir.exists():
            logger.warning('Documents directory does not exist: %s', self.documents_dir)
            return []

        documents: List[Dict[str, str]] = []
        for file_path in sorted(self.documents_dir.rglob('*')):
            if not file_path.is_file():
                continue

            suffix = file_path.suffix.lower()
            if suffix not in SUPPORTED_EXTENSIONS:
                continue

            text = self._extract_text(file_path)
            if not text.strip():
                logger.warning('No readable text found in %s', file_path)
                continue

            documents.append({'source': str(file_path), 'content': text.strip()})
            logger.info('Loaded document: %s', file_path)

        logger.info('Loaded %s document(s) from %s', len(documents), self.documents_dir)
        return documents

    def _extract_text(self, file_path: Path) -> str:
        """Extract text from PDF, DOCX, or TXT files."""
        suffix = file_path.suffix.lower()
        if suffix == '.pdf':
            return self._read_pdf(file_path)
        if suffix == '.docx':
            return self._read_docx(file_path)
        if suffix == '.txt':
            return self._read_text(file_path)
        return ''

    def _read_pdf(self, file_path: Path) -> str:
        """Extract text from a PDF file page by page."""
        if PdfReader is None:
            logger.warning('pypdf is not installed; skipping PDF extraction for %s', file_path)
            return ''

        try:
            reader = PdfReader(str(file_path))
            pages = [page.extract_text() or '' for page in reader.pages]
            return '\n'.join(page for page in pages if page).strip()
        except Exception as exc:
            logger.exception('Failed to read PDF: %s', file_path)
            return ''

    def _read_docx(self, file_path: Path) -> str:
        """Extract text from a DOCX file."""
        if DocxDocument is None:
            logger.warning('python-docx is not installed; skipping DOCX extraction for %s', file_path)
            return ''

        try:
            document = DocxDocument(str(file_path))
            paragraphs = [paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()]
            return '\n'.join(paragraphs).strip()
        except Exception as exc:
            logger.exception('Failed to read DOCX: %s', file_path)
            return ''

    def _read_text(self, file_path: Path) -> str:
        """Read a plain text file using UTF-8 with fallback."""
        try:
            return file_path.read_text(encoding='utf-8').strip()
        except Exception:
            try:
                return file_path.read_text(encoding='latin-1').strip()
            except Exception as exc:
                logger.exception('Failed to read text file: %s', file_path)
                return ''
