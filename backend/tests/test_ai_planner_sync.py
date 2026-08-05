import sys
sys.stdout.reconfigure(line_buffering=True)
import os
from dotenv import load_dotenv

print("Starting test...", flush=True)

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env')))

print("Loaded env, importing...", flush=True)

try:
    from app.services.query_router import QueryRouter
    print("Imported QueryRouter.", flush=True)

    router = QueryRouter()
    print("Instantiated QueryRouter.", flush=True)
    
    if not router.planner_llm:
        print("WARNING: planner_llm is None. The test will use fallback logic.", flush=True)
    
    query = "Write a Python script to reverse a linked list."
    print(f"Testing Query: '{query}'", flush=True)
    plan = router.generate_plan(query)
    
    print(f"Intent: {plan.intent}", flush=True)
    print(f"Requires Memory: {plan.requires_memory}", flush=True)
    print(f"Requires RAG: {plan.requires_rag}", flush=True)
    print(f"Tools Required: {plan.tools_required}", flush=True)
    print(f"Confidence: {plan.confidence}", flush=True)
    print(f"Reasoning: {plan.reasoning}", flush=True)
    print("Success!", flush=True)

except Exception as e:
    print(f"Error: {e}", flush=True)
