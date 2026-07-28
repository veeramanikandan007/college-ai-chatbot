import asyncio
from typing import List, Dict, Any
from fastapi import WebSocket
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate

class ConnectionManager:
    def __init__(self):
        # Maps user_id to a list of active WebSocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

def get_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 50, filter_type: str = None, unread_only: bool = False):
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if filter_type and filter_type.lower() != 'all':
        query = query.filter(Notification.type == filter_type)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

def get_unread_count(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).count()

def mark_as_read(db: Session, notification_id: int, user_id: int):
    notification = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if notification and not notification.is_read:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
        return notification
    return None

def mark_all_as_read(db: Session, user_id: int):
    db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True})
    db.commit()

def delete_notification(db: Session, notification_id: int, user_id: int):
    notification = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if notification:
        db.delete(notification)
        db.commit()
        return True
    return False

async def create_notification(db: Session, notification_in: NotificationCreate):
    db_notification = Notification(**notification_in.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    # Broadcast to websocket
    await manager.send_personal_message({
        "event": "new_notification",
        "data": {
            "id": db_notification.id,
            "title": db_notification.title,
            "message": db_notification.message,
            "type": db_notification.type,
            "priority": db_notification.priority,
            "icon": db_notification.icon,
            "is_read": db_notification.is_read,
            "created_at": db_notification.created_at.isoformat() if db_notification.created_at else None
        }
    }, notification_in.user_id)
    return db_notification
