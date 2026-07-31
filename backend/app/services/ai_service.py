import os
import asyncio
<<<<<<< HEAD
import json
from typing import Optional, List, Dict, Any, AsyncGenerator
=======
from typing import Optional, List, Dict, Any
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9

from fastapi import HTTPException, status
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
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

<<<<<<< HEAD
RAG_FALLBACK_RESPONSE = "I couldn't find this information in the college knowledge base."


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
=======
_FRIENDLY_UNAVAILABLE = "CampusMate AI is temporarily unavailable. Please try again later."
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9


class AIService:
    def __init__(self) -> None:
<<<<<<< HEAD
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
=======
        if is_configured():
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9
            self.llm = ChatGroq(
                temperature=0.2,
                groq_api_key=get_api_key(),
                model_name=get_model_name(),
                max_tokens=1000
            )
        else:
            logger.warning("AIService: Groq API key not configured. LLM features disabled.")
            self.llm = None

<<<<<<< HEAD
        # Try initializing Ollama Qwen2.5 if available locally
        try:
            from langchain_community.chat_models import ChatOllama
            self.ollama_llm = ChatOllama(model="qwen2.5", temperature=0.2)
        except Exception:
            self.ollama_llm = None
            
=======
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9
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

    async def get_chat_answer(self, message: str, current_user: Optional[Any] = None, db: Optional[Session] = None) -> str:
        if not message or not message.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Message is required')

<<<<<<< HEAD
        if not self.llm and not self.ollama_llm:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='AI LLM service is not configured'
            )
=======
        if not self.llm:
            logger.error("Chat request received but Groq LLM is not configured.")
            return _FRIENDLY_UNAVAILABLE
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9

        try:
            logger.info('Processing chat request with AI engine')
            
            from app.services.language_service import LanguageService
            
            detected_lang = LanguageService.detect_language(message)
            normalized_message = LanguageService.normalize_message(message)
            logger.info('Language detected: %s. Normalized message: %s', detected_lang, normalized_message)
            
            language_instruction = (
                "You are CampusMate AI Assistant.\n"
                f"Detected language: {detected_lang}.\n"
                "Reply in natural, clear English or Tamil matching the user's language."
            )

            intent = self.query_router.route_query(normalized_message)
            logger.info('Intent detected: %s', intent)
            
            if intent == "GREETING":
                system_instruction = f"You are CampusMate AI, a helpful college assistant. Greet the student warmly. {language_instruction}"
                return await self._get_llm_response(message, system_instruction)
                
            elif intent == "SMALL_TALK":
                system_instruction = f"You are CampusMate AI. Respond naturally to the user's conversation. {language_instruction}"
                return await self._get_llm_response(message, system_instruction)

            elif intent == "WEATHER":
                weather_info = await self.weather_service.get_weather()
                system_instruction = f"You are CampusMate AI. Present weather info clearly. {language_instruction}"
                prompt = f"User asked: {message}\n\nWeather Info:\n{weather_info}"
                return await self._get_llm_response(prompt, system_instruction)
                
            elif intent == "WEB_SEARCH":
                search_results = self.web_search_service.search(message)
                system_instruction = f"You are CampusMate AI. Answer using search results. {language_instruction}"
                prompt = f"User Question: {message}\n\nWeb Search Results:\n{search_results}"
                return await self._get_llm_response(prompt, system_instruction)

<<<<<<< HEAD
            elif intent in ["GENERAL", "CAMPUS_QUERY"]:
                self.rag_service.ensure_index_ready()
                context_chunks = self.rag_service.retrieve_context(normalized_message, top_k=5)
                # Filter chunks by relevance (distance < 1.2 in Cosine distance)
                valid_chunks = [c for c in context_chunks if c.get('distance', 1.0) < 1.2 or c.get('score', 1.0) < 1.2]

                if not valid_chunks:
                    logger.info('No relevant RAG context retrieved. Returning exact fallback.')
                    return RAG_FALLBACK_RESPONSE
=======
            elif intent == "GENERAL":
                logger.info('Intent detected: GENERAL')
                system_instruction = f"You are a helpful college AI assistant. Answer the student's general knowledge question using your broad knowledge base. {language_instruction}"
                return await self._get_llm_response(normalized_message, system_instruction)
                
            elif intent == "CALCULATOR":
                logger.info('Intent detected: CALCULATOR')
                system_instruction = f"You are a helpful AI assistant. Evaluate the following mathematical expression or calculation query accurately. Provide only the final answer or a brief explanation of the calculation. {language_instruction}"
                return await self._get_llm_response(message, system_instruction)

            # Intent is CAMPUS_QUERY -> Proceed with RAG
            logger.info('Intent detected: CAMPUS_QUERY\nUsing RAG pipeline')
            self.rag_service.ensure_index_ready()
            context_chunks = self.rag_service.retrieve_context(normalized_message, top_k=4)

            valid_chunks = [c for c in context_chunks if c.get('distance', 0) < 1.5]

            if not valid_chunks:
                logger.info('No relevant RAG context retrieved. Falling back to LLM general knowledge.')
                system_instruction = (
                    "You are CampusMate AI. The user asked a question categorized as a campus query, but no specific campus context was found in the database. "
                    "If the question is actually general knowledge or about a public location/entity (e.g., 'Where is Mount Zion College?'), answer it using your own knowledge. "
                    "If the question requires specific, internal college data (like a student's attendance or specific staff), politely explain that you do not have that specific campus information available right now. "
                    f"{language_instruction}"
                )
                return await self._get_llm_response(message, system_instruction)
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9
            
            logger.info('RAG context retrieved with %s chunks.', len(valid_chunks))
            context_text = self._build_context(valid_chunks)
            prompt = self._build_prompt(message, context_text)
<<<<<<< HEAD
            answer = await self._get_llm_response(prompt, SYSTEM_RAG_PROMPT)
=======

            # If LLM fails after RAG, return raw context as a fallback
            try:
                answer = await self._get_llm_response(prompt, system_instruction)
            except Exception:
                logger.warning("LLM unavailable after RAG retrieval — returning raw campus context.")
                return "Here is the campus information I found:\n\n" + context_text
            
            sources_list = []
            for chunk in valid_chunks:
                src = chunk.get('source', 'Unknown')
                if src not in sources_list:
                    sources_list.append(src)
                    
            if sources_list:
                answer += f"\n\n**Sources:**\n" + "\n".join([f"- {src}" for src in sources_list])
                
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9
            return answer

        except HTTPException:
            raise
        except Exception as exc:
            logger.exception('Unexpected error during AI generation')
            return RAG_FALLBACK_RESPONSE

    async def _get_llm_response(self, user_prompt: str, system_prompt: str) -> str:
<<<<<<< HEAD
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
                    return res.content
            except Exception as e:
                logger.warning('Google Gemini LLM failed/unavailable, falling back to backup LLM: %s', e)

        # 2. Attempt Ollama Qwen2.5 if available locally
        if self.ollama_llm:
            try:
                logger.info('Calling local Ollama Qwen2.5')
                res = await self.ollama_llm.ainvoke(messages)
                if res and res.content:
                    return res.content
            except Exception as e:
                logger.warning('Ollama Qwen2.5 failed/unavailable, falling back to Groq: %s', e)

        # 3. Groq Fallback
        if not self.llm:
            return RAG_FALLBACK_RESPONSE

=======
        """Call Groq LLM with exponential backoff retry. Returns friendly message on all failures."""
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9
        retries = 3
        backoff = 1.0

        for attempt in range(retries):
            try:
<<<<<<< HEAD
                response = await self.llm.ainvoke(messages)
                break
=======
                logger.info('Calling Groq API (Attempt %s/%s)', attempt + 1, retries)
                response = await self.llm.ainvoke([
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_prompt)
                ])
                return response.content or _FRIENDLY_UNAVAILABLE
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9
            except Exception as exc:
                logger.warning('Groq request failed on attempt %s: %s', attempt + 1, exc)
                if attempt < retries - 1:
                    await asyncio.sleep(backoff)
                    backoff *= 2.0

<<<<<<< HEAD
        return response.content if response else RAG_FALLBACK_RESPONSE
=======
        logger.error('All %s Groq API attempts failed.', retries)
        return _FRIENDLY_UNAVAILABLE
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9

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

    async def stream_chat_answer(self, message: str, current_user: Optional[Any] = None, db: Optional[Session] = None) -> AsyncGenerator[str, None]:
        if not message or not message.strip():
            yield "Message is required."
            return

<<<<<<< HEAD
        if not self.llm and not self.ollama_llm:
            yield RAG_FALLBACK_RESPONSE
=======
        if not self.llm:
            logger.error("Stream chat request received but Groq LLM is not configured.")
            yield _FRIENDLY_UNAVAILABLE
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9
            return

        try:
            from app.services.language_service import LanguageService
            
            detected_lang = LanguageService.detect_language(message)
            normalized_message = LanguageService.normalize_message(message)
            
            language_instruction = (
                "You are CampusMate AI Assistant.\n"
                f"Detected language: {detected_lang}.\n"
                "Reply in natural, clear English or Tamil matching the user's language."
            )

            intent = self.query_router.route_query(normalized_message)
            
            if intent == "GREETING":
                system_instruction = f"You are CampusMate AI, a helpful college assistant. Greet the user warmly. {language_instruction}"
                async for chunk in self._stream_llm_response(message, system_instruction):
                    yield chunk
                return
                
            elif intent == "SMALL_TALK":
                system_instruction = f"You are CampusMate AI. Respond naturally to small talk. {language_instruction}"
                async for chunk in self._stream_llm_response(message, system_instruction):
                    yield chunk
                return

            elif intent == "WEATHER":
                weather_info = await self.weather_service.get_weather()
                system_instruction = f"You are CampusMate AI. Present weather information clearly. {language_instruction}"
                prompt = f"User asked: {message}\n\nWeather Info:\n{weather_info}"
                async for chunk in self._stream_llm_response(prompt, system_instruction):
                    yield chunk
                return
                
            elif intent == "WEB_SEARCH":
                search_results = self.web_search_service.search(message)
                system_instruction = f"You are CampusMate AI. Use search results to answer accurately. {language_instruction}"
                prompt = f"User Question: {message}\n\nWeb Search Results:\n{search_results}"
                async for chunk in self._stream_llm_response(prompt, system_instruction):
                    yield chunk
                return

            elif intent == "GENERAL":
<<<<<<< HEAD
                system_instruction = f"You are CampusMate AI. Answer general knowledge questions accurately. {language_instruction}"
=======
                system_instruction = f"You are a helpful college AI assistant. Answer the student's general knowledge question using your broad knowledge base. {language_instruction}"
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9
                async for chunk in self._stream_llm_response(normalized_message, system_instruction):
                    yield chunk
                return
                
            elif intent == "CALCULATOR":
                system_instruction = f"You are a helpful AI assistant. Evaluate the following mathematical expression or calculation query accurately. Provide only the final answer or a brief explanation of the calculation. {language_instruction}"
                async for chunk in self._stream_llm_response(message, system_instruction):
                    yield chunk
                return

            elif intent == "PERSONAL":
                student_context = self._get_student_context(current_user, db)
                system_instruction = f"You are CampusMate AI. Answer using the student's official PostgreSQL database record context. {language_instruction}"
                prompt = f"Student Personal Data Context:\n{student_context}\n\nStudent Question: {message}"
                async for chunk in self._stream_llm_response(prompt, system_instruction):
                    yield chunk
                return

            elif intent == "HYBRID":
                student_context = self._get_student_context(current_user, db)
                self.rag_service.ensure_index_ready()
                context_chunks = self.rag_service.retrieve_context(normalized_message, top_k=4)
                valid_chunks = [c for c in context_chunks if c.get('distance', 0) < 1.5]
                rag_context = self._build_context(valid_chunks) if valid_chunks else "No college knowledge document context found."
                
                system_instruction = f"You are CampusMate AI. Synthesize both the student's personal records and college policy guidelines into one response. {language_instruction}"
                prompt = f"Student Personal Database Context:\n{student_context}\n\nCollege Knowledge Base RAG Context:\n{rag_context}\n\nStudent Question: {message}"
                async for chunk in self._stream_llm_response(prompt, system_instruction):
                    yield chunk
                return

            self.rag_service.ensure_index_ready()
            context_chunks = self.rag_service.retrieve_context(normalized_message, top_k=4)
            valid_chunks = [c for c in context_chunks if c.get('distance', 0) < 1.5]

            if not valid_chunks:
<<<<<<< HEAD
                yield RAG_FALLBACK_RESPONSE
=======
                system_instruction = (
                    "You are CampusMate AI. The user asked a question categorized as a campus query, but no specific campus context was found in the database. "
                    "If the question is actually general knowledge or about a public location/entity (e.g., 'Where is Mount Zion College?'), answer it using your own knowledge. "
                    "If the question requires specific, internal college data (like a student's attendance or specific staff), politely explain that you do not have that specific campus information available right now. "
                    f"{language_instruction}"
                )
                async for chunk in self._stream_llm_response(message, system_instruction):
                    yield chunk
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9
                return
            
            context_text = self._build_context(valid_chunks)
            prompt = self._build_prompt(message, context_text)
            
            async for chunk in self._stream_llm_response(prompt, SYSTEM_RAG_PROMPT):
                yield chunk
            return
                
        except HTTPException as e:
            logger.error('HTTPException during stream: %s', e.detail)
            yield _FRIENDLY_UNAVAILABLE
        except Exception as exc:
            logger.exception('Unexpected error during AI stream generation')
            yield RAG_FALLBACK_RESPONSE

    async def _stream_llm_response(self, user_prompt: str, system_prompt: str) -> AsyncGenerator[str, None]:
<<<<<<< HEAD
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]

        if self.gemini_llm:
            try:
                logger.info('Streaming with Google Gemini LLM (%s)', self.gemini_model_name)
                async for chunk in self.gemini_llm.astream(messages):
                    if chunk.content:
                        yield chunk.content
                return
            except Exception as e:
                logger.warning('Google Gemini LLM stream failed/unavailable, falling back: %s', e)

        if self.ollama_llm:
            try:
                async for chunk in self.ollama_llm.astream(messages):
                    if chunk.content:
                        yield chunk.content
                return
            except Exception as e:
                logger.warning('Ollama stream failed, falling back to Groq: %s', e)

        if self.llm:
            try:
                async for chunk in self.llm.astream(messages):
                    if chunk.content:
                        yield chunk.content
                return
            except Exception as exc:
                logger.warning('Groq stream request failed: %s', exc)

        yield RAG_FALLBACK_RESPONSE

=======
        try:
            async for chunk in self.llm.astream([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]):
                if chunk.content:
                    yield chunk.content
        except Exception as exc:
            logger.warning('Groq stream request failed: %s', exc)
            yield _FRIENDLY_UNAVAILABLE
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9

