from app.services.attendance_service import AttendanceService

def test_attendance():
    print("Testing AttendanceService math and analytics...")
    data = AttendanceService.get_dashboard_data()
    print("Overall Percentage:", data.get("overall_percentage"))
    print("Overall Risk Level:", data.get("overall_risk_level"))
    print("Number of subjects:", len(data.get("subjects", [])))
    
    for sub in data.get("subjects", []):
        print(f"- {sub['subject_name']}: {sub['attendance_percentage']}% ({sub['risk_level']}) | Needed: {sub['classes_required_to_reach_75']} | Missable: {sub['max_safe_missable_classes']}")

if __name__ == "__main__":
    test_attendance()
