# CollegeMate AI — Smart Campus SaaS Assistant

CollegeMate AI is a modern, enterprise-grade AI chatbot and student dashboard designed for engineering colleges. It combines a **React 18 + TypeScript + Tailwind CSS** frontend styled like ChatGPT/Claude with a **FastAPI + LangChain + ChromaDB + Ollama (Qwen2.5)** RAG backend.

> **Demo Ready**: This project ships with realistic sample data for immediate demonstration to faculty — no official college documents required.

---

## 🌟 Features Overview

- 🤖 **ChatGPT / Claude AI Interface**: Modern three-column SaaS layout (Sidebar, Center Chat, Right Stats Panel).
- 🎨 **Unified Design System**: Standardized theme palette (`#0A2A6A`, `#163D8C`, `#E8B24D`, `#F5F7FA`) defined in `src/constants/theme.ts`.
- 🗂️ **Date-Grouped Chat History**: Automatic grouping (Today, Yesterday, Previous 7 Days, Previous Month) with search filtering.
- ⚡ **Auto Chat Title Generator**: Summarizes the user's first prompt into a concise conversation title.
- 🗣️ **Voice Features**: Browser Web SpeechRecognition (Dictation) and SpeechSynthesis (Read Aloud).
- 🔐 **Student Auth & Profile Drawer**: Glassmorphism Login Modal and right-side sliding Profile Drawer.
- 📄 **Export Options**: One-click exports to `.txt`, `.md`, `.json`, or Print to PDF.
- 📚 **RAG Knowledge Base**: FastAPI backend configured with LangChain and ChromaDB for document QA.
- 📊 **Student Data**: Attendance, fees, CGPA, bus info, library books, certificates.
- 📱 **Responsive**: Works on desktop, tablet, and mobile.

---

## 📁 Folder Structure

```
college-ai-chatbot/
├── backend/
│   ├── app.py                 # Main FastAPI application entry point
│   ├── config.py              # Environment variables and model configuration
│   ├── database.py            # SQLAlchemy database engine + demo data seeding
│   ├── models.py              # SQLAlchemy database models (Student, ChatSession, Message)
│   ├── schemas.py             # Pydantic request & response schemas
│   ├── ai.py                  # Embedding service initialization
│   ├── ingest.py              # PDF, DOCX, TXT document parser
│   ├── rag.py                 # Semantic chunking module
│   ├── generate_pdfs.py       # Demo PDF document generator
│   ├── requirements.txt       # Backend Python dependencies
│   ├── documents/             # Knowledge base PDF documents (10 demo PDFs)
│   ├── routes/                # FastAPI router endpoints
│   │   ├── auth.py            # JWT authentication
│   │   ├── chat.py            # Chat API with RAG + student context
│   │   ├── student.py         # Student data APIs (attendance, fees, etc.)
│   │   ├── health.py          # Health check
│   │   ├── upload.py          # Document upload
│   │   └── rebuild.py         # Vector store rebuild
│   ├── services/              # Vector store and LLM service pipelines
│   │   ├── chat_service.py    # Chat pipeline (intent detection + RAG)
│   │   ├── llm_service.py     # Ollama LLM service (Qwen2.5)
│   │   ├── prompt_service.py  # Prompt building
│   │   ├── rag_service.py     # ChromaDB retrieval
│   │   └── vector_store.py    # ChromaDB vector store management
│   ├── utils/                 # Utility modules
│   │   ├── security.py        # Password hashing + JWT
│   │   └── file_utils.py      # File upload utilities
│   ├── vector_db/             # ChromaDB persistent storage
│   └── dev.db                 # SQLite database (auto-created)
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # React router setup
│   │   ├── main.tsx           # React entry point
│   │   ├── index.css          # Tailwind CSS + design tokens
│   │   ├── components/        # Sidebar, HeaderBar, ChatMessage, RightPanel, etc.
│   │   ├── pages/             # DashboardPage, ChatPage, HomePage, LoginPage, etc.
│   │   ├── services/          # authService, chatService, attendanceService, etc.
│   │   ├── contexts/          # AuthContext (JWT + student profile)
│   │   ├── constants/         # theme.ts color palette
│   │   └── hooks/             # useAutoScroll
│   ├── index.html
│   ├── package.json           # Frontend React & Tailwind dependencies
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── FutureUpdate.md            # Detailed migration guide for replacing demo data
└── README.md                  # This file
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Vite |
| **Backend** | FastAPI, Uvicorn, Python 3.13, Pydantic, SQLAlchemy |
| **AI / RAG** | LangChain, ChromaDB, HuggingFace Embeddings, Ollama (Qwen2.5) |
| **Database** | SQLite (Dev) / PostgreSQL (Production) |
| **Auth** | JWT (python-jose), bcrypt (passlib) |

---

## 🚀 Quick Start

### 1. Generate Demo PDFs
```bash
cd backend
pip install fpdf2
python generate_pdfs.py
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment:
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Ollama AI Model Setup (Optional)
```bash
ollama serve
ollama pull qwen2.5
```

### 5. Open in Browser
- Frontend: http://localhost:4173
- Backend API: http://127.0.0.1:8000
- API Docs: http://127.0.0.1:8000/docs

### 6. Demo Login
- **Student**: ID = `24CSE001`, Password = `password123`
- **Admin**: ID = `admin`, Password = `admin123`

---

## 🎯 Demo Knowledge Base

The project includes 10 realistic sample PDF documents:

| Document | Description |
|---|---|
| `attendance.pdf` | Attendance rules, condonation policy, calculation |
| `fees.pdf` | Fee structure, payment methods, due dates, scholarships |
| `library.pdf` | Library hours, book issue policy, digital resources |
| `bus_timing.pdf` | Bus routes, departure/return times, emergency contacts |
| `exam_schedule.pdf` | Exam schedule, instructions, grade distribution |
| `placement.pdf` | Placement statistics, top recruiters, eligibility |
| `hostel_rules.pdf` | Hostel rules, curfew, visitor policy, mess hours |
| `college_rules.pdf` | Academic conduct, dress code, grievance redressal |
| `canteen_menu.pdf` | Weekly menu, prices, payment methods |
| `scholarship.pdf` | Merit/means scholarships, application process |

---

## 🎓 Demo Student Records

| Student ID | Name | Department | CGPA | Attendance |
|---|---|---|---|---|
| 24CSE001 | Pandiyarajan | Computer Science and Engineering | 8.52 | 87% |
| 24CSE002 | Priya Sharma | Computer Science and Engineering | 9.1 | 92% |
| 24CSE003 | Arjun Kumar | Computer Science and Engineering | 7.8 | 78% |
| 24ECE001 | Meera Patel | Electronics and Communication Engineering | 8.3 | 85% |
| 24ME001 | Rohan Desai | Mechanical Engineering | 8.7 | 90% |

---

## 💬 Demo AI Questions

The AI correctly answers questions like:

- What is the attendance requirement?
- Show my attendance.
- What is my CGPA?
- What are today's classes?
- What is my bus timing?
- How much fee have I paid?
- What are the library timings?
- How do I apply for a bonafide certificate?
- What are placement eligibility criteria?
- When does the college start?
- What are hostel rules?

---

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` — Login with student ID + password
- `POST /auth/logout` — Logout
- `GET /auth/me` — Get current student profile

### Chat
- `POST /chat` — Send a message to the AI (requires JWT)
- `GET /sessions` — Get all chat sessions
- `POST /sessions` — Create a new chat session
- `GET /sessions/{id}/messages` — Get messages in a session
- `POST /sessions/{id}/pin` — Toggle pin status
- `POST /sessions/{id}/favorite` — Toggle favorite status
- `DELETE /sessions/{id}` — Delete a session

### Student Data
- `GET /student/attendance` — Get attendance breakdown
- `GET /student/fees` — Get fee details
- `GET /student/timetable` — Get class timetable
- `GET /student/library` — Get library info
- `GET /student/bus` — Get bus info
- `GET /student/certificate` — Get certificate status
- `GET /student/profile` — Get full profile

### Admin
- `POST /admin/upload` — Upload a document
- `POST /admin/rebuild` — Rebuild vector store

### Health
- `GET /` — Root endpoint
- `GET /health` — Health check

---

## 🔄 Replacing Demo Data

See [FutureUpdate.md](FutureUpdate.md) for detailed instructions on replacing:

1. **Demo PDFs** — Replace files in `backend/documents/`
2. **Demo Database** — Edit `backend/database.py` or migrate to PostgreSQL
3. **Demo Login** — Update credentials in `backend/database.py`

---

## 📝 License

Created for CollegeMate AI Project. Built for production deployment.
