from app.core.logging import get_logger

logger = get_logger(__name__)

class TravelAgent:
    def process(self, state: dict) -> dict:
        question = state.get("messages", [])[-1].content
        logger.info(f"Travel Agent processing query: {question}")
        context_str = (
            "Travel Planning Guidelines:\n"
            "1. Provide a day-wise itinerary.\n"
            "2. Estimate budget and include currency conversions using tools.\n"
            "3. Mention weather, transport options, and places to visit."
        )
        return {"context": context_str, "agent_used": "travel"}
