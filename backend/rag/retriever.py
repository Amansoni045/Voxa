from langchain_chroma import Chroma
from backend.config.constants import RETRIEVER_K, RETRIEVER_FETCH_K

def get_mmr_retriever(vector_store: Chroma, k: int = RETRIEVER_K, fetch_k: int = RETRIEVER_FETCH_K):
    return vector_store.as_retriever(
        search_type='mmr',
        search_kwargs={"k": k, "fetch_k": fetch_k}
    )
