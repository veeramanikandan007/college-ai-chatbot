from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.services.workspace_service import WorkspaceService
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceUpdate,
    WorkspaceListItem,
    WorkspaceDetailResponse,
    WorkspaceItemLinkRequest
)

router = APIRouter()
workspace_service = WorkspaceService()


@router.post("", response_model=WorkspaceListItem)
@router.post("/", response_model=WorkspaceListItem)
def create_workspace(
    payload: WorkspaceCreate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Create a new AI workspace."""
    ws = workspace_service.create_workspace(db, user_id=current_user.id, payload=payload)
    return WorkspaceListItem(
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


@router.get("", response_model=List[WorkspaceListItem])
@router.get("/", response_model=List[WorkspaceListItem])
def list_workspaces(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """List all AI workspaces for the current user."""
    return workspace_service.get_user_workspaces(db, user_id=current_user.id)


@router.get("/{workspace_id}", response_model=WorkspaceDetailResponse)
def get_workspace_detail(
    workspace_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Fetch details and linked resources for a specific workspace."""
    return workspace_service.get_workspace_detail(db, workspace_id=workspace_id, user_id=current_user.id)


@router.put("/{workspace_id}", response_model=WorkspaceListItem)
def update_workspace(
    workspace_id: int,
    payload: WorkspaceUpdate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Update workspace title, description, color, icon, pin/favorite/archive status."""
    ws = workspace_service.update_workspace(db, workspace_id=workspace_id, user_id=current_user.id, payload=payload)
    return WorkspaceListItem(
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


@router.delete("/{workspace_id}")
def delete_workspace(
    workspace_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Delete workspace."""
    workspace_service.delete_workspace(db, workspace_id=workspace_id, user_id=current_user.id)
    return {"message": "Workspace deleted successfully.", "id": workspace_id}


@router.post("/{workspace_id}/items")
def link_item_to_workspace(
    workspace_id: int,
    payload: WorkspaceItemLinkRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Link a document, chat, note, or quiz to a workspace."""
    workspace_service.link_item(
        db,
        workspace_id=workspace_id,
        user_id=current_user.id,
        item_type=payload.item_type,
        item_id=payload.item_id
    )
    return {"message": f"Linked {payload.item_type} to workspace successfully."}


@router.delete("/{workspace_id}/items")
def unlink_item_from_workspace(
    workspace_id: int,
    payload: WorkspaceItemLinkRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Unlink a document, chat, note, or quiz from a workspace."""
    workspace_service.unlink_item(
        db,
        workspace_id=workspace_id,
        user_id=current_user.id,
        item_type=payload.item_type,
        item_id=payload.item_id
    )
    return {"message": f"Unlinked {payload.item_type} from workspace successfully."}
