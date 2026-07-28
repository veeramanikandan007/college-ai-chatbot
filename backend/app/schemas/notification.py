from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    title: str = Field(..., max_length=255)
    message: str
    type: str = Field(..., max_length=50)
    priority: str = Field("normal", max_length=20)
    icon: Optional[str] = None
    action_url: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class NotificationCountResponse(BaseModel):
    unread_count: int
