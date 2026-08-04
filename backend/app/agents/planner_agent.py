from app.core.logging import get_logger

logger = get_logger(__name__)

class PlannerAgent:
    def process(self, state: dict) -> dict:
        """
        Intervenes for queries that require multi-step planning (e.g. 'Create a 30 day study plan').
        Provides structuring context to the generator.
        """
        question = state.get("messages", [])[-1].content
        logger.info(f"Planner Agent structuring plan for: {question}")
        context_str = (
            "Planner Agent Guidelines:\n"
            "1. Break down the user's request into actionable, sequential steps.\n"
            "2. For a study plan, organize by days or weeks.\n"
            "3. Format the plan using clear Markdown headings and checklists."
        )
        return {"context": context_str, "agent_used": "planner"}
