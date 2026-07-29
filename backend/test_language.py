from app.services.language_service import LanguageService

def test_language_detection():
    cases = [
        ("exam epo bro?", "tanglish", "exam when friend?"),
        ("தேர்வு எப்போது?", "ta", "தேர்வு எப்போது?"),
        ("when is the exam?", "en", "when is the exam?"),
        ("attendance evlo venum?", "tanglish", "attendance how much want?"),
        ("sollunga pls", "tanglish", "tell me please")
    ]
    
    for text, expected_lang, expected_norm in cases:
        lang = LanguageService.detect_language(text)
        norm = LanguageService.normalize_message(text)
        print(f"Text: '{text}' | Lang: {lang} (Expected: {expected_lang}) | Norm: '{norm}' (Expected: '{expected_norm}')")
        assert lang == expected_lang, f"Failed lang for {text}"
        assert norm == expected_norm, f"Failed norm for {text}"

    print("All language tests passed!")

if __name__ == "__main__":
    test_language_detection()
