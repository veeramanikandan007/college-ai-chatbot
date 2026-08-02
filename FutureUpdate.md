# Future Roadmap & Technical Upgrade Recommendations - CollegeMate AI

## Overview
This document outlines recommended architectural enhancements and future feature additions for **CollegeMate AI** beyond the initial RAG system.

---

## Recommended Future Enhancements

### 1. Multimodal RAG Support
- **PDF Diagram & Table OCR**: Integrate `unstructured` table parsing and OCR (Tesseract / PyTesseract) to parse complex diagrams, timetables, and scanned PDF grade cards.
- **Image Context Processing**: Support image uploads (e.g. event posters, handwritten notes) using Gemini Vision API.

### 2. Hybrid Sparse-Dense Search (BM25 + ChromaDB)
- **Hybrid Retrieval**: Combine dense vector similarity search (Sentence Transformers) with BM25 keyword search using Reciprocal Rank Fusion (RRF) for enhanced search accuracy on specialized codes (e.g. course codes like `CS8591`).

### 3. Real-Time WebSockets Voice Assistant
- **Bi-directional Streaming**: Implement WebSocket voice streaming (`/ws/voice`) for sub-second, real-time voice conversations without waiting for complete text responses.

### 4. Enterprise Role-Based Access Control (RBAC)
- **Granular Permissions**: Restrict sensitive document uploads (e.g., salary details, confidential senate minutes) exclusively to Admin & Faculty roles.
- **Department-level Knowledge Isolates**: Filter vector search results by student department (CSE, ECE, MECH) and year.

### 5. Advanced Analytics & Feedback Loop
- **Analytics Dashboard**: Track popular student questions, unanswered queries, and daily active user trends.
- **RAG Evaluation (RAGAS)**: Automate answer relevance and faithfulness scoring using RAGAS benchmarks.
