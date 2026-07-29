"""
groq_client.py
--------------
Single source of truth for the Groq API client.
Initialized ONCE at startup. All services import from here.

Never exposes raw config errors to users.
"""
import os
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# ─── Resolve API key from settings (loaded from .env via pydantic-settings) ───
_api_key: str = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
_model_name: str = settings.GROQ_MODEL if hasattr(settings, "GROQ_MODEL") else os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
_router_model: str = "llama-3.1-8b-instant"

# ─── Public accessors ─────────────────────────────────────────────────────────

def get_api_key() -> str:
    """Return the resolved Groq API key."""
    return _api_key

def get_model_name() -> str:
    """Return the primary LLM model name."""
    return _model_name

def get_router_model() -> str:
    """Return the fast routing model name."""
    return _router_model

def is_configured() -> bool:
    """Return True if Groq API key is present."""
    return bool(_api_key and _api_key.strip())

def validate_at_startup() -> None:
    """
    Call this once during FastAPI startup.
    Logs a warning if key is missing — never raises so server still boots.
    """
    if not is_configured():
        logger.error(
            "GROQ_API_KEY is not set. AI features will be unavailable. "
            "Add GROQ_API_KEY to your backend/.env file."
        )
    else:
        masked = _api_key[:8] + "..." + _api_key[-4:]
        logger.info("Groq API client ready. Key: %s | Model: %s", masked, _model_name)
