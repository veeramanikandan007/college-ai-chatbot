from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class NoteBase(BaseModel):
    title: str
    content: str
    subject: Optional[str] = None

class NoteCreate(NoteBase):
    pass

class NoteResponse(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# We can add more student schemas (Attendance, Timetable, etc.) later
