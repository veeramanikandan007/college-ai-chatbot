import asyncio
import os
import sys
from dotenv import load_dotenv

# Ensure backend directory is in the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables explicitly for testing
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env')))

from app.services.query_router import QueryRouter

async def test_ai_planner():
    router = QueryRouter()
    
    if not router.planner_llm:
        print("WARNING: planner_llm is None. The test will use fallback logic.")
    
    test_queries = [
        "What is the attendance for my subject?",
        "Write a Python script to reverse a linked list.",
        "How is the weather today?",
        "Tell me about the Computer Science HOD."
    ]
    
    for query in test_queries:
        print(f"\nTesting Query: '{query}'")
        plan = router.generate_plan(query)
        print(f"Intent: {plan.intent}")
        print(f"Requires Memory: {plan.requires_memory}")
        print(f"Requires RAG: {plan.requires_rag}")
        print(f"Tools Required: {plan.tools_required}")
        print(f"Confidence: {plan.confidence}")
        print(f"Reasoning: {plan.reasoning}")
        print("-" * 40)

if __name__ == "__main__":
    asyncio.run(test_ai_planner())
