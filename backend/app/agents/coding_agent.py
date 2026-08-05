from app.core.logging import get_logger
from app.tools.python_executor import execute_python
from langchain_groq import ChatGroq

logger = get_logger(__name__)

class CodingAgent:
    def __init__(self, llm: ChatGroq):
        self.llm = llm

    def process(self, state: dict) -> dict:
        """
        Handles coding queries, generates python logic, and optionally executes it.
        """
        question = state.get("messages", [])[-1].content
        logger.info(f"Coding Agent processing query: {question}")
        
        # For a full tool-calling setup in LangGraph, this could return a ToolInvocation.
        # Here we bind the tool to the LLM and let it decide, but for simplicity in this node,
        # we return a system context instructing the orchestrator's LLM to write code.
        
        context_str = (
            "Coding Guidelines:\n"
            "1. Provide complete, error-free code.\n"
            "2. Explain the logic step-by-step.\n"
            "3. If Python is required, you can use the python_executor tool."
        )
        
        return {"context": context_str, "agent_used": "coding"}
