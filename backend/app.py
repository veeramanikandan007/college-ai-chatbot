import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import APP_NAME, ENV, HOST, PORT
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from utils.logging import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title=APP_NAME,
    description='Production-ready API for CampusMate AI',
    version='1.0.0',
    debug=(ENV == 'development'),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router, prefix='/api/v1')
app.include_router(chat_router, prefix='/api/v1')


@app.get('/')
async def root() -> dict:
    return {'status': 'running', 'project': APP_NAME, 'version': 'v1'}


@app.get('/health')
async def health() -> dict:
    logger.info('Legacy health check requested')
    return {'status': 'running', 'project': APP_NAME}


@app.get('/api/v1/health')
async def health_v1() -> JSONResponse:
    logger.info('Detailed v1 health check requested')
    health_status = {
        "status": "healthy",
        "gemini": "unknown",
        "chromadb": "unknown",
        "rag": "unknown"
    }
    
    # 1. Verify Gemini API Connection
    try:
        from google import genai
        from google.genai import types
        api_key = os.getenv('GEMINI_API_KEY')
        model = os.getenv('GEMINI_MODEL', 'models/gemini-3.6-flash')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
            
        client = genai.Client(api_key=api_key)
        
        # Call with a 1-token query to verify credentials and connectivity
        await client.aio.models.generate_content(
            model=model,
            contents="ping",
            config=types.GenerateContentConfig(max_output_tokens=1)
        )
        health_status["gemini"] = "connected"
    except Exception as exc:
        logger.exception("Health check: Gemini connection failed")
        health_status["status"] = "unhealthy"
        health_status["gemini"] = f"failed: {exc}"

    # 2. Verify ChromaDB / RAG connection
    try:
        from rag.rag_service import RAGService
        rag_service = RAGService()
        if rag_service.vector_store.collection is not None:
            count = rag_service.vector_store.collection.count()
            health_status["chromadb"] = "connected"
            health_status["rag"] = f"ready (indexed chunks: {count})"
        else:
            health_status["chromadb"] = "disconnected (fallback store active)"
            health_status["rag"] = "ready (fallback mode)"
    except Exception as exc:
        logger.exception("Health check: ChromaDB/RAG connection failed")
        health_status["status"] = "unhealthy"
        health_status["chromadb"] = f"failed: {exc}"
        health_status["rag"] = "failed"

    status_code = 200 if health_status["status"] == "healthy" else 503
    return JSONResponse(status_code=status_code, content=health_status)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception('Unhandled exception', exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={'detail': 'Internal server error', 'error': str(exc)},
    )


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host=HOST, port=PORT)
