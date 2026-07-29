import asyncio
import os
from app.services.ai_service import AIService
from app.core.config import settings

async def run():
    # Setup dummy env vars if needed
    if not os.getenv('GROQ_API_KEY') and not settings.GROQ_API_KEY:
        print("NO API KEY")
        
    ai = AIService()
    try:
        response = await ai.get_chat_answer("hi")
        print(f"Response: {response}")
    except Exception as e:
        print(f"FAILED with error: {e}")

if __name__ == "__main__":
    asyncio.run(run())
