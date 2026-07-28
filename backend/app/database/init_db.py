from sqlalchemy.orm import Session
from app.database.engine import engine
from app.database.base import Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.notification import Notification

def init_db(db: Session = None):
    # Import all models to ensure they are registered with Base.metadata
    from app.models import user, chat, document, student, notification
    
    Base.metadata.create_all(bind=engine)

    if db:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@campusmate.edu").first()
        if not admin:
            admin_user = User(
                name="Admin User",
                email="admin@campusmate.edu",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            # Seed demo notifications for admin
            demo_notifications = [
                Notification(user_id=admin_user.id, title="Exam Tomorrow", message="Your final exam for CS101 starts at 9:00 AM.", type="Academic", priority="high", icon="book"),
                Notification(user_id=admin_user.id, title="Assignment Due", message="Machine Learning assignment is due in 2 hours.", type="Academic", priority="high", icon="file-text"),
                Notification(user_id=admin_user.id, title="AI Document Indexed", message="Your uploaded syllabus has been successfully indexed by CampusMate AI.", type="AI", priority="normal", icon="check-circle"),
                Notification(user_id=admin_user.id, title="Attendance Warning", message="Your attendance in Physics has dropped below 75%.", type="Alert", priority="high", icon="alert-triangle"),
                Notification(user_id=admin_user.id, title="Fee Reminder", message="Semester 4 tuition fee is due next week.", type="Administrative", priority="normal", icon="dollar-sign"),
                Notification(user_id=admin_user.id, title="Holiday Announcement", message="The campus will be closed on Friday for the public holiday.", type="Announcement", priority="low", icon="calendar")
            ]
            db.add_all(demo_notifications)
            db.commit()
