from pathlib import Path
from typing import Dict, List

import pdfplumber
from docx import Document

SUPPORTED_EXTENSIONS = {'.pdf', '.docx', '.txt'}
BASE_DIR = Path(__file__).resolve().parent
DOCUMENTS_DIR = BASE_DIR / 'documents'


def list_document_files(directory: Path = DOCUMENTS_DIR) -> List[Path]:
    """List supported document files in the documents directory."""
    if not directory.exists() or not directory.is_dir():
        return []

    document_files = [
        path
        for path in sorted(directory.iterdir())
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ]
    return document_files


def read_pdf(path: Path) -> str:
    """Read text contents from a PDF file."""
    text_chunks: List[str] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_chunks.append(page_text)
    return '\n\n'.join(text_chunks)


def read_docx(path: Path) -> str:
    """Read text contents from a DOCX file."""
    document = Document(path)
    paragraphs = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
    return '\n'.join(paragraphs)


def read_txt(path: Path) -> str:
    """Read text contents from a TXT file."""
    return path.read_text(encoding='utf-8')


def read_document(path: Path) -> str:
    """Read a supported document and return its raw text."""
    suffix = path.suffix.lower()
    if suffix == '.pdf':
        return read_pdf(path)
    if suffix == '.docx':
        return read_docx(path)
    if suffix == '.txt':
        return read_txt(path)
    raise ValueError(f'Unsupported document type: {path.suffix}')


def clean_text(text: str) -> str:
    """Clean extracted text to remove extra whitespace and normalize spacing."""
    cleaned = ' '.join(text.split())
    return cleaned.strip()


def load_all_documents(directory: Path = DOCUMENTS_DIR) -> Dict[str, str]:
    """Load and clean all supported documents from the documents directory."""
    documents: Dict[str, str] = {}
    for path in list_document_files(directory):
        raw_text = read_document(path)
        cleaned_text = clean_text(raw_text)
        if cleaned_text:
            documents[path.name] = cleaned_text
    return documents
