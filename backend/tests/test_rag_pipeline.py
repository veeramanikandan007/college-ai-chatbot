import os
import sys
import unittest
from pathlib import Path

backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

from app.rag.document_loader import DocumentLoader
from app.rag.text_splitter import TextSplitter
from app.rag.embedding_service import EmbeddingService
from app.rag.vector_store import VectorStore
from app.rag.rag_service import RAGService


class TestRAGPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_dir = backend_dir / "test_scratch_docs"
        cls.test_dir.mkdir(parents=True, exist_ok=True)

        # Create sample TXT file
        cls.txt_path = cls.test_dir / "attendance_rules.txt"
        cls.txt_content = (
            "Mount Zion College Attendance Policy:\n"
            "1. Minimum attendance requirement for all registered students is 75% per semester.\n"
            "2. Leave requests must be submitted to the Head of Department within 3 days of absence."
        )
        cls.txt_path.write_text(cls.txt_content, encoding="utf-8")

    def test_01_document_loader(self):
        loader = DocumentLoader(self.test_dir)
        doc = loader.load_single_document(self.txt_path)
        self.assertEqual(doc['filename'], "attendance_rules.txt")
        self.assertEqual(doc['file_type'], "txt")
        self.assertIn("75% per semester", doc['content'])

    def test_02_text_splitter(self):
        loader = DocumentLoader(self.test_dir)
        doc = loader.load_single_document(self.txt_path)
        splitter = TextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_single_document(doc)
        self.assertGreater(len(chunks), 0)
        self.assertEqual(chunks[0]['filename'], "attendance_rules.txt")

    def test_03_embedding_service(self):
        svc = EmbeddingService()
        sample_texts = ["What is attendance rule?", "Minimum requirement is 75%"]
        vectors = svc.create_embeddings(sample_texts)
        self.assertEqual(len(vectors), 2)
        self.assertEqual(len(vectors[0]), 384)

    def test_04_vector_store_and_search(self):
        store = VectorStore(persist_directory=str(backend_dir / "test_vector_db"))
        store.reset()

        loader = DocumentLoader(self.test_dir)
        doc = loader.load_single_document(self.txt_path)
        splitter = TextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_single_document(doc)

        indexed = store.add_chunks(chunks)
        self.assertEqual(indexed, len(chunks))

        results = store.query("What is attendance percentage?", n_results=5)
        self.assertGreater(len(results), 0)
        self.assertIn("75%", results[0]['content'])

    def test_05_rag_service_pipeline(self):
        rag = RAGService(documents_dir=self.test_dir)
        meta = rag.process_and_index_file(self.txt_path)
        self.assertEqual(meta['filename'], "attendance_rules.txt")

        context = rag.retrieve_context("What is the minimum attendance requirement?", top_k=5)
        self.assertGreater(len(context), 0)
        self.assertIn("75%", context[0]['content'])

    @classmethod
    def tearDownClass(cls):
        import shutil
        if cls.test_dir.exists():
            shutil.rmtree(cls.test_dir, ignore_errors=True)
        test_vdb = backend_dir / "test_vector_db"
        if test_vdb.exists():
            shutil.rmtree(test_vdb, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
