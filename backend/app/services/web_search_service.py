from typing import List, Dict
from ddgs import DDGS
from app.core.logging import get_logger

logger = get_logger(__name__)

class WebSearchService:
    def __init__(self):
        self.ddgs = DDGS()

    def search(self, query: str, max_results: int = 3) -> str:
        """
        Perform a web search for the query and format the results.
        Returns a formatted string containing summarized context and sources.
        """
        try:
            logger.info("Performing web search for: %s", query)
            results = self.ddgs.text(query, max_results=max_results)
            
            if not results:
                return "I couldn't find any relevant information on the web for your query."

            formatted_results = []
            sources = []
            for i, res in enumerate(results):
                title = res.get('title', 'Unknown Title')
                body = res.get('body', '')
                url = res.get('href', '')
                
                formatted_results.append(f"Result {i+1}:\nTitle: {title}\nSummary: {body}")
                sources.append(f"- {title}: {url}")
            
            context = "\n\n".join(formatted_results)
            sources_text = "\n".join(sources)
            
            return (
                f"{context}\n\n"
                f"**Sources:**\n{sources_text}"
            )
        except Exception as e:
            logger.exception("Web search failed")
            return "An error occurred while searching the web. Please try again later."
