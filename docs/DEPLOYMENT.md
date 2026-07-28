# CampusMate Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for manual deployment)
- Python 3.10+ (for manual deployment)
- 4GB RAM minimum (due to ChromaDB and potential AI load)

## Environment Configuration
Copy the `.env.example` to `.env` in the project root and fill in the required variables. For production, use `production.env.example` as a template and ensure `SECRET_KEY` is highly secure.

## Docker Deployment (Recommended)

1. Build the images:
   ```bash
   docker-compose build
   ```
2. Start the services:
   ```bash
   docker-compose up -d
   ```
3. The frontend will be available on port `5173` (or port 80 based on proxy settings). The backend runs on port `8000`.

## Manual Deployment

### Backend
1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start FastAPI with Uvicorn (production mode without `--reload`):
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm ci
   ```
2. Build the production bundle:
   ```bash
   npm run build
   ```
3. Serve the `dist/` directory using Nginx, Apache, or any static file server.
