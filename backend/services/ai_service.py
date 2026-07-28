import os
import asyncio
from typing import Optional, List, Dict, Any

from google import genai
from google.genai import types
from fastapi import HTTPException, status

from rag.rag_service import RAGService
from utils.logging import get_logger

logger = get_logger(__name__)


class AIService:
    def __init__(self) -> None:
        api_key = os.getenv('GEMINI_API_KEY')
        self.model = os.getenv('GEMINI_MODEL', 'models/gemini-3.6-flash')
        self.client = genai.Client(api_key=api_key) if api_key else None
        self.rag_service = RAGService()

    async def get_chat_answer(self, message: str) -> str:
        if not message or not message.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Message is required')

        if not self.client:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Gemini API key is not configured'
            )

        try:
            logger.info('Processing chat request with Gemini + RAG flow')
            self.rag_service.ensure_index_ready()
            context_chunks = self.rag_service.retrieve_context(message, top_k=4)
            context_text = self._build_context(context_chunks)

            # Define prompt structures based on context availability
            if not context_text:
                logger.info('No RAG context retrieved. Answering using general knowledge.')
                prompt = message
                system_instruction = (
                    'You are CampusMate AI, a helpful campus assistant for Mount Zion College of Engineering and Technology, Pudukkottai. '
                    'Answer the user question clearly, concisely, and politely using your general knowledge.'
                )
            else:
                logger.info('RAG context retrieved with %s chunks. Using context-guided prompt.', len(context_chunks))
                prompt = self._build_prompt(message, context_text)
                system_instruction = (
                    'You are CampusMate AI, a helpful campus assistant for Mount Zion College of Engineering and Technology, Pudukkottai. '
                    'Use the provided context to answer the user question clearly, concisely, and politely.'
                )

            # Call Gemini model with 3 retries and 15s timeout
            retries = 3
            backoff = 1.0
            response = None

            for attempt in range(retries):
                try:
                    logger.info('Calling Gemini API (Attempt %s/%s)', attempt + 1, retries)
                    response = await asyncio.wait_for(
                        self.client.aio.models.generate_content(
                            model=self.model,
                            contents=prompt,
                            config=types.GenerateContentConfig(
                                system_instruction=system_instruction,
                                temperature=0.2,
                                max_output_tokens=1000,
                            )
                        ),
                        timeout=15.0
                    )
                    break
                except asyncio.TimeoutError as exc:
                    logger.warning('Gemini request timed out on attempt %s', attempt + 1)
                    if attempt == retries - 1:
                        raise HTTPException(
                            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                            detail='Request to Gemini AI service timed out'
                        ) from exc
                except Exception as exc:
                    logger.warning('Gemini request failed on attempt %s: %s', attempt + 1, exc)
                    if attempt == retries - 1:
                        raise HTTPException(
                            status_code=status.HTTP_502_BAD_GATEWAY,
                            detail=f'Gemini AI service failed: {exc}'
                        ) from exc
                await asyncio.sleep(backoff)
                backoff *= 2.0

            answer = response.text if response else 'No response generated.'
            logger.info('Chat completion succeeded using Gemini model: %s', self.model)
            return answer or 'No response generated.'
        except HTTPException:
            raise
        except Exception as exc:
            logger.exception('Unexpected error during Gemini chat generation')
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Internal chatbot generation error'
            ) from exc

    def _build_context(self, context_chunks: list[dict]) -> str:
        """Convert retrieved chunks into a compact context block for the prompt."""
        if not context_chunks:
            return ''

        context_parts = []
        for index, chunk in enumerate(context_chunks, start=1):
            content = chunk.get('content', '').strip()
            if content:
                context_parts.append(f"Context {index}: {content}")

        return '\n\n'.join(context_parts)

    def _build_prompt(self, message: str, context_text: str) -> str:
        """Construct a prompt that includes retrieved context when available."""
        if not context_text:
            return message

        return (
            'Use the following college-related context to answer the user question. '
            'If the context does not contain the answer, say that you do not have enough information and do not invent facts.\n\n'
            f'Context:\n{context_text}\n\n'
            f'User Question: {message}'
        )
