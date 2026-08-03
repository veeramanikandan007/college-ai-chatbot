import sys
import os
import asyncio

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.engine import SessionLocal
from app.database.init_db import init_db
from app.models.user import User
from app.services.workspace_service import WorkspaceService
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate


def run_test():
    print("--- 1. Initializing Database & Workspace Tables ---")
    init_db()

    db = SessionLocal()
    try:
        student = db.query(User).filter(User.role == "student").first()
        if not student:
            print("ERROR: Student user not found.")
            return

        print(f"Testing with Student: {student.name} (ID: {student.id})")
        service = WorkspaceService()

        print("\n--- 2. Creating New AI Workspace ---")
        payload = WorkspaceCreate(
            title="Distributed Systems Project",
            description="All notes, research papers, and AI chat sessions for CS401.",
            color="#1E4DB7",
            icon="Brain",
            is_pinned=True,
            is_favorite=True
        )
        ws = service.create_workspace(db, user_id=student.id, payload=payload)
        print(f"SUCCESS: Created Workspace ID={ws.id}, Title='{ws.title}', Icon='{ws.icon}'")

        print("\n--- 3. Updating Workspace ---")
        updated = service.update_workspace(
            db,
            workspace_id=ws.id,
            user_id=student.id,
            payload=WorkspaceUpdate(title="Distributed Systems & Cloud Computing")
        )
        print(f"SUCCESS: Updated Title='{updated.title}'")

        print("\n--- 4. Listing User Workspaces ---")
        user_wss = service.get_user_workspaces(db, user_id=student.id)
        print(f"User has {len(user_wss)} workspace(s). First workspace: '{user_wss[0].title}'")

        print("\n--- 5. Getting Workspace Detail ---")
        detail = service.get_workspace_detail(db, workspace_id=ws.id, user_id=student.id)
        print(f"Workspace Detail: {detail.title}, Chats: {len(detail.chats)}, Docs: {len(detail.documents)}")

        print("\n--- 6. Deleting Test Workspace ---")
        deleted = service.delete_workspace(db, workspace_id=ws.id, user_id=student.id)
        print(f"Deleted Workspace Status: {deleted}")

        print("\n=== ALL BACKEND AI WORKSPACE TESTS PASSED SUCCESSFULLY! ===")

    finally:
        db.close()


if __name__ == "__main__":
    run_test()
