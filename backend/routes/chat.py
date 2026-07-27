from fastapi import APIRouter, HTTPException

from schemas import ChatRequest, ChatResponse
from services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()


@router.post('/chat', response_model=ChatResponse, tags=['Chat'])
async def chat(request: ChatRequest) -> ChatResponse:
    if not request.message.strip():
        raise HTTPException(status_code=400, detail='Message cannot be empty.')

    reply = chat_service.ask(request.message)
    return ChatResponse(reply=reply)
