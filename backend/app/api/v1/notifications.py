from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api import deps
from app.models.user import User
from app.schemas.notification import NotificationResponse, NotificationCreate, NotificationCountResponse
from app.services import notification_service

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    skip: int = 0, 
    limit: int = 50, 
    filter: Optional[str] = Query(None, description="Filter by type (all, academic, administrative, ai, alert)"),
    unread_only: bool = False,
    current_user: User = Depends(deps.get_current_user), 
    db: Session = Depends(deps.get_db)
):
    """Get notifications for current user."""
    return notification_service.get_notifications(db, current_user.id, skip, limit, filter, unread_only)

@router.get("/unread-count", response_model=NotificationCountResponse)
def get_unread_count(current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Get unread notification count."""
    count = notification_service.get_unread_count(db, current_user.id)
    return {"unread_count": count}

@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(notification_id: int, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Mark a notification as read."""
    notification = notification_service.mark_as_read(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.post("/read-all")
def mark_all_as_read(current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Mark all notifications as read."""
    notification_service.mark_all_as_read(db, current_user.id)
    return {"success": True}

@router.post("/{notification_id}/pin", response_model=NotificationResponse)
def toggle_pin(notification_id: int, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Toggle pin status of a notification."""
    notification = notification_service.toggle_pin(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.delete("/clear-all")
def clear_all_notifications(current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Clear all notifications for user."""
    notification_service.clear_all(db, current_user.id)
    return {"success": True}

@router.delete("/{notification_id}")
def delete_notification(notification_id: int, current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Delete a notification."""
    success = notification_service.delete_notification(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True}

@router.post("", response_model=NotificationResponse)
async def create_notification(
    notification_in: NotificationCreate, 
    current_user: User = Depends(deps.get_current_user), 
    db: Session = Depends(deps.get_db)
):
    """Create a notification (Admin only or system service)."""
    # For now, allow any authenticated user to create a notification for demo purposes, 
    # but in production this should be restricted to admins or internal services.
    return await notification_service.create_notification(db, notification_in)

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(deps.get_db)):
    """WebSocket endpoint for real-time notifications."""
    try:
        from app.core.config import settings
        from jose import jwt
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if not payload or not payload.get("sub"):
            await websocket.close(code=1008)
            return
        user_id = int(payload.get("sub"))
        
        await notification_service.manager.connect(websocket, user_id)
        try:
            while True:
                # Keep connection open, wait for client messages if any (ping/pong)
                data = await websocket.receive_text()
                # Could handle specific commands from client here if needed
        except WebSocketDisconnect:
            notification_service.manager.disconnect(websocket, user_id)
    except Exception as e:
        await websocket.close(code=1008)
