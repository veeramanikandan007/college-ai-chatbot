from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database.base import Base

# Association Tables
workspace_documents = Table(
    "workspace_documents",
    Base.metadata,
    Column("workspace_id", Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), primary_key=True),
    Column("document_id", Integer, ForeignKey("uploaded_documents.id", ondelete="CASCADE"), primary_key=True)
)

workspace_chats = Table(
    "workspace_chats",
    Base.metadata,
    Column("workspace_id", Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), primary_key=True),
    Column("chat_session_id", Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), primary_key=True)
)

workspace_notes = Table(
    "workspace_notes",
    Base.metadata,
    Column("workspace_id", Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), primary_key=True),
    Column("note_id", Integer, ForeignKey("ai_notes.id", ondelete="CASCADE"), primary_key=True)
)

workspace_quizzes = Table(
    "workspace_quizzes",
    Base.metadata,
    Column("workspace_id", Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), primary_key=True),
    Column("quiz_id", Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), primary_key=True)
)


class WorkspaceModel(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(50), default="#1E4DB7")  # Hex color code
    icon = Column(String(50), default="Folder")    # Lucide icon name
    is_pinned = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", backref="workspaces")
    documents = relationship("UploadedDocument", secondary=workspace_documents, backref="workspaces")
    chats = relationship("ChatSession", secondary=workspace_chats, backref="workspaces")
    notes = relationship("NoteModel", secondary=workspace_notes, backref="workspaces")
    quizzes = relationship("Quiz", secondary=workspace_quizzes, backref="workspaces")
