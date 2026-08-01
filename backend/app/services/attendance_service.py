import math
from typing import List, Dict, Any, Optional
from datetime import date, datetime, timedelta

from app.core.logging import get_logger

logger = get_logger(__name__)

# Sample default subject seed database store
_DEFAULT_SUBJECT_ATTENDANCE: List[Dict[str, Any]] = [
    {
        "id": 1,
        "subject_name": "Database Management Systems",
        "subject_code": "CS501",
        "faculty_name": "Dr. Sarah Allen",
        "department": "Computer Science & Engineering",
        "semester": 5,
        "classes_attended": 28,
        "classes_missed": 12,
        "classes_late": 1,
        "medical_leave": 0,
        "required_percentage": 75.0,
    },
    {
        "id": 2,
        "subject_name": "Operating Systems",
        "subject_code": "CS502",
        "faculty_name": "Prof. Marcus Davis",
        "department": "Computer Science & Engineering",
        "semester": 5,
        "classes_attended": 35,
        "classes_missed": 3,
        "classes_late": 0,
        "medical_leave": 0,
        "required_percentage": 75.0,
    },
    {
        "id": 3,
        "subject_name": "Java Concurrency & Enterprise",
        "subject_code": "CS503",
        "faculty_name": "Dr. Robert Smith",
        "department": "Computer Science & Engineering",
        "semester": 5,
        "classes_attended": 36,
        "classes_missed": 4,
        "classes_late": 0,
        "medical_leave": 0,
        "required_percentage": 75.0,
    },
    {
        "id": 4,
        "subject_name": "Computer Networks",
        "subject_code": "CS504",
        "faculty_name": "Prof. Elena Rostova",
        "department": "Computer Science & Engineering",
        "semester": 5,
        "classes_attended": 30,
        "classes_missed": 10,
        "classes_late": 2,
        "medical_leave": 0,
        "required_percentage": 75.0,
    },
    {
        "id": 5,
        "subject_name": "Machine Learning",
        "subject_code": "CS505",
        "faculty_name": "Dr. Rajesh Patel",
        "department": "Computer Science & Engineering",
        "semester": 5,
        "classes_attended": 33,
        "classes_missed": 2,
        "classes_late": 0,
        "medical_leave": 0,
        "required_percentage": 75.0,
    }
]

class AttendanceService:
    @staticmethod
    def calculate_subject_analytics(subject: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate analytical metrics, risk classification, and AI predictions for a subject.
        """
        attended = subject.get("classes_attended", 0)
        missed = subject.get("classes_missed", 0)
        late = subject.get("classes_late", 0)
        leave = subject.get("medical_leave", 0)
        req_pct = subject.get("required_percentage", 75.0)

        # Counted total classes
        effective_attended = attended + late
        total_classes = attended + missed + late + leave
        
        current_pct = round((effective_attended / total_classes * 100), 1) if total_classes > 0 else 100.0

        # Risk Classification: Safe (>=80), Warning (75-79), Critical (<75)
        if current_pct >= 80.0:
            risk_level = "Safe"
            status_color = "Green"
        elif current_pct >= req_pct:
            risk_level = "Warning"
            status_color = "Yellow"
        else:
            risk_level = "Critical"
            status_color = "Red"

        # AI Prediction Math
        # If below 75%: How many consecutive upcoming classes needed?
        # (Effective_Attended + N) / (Total_Classes + N) >= 0.75
        # Effective_Attended + N >= 0.75 * Total_Classes + 0.75 * N
        # 0.25 * N >= 0.75 * Total_Classes - Effective_Attended
        # N >= (0.75 * Total_Classes - Effective_Attended) / 0.25
        # N >= 3 * Total_Classes - 4 * Effective_Attended
        classes_required_to_reach_75 = 0
        max_safe_missable_classes = 0

        if current_pct < req_pct:
            needed = math.ceil(3 * total_classes - 4 * effective_attended)
            classes_required_to_reach_75 = max(1, needed)
        else:
            # If above or equal 75%: How many classes can student safely miss?
            # Effective_Attended / (Total_Classes + K) >= 0.75
            # Effective_Attended >= 0.75 * Total_Classes + 0.75 * K
            # 0.75 * K <= Effective_Attended - 0.75 * Total_Classes
            # K <= (Effective_Attended - 0.75 * Total_Classes) / 0.75
            missable = math.floor((effective_attended - 0.75 * total_classes) / 0.75)
            max_safe_missable_classes = max(0, missable)

        # Generate personalized suggestion
        if risk_level == "Critical":
            ai_suggestion = f"Your {subject['subject_name']} attendance is {current_pct}% (below 75%). Attend the next {classes_required_to_reach_75} consecutive classes to reach safe status."
        elif risk_level == "Warning":
            ai_suggestion = f"Warning: {subject['subject_name']} is at {current_pct}%. Do not miss any upcoming classes."
        else:
            if max_safe_missable_classes > 0:
                ai_suggestion = f"{subject['subject_name']} attendance is excellent ({current_pct}%). You can safely miss up to {max_safe_missable_classes} classes."
            else:
                ai_suggestion = f"{subject['subject_name']} attendance is solid ({current_pct}%). Maintain your current streak!"

        return {
            **subject,
            "total_classes": total_classes,
            "effective_attended": effective_attended,
            "attendance_percentage": current_pct,
            "required_percentage": req_pct,
            "risk_level": risk_level,
            "status_color": status_color,
            "classes_required_to_reach_75": classes_required_to_reach_75,
            "max_safe_missable_classes": max_safe_missable_classes,
            "ai_suggestion": ai_suggestion
        }

    @classmethod
    def get_dashboard_data(cls) -> Dict[str, Any]:
        """
        Build aggregated smart attendance dashboard stats, trends, insights, and risk metrics.
        """
        analytics_list = [cls.calculate_subject_analytics(s) for s in _DEFAULT_SUBJECT_ATTENDANCE]

        total_classes_held = sum(s["total_classes"] for s in analytics_list)
        total_effective_attended = sum(s["effective_attended"] for s in analytics_list)
        total_missed = sum(s["classes_missed"] for s in analytics_list)
        total_late = sum(s["classes_late"] for s in analytics_list)
        total_leave = sum(s["medical_leave"] for s in analytics_list)

        overall_percentage = round((total_effective_attended / total_classes_held * 100), 1) if total_classes_held > 0 else 100.0

        # Current month percentage (August 2026)
        current_month_percentage = round(min(100.0, overall_percentage + 1.8), 1)

        # Risk distribution count
        safe_count = sum(1 for s in analytics_list if s["risk_level"] == "Safe")
        warning_count = sum(1 for s in analytics_list if s["risk_level"] == "Warning")
        critical_count = sum(1 for s in analytics_list if s["risk_level"] == "Critical")

        # Overall risk level
        if critical_count > 0:
            overall_risk = "Critical"
        elif warning_count > 0:
            overall_risk = "Warning"
        else:
            overall_risk = "Safe"

        # AI Insights list
        ai_insights = [s["ai_suggestion"] for s in analytics_list]

        # Notifications
        notifications = []
        for s in analytics_list:
            if s["risk_level"] == "Critical":
                notifications.append({
                    "id": f"notif_{s['id']}",
                    "type": "Critical Alert",
                    "subject": s["subject_name"],
                    "message": f"Attendance for {s['subject_name']} ({s['attendance_percentage']}%) is below the required 75% threshold! Action required.",
                    "priority": "high",
                    "date": datetime.now().strftime("%Y-%m-%d")
                })
            elif s["risk_level"] == "Warning":
                notifications.append({
                    "id": f"notif_{s['id']}",
                    "type": "Shortage Warning",
                    "subject": s["subject_name"],
                    "message": f"{s['subject_name']} attendance ({s['attendance_percentage']}%) is close to the threshold margin.",
                    "priority": "medium",
                    "date": datetime.now().strftime("%Y-%m-%d")
                })

        # Monthly trend data
        monthly_trend = [
            {"month": "Jan", "percentage": 92.5},
            {"month": "Feb", "percentage": 88.0},
            {"month": "Mar", "percentage": 85.2},
            {"month": "Apr", "percentage": 89.4},
            {"month": "May", "percentage": 84.1},
            {"month": "Jun", "percentage": 86.8},
            {"month": "Jul", "percentage": 83.5},
            {"month": "Aug", "percentage": overall_percentage},
        ]

        # Weekly log (Mon - Fri)
        weekly_log = [
            {"day": "Mon", "date": "Jul 28", "status": "Present", "subject": "DBMS"},
            {"day": "Tue", "date": "Jul 29", "status": "Present", "subject": "Operating Systems"},
            {"day": "Wed", "date": "Jul 30", "status": "Late", "subject": "Computer Networks"},
            {"day": "Thu", "date": "Jul 31", "status": "Present", "subject": "Java Concurrency"},
            {"day": "Fri", "date": "Aug 01", "status": "Present", "subject": "Machine Learning"},
        ]

        return {
            "department": "Computer Science & Engineering",
            "semester": 5,
            "academic_year": "2026 - 2027",
            "overall_percentage": overall_percentage,
            "required_percentage": 75.0,
            "current_month_percentage": current_month_percentage,
            "todays_status": "Present",
            "overall_risk_level": overall_risk,
            "total_classes_held": total_classes_held,
            "total_effective_attended": total_effective_attended,
            "total_missed": total_missed,
            "total_late": total_late,
            "total_medical_leave": total_leave,
            "risk_counts": {
                "safe": safe_count,
                "warning": warning_count,
                "critical": critical_count
            },
            "subjects": analytics_list,
            "monthly_trend": monthly_trend,
            "weekly_log": weekly_log,
            "ai_insights": ai_insights,
            "notifications": notifications
        }
