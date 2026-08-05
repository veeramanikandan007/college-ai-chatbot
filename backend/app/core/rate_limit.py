import os
import time
import json
import redis
from fastapi import HTTPException, Request, status
from app.core.logging import get_logger
from app.models.user import User

logger = get_logger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = None
try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
except Exception as e:
    logger.warning("Failed to connect to Redis for Rate Limiting: %s", e)

# 100 requests per day (86400 seconds)
STUDENT_DAILY_LIMIT = 100
WINDOW_SECONDS = 86400

async def check_rate_limit(user: User):
    """
    Checks if the user has exceeded their daily AI request limit.
    Admins bypass rate limits.
    """
    if not redis_client:
        # Fail open if Redis is down
        return
        
    if user.role == "admin":
        return
        
    user_key = f"rate_limit:user:{user.id}"
    
    try:
        current_count = redis_client.get(user_key)
        
        if current_count is not None and int(current_count) >= STUDENT_DAILY_LIMIT:
            logger.warning(f"User {user.id} hit the AI rate limit.")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Daily AI request limit reached (100/day). Please try again tomorrow."
            )
            
        # Increment counter and set expiry if it's a new key
        pipe = redis_client.pipeline()
        pipe.incr(user_key)
        if current_count is None:
            pipe.expire(user_key, WINDOW_SECONDS)
        pipe.execute()
        
    except redis.RedisError as e:
        logger.warning(f"Redis error during rate limiting: {e}")
        # Fail open
        return

def get_cached_response(question: str) -> str:
    """Retrieve semantic cached response from Redis."""
    if not redis_client:
        return None
    cache_key = f"ai_cache:{question.lower().strip()}"
    try:
        return redis_client.get(cache_key)
    except Exception:
        return None

def set_cached_response(question: str, answer: str, ttl: int = 3600) -> None:
    """Cache AI response for frequent queries."""
    if not redis_client:
        return
    cache_key = f"ai_cache:{question.lower().strip()}"
    try:
        redis_client.setex(cache_key, ttl, answer)
    except Exception:
        pass
