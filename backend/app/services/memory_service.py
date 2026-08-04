import json
from typing import List, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.models.user_memory import UserMemory
from app.core.logging import get_logger
from app.services.groq_client import get_api_key, get_model_name, is_configured

logger = get_logger(__name__)

class MemoryExtractionSchema(BaseModel):
    memories: List[dict] = Field(
        description="List of extracted memories. Each must have 'memory_key' (string), 'memory_value' (string), 'category' (string), 'importance_score' (float 0.0-1.0)."
    )

class MemoryService:
    def __init__(self):
        self.enabled = is_configured()
        if self.enabled:
            from langchain_groq import ChatGroq
            self.llm = ChatGroq(
                temperature=0.1,
                groq_api_key=get_api_key(),
                model_name=get_model_name()
            ).with_structured_output(MemoryExtractionSchema)
        else:
            self.llm = None

    async def extract_and_store_memory(self, user_id: int, message: str, db: Session) -> None:
        """
        Extract facts from the user message and store in long-term memory.
        This should ideally be run in a background task to avoid blocking the chat response.
        """
        if not self.enabled or not self.llm:
            return

        system_prompt = (
            "You are an AI Memory Extractor for CampusMate AI. "
            "Your job is to extract important, long-term facts about the user from their message. "
            "Only extract facts that are worth remembering for future conversations (e.g., department, year, name, preferences, goals, struggles, enrolled courses). "
            "If the message is generic (e.g., 'hello', 'what is the timetable'), return an empty list. "
            "Categories can be: ACADEMICS, PERSONAL, PREFERENCES, CAREER, OTHER."
        )

        try:
            from langchain_core.messages import SystemMessage, HumanMessage
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=message)
            ])

            if response and response.memories:
                for memory_item in response.memories:
                    key = memory_item.get("memory_key")
                    value = memory_item.get("memory_value")
                    category = memory_item.get("category", "OTHER")
                    score = float(memory_item.get("importance_score", 0.5))

                    if not key or not value:
                        continue

                    # Upsert logic: if memory_key exists for user, update it, else insert
                    existing = db.query(UserMemory).filter(
                        UserMemory.user_id == user_id,
                        UserMemory.memory_key == key
                    ).first()

                    if existing:
                        existing.memory_value = value
                        existing.importance_score = score
                        existing.category = category
                    else:
                        new_memory = UserMemory(
                            user_id=user_id,
                            memory_key=key,
                            memory_value=value,
                            category=category,
                            importance_score=score
                        )
                        db.add(new_memory)
                db.commit()
                logger.info(f"Extracted and stored {len(response.memories)} memories for user {user_id}")
        except Exception as e:
            logger.warning("Failed to extract memory: %s", e)

    def retrieve_memories(self, user_id: int, db: Session, limit: int = 20) -> str:
        """
        Retrieve highest importance memories for the user to inject into the prompt.
        """
        if not db:
            return ""

        try:
            memories = (
                db.query(UserMemory)
                .filter(UserMemory.user_id == user_id)
                .order_by(UserMemory.importance_score.desc(), UserMemory.updated_at.desc())
                .limit(limit)
                .all()
            )

            if not memories:
                return ""

            lines = [f"- {m.memory_key}: {m.memory_value}" for m in memories]
            return "User Long-Term Memory (Facts):\n" + "\n".join(lines)
        except Exception as e:
            logger.warning("Failed to retrieve memories for user %s: %s", user_id, e)
            return ""
