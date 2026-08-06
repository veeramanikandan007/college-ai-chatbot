from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.core.limiter import limiter
from app.api.v1.router import api_router
from app.api.v1.rag_router import router as rag_router
from app.database.init_db import init_db
from app.rag.rag_service import RAGService
from app.core.logging import get_logger

import os
import sentry_sdk

logger = get_logger(__name__)

if os.getenv("SENTRY_DSN"):
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )
app = FastAPI(title=settings.APP_NAME)
app.state.limiter = limiter
from typing import cast, Callable
from starlette.responses import Response
app.add_exception_handler(RateLimitExceeded, cast(Callable[[Request, Exception], Response], _rate_limit_exceeded_handler))

# Middleware
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(rag_router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

@app.on_event("startup")
def startup_event():
    # Initialize SQLite DB (creates tables, seeds admin)
    init_db()

    # Validate Groq API key once at startup
    from app.services.groq_client import validate_at_startup
    validate_at_startup()

    # Ensure required storage directories exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.DOCUMENTS_DIR, exist_ok=True)
    os.makedirs(settings.VECTOR_DB_DIR, exist_ok=True)
    os.makedirs(settings.EMBEDDINGS_DIR, exist_ok=True)

    # Automatically reload persistent vector database in background
    import threading
    def load_rag_background():
        try:
            rag = RAGService()
            rag.ensure_index_ready()
            logger.info("Vector database loaded successfully on backend startup.")
        except Exception as e:
            logger.warning(f"Vector DB auto-load warning on startup: {e}")

    threading.Thread(target=load_rag_background, daemon=True).start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        reload_dirs=["app"],
        reload_excludes=["vector_db", "chroma_db", ".chroma", "database", "uploads", "documents", "*.db"]
    )


# reload trigger
