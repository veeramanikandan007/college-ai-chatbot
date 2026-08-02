# CollegeMate AI - RAG Setup & Environment Documentation

## Overview
This document provides complete setup, dependency, configuration, and troubleshooting documentation for the **CollegeMate AI** Retrieval-Augmented Generation (RAG) system built with **FastAPI**, **LangChain**, **ChromaDB**, **Sentence Transformers (`all-MiniLM-L6-v2`)**, and **Ollama (`qwen2.5`)**.

---

## 1. Installed Python Packages

The following dependencies are specified in `backend/requirements.txt` and verified in the environment:

- **Web Framework & Server**: `fastapi`, `uvicorn[standard]`, `slowapi`
- **RAG & Vector Store**: `langchain`, `langchain-community`, `langchain-core`, `langchain-text-splitters`, `langchain-chroma`, `chromadb`, `sentence-transformers`
- **LLM Integration**: `ollama`, `langchain-groq`, `langchain-huggingface`
- **Document Processing**: `pymupdf` (PyMuPDF), `pypdf`, `python-docx`, `python-pptx`, `python-multipart`, `unstructured`, `tiktoken`
- **Validation & Security**: `pydantic[email]`, `pydantic-settings`, `email-validator`, `python-dotenv`, `passlib[bcrypt]`, `python-jose[cryptography]`, `bcrypt`
- **Database**: `sqlalchemy`, `psycopg2-binary`, `alembic`
- **Utilities & Testing**: `langdetect`, `gTTS`, `pytest`, `pytest-asyncio`, `httpx`, `sentry-sdk`, `ddgs`

---

## 2. VS Code Extensions

Workspace recommendations are configured in `.vscode/extensions.json`:

1. **Python** (`ms-python.python`)
2. **Pylance** (`ms-python.vscode-pylance`)
3. **Python Debugger** (`ms-python.debugpy`)
4. **Thunder Client** (`rangav.vscode-thunder-client`) - API testing inside VS Code
5. **SQLTools** (`mtxr.sqltools`)
6. **SQLTools PostgreSQL Driver** (`mtxr.sqltools-driver-pg`)
7. **Docker** (`ms-azuretools.vscode-docker`)
8. **Error Lens** (`usernamehw.errorlens`)
9. **GitHub Copilot** (`github.copilot`) *(Optional)*

---

## 3. Ollama & Qwen2.5 Setup

### Installation Steps
1. Download Ollama for Windows from [ollama.com/download](https.ollama.com/download).
2. Install and launch the Ollama service.
3. Open Terminal/PowerShell and pull the **Qwen2.5** model:
   ```bash
   ollama pull qwen2.5
   ```
4. Verify local model availability:
   ```bash
   ollama list
   ```

### Automated Fallback
The `AIService` automatically checks for local Ollama (`qwen2.5`). If Ollama is running, queries use local Qwen2.5. If Ollama is starting up or offline, the system seamlessly uses the backup LLM (`llama-3.3-70b-versatile`) so backend endpoints never crash.

---

## 4. Commands to Run

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Run Backend Server
```bash
cd backend
uvicorn app.main:app --reload
```

### Run RAG Verification Test Suite
```bash
cd backend
python test_rag_pipeline.py
```

---

## 5. Project Structure

```
college-ai-chatbot/
├── .vscode/
│   └── extensions.json           # Recommended VS Code extensions
├── RAG_SETUP.md                  # Comprehensive setup & RAG documentation
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   └── rag_router.py     # FastAPI endpoints (/upload, /chat, /documents, /document/{id})
│   │   ├── core/
│   │   │   └── config.py        # Settings & directory paths
│   │   ├── rag/
│   │   │   ├── document_loader.py # Extractor for PDF, DOCX, TXT
│   │   │   ├── text_splitter.py   # Recursive splitter (1000 size, 200 overlap)
│   │   │   ├── embedding_service.py # sentence-transformers (all-MiniLM-L6-v2)
│   │   │   ├── vector_store.py    # ChromaDB persistence & similarity search
│   │   │   ├── retriever.py       # Top-5 context retriever
│   │   │   └── rag_service.py     # RAG pipeline coordinator & startup auto-loader
│   │   ├── services/
│   │   │   └── ai_service.py      # LLM orchestration & prompt enforcement
│   │   └── main.py              # FastAPI app & background vector database loader
│   ├── documents/               # Storage for knowledge base source files
│   ├── uploads/                 # Storage for uploaded files via API
│   ├── vector_db/               # Persistent ChromaDB vector storage
│   ├── requirements.txt         # All Python package requirements
│   └── test_rag_pipeline.py     # RAG verification test suite
```

---

## 6. RAG API Flow

```
POST /upload -> Extract Text -> Chunk (1000/200) -> Generate Embeddings -> Persist in vector_db/

POST /chat   -> Receive Question -> Cosine Similarity Search -> Top 5 Chunks -> Qwen2.5 -> Return Answer
```

### Prompt Instructions
> *"Answer ONLY using retrieved context. If answer unavailable reply exactly 'I couldn't find this information in the college knowledge base.' Never hallucinate."*

---

## 7. Troubleshooting

- **Ollama Connection Error**:
  Ensure Ollama desktop app is running and `http://localhost:11434` is accessible. The system automatically falls back to Groq if Ollama is unreachable.
- **PyMuPDF / fitz Import Issue**:
  Run `pip install pymupdf`. The loader also has a automatic fallback to `pypdf`.
- **Vector DB Auto-Load on Startup**:
  ChromaDB initializes automatically from `vector_db/` when starting the backend via `uvicorn app.main:app --reload`.
