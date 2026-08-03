import sys
import os
from pathlib import Path
import io
from PIL import Image, ImageDraw, ImageFont

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.engine import SessionLocal
from app.database.init_db import init_db
from app.models.user import User
from app.models.ocr import OCRScanModel
from app.services.ocr_service import OCRService
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

        # Create a sample image with rendered text for testing
        img = Image.new("RGB", (800, 400), color=(255, 255, 255))
        d = ImageDraw.Draw(img)
        d.text((30, 30), "Data Structures & Algorithms - Lecture 4", fill=(0, 0, 0))
        d.text((30, 80), "Binary Search Tree (BST) Properties:", fill=(0, 0, 0))
        d.text((30, 130), "1. Left subtree contains keys smaller than node.", fill=(0, 0, 0))
        d.text((30, 180), "2. Right subtree contains keys larger than node.", fill=(0, 0, 0))
        d.text((30, 230), "Time Complexity: O(log N) average, O(N) worst case.", fill=(0, 0, 0))
        d.text((30, 280), "Important Question: Explain BST deletion algorithms. (5 Marks)", fill=(0, 0, 0))

        buffered = io.BytesIO()
        img.save(buffered, format="JPEG")
        file_bytes = buffered.getvalue()

        print("\n--- 2. Testing OCRService.process_ocr_upload ---")
        ocr_service = OCRService()
        
        scan = await ocr_service.process_ocr_upload(
            db=db,
            user_id=student.id,
            file_bytes=file_bytes,
            image_name="test_bst_lecture.jpg"
        )

        print(f"SUCCESS: OCR Scan Created with ID: {scan.id}, Language: '{scan.language_detected}'")
        print(f"Extracted Text Snippet: {scan.extracted_text[:120]}...")

        print("\n--- 3. Testing OCRService.execute_ai_action (Summary) ---")
        summary_res = await ocr_service.execute_ai_action("summary", scan.extracted_text)
        print(f"AI Summary Result: {summary_res.get('result')[:150]}...")

        print("\n--- 4. Testing OCRService.get_user_scans ---")
        user_scans = ocr_service.get_user_scans(db, user_id=student.id)
        print(f"Found {len(user_scans)} OCR scan(s) for student.")

        print("\n--- 5. Testing OCRService.get_scan_by_id ---")
        fetched_scan = ocr_service.get_scan_by_id(db, scan_id=scan.id, user_id=student.id)
        print(f"Fetched Scan Image Name: '{fetched_scan.image_name}'")

        print("\n--- 6. Testing OCRService.delete_scan ---")
        deleted = ocr_service.delete_scan(db, scan_id=scan.id, user_id=student.id)
        print(f"Deleted Scan Status: {deleted}")

        print("\n=== ALL BACKEND AI OCR SCANNER TESTS PASSED SUCCESSFULLY! ===")

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(run_test())
