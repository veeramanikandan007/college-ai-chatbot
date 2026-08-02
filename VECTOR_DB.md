# CollegeMate AI - Vector Database & Embedding Architecture

This guide explains the persistent vector database engine, embedding models, similarity search settings, and startup loading mechanisms in CollegeMate AI.

---

## 1. Vector Database Technology

- **Database Engine**: ChromaDB persistent vector database
- **Storage Directory**: `./vector_db`
- **Distance Metric**: Cosine Similarity (`hnsw:space: cosine`)
- **Persistence Mechanism**: Automatic on disk; no external database server required.

---

## 2. Embedding Model Specification

- **Model Name**: `sentence-transformers/all-MiniLM-L6-v2`
- **Vector Output Dimension**: 384 dimensions
- **Device**: CPU optimized (compatible with all deployment platforms)
- **Normalization**: `normalize_embeddings=True` (ensures unit vector output for exact cosine similarity calculation)
- **Performance**: Lazy-loaded upon first requirement to minimize backend startup latency.

---

## 3. Similarity Search & Top-K Retrieval

- **Top-K**: `5`
- **Metric**: Cosine Similarity Search (`similarity_search_with_score`)
- **Query Flow**:
  1. User question is passed to `Retriever`.
  2. Question is converted into a 384-dimensional dense vector using `all-MiniLM-L6-v2`.
  3. ChromaDB executes nearest-neighbor Cosine Distance search.
  4. Top 5 context chunks are extracted and evaluated against similarity threshold distance (< 1.2).
  5. If valid context exists, it is passed to LLM (Qwen2.5 / Ollama).
  6. If no valid context exists or similarity score is low, system returns exact fallback text:
     `"I couldn't find this information in the college knowledge base."`

---

## 4. Startup & Auto-Rebuild Workflow

1. **FastAPI Backend Startup**:
   - Executes `@app.on_event("startup")` hook in `app/main.py`.
   - Initializes `RAGService` and loads existing vector database from `./vector_db`.
   - If database exists, vectors are reloaded in memory instantly without re-embedding.
   - If database doesn't exist, it is created automatically and scans `documents/` or `uploads/` for initial indexing.
2. **Document Upload/Delete Triggers**:
   - Adding a file automatically chunks, embeds, and appends to `./vector_db`.
   - Deleting a file automatically purges matching vectors by filename from `./vector_db`.
