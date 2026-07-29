import os
import uuid
import asyncio
from gtts import gTTS
from groq import AsyncGroq
from fastapi import HTTPException
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

class SpeechService:
    def __init__(self):
        api_key = settings.GROQ_API_KEY or os.getenv('GROQ_API_KEY')
        if not api_key:
            logger.error("Groq API Key not found for SpeechService")
            self.client = None
        else:
            self.client = AsyncGroq(api_key=api_key)
        
        self.audio_dir = os.path.join(settings.UPLOAD_DIR, "audio")
        os.makedirs(self.audio_dir, exist_ok=True)

    async def transcribe_audio(self, file_path: str) -> str:
        """Transcribe an audio file using Groq Whisper API"""
        if not self.client:
            raise HTTPException(status_code=500, detail="Voice service is not configured (Missing Groq Key)")
            
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
            # map 'ta' or 'tanglish' correctly for gTTS
            tts_lang = "ta" if lang in ["ta", "tanglish"] else "en"
            
            # Since gTTS makes blocking HTTP calls, we run it in a thread
            def _generate_tts():
                tts = gTTS(text=text, lang=tts_lang, slow=False)
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
