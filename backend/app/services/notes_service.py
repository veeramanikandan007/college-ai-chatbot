import os
import json
import re
from pathlib import Path
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.note import NoteModel
from app.rag.document_loader import DocumentLoader
from app.rag.rag_service import RAGService
from app.services.ai_service import AIService
from app.core.logging import get_logger

logger = get_logger(__name__)


SYSTEM_NOTES_PROMPT = """
You are CollegeMate AI, an expert academic professor and study assistant.
Generate comprehensive, highly structured study notes from the provided textbook/document content.

Return ONLY a single valid raw JSON object matching the exact format below (do not wrap in extra commentary, do not include markdown code block backticks):

{
  "title": "Title of the Study Notes",
  "executive_summary": "High-level 2-3 paragraph overview of the core subject matter.",
  "chapter_summary": "Detailed chapter/section breakdown of the key topics covered in the document.",
  "key_concepts": [
    "Concept 1 with clear explanation",
    "Concept 2 with clear explanation",
    "Concept 3 with clear explanation"
  ],
  "definitions": [
    {"term": "Term 1", "definition": "Precise academic definition."},
    {"term": "Term 2", "definition": "Precise academic definition."}
  ],
  "formulae": [
    {"formula": "Mathematical / Algorithmic Formula", "description": "Variables and usage context."}
  ],
  "important_dates": [
    {"date_or_event": "Key Date / Event / Milestone", "significance": "Historical or technical significance."}
  ],
  "questions": {
    "two_marks": ["Short question 1?", "Short question 2?"],
    "five_marks": ["Medium analytical question 1?", "Medium question 2?"],
    "ten_marks": ["Comprehensive essay/problem question 1?", "Comprehensive question 2?"],
    "viva_questions": ["Oral exam / viva question 1?", "Viva question 2?"]
  },
  "flashcards": [
    {"front": "Flashcard Question / Key Prompt", "back": "Clear concise answer"}
  ],
  "mcqs": [
    {
      "question": "Multiple choice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Why Option A is correct."
    }
  ],
  "checklist": [
    "Understand topic X",
    "Memorize formula Y",
    "Practice question Z"
  ]
}
"""


class NotesService:
    def __init__(self):
        self.document_loader = DocumentLoader()
        self.rag_service = RAGService()
        self.ai_service = AIService()

    def _extract_json_payload(self, text: str) -> Dict[str, Any]:
        """Strip markdown codeblock wrappers if present and parse JSON."""
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.warning(f"Failed to parse direct JSON from LLM notes response: {exc}. Attempting regex extraction.")
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except Exception:
                    pass
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate valid structured notes from document."
            )

    async def generate_notes(
        self,
        db: Session,
        user_id: int,
        file_path: Optional[Path] = None,
        document_name: Optional[str] = None,
        document_id: Optional[int] = None
    ) -> NoteModel:
        """
        Extract document text, index into ChromaDB, run AI generation, and save NoteModel to database.
        """
        if not file_path or not file_path.exists():
            raise HTTPException(status_code=400, detail="Target document file not found.")

        fname = document_name or file_path.name
        logger.info(f"Generating AI notes for document: {fname} (User ID: {user_id})")

        # 1. Extract raw document text
        doc_data = self.document_loader.load_single_document(file_path)
        content = doc_data.get("content", "")
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file contains no extractable text.")

        # 2. Index in ChromaDB for future RAG queries
        try:
            self.rag_service.process_and_index_file(file_path)
        except Exception as e:
            logger.warning(f"Background ChromaDB indexing notice for notes: {e}")

        # 3. Truncate context if extremely large to fit model context window
        max_chars = 15000
        truncated_content = content[:max_chars]
        if len(content) > max_chars:
            truncated_content += f"\n\n[Note: Document truncated to first {max_chars} characters for note synthesis.]"

        prompt = f"Document Name: {fname}\n\nDocument Text:\n{truncated_content}"

        # 4. Invoke LLM
        raw_llm_response = await self.ai_service._get_llm_response(prompt, SYSTEM_NOTES_PROMPT)
        parsed_json = self._extract_json_payload(raw_llm_response)

        title = parsed_json.get("title") or f"Study Notes - {fname}"

        # 5. Create database record
        note_record = NoteModel(
            user_id=user_id,
            document_id=document_id,
            document_name=fname,
            title=title,
            summary=json.dumps({
                "executive_summary": parsed_json.get("executive_summary", ""),
                "chapter_summary": parsed_json.get("chapter_summary", "")
            }),
            key_concepts=json.dumps(parsed_json.get("key_concepts", [])),
            definitions=json.dumps(parsed_json.get("definitions", [])),
            formulae=json.dumps(parsed_json.get("formulae", [])),
            important_dates=json.dumps(parsed_json.get("important_dates", [])),
            questions=json.dumps(parsed_json.get("questions", {})),
            flashcards=json.dumps(parsed_json.get("flashcards", [])),
            mcqs=json.dumps(parsed_json.get("mcqs", [])),
            checklist=json.dumps(parsed_json.get("checklist", [])),
            full_content_json=json.dumps(parsed_json)
        )

        db.add(note_record)
        db.commit()
        db.refresh(note_record)
        return note_record

    def get_user_notes(self, db: Session, user_id: int, is_admin: bool = False) -> List[NoteModel]:
        """Fetch generated notes history."""
        if is_admin:
            return db.query(NoteModel).order_by(NoteModel.created_at.desc()).all()
        return db.query(NoteModel).filter(NoteModel.user_id == user_id).order_by(NoteModel.created_at.desc()).all()

    def get_note_by_id(self, db: Session, note_id: int, user_id: int, is_admin: bool = False) -> NoteModel:
        """Fetch single note details with permission check."""
        note = db.query(NoteModel).filter(NoteModel.id == note_id).first()
        if not note:
            raise HTTPException(status_code=404, detail="Requested note not found.")
        if note.user_id != user_id and not is_admin:
            raise HTTPException(status_code=403, detail="Access denied to this note.")
        return note

    def delete_note(self, db: Session, note_id: int, user_id: int, is_admin: bool = False) -> bool:
        """Delete note by ID."""
        note = self.get_note_by_id(db, note_id, user_id, is_admin)
        db.delete(note)
        db.commit()
        return True
