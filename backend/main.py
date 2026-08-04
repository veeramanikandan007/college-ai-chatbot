from app.main import app
from app.core.config import settings

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=getattr(settings, "HOST", "127.0.0.1"),
        port=getattr(settings, "PORT", 8000),
        reload=True,
        reload_dirs=["app"],
        reload_excludes=["vector_db", "chroma_db", ".chroma", "database", "uploads", "documents", "*.db", "*.sqlite3", "*.log"]
    )
