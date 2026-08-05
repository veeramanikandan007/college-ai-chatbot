import asyncio
from app.services.ai_service import AIService
from app.core.logging import get_logger

logger = get_logger(__name__)

async def test_vision():
    service = AIService()
    
    # We use a dummy image URL of a Python logo
    image_url = "https://www.python.org/static/community_logos/python-logo-master-v3-TM.png"
    query = "What is this logo for?"
    
    print("\n--- Testing Vision Agent Flow ---")
    print(f"Query: {query}")
    print(f"Image URL: {image_url}")
    
    print("\nStream Output:")
    async for chunk in service.stream_chat_answer(query, image_url=image_url):
        print(chunk, end="", flush=True)
    print("\n\n--- Stream Completed ---")

if __name__ == "__main__":
    asyncio.run(test_vision())
