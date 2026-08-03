import os
import asyncio
import json
from typing import Optional, List, Dict, Any, AsyncGenerator

from fastapi import HTTPException, status
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from sqlalchemy.orm import Session

from app.rag.rag_service import RAGService
from app.services.conversation_service import ConversationService
from app.core.logging import get_logger
from app.core.config import settings
from app.services.query_router import QueryRouter
from app.services.weather_service import WeatherService
from app.services.web_search_service import WebSearchService
from app.services.groq_client import get_api_key, get_model_name, is_configured

logger = get_logger(__name__)

# Maximum previous turns to inject for context memory (Phase 5)
MEMORY_WINDOW = 8


SYSTEM_RAG_PROMPT = (
    "You are CollegeMate AI.\n\n"
    "Answer naturally like ChatGPT.\n\n"
    "Use the retrieved RAG context only as background knowledge.\n\n"
    "Do not mention documents.\n"
    "Do not mention sources.\n"
    "Do not mention retrieved context.\n"
    "Do not mention filenames.\n"
    "Do not mention page numbers.\n"
    "Do not expose internal RAG implementation.\n\n"
    "Generate a professional, human-like answer.\n\n"
    "If the answer cannot be found in the retrieved context, simply reply:\n"
    "'I couldn't find that information in the college knowledge base.'\n\n"
    "Never hallucinate."
)


class AIService:
    def __init__(self) -> None:
        # Initialize Google Gemini as primary LLM if configured
        gemini_key = settings.GEMINI_API_KEY or os.getenv('GEMINI_API_KEY')
        raw_model = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash').replace('models/', '')
        self.gemini_model_name = raw_model if 'gemini' in raw_model else 'gemini-2.0-flash'
        if gemini_key:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                self.gemini_llm = ChatGoogleGenerativeAI(
                    model=self.gemini_model_name,
                    google_api_key=gemini_key,
                    temperature=0.2,
                    max_output_tokens=1000
                )
                logger.info("Initialized Google Gemini LLM with model: %s", self.gemini_model_name)
            except Exception as exc:
                logger.warning("Failed to initialize Google Gemini LLM: %s", exc)
                self.gemini_llm = None
        else:
            self.gemini_llm = None

        api_key = settings.GROQ_API_KEY or os.getenv('GROQ_API_KEY')
        self.model_name = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
        if api_key:
            self.llm = ChatGroq(
                temperature=0.2,
                groq_api_key=get_api_key(),
                model_name=get_model_name(),
                max_tokens=1000
            )
        else:
            logger.warning("AIService: Groq API key not configured. LLM features disabled.")
            self.llm = None

        # Try initializing Ollama Qwen2.5 if available locally
        try:
            from langchain_community.chat_models import ChatOllama
            self.ollama_llm = ChatOllama(model="qwen2.5", temperature=0.2)
        except Exception:
            self.ollama_llm = None
            
        self.rag_service = RAGService()
        self.conversation_service = ConversationService()
        self.query_router = QueryRouter()
        self.weather_service = WeatherService()
        self.web_search_service = WebSearchService()

    def _deduplicate_and_rank_chunks(self, context_chunks: list) -> list:
        if not context_chunks:
            return []
        
        seen_texts = set()
        unique_chunks = []
        
        sorted_chunks = sorted(
            context_chunks,
            key=lambda c: c.get('distance', c.get('score', 0.0))
        )
        
        for chunk in sorted_chunks:
            content = chunk.get('content', '').strip()
            normalized = " ".join(content.split()).lower()
            if normalized and normalized not in seen_texts:
                seen_texts.add(normalized)
                unique_chunks.append(chunk)
                
        return unique_chunks

    def _build_context(self, context_chunks: list) -> str:
        unique_chunks = self._deduplicate_and_rank_chunks(context_chunks)
        if not unique_chunks:
            return ''
        context_parts = [chunk.get('content', '').strip() for chunk in unique_chunks if chunk.get('content', '').strip()]
        return '\n\n'.join(context_parts)

    def _build_prompt(self, message: str, context_text: str) -> str:
        if not context_text:
            return message
        return (
            f"Background Knowledge:\n{context_text}\n\n"
            f"User Question: {message}"
        )

    def _get_student_context(self, current_user: Optional[Any], db: Optional[Session]) -> str:
        if not current_user:
            return "No logged-in student database record context available."

        if isinstance(current_user, dict):
            user_id = current_user.get('id')
            name = current_user.get('name') or current_user.get('full_name') or 'N/A'
            email = current_user.get('email') or 'N/A'
            student_id = current_user.get('student_id') or 'N/A'
            department = current_user.get('department') or 'N/A'
            year = current_user.get('year') or 'N/A'
            semester = current_user.get('semester') or 'N/A'
        else:
            try:
                user_id = getattr(current_user, 'id', None)
                name = getattr(current_user, 'full_name', None) or getattr(current_user, 'name', 'N/A')
                email = getattr(current_user, 'email', 'N/A')
                student_id = getattr(current_user, 'student_id', 'N/A')
                department = getattr(current_user, 'department', 'N/A')
                year = getattr(current_user, 'year', 'N/A')
                semester = getattr(current_user, 'semester', 'N/A')
            except Exception:
                return "No logged-in student database record context available."

        parts = []
        parts.append(
            f"Student Profile:\n- Name: {name}\n- Email: {email}\n- Student ID: {student_id}\n- Department: {department}\n- Year: {year}\n- Semester: {semester}"
        )

        if db and user_id:
            try:
                from app.models.student import Attendance, TimetableEntry, Fee, LibraryBook

                # Attendance
                attendances = db.query(Attendance).filter(Attendance.user_id == user_id).all()
                if attendances:
                    total = len(attendances)
                    present = len([a for a in attendances if a.status == 'present'])
                    pct = round((present / total * 100), 1) if total > 0 else 100.0
                    parts.append(
                        f"Attendance Summary:\n- Overall Attendance: {pct}%\n- Total Classes Recorded: {total} (Present: {present}, Absent: {total - present})\n- Subject Breakdown: " +
                        ", ".join([f"{a.subject}: {a.status}" for a in attendances[:5]])
                    )

                # Timetable
                if department != 'N/A' and year != 'N/A':
                    timetables = db.query(TimetableEntry).filter(
                        TimetableEntry.department == department,
                        TimetableEntry.year == year
                    ).all()
                    if timetables:
                        tt_lines = [f"• {t.day_of_week} ({t.period}): {t.subject} by {t.faculty} in {t.room}" for t in timetables[:6]]
                        parts.append("Timetable Schedule:\n" + "\n".join(tt_lines))

                # Fees
                fees = db.query(Fee).filter(Fee.user_id == user_id).all()
                if fees:
                    fee_lines = [f"• Semester {f.semester}: Total ₹{f.amount}, Paid ₹{f.paid_amount}, Remaining Due ₹{f.amount - f.paid_amount} ({f.status.upper()})" for f in fees]
                    parts.append("Fee Account Balance:\n" + "\n".join(fee_lines))

                # Library Books
                books = db.query(LibraryBook).limit(5).all()
                if books:
                    book_lines = [f"• '{b.title}' by {b.author} ({b.available_copies}/{b.total_copies} available)" for b in books]
                    parts.append("Library Catalog:\n" + "\n".join(book_lines))

            except Exception as e:
                logger.warning("Failed to retrieve student DB context: %s", e)

        return "\n\n".join(parts)

    def _get_conversation_history(self, session_id: Optional[int], db: Optional[Session]) -> List:
        """
        Phase 5: Short-term Conversation Memory.
        Fetch the last MEMORY_WINDOW messages from the DB for the given session.
        Returns a list of LangChain message objects (HumanMessage / AIMessage).
        """
        if not session_id or not db:
            return []
        try:
            from app.models.chat import ChatMessage
            rows = (
                db.query(ChatMessage)
                .filter(ChatMessage.session_id == session_id)
                .order_by(ChatMessage.created_at.desc())
                .limit(MEMORY_WINDOW)
                .all()
            )
            # Reverse to chronological order
            history = []
            for row in reversed(rows):
                if row.role == "user":
                    history.append(HumanMessage(content=row.content))
                else:
                    history.append(AIMessage(content=row.content))
            return history
        except Exception as e:
            logger.warning("Failed to retrieve conversation history: %s", e)
            return []

    async def get_chat_answer(
        self,
        message: str,
        current_user: Optional[Any] = None,
        db: Optional[Session] = None,
        session_id: Optional[int] = None,
    ) -> str:
        if not message or not message.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Message is required')

        if not self.llm and not self.ollama_llm and not self.gemini_llm:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='AI LLM service is not configured'
            )

        try:
            logger.info('Processing chat request (Phase 2-5 Hybrid Pipeline)')

            from app.services.language_service import LanguageService
            detected_lang = LanguageService.detect_language(message)
            normalized_message = LanguageService.normalize_message(message)

            language_instruction = (
                f"Detected language: {detected_lang}.\n"
                "Reply in natural, clear English or Tamil matching the user's language."
            )

            # 1. PLANNER (Phase 1)
            plan = self.query_router.generate_plan(normalized_message)
            logger.info("AI Plan: Intent=%s RAG=%s Memory=%s Tools=%s",
                        plan.intent, plan.requires_rag, plan.requires_memory, plan.tools_required)

            # 2. MEMORY (Phase 5)
            history_messages = []
            if plan.requires_memory:
                history_messages = self._get_conversation_history(session_id, db)
                logger.info("Injected %d memory messages.", len(history_messages))

            # 3. SMART RAG + CONFIDENCE (Phase 3 & 4)
            rag_context = ""
            rag_confidence = "NONE"
            valid_chunks: list = []
            if plan.requires_rag or plan.intent in ["CAMPUS", "HYBRID", "PERSONAL"]:
                self.rag_service.ensure_index_ready()
                valid_chunks, rag_confidence = self.rag_service.retrieve_context_with_confidence(
                    normalized_message, top_k=5
                )
                rag_context = self._build_context(valid_chunks)
                logger.info("RAG retrieved %d chunks with confidence=%s", len(valid_chunks), rag_confidence)

            # 4. STUDENT CONTEXT
            student_context = ""
            if plan.intent in ["PERSONAL", "HYBRID"]:
                student_context = self._get_student_context(current_user, db)

            # 5. TOOLS (Phase 6 prep — fire tools identified by the planner)
            weather_info = ""
            if plan.intent == "WEATHER" or "weather" in plan.tools_required:
                weather_info = await self.weather_service.get_weather()

            web_search_info = ""
            if plan.intent == "WEB_SEARCH" or "search" in plan.tools_required:
                web_search_info = self.web_search_service.search(message)

            # 6. SMART FALLBACK SYSTEM PROMPT SELECTION (Phase 4)
            needs_rag = plan.requires_rag or plan.intent in ["CAMPUS", "HYBRID"]
            if not needs_rag:
                base_system = SYSTEM_PROMPT_NO_RAG
            elif rag_confidence == "HIGH":
                base_system = SYSTEM_PROMPT_HIGH_CONFIDENCE
            elif rag_confidence == "MEDIUM":
                base_system = SYSTEM_PROMPT_MEDIUM_CONFIDENCE
            else:  # LOW or NONE
                base_system = SYSTEM_PROMPT_LOW_CONFIDENCE

            system_instruction = f"{base_system}\n\n{language_instruction}"

            if plan.intent == "PROGRAMMING":
                system_instruction += "\nProvide clean, well-commented code with explanations."

            # 7. PROMPT ASSEMBLY
            prompt_parts = []
            if student_context:
                prompt_parts.append(f"Student Record:\n{student_context}")
            if weather_info:
                prompt_parts.append(f"Weather Data:\n{weather_info}")
            if web_search_info:
                prompt_parts.append(f"Web Search Results:\n{web_search_info}")
            if rag_context:
                prompt_parts.append(f"Campus Knowledge Base (confidence={rag_confidence}):\n{rag_context}")
            prompt_parts.append(f"User Question: {message}")
            final_prompt = "\n\n".join(prompt_parts)

            # 8. GENERATE
            answer = await self._get_llm_response_with_history(
                final_prompt, system_instruction, history_messages
            )

            # 9. APPEND CITATIONS
            source_names = [
                str(c.get('filename') or c.get('source'))
                for c in valid_chunks
                if c.get('filename') or c.get('source')
            ]
            sources = sorted(set(source_names))
            if sources and rag_confidence in ["HIGH", "MEDIUM"]:
                answer += "\n\n**Sources:** " + " | ".join(f"`{s}`" for s in sources)

            return answer

        except HTTPException:
            raise
        except Exception as exc:
            logger.exception('Unexpected error during AI generation')
            return "I'm having trouble processing that right now. Please try again."

    async def _get_llm_response(self, user_prompt: str, system_prompt: str) -> str:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        # 1. Attempt Google Gemini LLM if configured
        if self.gemini_llm:
            try:
                logger.info('Calling Google Gemini LLM (%s)', self.gemini_model_name)
                res = await self.gemini_llm.ainvoke(messages)
                if res and res.content:
                    return str(res.content)
            except Exception as e:
                logger.warning('Google Gemini LLM failed/unavailable, falling back to backup LLM: %s', e)

        # 2. Attempt Ollama Qwen2.5 if available locally
        if self.ollama_llm:
            try:
                logger.info('Calling local Ollama Qwen2.5')
                res = await self.ollama_llm.ainvoke(messages)
                if res and res.content:
                    return str(res.content)
            except Exception as e:
                logger.warning('Ollama Qwen2.5 failed/unavailable, falling back to Groq: %s', e)

        # 3. Groq Fallback
        if not self.llm:
            return RAG_FALLBACK_RESPONSE

        retries = 3
        backoff = 1.0
        response = None

        for attempt in range(retries):
            try:
                response = await self.llm.ainvoke(messages)
                break
            except Exception as exc:
                logger.warning('Groq request failed on attempt %s: %s', attempt + 1, exc)
                if attempt < retries - 1:
                    await asyncio.sleep(backoff)
                    backoff *= 2.0

        return str(response.content) if response and response.content else "I'm having trouble processing that right now."

    async def _get_llm_response_with_history(
        self,
        user_prompt: str,
        system_prompt: str,
        history: List,
    ) -> str:
        """
        Phase 5: Invoke LLM with conversation history injected between system
        and the current user message for multi-turn context awareness.
        """
        messages = [SystemMessage(content=system_prompt)]
        # Inject previous turns (HumanMessage / AIMessage objects)
        messages.extend(history)
        messages.append(HumanMessage(content=user_prompt))

        # Priority: Gemini → Ollama → Groq
        if self.gemini_llm:
            try:
                logger.info("Calling Gemini LLM with %d history messages", len(history))
                res = await self.gemini_llm.ainvoke(messages)
                if res and res.content:
                    return str(res.content)
            except Exception as e:
                logger.warning("Gemini failed in _get_llm_response_with_history: %s", e)

        if self.ollama_llm:
            try:
                res = await self.ollama_llm.ainvoke(messages)
                if res and res.content:
                    return str(res.content)
            except Exception as e:
                logger.warning("Ollama failed in _get_llm_response_with_history: %s", e)

        if not self.llm:
            return "I'm having trouble processing that right now."

        retries, backoff, response = 3, 1.0, None
        for attempt in range(retries):
            try:
                response = await self.llm.ainvoke(messages)
                break
            except Exception as exc:
                logger.warning("Groq attempt %d failed: %s", attempt + 1, exc)
                if attempt < retries - 1:
                    await asyncio.sleep(backoff)
                    backoff *= 2.0

        return str(response.content) if response and response.content else "I'm having trouble processing that right now."

    def _build_context(self, context_chunks: list) -> str:
        if not context_chunks:
            return ''
        context_parts = []
        for index, chunk in enumerate(context_chunks, start=1):
            content = chunk.get('content', '').strip()
            if content:
                context_parts.append(f"Context {index}: {content}")
        return '\n\n'.join(context_parts)

    def _build_prompt(self, message: str, context_text: str) -> str:
        if not context_text:
            return message
        return (
            'Use the following college-related context to answer the user question. '
            'If the context does not contain the answer, reply with: "I couldn\'t find this information in the college knowledge base."\n\n'
            f'Context:\n{context_text}\n\n'
            f'User Question: {message}'
        )

    async def stream_chat_answer(
        self,
        message: str,
        current_user: Optional[Any] = None,
        db: Optional[Session] = None,
        session_id: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        if not message or not message.strip():
            yield "Message is required."
            return

        if not self.llm and not self.ollama_llm and not self.gemini_llm:
            yield "AI service is not configured."
            return

        try:
            logger.info('Processing streaming chat request (Phase 2-5 Hybrid Pipeline)')
            from app.services.language_service import LanguageService

            detected_lang = LanguageService.detect_language(message)
            normalized_message = LanguageService.normalize_message(message)

            language_instruction = (
                f"Detected language: {detected_lang}.\n"
                "Reply in natural, clear English or Tamil matching the user's language."
            )

            # 1. PLANNER (Phase 1)
            plan = self.query_router.generate_plan(normalized_message)
            logger.info("AI Plan: Intent=%s RAG=%s Memory=%s Tools=%s",
                        plan.intent, plan.requires_rag, plan.requires_memory, plan.tools_required)

            # 2. MEMORY (Phase 5)
            history_messages = []
            if plan.requires_memory:
                history_messages = self._get_conversation_history(session_id, db)
                logger.info("Injected %d memory messages into stream.", len(history_messages))

            # 3. SMART RAG + CONFIDENCE (Phase 3 & 4)
            rag_context = ""
            rag_confidence = "NONE"
            if plan.requires_rag or plan.intent in ["CAMPUS", "HYBRID", "PERSONAL"]:
                self.rag_service.ensure_index_ready()
                valid_chunks, rag_confidence = self.rag_service.retrieve_context_with_confidence(
                    normalized_message, top_k=5
                )
                rag_context = self._build_context(valid_chunks)
                logger.info("RAG retrieved %d chunks with confidence=%s", len(valid_chunks), rag_confidence)

            # 4. STUDENT CONTEXT
            student_context = ""
            if plan.intent in ["PERSONAL", "HYBRID"]:
                student_context = self._get_student_context(current_user, db)

            # 5. TOOLS
            weather_info = ""
            if plan.intent == "WEATHER" or "weather" in plan.tools_required:
                weather_info = await self.weather_service.get_weather()

            web_search_info = ""
            if plan.intent == "WEB_SEARCH" or "search" in plan.tools_required:
                web_search_info = self.web_search_service.search(message)

            # 6. SMART FALLBACK PROMPT SELECTION (Phase 4)
            needs_rag = plan.requires_rag or plan.intent in ["CAMPUS", "HYBRID"]
            if not needs_rag:
                base_system = SYSTEM_PROMPT_NO_RAG
            elif rag_confidence == "HIGH":
                base_system = SYSTEM_PROMPT_HIGH_CONFIDENCE
            elif rag_confidence == "MEDIUM":
                base_system = SYSTEM_PROMPT_MEDIUM_CONFIDENCE
            else:
                base_system = SYSTEM_PROMPT_LOW_CONFIDENCE

            system_instruction = f"{base_system}\n\n{language_instruction}"
            if plan.intent == "PROGRAMMING":
                system_instruction += "\nProvide clean, well-commented code with explanations."

            # 7. PROMPT ASSEMBLY
            prompt_parts = []
            if student_context:
                prompt_parts.append(f"Student Record:\n{student_context}")
            if weather_info:
                prompt_parts.append(f"Weather Data:\n{weather_info}")
            if web_search_info:
                prompt_parts.append(f"Web Search Results:\n{web_search_info}")
            if rag_context:
                prompt_parts.append(f"Campus Knowledge Base (confidence={rag_confidence}):\n{rag_context}")
            prompt_parts.append(f"User Question: {message}")
            final_prompt = "\n\n".join(prompt_parts)

            # 8. GENERATE STREAM WITH MEMORY
            async for chunk in self._stream_llm_response_with_history(
                final_prompt, system_instruction, history_messages
            ):
                yield chunk

        except HTTPException as e:
            logger.error('HTTPException during stream: %s', e.detail)
            yield "An error occurred while processing your request."
        except Exception as exc:
            logger.exception('Unexpected error during AI stream generation')
            yield "I'm having trouble processing that right now. Please try again."

    async def _stream_llm_response(self, user_prompt: str, system_prompt: str) -> AsyncGenerator[str, None]:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]

        if self.gemini_llm:
            try:
                logger.info('Streaming with Google Gemini LLM (%s)', self.gemini_model_name)
                async for chunk in self.gemini_llm.astream(messages):
                    if chunk.content:
                        yield str(chunk.content)
                return
            except Exception as e:
                logger.warning('Google Gemini LLM stream failed/unavailable, falling back: %s', e)

        if self.ollama_llm:
            try:
                async for chunk in self.ollama_llm.astream(messages):
                    if chunk.content:
                        yield str(chunk.content)
                return
            except Exception as e:
                logger.warning('Ollama stream failed, falling back to Groq: %s', e)

        if self.llm:
            try:
                async for chunk in self.llm.astream(messages):
                    if chunk.content:
                        yield str(chunk.content)
                return
            except Exception as exc:
                logger.warning('Groq stream request failed: %s', exc)

        yield "I'm having trouble processing that right now."

    async def _stream_llm_response_with_history(
        self,
        user_prompt: str,
        system_prompt: str,
        history: List,
    ) -> AsyncGenerator[str, None]:
        """
        Phase 5: Stream LLM response with conversation history injected.
        Priority: Gemini → Ollama → Groq.
        """
        messages = [SystemMessage(content=system_prompt)]
        messages.extend(history)  # Inject previous turns
        messages.append(HumanMessage(content=user_prompt))

        if self.gemini_llm:
            try:
                logger.info("Streaming Gemini with %d history messages", len(history))
                async for chunk in self.gemini_llm.astream(messages):
                    if chunk.content:
                        yield str(chunk.content)
                return
            except Exception as e:
                logger.warning("Gemini stream failed, falling back: %s", e)

        if self.ollama_llm:
            try:
                async for chunk in self.ollama_llm.astream(messages):
                    if chunk.content:
                        yield str(chunk.content)
                return
            except Exception as e:
                logger.warning("Ollama stream failed, falling back to Groq: %s", e)

        if self.llm:
            try:
                async for chunk in self.llm.astream(messages):
                    if chunk.content:
                        yield str(chunk.content)
                return
            except Exception as exc:
                logger.warning("Groq stream failed: %s", exc)

        yield "I'm having trouble processing that right now."


