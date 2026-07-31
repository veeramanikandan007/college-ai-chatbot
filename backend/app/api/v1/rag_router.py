from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Request
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import shutil
import re
from pathlib import Path
from datetime import datetime

from app.rag.rag_service import RAGService
from app.services.ai_service import AIService
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()
rag_service = RAGService()
ai_service = AIService()

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt"}


class ChatMessagePayload(BaseModel):
    message: str = Field(..., example="What is the attendance rule?")
    session_id: Optional[int] = None


class SimpleChatResponse(BaseModel):
    response: str
    message: Optional[str] = None
    sources: Optional[List[str]] = None


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal and special char issues."""
    name = os.path.basename(filename)
    name = re.sub(r'[^a-zA-Z0-9_.-]', '_', name)
    return name


@router.post("/upload")
@router.post("/upload-document")
@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a college document (PDF, DOCX, TXT).
    Automatically cleans text, generates chunks, generates embeddings using sentence-transformers,
    and updates ChromaDB vector store.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided in upload request."
        )

    clean_name = sanitize_filename(file.filename)
    ext = Path(clean_name).suffix.lower()

    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Supported formats: PDF, DOCX, TXT."
        )

    # Check file size
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE / (1024 * 1024):.1f}MB."
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded document is empty."
        )

    # Ensure uploads directory exists
    target_dir = Path(settings.UPLOAD_DIR)
    target_dir.mkdir(parents=True, exist_ok=True)
    dest_path = target_dir / clean_name

    # Check duplicate upload
    is_duplicate = dest_path.exists()

    try:
        with open(dest_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Process and index file in ChromaDB
        metadata = rag_service.process_and_index_file(dest_path)

        # Also place a copy in documents/ for backup consistency if different
        doc_backup = Path(settings.DOCUMENTS_DIR) / clean_name
        if doc_backup != dest_path:
            shutil.copy(dest_path, doc_backup)

        return {
            "status": "success",
            "message": f"Document '{clean_name}' uploaded and indexed successfully into ChromaDB.",
            "is_duplicate": is_duplicate,
            "document": metadata
        }
    except ValueError as val_err:
        if dest_path.exists():
            dest_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err)
        )
    except Exception as exc:
        logger.exception("Failed to process document upload for %s", clean_name)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document processing failed: {str(exc)}"
        )


@router.get("/documents")
def list_documents():
    """Retrieve list of all uploaded documents, upload dates, file types, and embedding status."""
    try:
        docs = rag_service.get_all_documents_metadata()
        return {
            "documents": docs,
            "total": len(docs)
        }
    except Exception as exc:
        logger.exception("Failed to list documents")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve documents: {str(exc)}"
        )


@router.delete("/document/{id}")
@router.delete("/documents/{id}")
def delete_document(id: str):
    """Delete document by filename/id and remove its vector embeddings from ChromaDB."""
    clean_name = sanitize_filename(id)
    try:
        removed = rag_service.remove_document(clean_name)
        if not removed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document '{clean_name}' not found."
            )
        return {
            "status": "success",
            "message": f"Document '{clean_name}' and its vector embeddings have been deleted successfully."
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to delete document %s", clean_name)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(exc)}"
        )


@router.post("/chat")
async def rag_chat_endpoint(payload: ChatMessagePayload):
    """
    RAG Chat endpoint.
    Performs Cosine Similarity search in ChromaDB, retrieves top 5 relevant chunks,
    sends context + query to Qwen2.5 (Ollama), and returns final response.
    """
    if not payload.message or not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message field cannot be empty."
        )

    try:
        answer = await ai_service.get_chat_answer(payload.message)
        return {
            "response": answer,
            "answer": answer
        }
    except Exception as exc:
        logger.exception("Error in RAG chat endpoint")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG Chat execution error: {str(exc)}"
        )

