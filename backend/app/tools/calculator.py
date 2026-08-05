import numexpr
from langchain_core.tools import tool
from app.core.logging import get_logger

logger = get_logger(__name__)

@tool
def calculate(expression: str) -> str:
    """
    Evaluates a mathematical expression safely.
    Use this for mathematics, budget calculations, and conversions.
    Do NOT rely on LLM logic for math; always use this tool.
    Input should be a string containing a valid mathematical expression (e.g. "25 * 67", "100 / 3.5").
    """
    try:
        # Evaluate safely using numexpr
        result = numexpr.evaluate(expression)
        return str(result.item())
    except Exception as e:
        logger.error(f"Calculator tool failed for expression '{expression}': {e}")
        return f"Error: Could not calculate '{expression}'. Please ensure it is a valid mathematical expression."
