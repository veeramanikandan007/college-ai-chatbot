import re
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.logging import get_logger
from app.services.groq_client import is_configured, get_api_key, get_router_model
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate

logger = get_logger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Action-intent regex table for Copilot fast-path routing
# Order matters: more specific patterns go first
# ─────────────────────────────────────────────────────────────────────────────
COPILOT_ACTION_PATTERNS = [
    # Composite intents (multi-module flows)
    (r"\b(exam|test|semester|finals|mid.?term|revision)\b.*\b(week|tomorrow|today|soon|near|coming)\b",
     "COMPOSITE_EXAM_PREP"),
    (r"\b(prepare|prep|ready|crack)\b.*\b(tcs|infosys|wipro|accenture|placement|interview|company|drive)\b",
     "COMPOSITE_PLACEMENT_PREP"),
    (r"\b(placement|job|campus|drive|recruitment|career)\b.*\b(prepare|ready|plan|help)\b",
     "COMPOSITE_PLACEMENT_PREP"),
    # Navigation — Attendance
    (r"\b(attendance|attend|absent|present|bunk|bunked)\b", "NAVIGATE_ATTENDANCE"),
    # Navigation — Assignments
    (r"\b(assignment|submit|submission|homework|task|due)\b", "NAVIGATE_ASSIGNMENTS"),
    # Navigation — Timetable
    (r"\b(timetable|schedule|class|period|today.?class|when is|lecture|slot)\b", "NAVIGATE_TIMETABLE"),
    # Navigation — Resume
    (r"\b(resume|cv|curriculum|ats|portfolio)\b", "NAVIGATE_RESUME"),
    # Navigation — Placement
    (r"\b(placement|placement hub|internship|job|campus drive|aptitude|coding)\b", "NAVIGATE_PLACEMENT"),
    # Navigation — Mock Interview
    (r"\b(mock interview|interview practice|interview prep|interview simulation)\b", "OPEN_MOCK_INTERVIEW"),
    # Generate — Notes
    (r"\b(generate|create|make|write|summarize)\b.*\b(notes|note|summary|revision)\b",
     "GENERATE_NOTES"),
    (r"\b(notes?|revision)\b.*\b(for|on|about)\b", "GENERATE_NOTES"),
    # Generate — Quiz
    (r"\b(quiz|test|mcq|practice test|generate quiz)\b", "GENERATE_QUIZ"),
    # OCR / Upload
    (r"\b(upload|scan|ocr|extract|question paper|paper upload)\b", "OPEN_OCR"),
    # Analytics
    (r"\b(analytics|performance|report|progress|cgpa|marks|grade)\b", "OPEN_ANALYTICS"),
    # Documents
    (r"\b(document|file|pdf|upload doc|my document)\b", "OPEN_DOCUMENTS"),
    # Study Planner
    (r"\b(study plan|planner|schedule study|plan my study)\b", "OPEN_STUDY_PLANNER"),
    # Profile / Settings
    (r"\b(profile|settings|account|password|edit profile)\b", "OPEN_SETTINGS"),
    # Knowledge Base / Faculty
    (r"\b(hod|principal|faculty|professor|teacher|staff|contact)\b", "CAMPUS_QUERY"),
]


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

        # Regex for basic math calculation (e.g. 25*48, 12+5)
        self.math_patterns = [
            r"^\s*([\d\.]+\s*[\+\-\*\/x]\s*[\d\.]+)+\s*$",
            r"^\s*(calculate|what is|whats)\s+[\d\.]+\s*[\+\-\*\/x]\s*[\d\.]+"
        ]

        # Fast regex for personal student query indicators
        self.personal_keywords = [
            r"\bmy\s+(attendance|timetable|fees|fee|due|schedule|grades|grade|marks|cgpa|gpa|profile|books|book|assignments|assignment|notes|note)\b",
            r"\b(how\s+many|what\s+is\s+my|when\s+is\s+my|do\s+i\s+have|check\s+my)\b"
        ]

        # Fast regex for general non-campus queries to save LLM routing overhead
        self.general_patterns = [
            r"^\s*(explain|what is|whats|how to|how do|write|create|code|define|difference between|summarize|tell me|who is|where is|why does|list|can you|give me)\b"
        ]

    def resolve_action_intent(self, message: str) -> str | None:
        """
        Fast regex-based action intent resolver for the Copilot.
        Returns a specific action intent string or None if no match.
        """
        msg_lower = message.lower().strip()
        for pattern, intent in COPILOT_ACTION_PATTERNS:
            if re.search(pattern, msg_lower):
                return intent
        return None

    def route_query(self, message: str) -> str:
        """
        Classifies the user query into one of the routing intents.
        Returns one of: GREETING, SMALL_TALK, PERSONAL, CAMPUS_QUERY, HYBRID,
                        WEB_SEARCH, WEATHER, GENERAL, CALCULATOR
        """
        msg_lower = message.lower().strip()
        clean_msg = re.sub(r'[^a-z\s]', '', msg_lower).strip()

        # 1. Fast regex detection for basic greetings
        for pattern in self.greeting_patterns:
            if re.search(pattern, msg_lower):
                if len(clean_msg.split()) <= 3:
                    return "GREETING"

        # 2. Fast regex detection for basic math calculations
        for pattern in self.math_patterns:
            if re.search(pattern, msg_lower):
                return "CALCULATOR"

        # 3. Heuristic for weather
        if "weather" in msg_lower or "mazhai" in msg_lower or "rain" in msg_lower:
            return "WEATHER"

        # 4. Check for Personal vs Hybrid vs General Campus
        has_personal = any(re.search(pat, msg_lower) for pat in self.personal_keywords)
        has_campus_rule = any(kw in msg_lower for kw in [
            "rule", "policy", "eligibility", "allowed", "minimum",
            "hod", "principal", "campus", "college", "department"
        ])

        if has_personal and has_campus_rule:
            return "HYBRID"
        elif has_personal:
            return "PERSONAL"

        # 5. Fast regex detection for general questions
        for pattern in self.general_patterns:
            if re.search(pattern, msg_lower) and not has_campus_rule:
                return "GENERAL"

        # 5. LLM-based intelligent classification
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

                raw_content = response.content
                if isinstance(raw_content, list):
                    raw_content = " ".join(
                        c.get("text", "") if isinstance(c, dict) else str(c)
                        for c in raw_content
                    )
                intent_str = str(raw_content).strip().upper()

                valid_intents = ["GREETING", "SMALL_TALK", "PERSONAL", "CAMPUS_QUERY",
                                 "HYBRID", "WEB_SEARCH", "WEATHER", "GENERAL"]
                for valid in valid_intents:
                    if valid in intent_str:
                        return valid

                return "CAMPUS_QUERY"
            except Exception as e:
                logger.warning("LLM Routing failed: %s. Defaulting to CAMPUS_QUERY.", e)
                return "CAMPUS_QUERY"

        # Default fallback
        return "CAMPUS_QUERY"
