from app.tools.search_tools import web_search
from langchain_core.tools import tool
from app.core.logging import get_logger

logger = get_logger(__name__)

@tool
def search_products(query: str) -> str:
    """
    Searches for products, their prices, and specifications online.
    Input should be a product name (e.g. 'iPhone 15 Pro Max price specs').
    """
    logger.info(f"Searching products for: {query}")
    try:
        # Wrap the web search tool specifically for products
        enhanced_query = f"{query} price specs review buy"
        # Since web_search is a LangChain tool, we call its invoke method or underlying function.
        # It's decorated with @tool, so we can call it directly as a python function in older LC, 
        # but in newer LC we might need to do web_search.invoke(enhanced_query)
        results = web_search.invoke({"query": enhanced_query})
        return f"Product Search Results for '{query}':\n\n{results}"
    except Exception as e:
        logger.error(f"Product search failed: {e}")
        return "Product search is currently unavailable."
