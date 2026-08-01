import asyncio
from app.services.timetable_service import TimetableService

def test_timetable_service():
    print("Testing TimetableService logic...")
    
    # 1. Test Today's timetable
    today_data = TimetableService.get_today_timetable("Monday")
    print(f"Department: {today_data['department']}")
    print(f"Current Day: {today_data['current_day']}")
    print(f"Total Classes Today: {today_data['stats']['total_classes']}")
    print(f"Ongoing Class: {today_data['ongoing_class']['subject_name'] if today_data['ongoing_class'] else 'None'}")
    
    assert today_data['stats']['total_classes'] > 0, "Today classes count should be > 0"
    
    # 2. Test Weekly timetable
    weekly_data = TimetableService.get_weekly_timetable()
    print(f"Weekly Days Count: {len(weekly_data)}")
    assert "Monday" in weekly_data, "Monday should be in weekly data"
    assert "Friday" in weekly_data, "Friday should be in weekly data"
    
    # 3. Test Academic Calendar
    cal_data = TimetableService.get_academic_calendar()
    print(f"Academic Events Count: {len(cal_data)}")
    assert len(cal_data) > 0, "Calendar events count should be > 0"

    print("\n--- TIMETABLE SERVICE TESTS PASSED SUCCESSFULLY ---")

async def test_ai_query():
    print("\nTesting Timetable AI Assistant Query...")
    service = TimetableService()
    ans1 = await service.answer_timetable_ai_query("When is my next class?")
    print(f"AI Query 1 Response: {ans1}")
    
    ans2 = await service.answer_timetable_ai_query("Show tomorrow's timetable.")
    print(f"AI Query 2 Response:\n{ans2}")
    
    assert "Database" in ans1 or "class" in ans1, "AI response should contain class info"
    print("\n--- TIMETABLE AI QUERY TESTS PASSED SUCCESSFULLY ---")

if __name__ == "__main__":
    test_timetable_service()
    asyncio.run(test_ai_query())
