from duckduckgo_search import DDGS
from langchain_core.tools import tool
from app.core.logging import get_logger

logger = get_logger(__name__)

@tool
def web_search(query: str) -> str:
    """
    Searches the web for current, real-time information.
    Use this for news, latest facts, and up-to-date information not present in the internal knowledge base.
    """
    logger.info(f"Performing web search for: {query}")
    try:
        results = DDGS().text(query, max_results=3)
        if not results:
            return "No results found on the web."
        
        formatted_results = "\n\n".join(
            f"Title: {res.get('title')}\nLink: {res.get('href')}\nSnippet: {res.get('body')}"
            for res in results
        )
        return formatted_results
    except Exception as e:
        logger.error(f"Web search failed: {e}")
        return "Search is currently unavailable."
