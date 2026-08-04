from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.logging import get_logger

logger = get_logger(__name__)

class CriticAgent:
    def __init__(self, llm: ChatGroq):
        self.llm = llm

    def process(self, state: dict) -> dict:
        """
        Evaluates the generated response for hallucinations, missing info, or formatting issues.
        """
        original_query = state.get("messages", [])[0].content
        generated_response = state.get("messages", [])[-1].content
        context = state.get("context", "")
        
        logger.info("Critic Agent evaluating the response...")
        
        system_prompt = (
            "You are the Critic Agent. Your job is to review the AI's generated response against the user's query and the provided context.\n"
            "If the response is accurate, helpful, and doesn't hallucinate outside the context (when context is strict like RAG), output 'PASS'.\n"
            "If there is a severe hallucination, inappropriate content, or it completely missed the user's question, output 'REJECT' followed by the reason."
        )
        
        evaluation_prompt = f"Query: {original_query}\nContext: {context}\nGenerated Response:\n{generated_response}"
        
        try:
            eval_res = self.llm.invoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=evaluation_prompt)
            ])
            
            feedback = str(eval_res.content).strip()
            if feedback.startswith("REJECT"):
                logger.warning(f"Critic Agent rejected the response: {feedback}")
                # Append the critique to the context so the generator can fix it on the next loop
                new_context = context + f"\n\nCRITIQUE (Fix these issues): {feedback}"
                return {"critic_status": "REJECT", "context": new_context}
            else:
                logger.info("Critic Agent passed the response.")
                return {"critic_status": "PASS"}
        except Exception as e:
            logger.error(f"Critic Agent failed: {e}")
            return {"critic_status": "PASS"}  # Fail-open
