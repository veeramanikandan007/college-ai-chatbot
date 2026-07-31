# CollegeMate AI - RAG API Documentation

Complete REST API reference for CollegeMate AI Retrieval-Augmented Generation (RAG) system endpoints.

---

## 1. Document Upload API

### `POST /upload-document`
Upload a document (PDF, DOCX, TXT), automatically clean text, chunk into 1000 characters (200 overlap), generate embeddings using `all-MiniLM-L6-v2`, and update ChromaDB.

- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file`: UploadFile (PDF, DOCX, or TXT file, max 10MB)

#### Example Request (cURL):
```bash
curl -X POST "http://127.0.0.1:8000/upload-document" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@attendance_rules.pdf"
```

#### Successful Response (200 OK):
```json
{
  "status": "success",
  "message": "Document 'attendance_rules.pdf' uploaded and indexed successfully into ChromaDB.",
  "is_duplicate": false,
  "document": {
    "id": "attendance_rules.pdf",
    "filename": "attendance_rules.pdf",
    "file_type": "pdf",
    "file_size": 245120,
    "upload_date": "2026-07-30T18:30:00",
    "chunks_count": 4,
    "status": "indexed"
  }
}
```

#### Error Responses:
- **400 Bad Request**: Unsupported file extension, missing file, or empty document.
- **413 Payload Too Large**: File size exceeds 10MB.
- **422 Unprocessable Entity**: Unreadable or corrupted PDF/DOCX content.

---

## 2. List Documents API

### `GET /documents`
List all uploaded college documents, file metadata, upload timestamps, file types, and embedding indexing status.

#### Example Request:
```bash
curl -X GET "http://127.0.0.1:8000/documents"
```

#### Successful Response (200 OK):
```json
{
  "documents": [
    {
      "id": "attendance_rules.pdf",
      "filename": "attendance_rules.pdf",
      "file_type": "pdf",
      "file_size": 245120,
      "upload_date": "2026-07-30 18:30:00",
      "status": "indexed"
    }
  ],
  "total": 1
}
```

---

## 3. Delete Document API

### `DELETE /document/{filename}`
Delete a specified document file from storage and automatically purge all associated vector embeddings from ChromaDB.

#### Example Request:
```bash
curl -X DELETE "http://127.0.0.1:8000/document/attendance_rules.pdf"
```

#### Successful Response (200 OK):
```json
{
  "status": "success",
  "message": "Document 'attendance_rules.pdf' and its vector embeddings have been deleted successfully."
}
```

#### Error Response:
- **404 Not Found**: Specified document does not exist in storage or vector store.

---

## 4. Chat API (RAG System)

### `POST /chat`
Submit a question to CollegeMate AI. The system performs top-5 Cosine Similarity search in ChromaDB, injects context into Ollama (`qwen2.5`), and generates the answer.

- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "message": "What is the minimum attendance requirement?"
}
```

#### Successful Response (Question found in college knowledge base):
```json
{
  "response": "The minimum attendance requirement for all registered students is 75% per semester.\n\n**Sources:**\n- attendance_rules.pdf",
  "answer": "The minimum attendance requirement for all registered students is 75% per semester.\n\n**Sources:**\n- attendance_rules.pdf"
}
```

#### Response when question is NOT found in college documents:
```json
{
  "response": "I couldn't find this information in the college knowledge base.",
  "answer": "I couldn't find this information in the college knowledge base."
}
```
