import asyncio
from app.services.ai_service import AIService
from app.core.logging import get_logger

logger = get_logger(__name__)

async def test_streaming():
    service = AIService()
    
    print("\n--- Testing Streaming (Planner + Critic Flow) ---")
    query = "Create a 30 day study plan for Python programming."
    print(f"Query: {query}")
    
    print("\nStream Output:")
    async for chunk in service.stream_chat_answer(query):
        print(chunk, end="", flush=True)
    print("\n\n--- Stream Completed ---")

if __name__ == "__main__":
    asyncio.run(test_streaming())
