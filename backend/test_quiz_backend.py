import asyncio
import json
from app.services.quiz_generator_service import QuizGeneratorService

async def main():
    service = QuizGeneratorService()
    print("Testing quiz generation...")
    res = await service.generate_quiz(
        document_name="Operating_Systems_Module_3.pdf",
        num_questions=5,
        difficulty="Medium",
        quiz_type="MCQ",
        subject="Operating Systems"
    )
    print("Generated Quiz Title:", res.get("title"))
    print("Number of Questions:", res.get("num_questions"))
    print("Questions Sample:", json.dumps(res.get("questions")[:2], indent=2))

if __name__ == "__main__":
    asyncio.run(main())
