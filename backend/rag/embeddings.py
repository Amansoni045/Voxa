from langchain_community.embeddings import HuggingFaceEmbeddings
from backend.config.constants import EMBEDDING_MODEL

def get_huggingface_embeddings():
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"}
    )
