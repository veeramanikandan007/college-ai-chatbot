import os
from groq import AsyncGroq
from app.services.language_service import LanguageService
from app.core.logging import get_logger
from app.services.groq_client import get_api_key, is_configured

logger = get_logger(__name__)

class VoiceLanguageRouter:
    def __init__(self):
        if is_configured():
            self.client = AsyncGroq(api_key=get_api_key())
        else:
            logger.warning("VoiceLanguageRouter: Groq API key not configured. Tanglish conversion disabled.")
            self.client = None

    async def process_voice_text(self, text: str) -> dict:
        """
        Takes raw AI text, detects language, and normalizes Tanglish to Tamil script.
        Returns dict with `text` (TTS ready) and `language` (ta-IN or en-IN).
        """
        lang = LanguageService.detect_language(text)

        if lang == "ta":
            return {"text": text, "language": "ta-IN"}
        
        if lang == "en":
            return {"text": text, "language": "en-IN"}

        # It's Tanglish. Convert to Tamil script.
        if not self.client:
            # Fallback if no LLM
            return {"text": text, "language": "en-IN"}

        try:
            # Convert Tanglish to natural Tamil script for TTS
            prompt = (
                "You are an expert transliterator for a college voice assistant.\n"
                "Convert the following Tanglish (Tamil written in English) into natural spoken Tamil script.\n"
                "Rules:\n"
                "- Output ONLY the Tamil text.\n"
                "- Do NOT output any English words unless it is a common English noun (like 'college', 'exam') that is better left in English, but try to transliterate them into Tamil script if it sounds natural (e.g. 'எக்ஸாம்').\n"
                "- Keep the casual Gen-Z tone (e.g., 'mapla' -> 'மாப்ளா').\n"
                "- Do not add explanations.\n\n"
                f"Tanglish text: {text}"
            )

            response = await self.client.chat.completions.create(
                messages=[{"role": "system", "content": prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.3,
                max_tokens=256
            )
            
            translated_text = response.choices[0].message.content.strip()
            
            # If the LLM failed and returned empty, fallback to original
            if not translated_text:
                return {"text": text, "language": "en-IN"}
                
            return {"text": translated_text, "language": "ta-IN"}
            
        except Exception as e:
            logger.exception("Voice language routing translation failed")
            # Fallback to English if translation fails to prevent breaking
            return {"text": text, "language": "en-IN"}
