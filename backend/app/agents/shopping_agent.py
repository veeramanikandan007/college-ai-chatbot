from app.core.logging import get_logger

logger = get_logger(__name__)

class ShoppingAgent:
    def process(self, state: dict) -> dict:
        question = state.get("messages", [])[-1].content
        logger.info(f"Shopping Agent processing query: {question}")
        context_str = (
            "Shopping & Product Guidelines:\n"
            "1. Format results as a comparison table.\n"
            "2. Include Item, Price, Key Specs, and Pros/Cons.\n"
            "3. Use web search to fetch the latest prices if unknown."
        )
        return {"context": context_str, "agent_used": "shopping"}
