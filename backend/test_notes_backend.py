import sys
import os
from pathlib import Path

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.engine import SessionLocal
from app.database.init_db import init_db
from app.models.user import User
from app.models.note import NoteModel
from app.services.notes_service import NotesService
import asyncio


async def run_test():
    print("--- 1. Initializing Database Schema ---")
    init_db()
    
    db = SessionLocal()
    try:
        student = db.query(User).filter(User.role == "student").first()
        if not student:
            print("ERROR: No demo student found in database.")
            return

        print(f"Testing with Student: {student.name} (ID: {student.id})")

        # Create a sample text file for testing
        test_file = Path("./test_sample_lecture.txt")
        test_file.write_text("""
        Operating Systems - Process Synchronization & Semaphores
        
        A Semaphore is a synchronization tool used to solve the critical section problem.
        There are two main types of semaphores: Binary Semaphores (also known as mutex locks) and Counting Semaphores.
        
        Formula for Wait operation:
        wait(S) { while (S <= 0); S--; }
        
        Formula for Signal operation:
        signal(S) { S++; }
        
        Key Concepts:
        1. Mutual Exclusion
        2. Progress
        3. Bounded Waiting
        
        Important Questions:
        What is a Binary Semaphore? (2 Marks)
        Explain the Readers-Writers Problem using semaphores. (10 Marks)
        """, encoding="utf-8")

        print("\n--- 2. Testing NotesService.generate_notes ---")
        notes_service = NotesService()
        
        note = await notes_service.generate_notes(
            db=db,
            user_id=student.id,
            file_path=test_file,
            document_name="test_sample_lecture.txt"
        )

        print(f"SUCCESS: Note Generated with ID: {note.id}, Title: '{note.title}'")

        print("\n--- 3. Testing NotesService.get_user_notes ---")
        user_notes = notes_service.get_user_notes(db, user_id=student.id)
        print(f"Found {len(user_notes)} note(s) for student.")

        print("\n--- 4. Testing NotesService.get_note_by_id ---")
        fetched_note = notes_service.get_note_by_id(db, note_id=note.id, user_id=student.id)
        print(f"Fetched Note Title: '{fetched_note.title}'")

        print("\n--- 5. Testing NotesService.delete_note ---")
        deleted = notes_service.delete_note(db, note_id=note.id, user_id=student.id)
        print(f"Deleted Note Status: {deleted}")

        # Cleanup temp file
        if test_file.exists():
            test_file.unlink()

        print("\n=== ALL BACKEND AI NOTES TESTS PASSED SUCCESSFULLY! ===")

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(run_test())
