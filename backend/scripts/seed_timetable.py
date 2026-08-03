import sys
import os
from datetime import datetime

# Add the backend directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.base import Base
from app.database.engine import engine, SessionLocal
from app.models.timetable import TimetableSchedule

def seed_timetable():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    
    # Check if data already exists
    existing = db.query(TimetableSchedule).filter(TimetableSchedule.class_id == "V Semester - CSE - A").first()
    if existing:
        print("Data already exists. Dropping and re-inserting...")
        db.query(TimetableSchedule).filter(TimetableSchedule.class_id == "V Semester - CSE - A").delete()
        db.commit()

    monday = [
        {"period_number": 1, "start_time": "09:00", "end_time": "09:50", "subject_code": "CN", "subject_name": "Computer Networks", "faculty_name": "Mrs. B. GAYATHRI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 2, "start_time": "09:50", "end_time": "10:40", "subject_code": "CACS", "subject_name": "Cryptography and Cyber Security", "faculty_name": "Mrs. M.S RAMADEVI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 3, "start_time": "10:55", "end_time": "11:45", "subject_code": "WT", "subject_name": "Web Technologies", "faculty_name": "Mrs. M. MAHAMATHI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 4, "start_time": "11:45", "end_time": "12:35", "subject_code": "DW", "subject_name": "Data Warehousing", "faculty_name": "Ms. K. MALAPRIYADARSHNI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 5, "start_time": "13:15", "end_time": "14:00", "subject_code": "CD", "subject_name": "Compiler Design", "faculty_name": "Mr. G. SWAMINATHAN", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 6, "start_time": "14:00", "end_time": "14:45", "subject_code": "CACS", "subject_name": "Cryptography and Cyber Security", "faculty_name": "Mrs. M.S RAMADEVI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 7, "start_time": "15:00", "end_time": "15:45", "subject_code": "CN", "subject_name": "Computer Networks", "faculty_name": "Mrs. B. GAYATHRI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 8, "start_time": "15:45", "end_time": "16:30", "subject_code": "DRRAM", "subject_name": "Disaster Risk Reduction and Management", "faculty_name": "Dr. N. SARALA", "room_number": "A204 - LH 25", "is_lab": False},
    ]

    tuesday = [
        {"period_number": 1, "start_time": "09:00", "end_time": "09:50", "subject_code": "CD", "subject_name": "Compiler Design", "faculty_name": "Mr. G. SWAMINATHAN", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 2, "start_time": "09:50", "end_time": "10:40", "subject_code": "WT", "subject_name": "Web Technologies", "faculty_name": "Mrs. M. MAHAMATHI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 3, "start_time": "10:55", "end_time": "11:45", "subject_code": "DW", "subject_name": "Data Warehousing", "faculty_name": "Ms. K. MALAPRIYADARSHNI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 4, "start_time": "11:45", "end_time": "12:35", "subject_code": "CACS", "subject_name": "Cryptography and Cyber Security", "faculty_name": "Mrs. M.S RAMADEVI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 5, "start_time": "13:15", "end_time": "14:00", "subject_code": "LAB", "subject_name": "Web Tech Lab", "faculty_name": "Mrs. M. MAHAMATHI", "room_number": "CS Lab 1", "is_lab": True},
        {"period_number": 6, "start_time": "14:00", "end_time": "14:45", "subject_code": "LAB", "subject_name": "Web Tech Lab", "faculty_name": "Mrs. M. MAHAMATHI", "room_number": "CS Lab 1", "is_lab": True},
        {"period_number": 7, "start_time": "15:00", "end_time": "15:45", "subject_code": "CN", "subject_name": "Computer Networks", "faculty_name": "Mrs. B. GAYATHRI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 8, "start_time": "15:45", "end_time": "16:30", "subject_code": "SEMINAR", "subject_name": "Project Seminar", "faculty_name": "Dr. N. SARALA", "room_number": "A204 - LH 25", "is_lab": False},
    ]

    wednesday = [
        {"period_number": 1, "start_time": "09:00", "end_time": "09:50", "subject_code": "CACS", "subject_name": "Cryptography and Cyber Security", "faculty_name": "Mrs. M.S RAMADEVI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 2, "start_time": "09:50", "end_time": "10:40", "subject_code": "CN", "subject_name": "Computer Networks", "faculty_name": "Mrs. B. GAYATHRI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 3, "start_time": "10:55", "end_time": "11:45", "subject_code": "CD", "subject_name": "Compiler Design", "faculty_name": "Mr. G. SWAMINATHAN", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 4, "start_time": "11:45", "end_time": "12:35", "subject_code": "WT", "subject_name": "Web Technologies", "faculty_name": "Mrs. M. MAHAMATHI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 5, "start_time": "13:15", "end_time": "14:00", "subject_code": "LAB", "subject_name": "Networks Lab", "faculty_name": "Mrs. B. GAYATHRI", "room_number": "CS Lab 2", "is_lab": True},
        {"period_number": 6, "start_time": "14:00", "end_time": "14:45", "subject_code": "LAB", "subject_name": "Networks Lab", "faculty_name": "Mrs. B. GAYATHRI", "room_number": "CS Lab 2", "is_lab": True},
        {"period_number": 7, "start_time": "15:00", "end_time": "15:45", "subject_code": "DW", "subject_name": "Data Warehousing", "faculty_name": "Ms. K. MALAPRIYADARSHNI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 8, "start_time": "15:45", "end_time": "16:30", "subject_code": "DRRAM", "subject_name": "Disaster Risk Reduction and Management", "faculty_name": "Dr. N. SARALA", "room_number": "A204 - LH 25", "is_lab": False},
    ]

    thursday = [
        {"period_number": 1, "start_time": "09:00", "end_time": "09:50", "subject_code": "WT", "subject_name": "Web Technologies", "faculty_name": "Mrs. M. MAHAMATHI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 2, "start_time": "09:50", "end_time": "10:40", "subject_code": "DW", "subject_name": "Data Warehousing", "faculty_name": "Ms. K. MALAPRIYADARSHNI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 3, "start_time": "10:55", "end_time": "11:45", "subject_code": "CN", "subject_name": "Computer Networks", "faculty_name": "Mrs. B. GAYATHRI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 4, "start_time": "11:45", "end_time": "12:35", "subject_code": "CACS", "subject_name": "Cryptography and Cyber Security", "faculty_name": "Mrs. M.S RAMADEVI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 5, "start_time": "13:15", "end_time": "14:00", "subject_code": "CD", "subject_name": "Compiler Design", "faculty_name": "Mr. G. SWAMINATHAN", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 6, "start_time": "14:00", "end_time": "14:45", "subject_code": "DRRAM", "subject_name": "Disaster Risk Reduction and Management", "faculty_name": "Dr. N. SARALA", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 7, "start_time": "15:00", "end_time": "15:45", "subject_code": "LAB", "subject_name": "Security Lab", "faculty_name": "Mrs. M.S RAMADEVI", "room_number": "CS Lab 3", "is_lab": True},
        {"period_number": 8, "start_time": "15:45", "end_time": "16:30", "subject_code": "LAB", "subject_name": "Security Lab", "faculty_name": "Mrs. M.S RAMADEVI", "room_number": "CS Lab 3", "is_lab": True},
    ]

    friday = [
        {"period_number": 1, "start_time": "09:00", "end_time": "09:50", "subject_code": "DW", "subject_name": "Data Warehousing", "faculty_name": "Ms. K. MALAPRIYADARSHNI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 2, "start_time": "09:50", "end_time": "10:40", "subject_code": "CD", "subject_name": "Compiler Design", "faculty_name": "Mr. G. SWAMINATHAN", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 3, "start_time": "10:55", "end_time": "11:45", "subject_code": "WT", "subject_name": "Web Technologies", "faculty_name": "Mrs. M. MAHAMATHI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 4, "start_time": "11:45", "end_time": "12:35", "subject_code": "CN", "subject_name": "Computer Networks", "faculty_name": "Mrs. B. GAYATHRI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 5, "start_time": "13:15", "end_time": "14:00", "subject_code": "CACS", "subject_name": "Cryptography and Cyber Security", "faculty_name": "Mrs. M.S RAMADEVI", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 6, "start_time": "14:00", "end_time": "14:45", "subject_code": "DRRAM", "subject_name": "Disaster Risk Reduction and Management", "faculty_name": "Dr. N. SARALA", "room_number": "A204 - LH 25", "is_lab": False},
        {"period_number": 7, "start_time": "15:00", "end_time": "15:45", "subject_code": "SPORTS", "subject_name": "Physical Education", "faculty_name": "Mr. K. RAJ", "room_number": "Ground", "is_lab": False},
        {"period_number": 8, "start_time": "15:45", "end_time": "16:30", "subject_code": "LIB", "subject_name": "Library Hour", "faculty_name": "Librarian", "room_number": "Main Library", "is_lab": False},
    ]

    # Saturday is empty implicitly by not inserting anything

    timetable_data = []
    for day, schedule_list in [("Monday", monday), ("Tuesday", tuesday), ("Wednesday", wednesday), ("Thursday", thursday), ("Friday", friday)]:
        for entry in schedule_list:
            new_entry = dict(entry)
            new_entry["day"] = day
            timetable_data.append(new_entry)

    for entry in timetable_data:
        schedule = TimetableSchedule(
            class_id="V Semester - CSE - A",
            day=entry["day"],
            period_number=entry["period_number"],
            start_time=entry["start_time"],
            end_time=entry["end_time"],
            subject_code=entry["subject_code"],
            subject_name=entry["subject_name"],
            faculty_name=entry["faculty_name"],
            room_number=entry["room_number"],
            is_lab=entry.get("is_lab", False)
        )
        db.add(schedule)
    
    db.commit()
    print(f"Timetable data inserted successfully. ({len(timetable_data)} rows)")
    db.close()

if __name__ == "__main__":
    seed_timetable()
