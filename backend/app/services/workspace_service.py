from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.workspace import WorkspaceModel, workspace_documents, workspace_chats, workspace_notes, workspace_quizzes
from app.models.document import UploadedDocument
from app.models.chat import ChatSession
from app.models.note import NoteModel
from app.models.quiz import Quiz
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceListItem, WorkspaceDetailResponse
from app.core.logging import get_logger

logger = get_logger(__name__)


class WorkspaceService:
    def create_workspace(self, db: Session, user_id: int, payload: WorkspaceCreate) -> WorkspaceModel:
        """Create a new AI workspace."""
        workspace = WorkspaceModel(
            user_id=user_id,
            title=payload.title,
            description=payload.description or "",
            color=payload.color or "#1E4DB7",
            icon=payload.icon or "Folder",
            is_pinned=payload.is_pinned or False,
            is_favorite=payload.is_favorite or False
        )
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
        return workspace

    def get_user_workspaces(self, db: Session, user_id: int) -> List[WorkspaceListItem]:
        """Fetch all workspaces for a given user."""
        workspaces = db.query(WorkspaceModel).filter(WorkspaceModel.user_id == user_id).order_by(WorkspaceModel.is_pinned.desc(), WorkspaceModel.updated_at.desc()).all()
        
        result = []
        for ws in workspaces:
            item = WorkspaceListItem(
                id=ws.id,
                user_id=ws.user_id,
                title=ws.title,
                description=ws.description,
                color=ws.color,
                icon=ws.icon,
                is_pinned=ws.is_pinned,
                is_archived=ws.is_archived,
                is_favorite=ws.is_favorite,
                document_count=len(ws.documents),
                chat_count=len(ws.chats),
                note_count=len(ws.notes),
                created_at=ws.created_at,
                updated_at=ws.updated_at
            )
            result.append(item)
        return result

    def get_workspace_detail(self, db: Session, workspace_id: int, user_id: int) -> WorkspaceDetailResponse:
        """Fetch full details of a specific workspace."""
        ws = db.query(WorkspaceModel).filter(WorkspaceModel.id == workspace_id, WorkspaceModel.user_id == user_id).first()
        if not ws:
            raise HTTPException(status_code=404, detail="Workspace not found.")

        # Serialize linked items
        docs = [{"id": d.id, "filename": d.filename, "file_type": d.file_type} for d in ws.documents]
        chats = [{"id": c.id, "title": c.title, "updated_at": str(c.updated_at)} for c in ws.chats]
        notes = [{"id": n.id, "title": n.title, "document_name": n.document_name} for n in ws.notes]
        quizzes = [{"id": q.id, "title": q.title, "subject": q.subject} for q in ws.quizzes]

        return WorkspaceDetailResponse(
            id=ws.id,
            user_id=ws.user_id,
            title=ws.title,
            description=ws.description,
            color=ws.color,
            icon=ws.icon,
            is_pinned=ws.is_pinned,
            is_archived=ws.is_archived,
            is_favorite=ws.is_favorite,
            document_count=len(ws.documents),
            chat_count=len(ws.chats),
            note_count=len(ws.notes),
            created_at=ws.created_at,
            updated_at=ws.updated_at,
            documents=docs,
            chats=chats,
            notes=notes,
            quizzes=quizzes
        )

    def update_workspace(self, db: Session, workspace_id: int, user_id: int, payload: WorkspaceUpdate) -> WorkspaceModel:
        """Update workspace metadata."""
        ws = db.query(WorkspaceModel).filter(WorkspaceModel.id == workspace_id, WorkspaceModel.user_id == user_id).first()
        if not ws:
            raise HTTPException(status_code=404, detail="Workspace not found.")

        if payload.title is not None:
            ws.title = payload.title
        if payload.description is not None:
            ws.description = payload.description
        if payload.color is not None:
            ws.color = payload.color
        if payload.icon is not None:
            ws.icon = payload.icon
        if payload.is_pinned is not None:
            ws.is_pinned = payload.is_pinned
        if payload.is_archived is not None:
            ws.is_archived = payload.is_archived
        if payload.is_favorite is not None:
            ws.is_favorite = payload.is_favorite

        db.commit()
        db.refresh(ws)
        return ws

    def delete_workspace(self, db: Session, workspace_id: int, user_id: int) -> bool:
        """Delete workspace."""
        ws = db.query(WorkspaceModel).filter(WorkspaceModel.id == workspace_id, WorkspaceModel.user_id == user_id).first()
        if not ws:
            raise HTTPException(status_code=404, detail="Workspace not found.")
        db.delete(ws)
        db.commit()
        return True

    def link_item(self, db: Session, workspace_id: int, user_id: int, item_type: str, item_id: Any) -> bool:
        """Link an item (document, chat, note, quiz) to a workspace."""
        ws = db.query(WorkspaceModel).filter(WorkspaceModel.id == workspace_id, WorkspaceModel.user_id == user_id).first()
        if not ws:
            raise HTTPException(status_code=404, detail="Workspace not found.")

        if item_type == "document":
            doc = db.query(UploadedDocument).filter(UploadedDocument.id == int(item_id)).first()
            if doc and doc not in ws.documents:
                ws.documents.append(doc)
        elif item_type == "chat":
            chat = db.query(ChatSession).filter(ChatSession.id == str(item_id)).first()
            if chat and chat not in ws.chats:
                ws.chats.append(chat)
        elif item_type == "note":
            note = db.query(NoteModel).filter(NoteModel.id == int(item_id)).first()
            if note and note not in ws.notes:
                ws.notes.append(note)
        elif item_type == "quiz":
            quiz = db.query(Quiz).filter(Quiz.id == int(item_id)).first()
            if quiz and quiz not in ws.quizzes:
                ws.quizzes.append(quiz)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported item type '{item_type}'")

        db.commit()
        return True

    def unlink_item(self, db: Session, workspace_id: int, user_id: int, item_type: str, item_id: Any) -> bool:
        """Unlink an item from a workspace."""
        ws = db.query(WorkspaceModel).filter(WorkspaceModel.id == workspace_id, WorkspaceModel.user_id == user_id).first()
        if not ws:
            raise HTTPException(status_code=404, detail="Workspace not found.")

        if item_type == "document":
            ws.documents = [d for d in ws.documents if d.id != int(item_id)]
        elif item_type == "chat":
            ws.chats = [c for c in ws.chats if c.id != str(item_id)]
        elif item_type == "note":
            ws.notes = [n for n in ws.notes if n.id != int(item_id)]
        elif item_type == "quiz":
            ws.quizzes = [q for q in ws.quizzes if q.id != int(item_id)]
        
        db.commit()
        return True
