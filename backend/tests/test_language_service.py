import pytest
from app.services.language_service import LanguageService

def test_language_detection_english():
    text = "What are the college timings?"
    assert LanguageService.detect_language(text) == "en"

def test_language_detection_tamil():
    text = "கல்லூரி நேரம் என்ன?"
    assert LanguageService.detect_language(text) == "ta"

def test_language_detection_tanglish():
    text = "exam epo bro?"
    assert LanguageService.detect_language(text) == "tanglish"

def test_language_normalization_english():
    text = "What is the fee structure?"
    # Should remain unchanged
    assert LanguageService.normalize_message(text) == "what is the fee structure?"

def test_language_normalization_tamil():
    text = "தேர்வு எப்போது நடக்கும்?"
    # Should remain unchanged
    assert LanguageService.normalize_message(text) == "தேர்வு எப்போது நடக்கும்?"

def test_language_normalization_tanglish():
    text = "exam epo bro?"
    # Should translate slang to standard english
    normalized = LanguageService.normalize_message(text)
    assert "when" in normalized
    assert "friend" in normalized
