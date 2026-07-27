from typing import List

from langchain_core.documents import Document as LangchainDocument

from ingest import list_document_files
from services.vector_store import get_vector_store

TOP_K = 5


def has_documents() -> bool:
    """Determine whether any supported documents are available."""
    return bool(list_document_files())


def create_retriever(top_k: int = TOP_K):
    """Create a similarity retriever from the persisted Chroma vector store."""
    store = get_vector_store()
    return store.as_retriever(search_kwargs={'k': top_k})


def get_relevant_documents(query: str, top_k: int = TOP_K) -> List[LangchainDocument]:
    """Retrieve the most relevant document chunks for the query."""
    retriever = create_retriever(top_k)
    return retriever.invoke(query)
