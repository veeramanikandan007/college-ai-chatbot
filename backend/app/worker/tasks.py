import os
from pathlib import Path
from app.worker.celery_app import celery_app
from app.rag.rag_service import RAGService
from app.core.logging import get_logger
from app.database.session import get_db
from app.models.document import UploadedDocument
from sqlalchemy.orm import Session

logger = get_logger(__name__)

@celery_app.task(bind=True, name="process_document_task")
def process_document_task(self, file_path_str: str, document_id: int):
    """
    Background job to extract text, chunk, generate embeddings, and update Vector DB.
    """
    logger.info("Starting background processing for document %s", document_id)
    
    # Initialize DB session
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        rag_service = RAGService()
        
        # This function reads the file, cleans text, chunks, embeds, and adds to Chroma
        metadata = rag_service.process_and_index_file(file_path_str)
        
        # Re-initialize BM25 since we added new vectors
        if hasattr(rag_service, 'retriever') and hasattr(rag_service.retriever, '_init_bm25'):
            rag_service.retriever._init_bm25()
            
        # Update DB document status
        document = db.query(UploadedDocument).filter(UploadedDocument.id == document_id).first()
        if document:
            document.status = "indexed"
            db.commit()
            
        logger.info("Successfully processed document %s", document_id)
        return metadata
    except Exception as e:
        logger.error("Failed to process document %s: %s", document_id, e)
        # Update DB document status to failed
        document = db.query(UploadedDocument).filter(UploadedDocument.id == document_id).first()
        if document:
            document.status = "failed"
            db.commit()
        raise e
    finally:
        db.close()
