# CollegeMate — API Reference

Base URL: `http://localhost:8000/api/v1`

All protected endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## Authentication

### POST `/auth/register`
Register a new user.
```json
// Request
{ "name": "Rahul Verma", "email": "rahul@college.edu", "password": "Password@1", "role": "student" }

// Response 201
{ "id": 1, "name": "Rahul Verma", "email": "rahul@college.edu", "role": "student" }
```

### POST `/auth/login`
Login and obtain a JWT token.
```json
// Request
{ "email": "rahul@college.edu", "password": "Password@1" }

// Response 200
{ "access_token": "eyJ...", "token_type": "bearer", "user": { ... } }
```

### GET `/auth/me` 🔒
Returns the currently authenticated user.

---

## Chat

### GET `/chat/sessions` 🔒
Returns all chat sessions for the authenticated user.

### POST `/chat/sessions` 🔒
Create a new chat session.
```json
{ "title": "My New Conversation" }
```

### GET `/chat/sessions/{session_id}/messages` 🔒
Get all messages in a session.

### DELETE `/chat/sessions/{session_id}` 🔒
Delete a session and all its messages.

### POST `/chat` 🔒
Send a message and receive an AI-generated answer.
```json
// Request
{ "message": "What is the attendance policy?", "session_id": 1 }

// Response
{ "answer": "According to the college regulations, students must maintain a minimum of 75% attendance…", "sources": [ ... ] }
```

---

## Admin Endpoints (Admin role required)

### GET `/admin/stats` 🔒🛡️
Aggregate stats: total students, sessions, messages.

### GET `/admin/students` 🔒🛡️
List all student accounts.

### PATCH `/admin/students/{id}/toggle-active` 🔒🛡️
Enable or disable a student account.

### DELETE `/admin/students/{id}` 🔒🛡️
Permanently delete a student account.

### POST `/admin/documents/upload` 🔒🛡️
Upload a PDF document for RAG indexing.

### GET `/admin/documents` 🔒🛡️
List all uploaded documents.

### DELETE `/admin/documents/{filename}` 🔒🛡️
Delete a document.

### POST `/admin/rag/rebuild` 🔒🛡️
Trigger a full rebuild of the RAG vector index.

### POST `/admin/notifications/broadcast` 🔒🛡️
Broadcast a notification to all active students.
```
POST /admin/notifications/broadcast?title=Exam+Alert&message=Exams+start+Monday
```

### GET `/admin/analytics/chat` 🔒🛡️
Get chat analytics grouped by day.

---

## Health

### GET `/health`
Returns the API health status (no auth required).
```json
{ "status": "ok", "version": "2.0.0" }
```

---

**Legend:** 🔒 = Protected (JWT required) &nbsp;&nbsp; 🛡️ = Admin only
