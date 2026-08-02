
import asyncio, os, sys
sys.path.insert(0, os.path.abspath("."))
from app.services.ai_service import AIService
from dotenv import load_dotenv

load_dotenv()

async def main():
    service = AIService()
    questions = [
        "hi",
        "how are you",
        "today weather",
        "Google company details",
        "exam date",
        "explain Python"
    ]
    
    for q in questions:
        print(f"\n\n==== Q: {q} ====")
        try:
            ans = await service.get_chat_answer(q)
            print("ANS:", ans)
        except Exception as e:
            print("ERR:", e)

asyncio.run(main())

