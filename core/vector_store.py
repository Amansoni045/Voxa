from langchain_chroma import Chroma 
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from core.config import Config

EMBEDDING_MODEL = "all-MiniLM-L6-v2"

def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"}
    )

def build_vector_store(transcript: str, source_file: str = None) -> Chroma:
    print("Building vector Store")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=Config.VECTOR_CHUNK_SIZE,
        chunk_overlap=Config.VECTOR_CHUNK_OVERLAP
    )
    chunks = splitter.split_text(transcript)

    docs = []
    for i, chunk in enumerate(chunks):
        metadata = {'chunk_index': i}
        if source_file:
            metadata['source'] = source_file
        docs.append(Document(page_content=chunk, metadata=metadata))

    embeddings = get_embeddings()
    vector_store = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        collection_name=Config.CHROMA_COLLECTION_NAME,
        persist_directory=Config.CHROMA_DIR
    )

    return vector_store

def load_vector_store() -> Chroma:
    embeddings = get_embeddings()
    vector_store = Chroma(
        collection_name=Config.CHROMA_COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=Config.CHROMA_DIR
    )

    return vector_store

def get_retriever(vector_store: Chroma, k: int = Config.RETRIEVER_K, fetch_k: int = Config.RETRIEVER_FETCH_K):
    return vector_store.as_retriever(
        search_type='mmr',
        search_kwargs={"k": k, "fetch_k": fetch_k}
    )