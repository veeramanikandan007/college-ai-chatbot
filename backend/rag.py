from typing import Dict, List

from langchain_core.documents import Document as LangchainDocument
from langchain_text_splitters import RecursiveCharacterTextSplitter

from ingest import load_all_documents


CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


def split_documents_to_chunks(documents: Dict[str, str]) -> List[LangchainDocument]:
    """Split cleaned document text into manageable semantic chunks."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    chunked_documents: List[LangchainDocument] = []

    for source_name, document_text in documents.items():
        if not document_text:
            continue

        text_chunks = text_splitter.split_text(document_text)
        for index, chunk_text in enumerate(text_chunks):
            chunked_documents.append(
                LangchainDocument(
                    page_content=chunk_text,
                    metadata={
                        'source': source_name,
                        'chunk_index': index,
                    },
                )
            )

    return chunked_documents


def load_and_split_documents() -> List[LangchainDocument]:
    """Load all documents and split them into chunks."""
    documents = load_all_documents()
    return split_documents_to_chunks(documents)
