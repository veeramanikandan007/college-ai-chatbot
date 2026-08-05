#!/usr/bin/env python3
"""
build_index.py — Builds (or rebuilds) the ChromaDB RAG vector index
by ingesting all PDF documents from the documents/ folder.

Usage:
    python scripts/build_index.py
    python scripts/build_index.py --dir /path/to/custom/docs

This script will:
  - Load all PDF files from the target directory
  - Split them into overlapping chunks
  - Generate embeddings with Google's embedding-001 model
  - Store them in a persistent ChromaDB collection
"""

import sys, os, argparse
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def main():
    parser = argparse.ArgumentParser(description="Build CollegeMate RAG Vector Index")
    parser.add_argument(
        "--dir",
        default="documents",
        help="Directory containing PDF documents to index (default: ./documents)",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete the existing ChromaDB collection before rebuilding",
    )
    args = parser.parse_args()

    docs_dir = os.path.abspath(args.dir)
    if not os.path.isdir(docs_dir):
        print(f"  Documents directory not found: {docs_dir}")
        sys.exit(1)

    pdf_files = [f for f in os.listdir(docs_dir) if f.endswith(".pdf")]
    if not pdf_files:
        print(f"   No PDF files found in {docs_dir}. Nothing to index.")
        sys.exit(0)

    print(f"  Found {len(pdf_files)} PDF file(s) in: {docs_dir}")
    for f in pdf_files:
        print(f"     • {f}")

    print("\n  Initialising RAG service…")
    from app.rag.rag_service import RAGService

    rag = RAGService()

    if args.reset:
        print("   Resetting existing vector store…")
        rag.reset()

    print("  Loading and splitting documents…")
    count = rag.build_index(docs_dir)
    print(f"\n  Successfully indexed {count} document(s).")
    print("   ChromaDB collection updated and persisted.")


if __name__ == "__main__":
    main()
