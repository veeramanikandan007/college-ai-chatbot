# CampusMate — Architecture Overview

```
CampusMate/
├── backend/                  ← FastAPI Application
│   ├── app/
│   │   ├── api/v1/           ← Route handlers
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── students.py
│   │   │   ├── admin.py
│   │   │   ├── health.py
│   │   │   ├── deps.py       ← Auth & DB dependencies
│   │   │   └── router.py
│   │   ├── core/             ← Config, security, logging
│   │   ├── database/         ← SQLAlchemy engine & init
│   │   ├── models/           ← SQLAlchemy ORM models
│   │   ├── schemas/          ← Pydantic schemas
│   │   ├── services/         ← Business logic
│   │   ├── rag/              ← RAG pipeline
│   │   └── main.py
│   ├── documents/            ← College PDF knowledge base
│   ├── chroma_db/            ← Persistent vector store
│   ├── scripts/
│   │   ├── seed_data.py
│   │   └── build_index.py
│   └── requirements.txt
│
└── frontend/                 ← React + Vite Application
    ├── src/
    │   ├── components/       ← Reusable UI components
    │   │   └── layout/       ← Shared layouts (StudentLayout)
    │   ├── context/          ← React contexts (Auth, Toast)
    │   ├── hooks/            ← Custom hooks (useAuth, useVoiceSystem)
    │   ├── lib/              ← API client, helpers
    │   └── pages/
    │       ├── student/      ← Student portal pages
    │       └── *.tsx         ← Top-level pages
    └── tailwind.config.js
```

---

## Key Design Decisions

### 1. Decoupled Frontend & Backend
The React frontend communicates with the FastAPI backend exclusively via `/api/v1` REST endpoints. This allows independent scaling and separate deployment.

### 2. RAG Pipeline
```
User Query → Query Embedding → ChromaDB Similarity Search
  → Top-K Context Chunks → Gemini 1.5 Pro Prompt
  → Grounded Answer
```
- **Embeddings**: `models/embedding-001` (Google)
- **Vector DB**: ChromaDB (local, persistent)
- **LLM**: `gemini-1.5-pro-latest`

### 3. Authentication
JWT-based auth with two roles: `student` and `admin`.
- Tokens expire in 24 hours (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- `ProtectedRoute` component in React guards all authenticated pages

### 4. Voice System
Browser-native APIs (no external service required):
- **STT**: `window.SpeechRecognition` / `webkitSpeechRecognition`
- **TTS**: `window.speechSynthesis`
- **Wake Word**: Continuous SpeechRecognition for "Hey CampusMate"
- All logic encapsulated in the `useVoiceSystem` custom hook

### 5. Database
SQLite via SQLAlchemy ORM (easily swappable to PostgreSQL by changing `DATABASE_URL`).

### 6. Student Layout Pattern
All Student Portal pages use a shared `StudentLayout` wrapper with a common sidebar and header, while the `DashboardPage` (AI Chat) stands alone for a focused full-screen experience.
