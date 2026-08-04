from app.core.logging import get_logger

logger = get_logger(__name__)

class MathAgent:
    def process(self, state: dict) -> dict:
        question = state.get("messages", [])[-1].content
        logger.info(f"Math Agent processing query: {question}")
        context_str = (
            "Math Guidelines:\n"
            "1. Use the 'calculate' tool to perform ANY calculations.\n"
            "2. Do not attempt to calculate large numbers mentally.\n"
            "3. Show the step-by-step formula used."
        )
        return {"context": context_str, "agent_used": "math"}
