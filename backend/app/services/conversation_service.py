import re
import os
import random
from enum import Enum
from typing import Tuple

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class Intent(Enum):
    GREETING = "GREETING"
    SMALL_TALK = "SMALL_TALK"
    GENERAL_KNOWLEDGE = "GENERAL_KNOWLEDGE"
    CAMPUS_KNOWLEDGE = "CAMPUS_KNOWLEDGE"
    UNKNOWN = "UNKNOWN"

class ConversationService:
    def __init__(self):
        self.greeting_patterns = [
            r"^\s*(hi|hello|hey|good morning|good afternoon|good evening|yo|hola|hii|hey there|hi campusmate|vanakkam|namaste)\b"
        ]
        
        self.small_talk_patterns = {
            r"^\s*(how are you|epdi iruka|how are u)": "I'm doing great, thank you for asking! 😊 How can I assist you with your studies or college-related questions today?",
            r"^\s*(who are you|yaru neenga|ni yaru)": "I'm CampusMate AI, your college assistant. I can help with subjects, attendance, assignments, schedules, college information, and general questions.",
            r"^\s*(what can you do|enna panna mudiyum|help)": "I can help you with:\n\n• College information\n• Attendance\n• Assignments\n• Timetables\n• Subjects\n• Notes\n• Exams\n• General knowledge\n• AI assistance\n\nWhat would you like to explore today?",
            r"^\s*(thanks|nandri|thank you)\b": "You're welcome! I'm always happy to help. If you have any more questions, just ask.",
            r"^\s*(bye|goodbye|cya)\b": "Goodbye! Have a great day, and best of luck with your studies. 👋"
        }

        self.greeting_responses = [
            "Hello! 👋 I'm CampusMate AI. How can I assist you today?",
            "Hi! Welcome back. What would you like help with today?",
            "Hey! I'm here to help with academics, attendance, assignments, college information, and more."
        ]

        self.fallback_responses = [
            "I couldn't find reliable information for your question in the Campus Knowledge Base right now.\n\nYou can try:\n• Rephrasing your question\n• Asking a more specific question\n• Trying again in a moment",
            "I don't have enough campus information to answer that accurately at the moment. Please try asking in a different way."
        ]
        
        api_key = settings.GROQ_API_KEY or os.getenv('GROQ_API_KEY')
        if api_key:
            # We use a smaller model for fast intent classification
            self.classifier_llm = ChatGroq(temperature=0, groq_api_key=api_key, model_name="llama-3.1-8b-instant")
        else:
            self.classifier_llm = None

    def classify_message(self, message: str) -> Tuple[Intent, str]:
        """
        Classifies the message.
        Returns: (Intent, small_talk_key)
        """
        msg_lower = message.lower().strip()
        clean_msg = re.sub(r'[^a-z\s]', '', msg_lower).strip()
        
        # Check small talk first
        for pattern, response in self.small_talk_patterns.items():
            if re.search(pattern, msg_lower):
                return Intent.SMALL_TALK, pattern
        
        # Check greetings
        for pattern in self.greeting_patterns:
            if re.search(pattern, msg_lower):
                if len(clean_msg.split()) <= 3:
                    return Intent.GREETING, ""
                
        # Use LLM for semantic intent classification if configured
        if self.classifier_llm:
            try:
                system_prompt = (
                    "You are an intent classifier for CampusMate AI. "
                    "Classify the following user message into exactly one of these two categories: "
                    "GENERAL_KNOWLEDGE or CAMPUS_KNOWLEDGE. "
                    "Respond with ONLY the category name. "
                    "Use CAMPUS_KNOWLEDGE if the question is about college, courses, campus facilities, assignments, or student info. "
                    "Use GENERAL_KNOWLEDGE if the question is about math, science, programming, history, or general facts."
                )
                response = self.classifier_llm.invoke([
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=message)
                ])
                intent_text = response.content.strip().upper()
                if "CAMPUS_KNOWLEDGE" in intent_text:
                    return Intent.CAMPUS_KNOWLEDGE, ""
                elif "GENERAL_KNOWLEDGE" in intent_text:
                    return Intent.GENERAL_KNOWLEDGE, ""
            except Exception as e:
                logger.warning("LLM Intent classification failed, defaulting to CAMPUS_KNOWLEDGE: %s", e)
        
        # Default to Campus Knowledge for RAG pipeline if LLM fails
        return Intent.CAMPUS_KNOWLEDGE, ""

    def get_greeting_response(self) -> str:
        return random.choice(self.greeting_responses)

    def get_small_talk_response(self, key: str) -> str:
        return self.small_talk_patterns.get(key, self.get_greeting_response())

    def get_fallback_response(self) -> str:
        return random.choice(self.fallback_responses)
