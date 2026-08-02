from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Any

from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.logging import get_logger

logger = get_logger(__name__)


def get_clean_title(filename: str) -> str:
    """Format raw filename into a professional document title."""
    stem = Path(filename).stem
    clean_stem = stem.replace('_', ' ').replace('-', ' ').strip().lower()
    
    title_map = {
        'sample attendance': 'Attendance Policy',
        'sample policy': 'Campus Library Policy',
        'sample grading': 'Grading System Guidelines',
        'college rules': 'College Rules & Code of Conduct',
        'attendance policy': 'Attendance Regulations',
        'library rules': 'Central Library Regulations',
        'hostel rules': 'Hostel Rules & Regulations',
        'transport details': 'Transportation & Bus Routes',
        'placement cell': 'Placement & Training Cell',
        'scholarships info': 'Scholarships & Financial Aid',
        'fee structure': 'Tuition & Hostel Fee Structure',
        'exam regulations': 'Anna University Exam Regulations',
        'departments overview': 'Academic Departments Overview',
        'faculty directory': 'Faculty & Staff Directory',
        'campus facilities': 'Campus Infrastructure & Facilities',
        'academic calendar': 'Academic Calendar 2025-2026',
        'events workshops': 'Events & Cultural Symposiums',
        'timetable schedule': 'Daily Timetable Schedule',
        'sports facilities': 'Sports & Physical Education',
        'nss wing': 'National Service Scheme (NSS)',
        'ncc unit': 'National Cadet Corps (NCC)',
        'anti ragging policy': 'Anti-Ragging Policy',
        'grievance redressal': 'Grievance Redressal Cell',
        'internships policy': 'Internship Guidelines',
        'projects guidelines': 'Student Project Guidelines',
        'admissions info': 'Admissions & Eligibility',
        'certificates process': 'Certificates & Documents',
        'medical facilities': 'Healthcare & Medical Services',
        'leave rules': 'Leave Application Rules'
    }
    
    if clean_stem in title_map:
        return title_map[clean_stem]
    return ' '.join(word.capitalize() for word in clean_stem.split())


class TextSplitter:
    """Split large documents into smaller, context-rich chunks using RecursiveCharacterTextSplitter."""

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200) -> None:
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )

    def split_single_document(self, document: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Split a single document dictionary into chunks with rich metadata."""
        text = document.get('content', '')
        if not text.strip():
            return []

        source = document.get('source', 'unknown')
        filename = document.get('filename', Path(source).name)
        file_type = document.get('file_type', Path(source).suffix.lstrip('.'))
        doc_title = document.get('doc_title') or get_clean_title(filename)

        split_chunks = self.splitter.split_text(text)
        chunks: List[Dict[str, Any]] = []

        for index, chunk_text in enumerate(split_chunks):
            chunk_str = chunk_text.strip()
            if not chunk_str:
                continue
            
            # Estimate page number for PDF documents based on chunk index
            page_num = document.get('page') or (index + 1 if file_type.lower() == 'pdf' else 1)

            chunks.append(
                {
                    'source': source,
                    'filename': filename,
                    'file_type': file_type,
                    'doc_title': doc_title,
                    'page': page_num,
                    'content': chunk_str,
                    'chunk_index': index,
                    'total_chunks': len(split_chunks),
                    'chunk_id': f"{filename}:{index}",
                }
            )
        return chunks

    def split_documents(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Split a list of documents into overlapping chunks with metadata."""
        chunks: List[Dict[str, Any]] = []
        for document in documents:
            doc_chunks = self.split_single_document(document)
            chunks.extend(doc_chunks)

        logger.info('Created %s text chunk(s) across %s document(s)', len(chunks), len(documents))
        return chunks

