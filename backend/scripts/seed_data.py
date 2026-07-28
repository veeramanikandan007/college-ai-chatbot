#!/usr/bin/env python3
"""
seed_data.py — Populates the CampusMate database with realistic sample data
for development and testing.

Usage:
    python scripts/seed_data.py

This script will:
  - Create a default admin user
  - Create sample student users
  - Create timetable entries
  - Create sample assignments and events
  - Create library books
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta, date
from app.database.engine import SessionLocal
from app.database.init_db import init_db
from app.models.user import User
from app.models.student import (
    TimetableEntry, Assignment, Event, LibraryBook, Fee, Notification
)
from app.core.security import get_password_hash


def seed():
    init_db()
    db = SessionLocal()
    try:
        # ── Admin ──────────────────────────────────────────────────────────
        if not db.query(User).filter_by(email="admin@campusmate.edu").first():
            admin = User(
                name="Admin User",
                email="admin@campusmate.edu",
                hashed_password=get_password_hash("Admin@1234"),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            print("  Admin user created  (admin@campusmate.edu / Admin@1234)")
        else:
            print("   Admin already exists, skipping.")

        # ── Students ───────────────────────────────────────────────────────
        students_data = [
            ("Rahul Verma", "rahul@campusmate.edu", "CSE", "password123"),
            ("Priya Sharma", "priya@campusmate.edu", "ECE", "password123"),
            ("Ankit Patel", "ankit@campusmate.edu", "MECH", "password123"),
            ("Divya Nair", "divya@campusmate.edu", "CSE", "password123"),
        ]
        student_objects = []
        for name, email, dept, pwd in students_data:
            if not db.query(User).filter_by(email=email).first():
                s = User(
                    name=name, email=email,
                    hashed_password=get_password_hash(pwd),
                    role="student", department=dept, is_active=True,
                )
                db.add(s)
                student_objects.append(s)
        db.flush()
        print(f"  {len(student_objects)} student(s) created.")

        # ── Timetable ──────────────────────────────────────────────────────
        timetable_entries = [
            ("CSE", 3, 1, "Monday", "9:00 AM", "Data Structures", "Dr. Smith", "Room 302"),
            ("CSE", 3, 1, "Tuesday", "10:00 AM", "Computer Networks", "Dr. Brown", "Room 201"),
            ("CSE", 3, 1, "Wednesday", "11:15 AM", "Machine Learning", "Dr. Wilson", "Room 401"),
        ]
        for dept, year, sem, day, period, subject, faculty, room in timetable_entries:
            db.add(TimetableEntry(
                department=dept, year=year, semester=sem, day_of_week=day,
                period=period, subject=subject, faculty=faculty, room=room,
            ))
        print(f"  {len(timetable_entries)} timetable entries created.")

        # ── Library Books ──────────────────────────────────────────────────
        books = [
            ("Introduction to Algorithms", "Thomas H. Cormen", "978-0262033848", "DSA", 3, 5),
            ("Operating System Concepts", "Silberschatz", "978-1119800750", "OS", 2, 4),
            ("Computer Networks", "Andrew Tanenbaum", "978-0132126953", "Networks", 4, 6),
            ("Artificial Intelligence", "Stuart Russell", "978-0136042594", "AI/ML", 2, 3),
        ]
        for title, author, isbn, cat, avail, total in books:
            db.add(LibraryBook(title=title, author=author, isbn=isbn,
                               category=cat, available_copies=avail, total_copies=total))
        print(f"  {len(books)} library books created.")

        # ── Events ─────────────────────────────────────────────────────────
        db.flush()
        admin_user = db.query(User).filter_by(email="admin@campusmate.edu").first()
        events = [
            ("Tech Symposium 2026", "Annual technical fest", datetime.now() + timedelta(days=7), "Technical"),
            ("Campus Recruitment Drive", "Off-campus placement drive", datetime.now() + timedelta(days=15), "Career"),
        ]
        for title, desc, dt, cat in events:
            db.add(Event(title=title, description=desc, event_date=dt,
                         category=cat, created_by=admin_user.id))
        print(f"  {len(events)} events created.")

        db.commit()
        print("\n  Seed completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"\n  Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
