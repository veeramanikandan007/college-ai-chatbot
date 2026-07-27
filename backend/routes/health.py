from fastapi import APIRouter
from schemas import HealthResponse

router = APIRouter()


@router.get('/', response_model=HealthResponse, tags=['Health'])
async def health_check() -> HealthResponse:
    return HealthResponse(status='running', project='CollegeMate AI', version='1.0.0')
