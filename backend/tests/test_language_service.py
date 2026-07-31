import unittest
from app.services.language_service import LanguageService


class TestLanguageService(unittest.TestCase):
    def test_language_detection_english(self):
        text = "What are the college timings?"
        self.assertEqual(LanguageService.detect_language(text), "en")

    def test_language_detection_tamil(self):
        text = "கல்லூரி நேரம் என்ன?"
        self.assertEqual(LanguageService.detect_language(text), "ta")

    def test_language_detection_tanglish(self):
        text = "exam epo bro?"
        self.assertEqual(LanguageService.detect_language(text), "tanglish")

    def test_language_normalization_english(self):
        text = "What is the fee structure?"
        self.assertEqual(LanguageService.normalize_message(text), "what is the fee structure?")

    def test_language_normalization_tamil(self):
        text = "தேர்வு எப்போது நடக்கும்?"
        self.assertEqual(LanguageService.normalize_message(text), "தேர்வு எப்போது நடக்கும்?")

    def test_language_normalization_tanglish(self):
        text = "exam epo bro?"
        normalized = LanguageService.normalize_message(text)
        self.assertIn("when", normalized)
        self.assertIn("friend", normalized)


if __name__ == "__main__":
    unittest.main()
