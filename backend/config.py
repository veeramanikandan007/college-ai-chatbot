from pathlib import Path
from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

APP_NAME = os.getenv('APP_NAME', 'CollegeMate AI')
ENV = os.getenv('ENV', 'development')
HOST = os.getenv('HOST', '127.0.0.1')
PORT = int(os.getenv('PORT', 8000))
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./dev.db')
JWT_SECRET = os.getenv('JWT_SECRET', 'change_this_secret')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 60))
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'qwen2.5')
OLLAMA_TEMPERATURE = float(os.getenv('OLLAMA_TEMPERATURE', '0.2'))
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434')
EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
FALLBACK_EMBEDDING_MODEL = os.getenv('FALLBACK_EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
