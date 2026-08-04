from app.core.logging import get_logger

logger = get_logger(__name__)

class GeneralAgent:
    def process(self, state: dict) -> dict:
        question = state.get("messages", [])[-1].content
        logger.info(f"General Agent processing query: {question}")
        context_str = (
            "General Conversation Guidelines:\n"
            "1. Be friendly, empathetic, and professional.\n"
            "2. Answer the user's question directly using your general intelligence.\n"
            "3. Do not mention any internal campus databases unless specifically asked."
        )
        return {"context": context_str, "agent_used": "general"}
