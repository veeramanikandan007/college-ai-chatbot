from pathlib import Path
import os

from dotenv import load_dotenv

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
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')
