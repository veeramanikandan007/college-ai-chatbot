<<<<<<< HEAD
# 🎓 CampusMate AI

> **One production-ready college management platform** — powered by Gemini AI, RAG, and a beautiful modern UI.

CampusMate combines an intelligent AI chatbot (backed by a college knowledge base) with a full student portal: attendance tracking, timetables, assignments, library management, fees, and more — all in one seamless experience.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **Gemini AI Chatbot** | Ask anything about college rules, exams, fees, and library — backed by RAG |
| 🎤 **Advanced Voice System** | Dictate queries, TTS responses, and hands-free "Hey CampusMate" wake word |
| 📊 **Attendance Tracker** | Subject-wise attendance with visual progress indicators |
| 📅 **Interactive Timetable** | Day-by-day class schedule with room and faculty info |
| 📝 **Assignments Board** | Track pending, submitted, and graded assignments |
| 📚 **Digital Library** | View issued books, due dates, fines, and search the catalog |
| 💳 **Fee Management** | Outstanding balance, payment history, and receipt download |
| 🔔 **Notifications** | Real-time campus alerts and reminders |
| 🛡️ **Admin Portal** | Full admin control: students, documents, RAG rebuild, and analytics |

---

## 🚀 Quick Start

```bash
# 1. Setup & seed the backend
cd CampusMate/backend
pip install -r requirements.txt
cp .env.example .env      # Fill in GOOGLE_API_KEY
python scripts/seed_data.py
python scripts/build_index.py
uvicorn app.main:app --reload

# 2. Start the frontend
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

**Default Login:**
- Admin: `admin@campusmate.edu` / `Admin@1234`
- Student: `rahul@campusmate.edu` / `password123`

---

## 🐳 Docker Deployment

To spin up the entire application in production-ready mode using Docker Compose:

```bash
docker-compose up -d --build
```
This will launch the backend API and the compiled React application simultaneously.

---

## 🏗️ Tech Stack

**Backend**
- FastAPI + SQLAlchemy + SQLite
- Google Gemini 1.5 Pro (LLM)
- ChromaDB (Vector Store)
- JWT Authentication

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS (dark mode)
- Framer Motion (animations)
- Web Speech API (voice)

---

## 📚 Documentation

| Doc | Description |
|-----|-------------|
| [SETUP.md](docs/SETUP.md) | Full local setup guide |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker & Production Deployment Guide |
| [API.md](docs/API.md) | Complete API endpoint reference |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture & design decisions |
| [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Full file and folder breakdown |
| [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) | Contributor and local dev guide |

---

## 📁 Project Structure

```
CampusMate/
├── backend/          ← FastAPI + RAG
└── frontend/         ← React + Vite
```

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
=======
# CollegeMate AI

CollegeMate AI is a full-stack college assistant built with React, Tailwind CSS, FastAPI, PostgreSQL, and LangChain.

## Project structure

- `frontend/` - React + Vite application
- `backend/` - FastAPI backend
- `database/` - database migrations and models
- `documents/` - college knowledge base materials
- `embeddings/` - vector store data
- `uploads/` - uploaded assets and documents
- `screenshots/` - UI preview images

## Phase 1

The frontend scaffolds a modern dark UI with:

- Home, Login, Register, Chat, Profile, Admin pages
- Responsive layout and sidebar
- Chat interface with typing animation
- Dark theme and glassmorphism

## Next steps

1. Build API backend, models, and authentication.
2. Add RAG-based AI chat integration.
3. Add database schema and admin management.
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
