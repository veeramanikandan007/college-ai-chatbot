# CollegeMate AI - Document Upload & Processing Pipeline

This guide details how documents (PDF, DOCX, TXT) are uploaded, validated, cleaned, chunked, and automatically indexed in CollegeMate AI.

---

## 1. Supported File Formats

1. **PDF (`.pdf`)**: Extracted using **PyMuPDF (`fitz`)** for layout-aware text extraction with fallback to `pypdf`.
2. **DOCX (`.docx`)**: Extracted using **python-docx** paragraph processing.
3. **TXT (`.txt`)**: Extracted using UTF-8 decoding with Latin-1 fallback.

---

## 2. Document Ingestion Lifecycle

```
User Action: POST /upload-document
   │
   ├── 1. File Format Validation (Must be .pdf, .docx, or .txt)
   ├── 2. File Size Validation (Max 10MB limit enforcement)
   ├── 3. Filename Sanitization (Regex cleaning for safe path handling)
   ├── 4. Duplicate Check & Persistence (Stored in uploads/ directory)
   ├── 5. Text Cleaning & Normalization
   │      - Strip control characters
   │      - Normalize non-breaking spaces (\xa0)
   │      - Collapse multi-space lines & limit consecutive empty lines
   ├── 6. Recursive Chunking (Chunk Size = 1000, Overlap = 200)
   ├── 7. Sentence Transformer Embeddings Generation (all-MiniLM-L6-v2)
   ├── 8. ChromaDB Vector Storage Update (vector_db/)
   └── 9. Response JSON with Document Metadata & Status
```

---

## 3. Chunking Parameters

- **Text Splitter Class**: `RecursiveCharacterTextSplitter` (LangChain)
- **Chunk Size**: `1000` characters
- **Chunk Overlap**: `200` characters
- **Separators**: `["\n\n", "\n", " ", ""]`

### Chunk Metadata Structure
Each indexed chunk carries rich metadata stored inside ChromaDB:
```json
{
  "source": "c:/path/to/uploads/attendance_rules.txt",
  "filename": "attendance_rules.txt",
  "file_type": "txt",
  "chunk_id": "attendance_rules.txt:0",
  "chunk_index": 0
}
```

---

## 4. Deletion & Re-indexing

When a document is deleted via `DELETE /document/{filename}`:
1. The physical file is removed from `uploads/` and `documents/`.
2. All vector embeddings associated with `filename` are deleted from ChromaDB.
3. Vector store metadata count is automatically updated without requiring manual backend restarts.
