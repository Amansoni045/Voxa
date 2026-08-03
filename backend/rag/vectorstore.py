from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from backend.config.constants import CHROMA_DIR, CHROMA_COLLECTION_NAME, VECTOR_CHUNK_SIZE, VECTOR_CHUNK_OVERLAP
from backend.rag.embeddings import get_huggingface_embeddings

def build_vector_store(transcript: str, source_file: str = None) -> Chroma:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=VECTOR_CHUNK_SIZE,
        chunk_overlap=VECTOR_CHUNK_OVERLAP
    )
    chunks = splitter.split_text(transcript)

    docs = []
    for i, chunk in enumerate(chunks):
        metadata = {'chunk_index': i}
        if source_file:
            metadata['source'] = source_file
        docs.append(Document(page_content=chunk, metadata=metadata))

    embeddings = get_huggingface_embeddings()
    return Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        collection_name=CHROMA_COLLECTION_NAME,
        persist_directory=CHROMA_DIR
    )

def load_vector_store() -> Chroma:
    embeddings = get_huggingface_embeddings()
    return Chroma(
        collection_name=CHROMA_COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=CHROMA_DIR
    )
