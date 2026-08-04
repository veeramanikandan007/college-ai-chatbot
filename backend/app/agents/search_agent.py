from app.core.logging import get_logger

logger = get_logger(__name__)

class SearchAgent:
    def process(self, state: dict) -> dict:
        question = state.get("messages", [])[-1].content
        logger.info(f"Search Agent processing query: {question}")
        context_str = (
            "Web Search Guidelines:\n"
            "1. Use the 'web_search' tool to fetch current, real-time info.\n"
            "2. Synthesize the results into a clear, concise answer.\n"
            "3. Cite the sources if possible."
        )
        return {"context": context_str, "agent_used": "search"}
