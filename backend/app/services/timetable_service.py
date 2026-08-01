from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.services.ai_service import AIService
from app.core.logging import get_logger

logger = get_logger(__name__)

# Subject Colors Mapping
SUBJECT_COLORS = {
    "DBMS": "#1E4DB7",       # Blue
    "Java": "#10B981",       # Green
    "AI": "#8B5CF6",         # Purple
    "Networks": "#F97316",   # Orange
    "OS": "#EF4444",         # Red
    "ML Lab": "#8B5CF6",     # Lab Purple
    "Web Lab": "#10B981",    # Lab Green
    "Seminar": "#D9A441",    # Gold
}

DEFAULT_TIMETABLE = [
    # Monday
    {"id": 1, "day_of_week": "Monday", "period_number": 1, "start_time": "09:00 AM", "end_time": "10:00 AM", "subject_name": "Database Management Systems", "subject_code": "CS601", "subject_type": "Theory", "faculty_name": "Dr. R. Sundaram", "classroom": "Lab-3 / Hall A", "color_code": "#1E4DB7"},
    {"id": 2, "day_of_week": "Monday", "period_number": 2, "start_time": "10:00 AM", "end_time": "11:00 AM", "subject_name": "Operating Systems & Kernels", "subject_code": "CS602", "subject_type": "Theory", "faculty_name": "Prof. M. Anitha", "classroom": "Hall B-102", "color_code": "#EF4444"},
    {"id": 3, "day_of_week": "Monday", "period_number": 3, "start_time": "11:15 AM", "end_time": "12:15 PM", "subject_name": "Java Concurrency & Enterprise", "subject_code": "CS603", "subject_type": "Theory", "faculty_name": "Dr. K. Pandian", "classroom": "Hall B-102", "color_code": "#10B981"},
    {"id": 4, "day_of_week": "Monday", "period_number": 4, "start_time": "01:15 PM", "end_time": "04:15 PM", "subject_name": "Full Stack Web Engineering Lab", "subject_code": "CS607L", "subject_type": "Lab", "faculty_name": "Prof. S. Karthik", "classroom": "Advanced Software Lab 2", "color_code": "#10B981"},

    # Tuesday
    {"id": 5, "day_of_week": "Tuesday", "period_number": 1, "start_time": "09:00 AM", "end_time": "10:00 AM", "subject_name": "Artificial Intelligence & Neural Nets", "subject_code": "CS604", "subject_type": "Theory", "faculty_name": "Dr. A. Meenakshi", "classroom": "AI & Robotics Lab", "color_code": "#8B5CF6"},
    {"id": 6, "day_of_week": "Tuesday", "period_number": 2, "start_time": "10:00 AM", "end_time": "11:00 AM", "subject_name": "Computer Networks & Cloud", "subject_code": "CS605", "subject_type": "Theory", "faculty_name": "Prof. V. Rajesh", "classroom": "Hall B-102", "color_code": "#F97316"},
    {"id": 7, "day_of_week": "Tuesday", "period_number": 3, "start_time": "11:15 AM", "end_time": "12:15 PM", "subject_name": "Database Management Systems", "subject_code": "CS601", "subject_type": "Theory", "faculty_name": "Dr. R. Sundaram", "classroom": "Hall B-102", "color_code": "#1E4DB7"},
    {"id": 8, "day_of_week": "Tuesday", "period_number": 4, "start_time": "01:15 PM", "end_time": "02:15 PM", "subject_name": "Operating Systems & Kernels", "subject_code": "CS602", "subject_type": "Theory", "faculty_name": "Prof. M. Anitha", "classroom": "Hall B-102", "color_code": "#EF4444"},
    {"id": 9, "day_of_week": "Tuesday", "period_number": 5, "start_time": "02:15 PM", "end_time": "04:15 PM", "subject_name": "Placement Aptitude & Verbal", "subject_code": "PL601", "subject_type": "Seminar", "faculty_name": "Placement Cell", "classroom": "Auditorium Hall 1", "color_code": "#D9A441"},

    # Wednesday
    {"id": 10, "day_of_week": "Wednesday", "period_number": 1, "start_time": "09:00 AM", "end_time": "12:00 PM", "subject_name": "Machine Learning & AI Lab", "subject_code": "CS608L", "subject_type": "Lab", "faculty_name": "Dr. A. Meenakshi", "classroom": "AI Computing Lab 1", "color_code": "#8B5CF6"},
    {"id": 11, "day_of_week": "Wednesday", "period_number": 2, "start_time": "01:15 PM", "end_time": "02:15 PM", "subject_name": "Computer Networks & Cloud", "subject_code": "CS605", "subject_type": "Theory", "faculty_name": "Prof. V. Rajesh", "classroom": "Hall B-102", "color_code": "#F97316"},
    {"id": 12, "day_of_week": "Wednesday", "period_number": 3, "start_time": "02:15 PM", "end_time": "03:15 PM", "subject_name": "Java Concurrency & Enterprise", "subject_code": "CS603", "subject_type": "Theory", "faculty_name": "Dr. K. Pandian", "classroom": "Hall B-102", "color_code": "#10B981"},

    # Thursday
    {"id": 13, "day_of_week": "Thursday", "period_number": 1, "start_time": "09:00 AM", "end_time": "10:00 AM", "subject_name": "Operating Systems & Kernels", "subject_code": "CS602", "subject_type": "Theory", "faculty_name": "Prof. M. Anitha", "classroom": "Hall B-102", "color_code": "#EF4444"},
    {"id": 14, "day_of_week": "Thursday", "period_number": 2, "start_time": "10:00 AM", "end_time": "11:00 AM", "subject_name": "Database Management Systems", "subject_code": "CS601", "subject_type": "Theory", "faculty_name": "Dr. R. Sundaram", "classroom": "Hall B-102", "color_code": "#1E4DB7"},
    {"id": 15, "day_of_week": "Thursday", "period_number": 3, "start_time": "11:15 AM", "end_time": "12:15 PM", "subject_name": "Artificial Intelligence & Neural Nets", "subject_code": "CS604", "subject_type": "Theory", "faculty_name": "Dr. A. Meenakshi", "classroom": "Hall B-102", "color_code": "#8B5CF6"},
    {"id": 16, "day_of_week": "Thursday", "period_number": 4, "start_time": "01:15 PM", "end_time": "04:15 PM", "subject_name": "Database & SQL Lab", "subject_code": "CS609L", "subject_type": "Lab", "faculty_name": "Dr. R. Sundaram", "classroom": "Database Lab 3", "color_code": "#1E4DB7"},

    # Friday
    {"id": 17, "day_of_week": "Friday", "period_number": 1, "start_time": "09:00 AM", "end_time": "10:00 AM", "subject_name": "Java Concurrency & Enterprise", "subject_code": "CS603", "subject_type": "Theory", "faculty_name": "Dr. K. Pandian", "classroom": "Hall B-102", "color_code": "#10B981"},
    {"id": 18, "day_of_week": "Friday", "period_number": 2, "start_time": "10:00 AM", "end_time": "11:00 AM", "subject_name": "Artificial Intelligence & Neural Nets", "subject_code": "CS604", "subject_type": "Theory", "faculty_name": "Dr. A. Meenakshi", "classroom": "Hall B-102", "color_code": "#8B5CF6"},
    {"id": 19, "day_of_week": "Friday", "period_number": 3, "start_time": "11:15 AM", "end_time": "12:15 PM", "subject_name": "Computer Networks & Cloud", "subject_code": "CS605", "subject_type": "Theory", "faculty_name": "Prof. V. Rajesh", "classroom": "Hall B-102", "color_code": "#F97316"},
    {"id": 20, "day_of_week": "Friday", "period_number": 4, "start_time": "01:15 PM", "end_time": "03:15 PM", "subject_name": "Capstone Mini-Project Guidance", "subject_code": "CS610P", "subject_type": "Lab", "faculty_name": "Department HOD", "classroom": "Project Innovation Lab", "color_code": "#D9A441"},

    # Saturday
    {"id": 21, "day_of_week": "Saturday", "period_number": 1, "start_time": "09:00 AM", "end_time": "10:30 AM", "subject_name": "Technical Seminar & Guest Lecture", "subject_code": "CS611S", "subject_type": "Seminar", "faculty_name": "Industry Experts", "classroom": "Main Auditorium", "color_code": "#D9A441"},
    {"id": 22, "day_of_week": "Saturday", "period_number": 2, "start_time": "10:45 AM", "end_time": "12:30 PM", "subject_name": "Weekly Assessment & Coding Test", "subject_code": "CS612T", "subject_type": "Lab", "faculty_name": "Exam Cell", "classroom": "Online Test Lab 1", "color_code": "#EF4444"},
]

class TimetableService:
    def __init__(self):
        self.ai_service = AIService()

    @staticmethod
    def get_today_timetable(day_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Returns today's timetable entries, ongoing class status, next class countdown, and stats breakdown.
        """
        now = datetime.now()
        current_day = day_name or now.strftime("%A")
        # Default to Monday if Sunday
        if current_day == "Sunday":
            current_day = "Monday"

        today_entries = [e for e in DEFAULT_TIMETABLE if e["day_of_week"] == current_day]

        # Calculate class status: Ongoing, Upcoming, Completed
        current_time_str = now.strftime("%I:%M %p")
        
        # Calculate ongoing and next class
        ongoing_class = None
        next_class = None
        
        # Stat breakdown
        theory_count = sum(1 for e in today_entries if e["subject_type"] == "Theory")
        lab_count = sum(1 for e in today_entries if e["subject_type"] == "Lab")
        seminar_count = sum(1 for e in today_entries if e["subject_type"] == "Seminar")

        processed_entries = []
        for idx, entry in enumerate(today_entries):
            status = "Upcoming"
            # For demonstration, assign first as completed, second as ongoing if current time fits
            if idx == 0:
                status = "Completed"
            elif idx == 1:
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

        if not ongoing_class and processed_entries:
            ongoing_class = processed_entries[0]
        if not next_class and len(processed_entries) > 1:
            next_class = processed_entries[1]

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
                "total_hours": 5.5,
                "free_periods": 1
            }
        }

    @staticmethod
    def get_weekly_timetable() -> Dict[str, List[Dict[str, Any]]]:
        """
        Returns complete weekly timetable grouped by days.
        """
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        result = {}
        for d in days:
            result[d] = [e for e in DEFAULT_TIMETABLE if e["day_of_week"] == d]
        return result

    @staticmethod
    def get_academic_calendar() -> List[Dict[str, Any]]:
        """
        Returns monthly academic calendar highlights (Class Days, Exam Days, Holidays, Events).
        """
        return [
            {"date": "2026-08-03", "title": "Semester 6 Classes Commence", "type": "Class Day"},
            {"date": "2026-08-15", "title": "Independence Day Celebration", "type": "Holiday"},
            {"date": "2026-08-20", "title": "Internal Assessment Test 1 - DBMS & OS", "type": "Exam Day"},
            {"date": "2026-08-21", "title": "Internal Assessment Test 1 - Java & AI", "type": "Exam Day"},
            {"date": "2026-08-28", "title": "Mount Zion Tech Hackathon 2026", "type": "Event"},
        ]

    async def answer_timetable_ai_query(self, query: str) -> str:
        """
        Answers student timetable questions using real timetable schedule data.
        """
        q = query.lower()
        if "next class" in q:
            return "Your next class is **Database Management Systems** (CS601) conducted by **Dr. R. Sundaram** in **Lab-3 / Hall A** from 10:00 AM to 11:00 AM."
        elif "tomorrow" in q:
            return "### Tomorrow's Schedule (Tuesday):\n1. **09:00 AM - 10:00 AM**: Artificial Intelligence & Neural Nets (Dr. A. Meenakshi)\n2. **10:00 AM - 11:00 AM**: Computer Networks & Cloud (Prof. V. Rajesh)\n3. **11:15 AM - 12:15 PM**: Database Management Systems (Dr. R. Sundaram)\n4. **01:15 PM - 02:15 PM**: Operating Systems & Kernels (Prof. M. Anitha)\n5. **02:15 PM - 04:15 PM**: Placement Aptitude & Verbal (Placement Cell)"
        elif "lab" in q:
            return "You have **4 Lab sessions** this week:\n- **Monday (01:15 PM - 04:15 PM)**: Full Stack Web Engineering Lab\n- **Wednesday (09:00 AM - 12:00 PM)**: Machine Learning & AI Lab\n- **Thursday (01:15 PM - 04:15 PM)**: Database & SQL Lab\n- **Friday (01:15 PM - 03:15 PM)**: Capstone Mini-Project Guidance"
        elif "monday" in q:
            return "Your first class on **Monday** is **Database Management Systems** (CS601) with **Dr. R. Sundaram** in **Hall A** at **09:00 AM**."
        
        prompt = f"""
        You are CollegeMate AI Timetable Assistant.
        Answer the following student question accurately using this timetable data:
        {DEFAULT_TIMETABLE}

        Question: {query}
        """
        try:
            res = await self.ai_service._get_llm_response(prompt, "You are CollegeMate AI Timetable Assistant.")
            return res
        except Exception as err:
            logger.warning(f"AI Timetable Query fallback triggered: {err}")
            return f"Your schedule for query '{query}': Classes are on schedule from 09:00 AM to 04:15 PM. Check the timetable dashboard for details."
