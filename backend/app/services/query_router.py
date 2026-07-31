import os
import re
from typing import Tuple
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

class QueryRouter:
    def __init__(self):
        api_key = settings.GROQ_API_KEY or os.getenv('GROQ_API_KEY')
        if api_key:
            self.llm = ChatGroq(
                temperature=0, 
                groq_api_key=api_key, 
                model_name="llama-3.1-8b-instant"
            )
        else:
            self.llm = None
            
        # Fast regex fallback for greetings/small talk to save API calls
        self.greeting_patterns = [
            r"^\s*(hi|hello|hey|good morning|good afternoon|good evening|yo|hola|hii|hey there|hi campusmate|vanakkam|namaste)\b"
        ]

        # Fast regex for personal student query indicators
        self.personal_keywords = [
            r"\bmy\s+(attendance|timetable|fees|fee|due|schedule|grades|grade|marks|cgpa|gpa|profile|books|book|assignments|assignment|notes|note)\b",
            r"\b(how\s+many|what\s+is\s+my|when\s+is\s+my|do\s+i\s+have|check\s+my)\b"
        ]

    def route_query(self, message: str) -> str:
        """
        Classifies the user query into one of the routing intents.
        Returns one of: GREETING, SMALL_TALK, PERSONAL, CAMPUS_QUERY, HYBRID, WEB_SEARCH, WEATHER, GENERAL
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

        # 3. Check for Personal vs Hybrid vs General Campus
        has_personal = any(re.search(pat, msg_lower) for pat in self.personal_keywords)
        has_campus_rule = any(kw in msg_lower for kw in ["rule", "policy", "eligibility", "allowed", "minimum", "hod", "principal", "campus", "college", "department"])

        if has_personal and has_campus_rule:
            return "HYBRID"
        elif has_personal:
            return "PERSONAL"

        # 4. LLM-based intelligent classification
        if self.llm:
            try:
                system_prompt = (
                    "You are a routing assistant for an AI chatbot called CollegeMate. "
                    "Analyze the user's message and categorize it exactly into ONE of the following categories:\n\n"
                    "1. GREETING: Simple greetings like hi, hello.\n"
                    "2. SMALL_TALK: Personal questions about the bot, thanks, how are you.\n"
                    "3. PERSONAL: Specific questions about the logged-in student's personal records (e.g., 'my attendance', 'my timetable', 'my fee status', 'my library books', 'my profile').\n"
                    "4. CAMPUS_QUERY: Questions about general college info, HOD, campus rules, library timing, hostel rules, courses.\n"
                    "5. HYBRID: Questions combining both personal student status and general college rules/policies (e.g., 'Am I eligible for exams based on my attendance?').\n"
                    "6. WEATHER: Questions about the weather, temperature, rain.\n"
                    "7. WEB_SEARCH: Questions requiring live, external, or current internet information.\n"
                    "8. GENERAL: General knowledge, explanations, reasoning, coding, math, general science.\n\n"
                    "Reply with ONLY the exact category name."
                )
                
                response = self.llm.invoke([
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=message)
                ])
                
                intent_str = response.content.strip().upper()
                
                # Ensure valid mapping
                valid_intents = ["GREETING", "SMALL_TALK", "PERSONAL", "CAMPUS_QUERY", "HYBRID", "WEB_SEARCH", "WEATHER", "GENERAL"]
                for valid in valid_intents:
                    if valid in intent_str:
                        return valid
                        
                return "CAMPUS_QUERY"
            except Exception as e:
                logger.warning("LLM Routing failed: %s. Defaulting to CAMPUS_QUERY.", e)
                return "CAMPUS_QUERY"
                
        # Default fallback
        return "CAMPUS_QUERY"

