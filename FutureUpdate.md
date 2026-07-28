# CollegeMate AI — Future Update & Migration Guide

This document explains exactly how to replace the demo data with your college's official data.

---

## 1. Replacing Demo PDFs

### Location
All demo PDF documents are stored in:
```
college-ai-chatbot/backend/documents/
```

### Current Demo Files
- `attendance.pdf` — Attendance rules and condonation policy
- `fees.pdf` — Fee structure and payment policy
- `library.pdf` — Library rules and services
- `bus_timing.pdf` — Bus routes and timings
- `exam_schedule.pdf` — Examination schedule
- `placement.pdf` — Campus placement statistics
- `hostel_rules.pdf` — Hostel rules and regulations
- `college_rules.pdf` — College rules and regulations
- `canteen_menu.pdf` — Campus cafeteria menu
- `scholarship.pdf` — Scholarship programs

### How to Replace

1. **Prepare your official PDF documents** with the same filenames (e.g., `attendance.pdf`, `fees.pdf`, etc.)
2. **Copy them** into the `backend/documents/` directory, overwriting the demo files
3. **Rebuild the RAG vector store** by calling:
   ```
   POST http://127.0.0.1:8000/admin/rebuild
   ```
   Or run the rebuild script:
   ```bash
   cd backend
   python -c "from services.vector_store import rebuild_vector_store; rebuild_vector_store()"
   ```
4. The AI will now answer questions using your official documents

### Adding New Documents
You can also upload new documents via the API:
```
POST http://127.0.0.1:8000/admin/upload
Content-Type: multipart/form-data
file: <your-document.pdf>
```
The uploaded document will be automatically added to the knowledge base and the vector store will be rebuilt.

### Supported Formats
- PDF (.pdf)
- Word Document (.docx)
- Plain Text (.txt)

---

## 2. Replacing Demo Database

### Location
The demo database is SQLite, stored at:
```
college-ai-chatbot/backend/dev.db
```

### Current Demo Students
The database is seeded with these demo students (in `backend/database.py`, function `seed_demo_data()`):

| Student ID | Name | Department | Year | Semester | CGPA | Attendance |
|---|---|---|---|---|---|---|
| 24CSE001 | Pandiyarajan | Computer Science and Engineering | 3rd Year | 5 | 8.52 | 87% |
| 24CSE002 | Priya Sharma | Computer Science and Engineering | 3rd Year | 5 | 9.1 | 92% |
| 24CSE003 | Arjun Kumar | Computer Science and Engineering | 3rd Year | 5 | 7.8 | 78% |
| 24ECE001 | Meera Patel | Electronics and Communication Engineering | 3rd Year | 5 | 8.3 | 85% |
| 24ME001 | Rohan Desai | Mechanical Engineering | 3rd Year | 5 | 8.7 | 90% |
| admin | Admin User | Administration | N/A | N/A | 10.0 | 100% |

### How to Replace

#### Option A: Replace with Official Student Data (Recommended)

1. **Edit `backend/database.py`**, function `seed_demo_data()`
2. Replace the `demo_students` list with your official student records
3. Each student record requires these fields:
   ```python
   {
       'student_id': 'YOUR_STUDENT_ID',      # e.g., '24CSE001'
       'name': 'Student Name',
       'email': 'student@campusmail.edu',
       'phone': '+91 98765 43210',
       'department': 'Department Name',
       'year': 'Year (e.g., 3rd Year)',
       'semester': 'Semester (e.g., 5)',
       'attendance_percent': 87.0,           # float
       'cgpa': 8.52,                         # float
       'fees_paid': 45000,                   # integer (in rupees)
       'fees_total': 75000,                  # integer (in rupees)
       'bus_no': '3',                        # string
       'library_books': 'Book1, Book2',      # comma-separated string
       'certificate': 'Bonafide - Available',
       'password': hash_password('password123'),  # use hash_password()
       'role': 'student',                    # or 'admin'
   }
   ```
4. **Delete the old database** to force re-seeding:
   ```bash
   rm backend/dev.db
   ```
5. **Restart the backend** — the database will be recreated with your data

#### Option B: Migrate to PostgreSQL

1. **Update `backend/.env`**:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/collegemate_ai
   ```
2. **Install PostgreSQL dependencies**:
   ```bash
   pip install psycopg2-binary
   ```
3. **Create the database**:
   ```bash
   createdb collegemate_ai
   ```
4. **Delete the SQLite database**:
   ```bash
   rm backend/dev.db
   ```
5. **Restart the backend** — tables will be created automatically

#### Option C: Import from CSV/Excel

1. Create a CSV file with columns matching the student fields above
2. Use this script to import:
   ```python
   import csv
   from database import SessionLocal, Base, engine
   from models import Student
   from utils.security import hash_password

   Base.metadata.create_all(bind=engine)
   db = SessionLocal()

   with open('students.csv', 'r') as f:
       reader = csv.DictReader(f)
       for row in reader:
           student = Student(
               student_id=row['student_id'],
               name=row['name'],
               email=row['email'],
               phone=row['phone'],
               department=row['department'],
               year=row['year'],
               semester=row['semester'],
               attendance_percent=float(row['attendance_percent']),
               cgpa=float(row['cgpa']),
               fees_paid=int(row['fees_paid']),
               fees_total=int(row['fees_total']),
               bus_no=row['bus_no'],
               library_books=row['library_books'],
               certificate=row['certificate'],
               password=hash_password(row['password']),
               role=row.get('role', 'student'),
           )
           db.add(student)
       db.commit()
       db.close()
   ```

---

## 3. Replacing Demo Login

### Current Demo Credentials

**Student Login:**
- Student ID: `24CSE001`
- Password: `password123`

**Admin Login:**
- Student ID: `admin`
- Password: `admin123`

### How to Replace

#### Option A: Update Demo Credentials

1. **Edit `backend/database.py`**, function `seed_demo_data()`
2. Change the `password` field for each student to `hash_password('your_new_password')`
3. **Delete the old database** and restart:
   ```bash
   rm backend/dev.db
   ```

#### Option B: Connect to Official Student Portal

1. **Edit `backend/routes/auth.py`**
2. Replace the `login` function to authenticate against your official student portal:
   ```python
   @router.post('/login', response_model=LoginResponse)
   async def login(request: LoginRequest, db: Session = Depends(get_db)):
       # Option 1: Check against your official database
       student = db.query(Student).filter(Student.student_id == request.student_id).first()
       if not student or not verify_password(request.password, student.password):
           raise HTTPException(status_code=401, detail='Invalid Student ID or password.')
       
       # Option 2: Call your official student portal API
       # response = await http.post('https://your-portal.edu/api/auth', json={...})
       # if response.ok:
       #     data = response.json()
       #     # Sync student data from official portal
       #     ...
       
       access_token = create_access_token(data={'sub': student.student_id, 'role': student.role})
       return LoginResponse(success=True, access_token=access_token, user=student_to_dict(student))
   ```
3. **Update `frontend/src/services/authService.ts`** — the `DEMO_CREDENTIALS` and `MOCK_USERS` objects will be bypassed automatically when the backend is available

#### Option C: Single Sign-On (SSO)

1. Implement OAuth2/OIDC integration with your college's SSO provider
2. Update `backend/routes/auth.py` to handle SSO callbacks
3. Update `frontend/src/services/authService.ts` to redirect to SSO login page

---

## 4. Replacing Demo Attendance Data

### Location
Attendance data is stored in the SQLite database (`backend/dev.db`) in the `students` table, field `attendance_percent`.

### How to Replace
- **Option A**: Update the `attendance_percent` field in `seed_demo_data()` in `backend/database.py`
- **Option B**: Add per-subject attendance data by extending the `students` table or creating a new `attendance` table
- **Option C**: Connect to your official attendance management system via API

### Per-Subject Attendance
The backend currently returns overall attendance percentage. To add per-subject breakdown:
1. Create an `attendance_records` table in `backend/models.py`
2. Add a route in `backend/routes/student.py` to return per-subject data
3. Update `frontend/src/services/attendanceService.ts` to fetch from the new endpoint

---

## 5. Replacing Demo Fee Data

### Location
Fee data is stored in the SQLite database (`backend/dev.db`) in the `students` table, fields `fees_paid` and `fees_total`.

### How to Replace
- **Option A**: Update the `fees_paid` and `fees_total` fields in `seed_demo_data()` in `backend/database.py`
- **Option B**: Create a `fees` table with per-semester fee breakdowns
- **Option C**: Connect to your official fee management system via API

---

## 6. Replacing Demo Timetable Data

### Location
Timetable data is hardcoded in `backend/routes/student.py`, function `get_timetable()`.

### How to Replace
1. **Edit `backend/routes/student.py`**, function `get_timetable()`
2. Replace the `schedule` dictionary with your official timetable
3. For dynamic timetables, create a `timetables` table in the database and fetch from there

---

## 7. Architecture Overview

```
CollegeMate AI
├── backend/
│   ├── app.py                    # FastAPI entry point
│   ├── config.py                 # Environment configuration
│   ├── database.py               # SQLite/SQLAlchemy + demo data seeding
│   ├── models.py                 # SQLAlchemy models (Student, ChatSession, Message)
│   ├── schemas.py                # Pydantic request/response schemas
│   ├── ai.py                     # Embedding service (Sentence Transformers)
│   ├── ingest.py                 # PDF/DOCX/TXT document parser
│   ├── rag.py                    # Semantic chunking
│   ├── generate_pdfs.py          # Demo PDF generator
│   ├── routes/
│   │   ├── auth.py               # JWT authentication
│   │   ├── chat.py               # Chat API with RAG + student context
│   │   ├── student.py            # Student data APIs (attendance, fees, etc.)
│   │   ├── health.py             # Health check
│   │   ├── upload.py             # Document upload
│   │   └── rebuild.py            # Vector store rebuild
│   ├── services/
│   │   ├── chat_service.py       # Chat pipeline (intent detection + RAG)
│   │   ├── llm_service.py        # Ollama LLM service (Qwen2.5)
│   │   ├── prompt_service.py     # Prompt building
│   │   ├── rag_service.py        # ChromaDB retrieval
│   │   └── vector_store.py       # ChromaDB vector store management
│   ├── utils/
│   │   ├── security.py           # Password hashing + JWT
│   │   └── file_utils.py         # File upload utilities
│   ├── documents/                # Knowledge base PDFs (replaceable)
│   ├── vector_db/                # ChromaDB persistent storage
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # React router
│   │   ├── main.tsx              # Entry point
│   │   ├── components/           # UI components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API service layer
│   │   ├── contexts/             # React contexts (Auth)
│   │   ├── constants/            # Theme tokens
│   │   └── hooks/                # Custom hooks
│   └── package.json
├── FutureUpdate.md               # This file
└── README.md
```

---

## 8. Quick Start (Demo Mode)

```bash
# 1. Generate demo PDFs (if not already done)
cd backend
python generate_pdfs.py

# 2. Start the backend
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000

# 3. Start the frontend
cd ../frontend
npm install
npm run dev

# 4. Open http://localhost:4173 in your browser
# 5. Login with: Student ID = 24CSE001, Password = password123
```

---

## 9. RAG Pipeline (Ollama + Qwen2.5)

To enable the full RAG pipeline with Ollama:

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama
ollama serve

# Pull the Qwen2.5 model
ollama pull qwen2.5

# The backend will automatically use Ollama for LLM responses
# If Ollama is not available, the backend falls back to intent-based responses
```

---

## 10. Testing the Migration

After replacing demo data:

1. **Test login**: `POST /auth/login` with your official credentials
2. **Test student data**: `GET /student/attendance` with JWT token
3. **Test chat**: `POST /chat` with a question about your college
4. **Test RAG**: `POST /admin/rebuild` to rebuild vector store with new documents
5. **Test frontend**: Login and ask questions about your college

---

## 11. Environment Variables

All configuration is in `backend/.env`:

```
APP_NAME=CollegeMate AI
ENV=development
HOST=127.0.0.1
PORT=8000
DATABASE_URL=sqlite:///./dev.db          # Change to PostgreSQL for production
JWT_SECRET=your_jwt_secret_here          # Change this!
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OLLAMA_MODEL=qwen2.5
OLLAMA_TEMPERATURE=0.2
OLLAMA_URL=http://localhost:11434
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
FALLBACK_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```
