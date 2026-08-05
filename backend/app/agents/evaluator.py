import os
import asyncio
from app.services.ai_service import AIService
from app.core.logging import get_logger

logger = get_logger(__name__)

from langchain_core.messages import HumanMessage

async def run_evaluation():
    service = AIService()
    
    questions = [
        ("What's 15 * 4?", "MATH"),
        ("Write a Python function for factorial.", "CODING"),
        ("Tell me about my college.", "CAMPUS"),
        ("Create a 30 day study plan.", "PLANNER"),
        ("What is the weather in New York?", "SEARCH"),
        ("Hi!", "GENERAL"),
    ]
    
    print("--- Starting Evaluator Benchmark ---")
    score = 0
    total = len(questions)
    
    for query, expected_agent in questions:
        print(f"\nEvaluating: '{query}' (Expected Agent: {expected_agent})")
        
        # We can hook into the orchestrator directly to test routing accuracy
        state = await service.orchestrator.graph.ainvoke({
            "messages": [HumanMessage(content=query)],
            "intent": "",
            "context": "",
            "agent_used": "",
            "critic_status": "PASS",
            "revision_count": 0,
            "image_url": ""
        })
        
        # The intent mapping should match the expected agent
        actual_intent = state.get("intent")
        if actual_intent == expected_agent:
            print(f"[PASS] Correctly routed to {expected_agent}")
            score += 1
        else:
            print(f"[FAIL] Expected {expected_agent}, but got {actual_intent}")
            
    print(f"\n--- Evaluation Complete: {score}/{total} Passed ({(score/total)*100:.1f}%) ---")

if __name__ == "__main__":
    asyncio.run(run_evaluation())
