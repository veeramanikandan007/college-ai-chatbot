from app.rag.rag_service import RAGService
from app.core.logging import get_logger

logger = get_logger(__name__)

class RAGAgent:
    def __init__(self, rag_service: RAGService):
        self.rag_service = rag_service

    def process(self, state: dict) -> dict:
        """
        Retrieves college documents, rules, syllabus, and notices using Hybrid RAG.
        """
        question = state.get("messages", [])[-1].content
        logger.info(f"RAG Agent processing query: {question}")
        
        try:
            chunks, confidence = self.rag_service.retrieve_context_with_confidence(question, top_k=5)
            
            if not chunks:
                context_str = "No internal college documents found for this query."
            else:
                context_str = "College Knowledge Base Context:\n"
                for i, c in enumerate(chunks, 1):
                    content = c.get('content', '').strip().replace('\n', ' ')
                    context_str += f"{i}. {content}\n"
            
            return {"context": context_str, "confidence": confidence, "agent_used": "rag"}
        except Exception as e:
            logger.error(f"RAG Agent failed: {e}")
            return {"context": "Error retrieving college context.", "confidence": "NONE", "agent_used": "rag"}
