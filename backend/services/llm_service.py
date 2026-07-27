from typing import Optional

from config import OLLAMA_MODEL, OLLAMA_TEMPERATURE, OLLAMA_URL

try:
    from langchain_community.llms import Ollama
except ImportError:
    try:
        from langchain_ollama import OllamaLLM as Ollama  # type: ignore
    except ImportError:
        Ollama = None  # type: ignore


class OllamaLLMService:
    """Service for generating responses via Ollama qwen2.5."""

    def __init__(self) -> None:
        self.model_name = OLLAMA_MODEL
        self.temperature = OLLAMA_TEMPERATURE
        self.base_url = OLLAMA_URL
        self.client = self._build_client()

    def _build_client(self):
        if Ollama is None:
            raise RuntimeError(
                'Ollama integration requires langchain-community. '
                'Install it with: pip install langchain-community'
            )
        return Ollama(
            model=self.model_name,
            base_url=self.base_url,
            temperature=self.temperature,
        )

    def generate(self, prompt: str) -> str:
        """Generate text from the LLM using a complete prompt."""
        response = self.client.invoke(prompt)
        if hasattr(response, 'strip'):
            return response.strip()
        return str(response).strip()
