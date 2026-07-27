from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from ingest import clean_text, read_document
from schemas import UploadResponse
from services.vector_store import rebuild_vector_store
from utils.file_utils import validate_upload_filename, validate_upload_size, save_upload

router = APIRouter()


@router.post('/upload', response_model=UploadResponse, tags=['Admin'])
async def upload_document(file: UploadFile = File(...)) -> UploadResponse:
    validate_upload_filename(file.filename)
    validate_upload_size(file.file)

    uploaded_path = save_upload(file.file, file.filename)
    if not uploaded_path.exists():
        raise HTTPException(status_code=500, detail='Failed to save uploaded file.')

    document_text = clean_text(read_document(uploaded_path))
    if not document_text:
        raise HTTPException(status_code=400, detail='Uploaded document contains no readable text.')

    # Move uploaded file to documents directory so rebuild will include it.
    documents_dir = Path(__file__).resolve().parent.parent / 'documents'
    documents_dir.mkdir(parents=True, exist_ok=True)
    target_doc_path = documents_dir / file.filename
    uploaded_path.rename(target_doc_path)

    rebuild_vector_store()
    return UploadResponse(
        status='success',
        message='Document uploaded and vector database rebuilt successfully.',
    )
