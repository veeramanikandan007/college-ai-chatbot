import asyncio
from app.services.placement_service import PlacementService

async def test_placement():
    print("Testing PlacementService...")
    service = PlacementService()
    
    # 1. Dashboard data
    dash = service.get_dashboard_data()
    print("Placement Drives Count:", len(dash.get("drives", [])))
    print("Applied Applications Count:", len(dash.get("applications", [])))
    print("Coding Problems Count:", len(dash.get("coding_problems", [])))

    # 2. ATS analysis
    ats = await service.analyze_resume_ats("Java, Spring Boot, React, SQL, DSA, Git developer.")
    print("ATS Score:", ats.get("ats_score"))

    # 3. Mock interview question
    mock_q = await service.generate_mock_question("Technical", "Software Engineer")
    print("Mock Question:", mock_q.get("question"))

if __name__ == "__main__":
    asyncio.run(test_placement())
