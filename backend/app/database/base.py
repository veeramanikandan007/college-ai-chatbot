from sqlalchemy.orm import declarative_base
from app.core.config import settings

Base = declarative_base()

if not settings.DATABASE_URL.startswith("sqlite"):
    Base.metadata.schema = "chatbot"
