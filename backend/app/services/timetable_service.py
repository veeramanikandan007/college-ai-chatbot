from datetime import datetime
from zoneinfo import ZoneInfo  # Built-in since Python 3.9 — no pytz needed
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.timetable import TimetableSchedule
from app.services.ai_service import AIService
from app.core.logging import get_logger

logger = get_logger(__name__)

class TimetableService:
    def __init__(self):
        self.ai_service = AIService()

    @staticmethod
    def get_today_timetable(db: Session, day_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Returns today's timetable entries, ongoing class status, next class countdown, and stats breakdown from DB.
        """
        tz = ZoneInfo('Asia/Kolkata')
        now = datetime.now(tz)
        current_day = day_name or now.strftime("%A")
        if current_day == "Sunday":
            current_day = "Monday"

        # Fetch from DB
        entries = db.query(TimetableSchedule).filter(
            TimetableSchedule.class_id == "V Semester - CSE - A",
            TimetableSchedule.day == current_day
        ).order_by(TimetableSchedule.period_number).all()

        today_entries = []
        for e in entries:
            # Format time for frontend (e.g. "09:00" -> "09:00 AM")
            st_dt = datetime.strptime(e.start_time, "%H:%M")
            et_dt = datetime.strptime(e.end_time, "%H:%M")
            st_str = st_dt.strftime("%I:%M %p")
            et_str = et_dt.strftime("%I:%M %p")
            
            today_entries.append({
                "id": e.id,
                "day_of_week": e.day,
                "period_number": e.period_number,
                "start_time": st_str,
                "end_time": et_str,
                "subject_name": e.subject_name,
                "subject_code": e.subject_code,
                "subject_type": "Lab" if e.is_lab else "Theory",
                "faculty_name": e.faculty_name,
                "classroom": e.room_number,
                "color_code": "#1E4DB7", # Default
                "raw_start_time": e.start_time,
                "raw_end_time": e.end_time
            })

        current_time_str = now.strftime("%I:%M %p")
        current_hm = now.strftime("%H:%M")
        
        ongoing_class = None
        next_class = None
        
        theory_count = sum(1 for e in today_entries if e["subject_type"] == "Theory")
        lab_count = sum(1 for e in today_entries if e["subject_type"] == "Lab")
        seminar_count = 0

        processed_entries = []
        for entry in today_entries:
            status = "Upcoming"
            if entry["raw_end_time"] <= current_hm:
                status = "Completed"
            elif entry["raw_start_time"] <= current_hm < entry["raw_end_time"]:
                status = "Ongoing"
                ongoing_class = entry
            else:
                status = "Upcoming"
                if not next_class:
                    next_class = entry

            processed_entries.append({
                **entry,
                "status": status
            })

        return {
            "department": "Computer Science & Engineering",
            "semester": 6,
            "section": "A",
            "current_day": current_day,
            "current_date": now.strftime("%B %d, %Y"),
            "current_time": current_time_str,
            "ongoing_class": ongoing_class,
            "next_class": next_class,
            "today_entries": processed_entries,
            "stats": {
                "total_classes": len(today_entries),
                "theory_count": theory_count,
                "lab_count": lab_count,
                "seminar_count": seminar_count,
                "total_hours": len(today_entries),
                "free_periods": 0
            }
        }

    @staticmethod
    def get_current_period(db: Session, class_id: str = "V Semester - CSE - A") -> Dict[str, Any]:
        """
        API endpoint logic to get the real-time status.
        """
        tz = ZoneInfo('Asia/Kolkata')
        now = datetime.now(tz)
        current_day = now.strftime("%A")
        current_hm = now.strftime("%H:%M")

        entries = db.query(TimetableSchedule).filter(
            TimetableSchedule.class_id == class_id,
            TimetableSchedule.day == current_day
        ).order_by(TimetableSchedule.period_number).all()

        current_class = None
        next_class = None

        for e in entries:
            if e.start_time <= current_hm < e.end_time:
                # Calculate remaining minutes
                et = datetime.strptime(e.end_time, "%H:%M")
                ct = datetime.strptime(current_hm, "%H:%M")
                rem_mins = int((et - ct).total_seconds() / 60)
                
                current_class = {
                    "subject": e.subject_code,
                    "faculty": e.faculty_name,
                    "room": e.room_number,
                    "remaining_minutes": rem_mins
                }
            elif e.start_time > current_hm and not next_class:
                st = datetime.strptime(e.start_time, "%H:%M").strftime("%I:%M %p")
                next_class = {
                    "subject": e.subject_code,
                    "time": st
                }

        return {
            "current_time": now.strftime("%I:%M %p"),
            "day": current_day,
            "current_class": current_class,
            "next_class": next_class
        }

    @staticmethod
    def get_weekly_timetable(db: Session) -> Dict[str, List[Dict[str, Any]]]:
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        result = {}
        for d in days:
            entries = db.query(TimetableSchedule).filter(
                TimetableSchedule.class_id == "V Semester - CSE - A",
                TimetableSchedule.day == d
            ).order_by(TimetableSchedule.period_number).all()
            
            day_entries = []
            for e in entries:
                st_str = datetime.strptime(e.start_time, "%H:%M").strftime("%I:%M %p")
                et_str = datetime.strptime(e.end_time, "%H:%M").strftime("%I:%M %p")
                day_entries.append({
                    "id": e.id,
                    "day_of_week": e.day,
                    "period_number": e.period_number,
                    "start_time": st_str,
                    "end_time": et_str,
                    "subject_name": e.subject_name,
                    "subject_code": e.subject_code,
                    "subject_type": "Lab" if e.is_lab else "Theory",
                    "faculty_name": e.faculty_name,
                    "classroom": e.room_number,
                })
            result[d] = day_entries
        return result

    @staticmethod
    def get_academic_calendar() -> List[Dict[str, Any]]:
        return [
            {"date": "2026-08-03", "title": "Semester 6 Classes Commence", "type": "Class Day"},
            {"date": "2026-08-15", "title": "Independence Day Celebration", "type": "Holiday"},
            {"date": "2026-08-20", "title": "Internal Assessment Test 1", "type": "Exam Day"},
            {"date": "2026-08-28", "title": "Mount Zion Tech Hackathon 2026", "type": "Event"},
        ]

    async def answer_timetable_ai_query(self, query: str, db: Session) -> str:
        """
        Answers student timetable questions using real DB timetable schedule data with NO emojis.
        """
        q = query.lower()
        
        # We can pull today's and tomorrow's schedule directly from DB to pass to AI
        tz = ZoneInfo('Asia/Kolkata')
        now = datetime.now(tz)
        current_day = now.strftime("%A")
        
        entries = db.query(TimetableSchedule).filter(
            TimetableSchedule.class_id == "V Semester - CSE - A",
            TimetableSchedule.day == current_day
        ).order_by(TimetableSchedule.period_number).all()
        
        context_str = "\\n".join([f"{e.start_time}-{e.end_time}: {e.subject_name} ({e.subject_code}) by {e.faculty_name} in {e.room_number}" for e in entries])
        
        prompt = f"""
        You are CollegeMate AI Timetable Assistant.
        Answer the following student question accurately using this timetable data for today ({current_day}):
        {context_str}

        IMPORTANT: Do not use any emojis in your response.
        Question: {query}
        """
        try:
            res = await self.ai_service._get_llm_response(prompt, "You are CollegeMate AI Timetable Assistant. Do not use any emojis.")
            return res
        except Exception as err:
            logger.warning(f"AI Timetable Query fallback triggered: {err}")
            return f"Your schedule for query '{query}': Classes are on schedule. Check the timetable dashboard for details."
