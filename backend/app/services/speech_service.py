import os
import uuid
import asyncio
from gtts import gTTS
from groq import AsyncGroq
from fastapi import HTTPException
from app.core.config import settings
from app.core.logging import get_logger
from app.services.groq_client import get_api_key, is_configured

logger = get_logger(__name__)

class SpeechService:
    def __init__(self):
        if is_configured():
            self.client = AsyncGroq(api_key=get_api_key())
        else:
            logger.warning("SpeechService: Groq API key not configured. Voice transcription disabled.")
            self.client = None

        self.audio_dir = os.path.join(settings.UPLOAD_DIR, "audio")
        os.makedirs(self.audio_dir, exist_ok=True)

    async def transcribe_audio(self, file_path: str) -> str:
        """Transcribe an audio file using Groq Whisper API"""
        if not self.client:
            raise HTTPException(status_code=503, detail="Voice transcription is temporarily unavailable.")
            
        try:
            with open(file_path, "rb") as file:
                # Use whisper-large-v3 for multilingual transcription
                transcription = await self.client.audio.transcriptions.create(
                    file=(os.path.basename(file_path), file.read()),
                    model="whisper-large-v3",
                    response_format="json",
                )
                return transcription.text
        except Exception as e:
            logger.exception("Transcription failed")
            raise HTTPException(status_code=500, detail="Failed to process audio")

    async def generate_speech(self, text: str, lang: str = "en") -> str:
        """
        Convert text to speech using gTTS.
        Returns the filename/url to the generated audio file.
        """
        try:
            from app.services.voice_language_router import VoiceLanguageRouter
            router = VoiceLanguageRouter()
            routing_result = await router.process_voice_text(text)
            
            processed_text = routing_result["text"]
            detected_lang = routing_result["language"]
            
            # map 'ta-IN' or 'tanglish' correctly for gTTS
            tts_lang = "ta" if "ta" in detected_lang else "en"
            
            # Since gTTS makes blocking HTTP calls, we run it in a thread
            def _generate_tts():
                tts = gTTS(text=processed_text, lang=tts_lang, slow=False)
                filename = f"response_{uuid.uuid4().hex}.mp3"
                filepath = os.path.join(self.audio_dir, filename)
                tts.save(filepath)
                return filename

            loop = asyncio.get_event_loop()
            filename = await loop.run_in_executor(None, _generate_tts)
            
            return f"/api/v1/voice/audio/{filename}"
        except Exception as e:
            logger.exception("Text-to-speech failed")
            raise HTTPException(status_code=500, detail="Failed to generate audio response")
