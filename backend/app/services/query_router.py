import re
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.logging import get_logger
from app.services.conversation_service import Intent
from app.services.groq_client import get_api_key, get_router_model, is_configured

logger = get_logger(__name__)

class QueryRouter:
    def __init__(self):
        if is_configured():
            self.llm = ChatGroq(
                temperature=0,
                groq_api_key=get_api_key(),
                model_name=get_router_model()
            )
        else:
            self.llm = None
            
        # Fast regex fallback for greetings/small talk to save API calls
        self.greeting_patterns = [
            r"^\s*(hi|hello|hey|good morning|good afternoon|good evening|yo|hola|hii|hey there|hi campusmate|vanakkam|namaste)\b"
        ]

    def route_query(self, message: str) -> str:
        """
        Classifies the user query into one of the routing intents.
        Returns one of: GREETING, SMALL_TALK, CAMPUS_QUERY, WEB_SEARCH, WEATHER, GENERAL
        """
        msg_lower = message.lower().strip()
        clean_msg = re.sub(r'[^a-z\s]', '', msg_lower).strip()
        
        # 1. Fast regex detection for basic greetings
        for pattern in self.greeting_patterns:
            if re.search(pattern, msg_lower):
                if len(clean_msg.split()) <= 3:
                    return "GREETING"
        
        # 2. Heuristic for weather
        if "weather" in msg_lower or "mazhai" in msg_lower or "rain" in msg_lower:
            return "WEATHER"

        # 3. LLM-based intelligent classification
        if self.llm:
            try:
                system_prompt = (
                    "You are a routing assistant for an AI chatbot called CampusMate. "
                    "Analyze the user's message and categorize it exactly into ONE of the following categories:\n\n"
                    "1. GREETING: Simple greetings like hi, hello.\n"
                    "2. SMALL_TALK: Personal questions about the bot, thanks, how are you.\n"
                    "3. CAMPUS_QUERY: Questions about college, HOD, fees, attendance, semester exams, subjects, campus rules, campus facilities.\n"
                    "4. WEATHER: Questions about the weather, temperature, rain.\n"
                    "5. WEB_SEARCH: Questions requiring live, external, or current internet information (e.g., news, stock prices, celebrity info, external companies like Google, OpenAI).\n"
                    "6. GENERAL: General knowledge, explanations, reasoning, coding, math, general science (e.g., 'explain machine learning', 'what is python').\n\n"
                    "Reply with ONLY the exact category name."
                )
                
                response = self.llm.invoke([
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=message)
                ])
                
                intent_str = response.content.strip().upper()
                
                # Ensure valid mapping
                valid_intents = ["GREETING", "SMALL_TALK", "CAMPUS_QUERY", "WEB_SEARCH", "WEATHER", "GENERAL"]
                for valid in valid_intents:
                    if valid in intent_str:
                        return valid
                        
                return "GENERAL"
            except Exception as e:
                logger.warning("LLM Routing failed: %s. Defaulting to CAMPUS_QUERY.", e)
                return "CAMPUS_QUERY"
                
        # Default fallback
        return "CAMPUS_QUERY"
