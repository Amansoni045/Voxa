from langchain_mistralai import ChatMistralAI
from backend.config.settings import Settings

def get_llm_client(temperature: float = 0.2) -> ChatMistralAI:
    return ChatMistralAI(
        model="mistral-small-latest",
        mistral_api_key=Settings.MISTRAL_API_KEY,
        temperature=temperature,
    )
