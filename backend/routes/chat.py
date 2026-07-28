from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from services.ai_service import AIService
from utils.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix='/chat', tags=['chat'])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    answer: str


def get_ai_service() -> AIService:
    return AIService()


@router.post('', response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat(payload: ChatRequest, ai_service: AIService = Depends(get_ai_service)) -> ChatResponse:
    try:
        answer = await ai_service.get_chat_answer(payload.message)
        return ChatResponse(answer=answer)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception('Unexpected chat error')
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Unexpected chat error') from exc
