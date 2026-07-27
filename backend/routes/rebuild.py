from fastapi import APIRouter, HTTPException

from ingest import list_document_files
from schemas import RebuildResponse
from services.vector_store import rebuild_vector_store

router = APIRouter()


@router.post('/rebuild', response_model=RebuildResponse, tags=['Admin'])
async def rebuild_embeddings() -> RebuildResponse:
    documents = list_document_files()
    if not documents:
        raise HTTPException(status_code=404, detail='No documents found.')

    rebuild_vector_store()
    return RebuildResponse(
        status='success',
        message='Vector database rebuilt successfully.',
    )
