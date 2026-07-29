
import os, sys, asyncio
sys.path.insert(0, os.path.abspath("."))
from app.database.engine import SessionLocal
from app.models.chat import ChatSession
from app.models.document import UploadedDocument
from app.models.notification import Notification
from app.models.user import User
from app.services import notification_service
db = SessionLocal()
user = db.query(User).filter_by(role="admin").first()
print(notification_service.get_notifications(db, user.id, 0, 50, None, False))

