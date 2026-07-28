from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    file_type: str
    file_size: int
    category: str
    is_indexed: bool
    chunk_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class RAGStatusResponse(BaseModel):
    total_documents: int
    indexed_documents: int
    total_chunks: int
    last_rebuild: Optional[datetime] = None
