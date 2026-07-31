# API Endpoints & Specification Report - CollegeMate AI

## Overview
This report lists all active REST API endpoints exposed by the **CollegeMate AI** FastAPI backend, along with request payloads, parameters, and sample responses.

---

## 1. RAG & Document Management APIs

### `POST /upload-document` (or `/upload`)
- **Summary**: Upload a college document (.pdf, .docx, .txt).
- **Consumes**: `multipart/form-data` (`file: UploadFile`)
- **Flow**:
  1. Validates file extension and size (max 10MB).
  2. Saves copy to `uploads/` and `documents/`.
  3. Extracts raw text via PyMuPDF / `python-docx` / plain text reader.
  4. Splits text into chunks (1000 size, 200 overlap).
  5. Generates 384-dimensional embeddings using `all-MiniLM-L6-v2`.
  6. Stores vectors and metadata in ChromaDB (`vector_db/`).
- **Response**:
```json
{
  "status": "success",
  "message": "Document 'attendance_policy.txt' uploaded and indexed successfully into ChromaDB.",
  "is_duplicate": false,
  "document": {
    "id": "attendance_policy.txt",
    "filename": "attendance_policy.txt",
    "file_type": "txt",
    "file_size": 1008,
    "chunks_count": 1,
    "status": "indexed"
  }
}
```

### `POST /chat`
- **Summary**: RAG Chat endpoint processing user questions.
- **Request Body**:
```json
{
  "message": "What is the minimum attendance requirement?"
}
```
- **Flow**:
  1. Performs Cosine Similarity search in ChromaDB.
  2. Retrieves top 5 most relevant context chunks.
  3. Formulates strict anti-hallucination prompt.
  4. Sends prompt + context to **Google Gemini** (`langchain-google-genai`).
  5. Appends citations / source document references.
- **Response**:
```json
{
  "answer": "According to the college attendance policy, students must maintain a minimum of 75% attendance in each course during the semester to be eligible for End Semester Examinations.\n\n**Sources:**\n- attendance_policy.txt",
  "response": "According to the college attendance policy..."
}
```

### `GET /documents`
- **Summary**: Retrieves a list of all indexed knowledge base documents.
- **Response**:
```json
{
  "documents": [
    {
      "id": "attendance_policy.txt",
      "filename": "attendance_policy.txt",
      "file_type": "txt",
      "file_size": 1008,
      "upload_date": "2026-07-31 12:00:00",
      "status": "indexed"
    }
  ],
  "total": 29
}
```

### `DELETE /document/{id}` (or `/documents/{id}`)
- **Summary**: Deletes a document file and purges its vector embeddings from ChromaDB.
- **Path Parameter**: `id` (filename, e.g. `sample_policy.docx`)
- **Response**:
```json
{
  "status": "success",
  "message": "Document 'sample_policy.docx' and its vector embeddings have been deleted successfully."
}
```

---

## 2. Authentication & Student Record APIs

- `POST /api/v1/auth/register`: Register new student account.
- `POST /api/v1/auth/login`: Authenticate student and receive JWT access token.
- `GET /api/v1/students/me`: Retrieve logged-in student profile, attendance summary, marks, and fees due.
- `GET /api/v1/health`: Returns API health status.
