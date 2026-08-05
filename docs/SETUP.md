# CollegeMate — Setup Guide

This document walks you through setting up the **CollegeMate** application for local development or production deployment.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| Google AI API Key | (Gemini 1.5 Pro) |

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-org/collegemate.git
cd collegemate/CollegeMate
```

---

## 2. Backend Setup

### 2a. Create a Virtual Environment

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 2b. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2c. Configure Environment Variables

Copy the example `.env` file and fill in your keys:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```dotenv
# Application
APP_NAME=CollegeMate
SECRET_KEY=your-super-secret-jwt-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google Gemini AI
GOOGLE_API_KEY=your-google-api-key-here

# Database
DATABASE_URL=sqlite:///./campusmate.db

# CORS
CORS_ORIGINS=["http://localhost:5173"]
```

> ⚠️ **Never commit your `.env` file to source control.**

### 2d. Seed the Database

Run the seed script to create the default admin and sample student accounts:

```bash
python scripts/seed_data.py
```

**Default credentials:**
- Admin: `admin@collegemate.edu` / `Admin@1234`
- Student: `rahul@collegemate.edu` / `password123`

### 2e. Build the RAG Vector Index

Place your college PDF documents in `backend/documents/` and run:

```bash
python scripts/build_index.py
```

### 2f. Start the Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
Interactive docs (Swagger): `http://localhost:8000/docs`

---

## 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

---

## 4. Production Build

### Backend

```bash
# Run with Gunicorn (Linux/macOS)
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm run build
# Serve the dist/ folder with nginx or any static file server
```

---

## 5. Troubleshooting

| Issue | Solution |
|-------|----------|
| `GOOGLE_API_KEY not set` | Ensure your `.env` file is present in `backend/` |
| ChromaDB `no collection found` | Run `python scripts/build_index.py` first |
| CORS errors in browser | Add `http://localhost:5173` to `CORS_ORIGINS` in `.env` |
| SQLite locked error | Stop any other running backend processes |
