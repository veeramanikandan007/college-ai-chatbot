import os
import asyncio
import json
from typing import Optional, List, Dict, Any

from fastapi import HTTPException, status
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

from app.rag.rag_service import RAGService
from app.services.conversation_service import ConversationService, Intent
from app.core.logging import get_logger
from app.core.config import settings
from app.services.query_router import QueryRouter
from app.services.weather_service import WeatherService
from app.services.web_search_service import WebSearchService

logger = get_logger(__name__)


class AIService:
    def __init__(self) -> None:
        api_key = settings.GROQ_API_KEY or os.getenv('GROQ_API_KEY')
        self.model_name = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
        if api_key:
            self.llm = ChatGroq(
                temperature=0.2,
                groq_api_key=api_key,
                model_name=self.model_name,
                max_tokens=1000
            )
        else:
            self.llm = None
            
        self.rag_service = RAGService()
        self.conversation_service = ConversationService()
        self.query_router = QueryRouter()
        self.weather_service = WeatherService()
        self.web_search_service = WebSearchService()

    # Synchronous wrapper removed. Using async get_chat_answer directly.

    async def get_chat_answer(self, message: str) -> str:
        if not message or not message.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Message is required')

        if not self.llm:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Groq API key is not configured'
            )

        try:
            logger.info('Processing chat request with Groq Llama 3.3')
            
            from app.services.language_service import LanguageService
            
            # Detect Language and Normalize Slang
            detected_lang = LanguageService.detect_language(message)
            normalized_message = LanguageService.normalize_message(message)
            logger.info('Language detected: %s. Normalized message: %s', detected_lang, normalized_message)
            
            language_instruction = (
                "You are CampusMate Voice Assistant. "
                "Your answers will be spoken aloud.\n"
                "Rules:\n"
                "- Keep sentences short.\n"
                "- Avoid complex formatting like bold, lists, and tables.\n"
                "- Avoid unnecessary symbols, emojis, and hashtags.\n"
                "- Use simple Tamil when responding in Tamil.\n"
                "- Use natural student-friendly language.\n"
                "- Match user's language.\n\n"
                f"Detected language: {detected_lang}.\n"
                "English user: Reply in English.\n"
                "Tamil user: Reply in Tamil.\n"
                "Tanglish user: Understand meaning and reply naturally."
            )

            # Classify Intent using the new AI Query Router
            intent = self.query_router.route_query(normalized_message)
            
            if intent == "GREETING":
                logger.info('Intent detected: GREETING')
                system_instruction = f"You are a helpful college AI assistant. Greet the user warmly. {language_instruction}"
                return await self._get_llm_response(message, system_instruction)
                
            elif intent == "SMALL_TALK":
                logger.info('Intent detected: SMALL_TALK')
                system_instruction = f"You are a helpful college AI assistant. Respond to the user's small talk. {language_instruction}"
                return await self._get_llm_response(message, system_instruction)

            elif intent == "WEATHER":
                logger.info('Intent detected: WEATHER')
                weather_info = await self.weather_service.get_weather() # Can enhance by extracting location
                system_instruction = f"You are a helpful AI assistant. Present the following weather information naturally to the user. {language_instruction}"
                prompt = f"User asked: {message}\n\nWeather Info:\n{weather_info}"
                return await self._get_llm_response(prompt, system_instruction)
                
            elif intent == "WEB_SEARCH":
                logger.info('Intent detected: WEB_SEARCH')
                search_results = self.web_search_service.search(message)
                system_instruction = f"You are a helpful AI assistant. Use the provided web search results to answer the user's question accurately. {language_instruction}"
                prompt = f"User Question: {message}\n\nWeb Search Results:\n{search_results}"
                return await self._get_llm_response(prompt, system_instruction)

            elif intent == "GENERAL":
                logger.info('Intent detected: GENERAL')
                system_instruction = f"You are a helpful college AI assistant. Answer the student's general knowledge question. {language_instruction}"
                return await self._get_llm_response(normalized_message, system_instruction)

            # Intent is CAMPUS_QUERY -> Proceed with RAG
            logger.info('Intent detected: CAMPUS_QUERY\nUsing RAG pipeline')
            self.rag_service.ensure_index_ready()
            context_chunks = self.rag_service.retrieve_context(normalized_message, top_k=4)

            valid_chunks = [c for c in context_chunks if c.get('distance', 0) < 1.5]

            if not valid_chunks:
                logger.info('No relevant RAG context retrieved. Returning professional fallback.')
                return self.conversation_service.get_fallback_response()
            
            logger.info('RAG context retrieved with %s chunks. Using context-guided prompt.', len(valid_chunks))
            context_text = self._build_context(valid_chunks)
            system_instruction = (
                'You are CampusMate AI, a helpful campus assistant for Mount Zion College of Engineering and Technology, Pudukkottai. '
                'Use the provided context to answer the user question clearly, concisely, and politely. '
                'If the answer is not contained in the context, do not answer it. Do not hallucinate. '
                f'{language_instruction}'
            )
            
            prompt = self._build_prompt(message, context_text)
            answer = await self._get_llm_response(prompt, system_instruction)
            
            sources_list = []
            for chunk in valid_chunks:
                src = chunk.get('source', 'Unknown')
                if src not in sources_list:
                    sources_list.append(src)
                    
            if sources_list:
                answer += f"\n\n**Sources:**\n" + "\n".join([f"- {src}" for src in sources_list])
                
            return answer

        except HTTPException:
            raise
        except Exception as exc:
            logger.exception('Unexpected error during ChatGroq generation')
            return self.conversation_service.get_fallback_response()

    async def _get_llm_response(self, user_prompt: str, system_prompt: str) -> str:
        retries = 3
        backoff = 1.0
        response = None

        for attempt in range(retries):
            try:
                logger.info('Calling Groq API (Attempt %s/%s)', attempt + 1, retries)
                response = await self.llm.ainvoke([
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_prompt)
                ])
                break
            except Exception as exc:
                logger.warning('Groq request failed on attempt %s: %s', attempt + 1, exc)
                if attempt == retries - 1:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f'LLM service failed: {exc}'
                    ) from exc
            await asyncio.sleep(backoff)
            backoff *= 2.0

        return response.content if response else 'No response generated.'

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
            'If the context does not contain the answer, say that you do not have enough information and do not invent facts.\n\n'
            f'Context:\n{context_text}\n\n'
            f'User Question: {message}'
        )

    from typing import AsyncGenerator

    async def stream_chat_answer(self, message: str) -> AsyncGenerator[str, None]:
        if not message or not message.strip():
            yield "Message is required."
            return

        if not self.llm:
            yield "Groq API key is not configured."
            return

        try:
            from app.services.language_service import LanguageService
            
            detected_lang = LanguageService.detect_language(message)
            normalized_message = LanguageService.normalize_message(message)
            
            language_instruction = (
                "You are CampusMate Voice Assistant. "
                "Your answers will be spoken aloud.\n"
                "Rules:\n"
                "- Keep sentences short.\n"
                "- Avoid complex formatting like bold, lists, and tables.\n"
                "- Avoid unnecessary symbols, emojis, and hashtags.\n"
                "- Use simple Tamil when responding in Tamil.\n"
                "- Use natural student-friendly language.\n"
                "- Match user's language.\n\n"
                f"Detected language: {detected_lang}.\n"
                "English user: Reply in English.\n"
                "Tamil user: Reply in Tamil.\n"
                "Tanglish user: Understand meaning and reply naturally."
            )

            intent = self.query_router.route_query(normalized_message)
            
            if intent == "GREETING":
                system_instruction = f"You are a helpful college AI assistant. Greet the user warmly. {language_instruction}"
                async for chunk in self._stream_llm_response(message, system_instruction):
                    yield chunk
                return
                
            elif intent == "SMALL_TALK":
                system_instruction = f"You are a helpful college AI assistant. Respond to the user's small talk. {language_instruction}"
                async for chunk in self._stream_llm_response(message, system_instruction):
                    yield chunk
                return

            elif intent == "WEATHER":
                weather_info = await self.weather_service.get_weather()
                system_instruction = f"You are a helpful AI assistant. Present the following weather information naturally to the user. {language_instruction}"
                prompt = f"User asked: {message}\n\nWeather Info:\n{weather_info}"
                async for chunk in self._stream_llm_response(prompt, system_instruction):
                    yield chunk
                return
                
            elif intent == "WEB_SEARCH":
                search_results = self.web_search_service.search(message)
                system_instruction = f"You are a helpful AI assistant. Use the provided web search results to answer the user's question accurately. {language_instruction}"
                prompt = f"User Question: {message}\n\nWeb Search Results:\n{search_results}"
                async for chunk in self._stream_llm_response(prompt, system_instruction):
                    yield chunk
                return

            elif intent == "GENERAL":
                system_instruction = f"You are a helpful college AI assistant. Answer the student's general knowledge question. {language_instruction}"
                async for chunk in self._stream_llm_response(normalized_message, system_instruction):
                    yield chunk
                return

            self.rag_service.ensure_index_ready()
            context_chunks = self.rag_service.retrieve_context(normalized_message, top_k=4)
            valid_chunks = [c for c in context_chunks if c.get('distance', 0) < 1.5]

            if not valid_chunks:
                yield self.conversation_service.get_fallback_response()
                return
            
            context_text = self._build_context(valid_chunks)
            system_instruction = (
                'You are CampusMate AI, a helpful campus assistant for Mount Zion College of Engineering and Technology, Pudukkottai. '
                'Use the provided context to answer the user question clearly, concisely, and politely. '
                'If the answer is not contained in the context, do not answer it. Do not hallucinate. '
                f'{language_instruction}'
            )
            
            prompt = self._build_prompt(message, context_text)
            
            async for chunk in self._stream_llm_response(prompt, system_instruction):
                yield chunk
            
            sources_list = []
            for chunk in valid_chunks:
                src = chunk.get('source', 'Unknown')
                if src not in sources_list:
                    sources_list.append(src)
                    
            if sources_list:
                yield f"\n\n**Sources:**\n" + "\n".join([f"- {src}" for src in sources_list])
                
        except HTTPException as e:
            yield f"Error: {e.detail}"
        except Exception as exc:
            logger.exception('Unexpected error during ChatGroq stream generation')
            yield self.conversation_service.get_fallback_response()

    async def _stream_llm_response(self, user_prompt: str, system_prompt: str) -> AsyncGenerator[str, None]:
        try:
            async for chunk in self.llm.astream([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]):
                if chunk.content:
                    yield chunk.content
        except Exception as exc:
            logger.warning('Groq stream request failed: %s', exc)
            raise HTTPException(status_code=502, detail=f'LLM stream service failed: {exc}')

