import langdetect
from app.services.slang_dictionary import normalize_slang
from app.core.logging import get_logger

logger = get_logger(__name__)

class LanguageService:
    @staticmethod
    def detect_language(text: str) -> str:
        """
        Detects the primary language of the text.
        Returns 'en' (English), 'ta' (Tamil), or 'tanglish' based on heuristics.
        """
        try:
            # First, check for Tamil characters
            # Tamil Unicode block: \u0B80 - \u0BFF
            if any("\u0B80" <= char <= "\u0BFF" for char in text):
                return "ta"
            
            # Detect using langdetect
            # Note: langdetect might misclassify short tanglish sentences as something else
            # We'll use a basic heuristic for Tanglish
            
            # Since Tanglish uses English alphabet but Tamil words, 
            # if we find known Tanglish slang, we tag it as tanglish
            from app.services.slang_dictionary import SLANG_DICTIONARY
            words = text.lower().split()
            for word in words:
                clean_word = word.strip("?,.!")
                if clean_word in SLANG_DICTIONARY and SLANG_DICTIONARY[clean_word] != "":
                    return "tanglish"
            
            return "en"
        except Exception as e:
            logger.warning("Language detection failed: %s", e)
            return "en"

    @staticmethod
    def normalize_message(text: str) -> str:
        """
        Normalizes the text by resolving Tanglish slang to standard English.
        This helps the intent classifier and RAG retrieval to understand the query.
        """
        lang = LanguageService.detect_language(text)
        
        # If it's Tamil, we don't normalize Tanglish words, we just return it
        if lang == "ta":
            return text
            
        # For English and Tanglish, we normalize slang
        return normalize_slang(text)
