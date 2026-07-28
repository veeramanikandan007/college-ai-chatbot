# CampusMate Project Structure

```
CampusMate/
├── .env.example              # Template for environment variables
├── development.env.example   # Dev specific env variables
├── production.env.example    # Prod specific env variables
├── docker-compose.yml        # Orchestration for full stack
├── backend/                  # FastAPI Application
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py           # Entrypoint and app config (CORS, Rate Limiter)
│   │   ├── api/              # Route definitions (v1)
│   │   ├── core/             # Settings, JWT, and Security dependencies
│   │   ├── models/           # SQLAlchemy ORM definitions
│   │   ├── schemas/          # Pydantic validation models
│   │   ├── services/         # Business logic layer (Auth, Chat, AI)
│   │   └── rag/              # Vector database (Chroma) & Gemini integrations
│   ├── database/             # SQLite DB location
│   ├── documents/            # RAG source documents
│   └── uploads/              # User uploaded files
├── frontend/                 # React UI Application
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts        # Vite configuration & chunking
│   ├── src/
│   │   ├── components/       # Reusable UI parts (Layout, Modals, Inputs)
│   │   ├── context/          # React Context (Auth, Toast)
│   │   ├── hooks/            # Custom logic hooks
│   │   ├── lib/              # API wrappers and shared utilities
│   │   ├── pages/            # Top-level Route components
│   │   └── styles/           # Tailwind globals
└── docs/                     # Documentation hub
    ├── API.md
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    ├── DEVELOPER_GUIDE.md
    ├── PROJECT_STRUCTURE.md
    └── SETUP.md
```
