# CampusMate Developer Guide

## Local Development Workflow
CampusMate uses a React frontend and a FastAPI backend. Both need to be running for full functionality.

### 1. Setup Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # (or .venv\Scripts\activate on Windows)
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The API runs at `http://127.0.0.1:8000`. Swagger documentation is auto-generated at `http://127.0.0.1:8000/docs`.

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
The Vite development server runs at `http://localhost:5173` and proxies API requests to the backend automatically.

## Code Conventions
- **Frontend**: Functional React components with hooks. Use Tailwind CSS for styling. Code splitting is enforced via `React.lazy()` in `App.tsx`.
- **Backend**: FastAPI with SQLAlchemy models. Business logic is separated into `app/services`, and routers stay slim.
- **Security**: Endpoint requests must pass through JWT authentication (`deps.get_current_user`).

## Common Tasks
- **Updating the Database**: When altering `app/models`, you must recreate the SQLite DB or run migrations if Alembic is integrated in the future.
- **Adding an Endpoint**: Create the router in `app/api/v1/`, define the schema in `app/schemas/`, and include the router in `app/api/v1/router.py`.
