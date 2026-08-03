import os
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("voxa")

class Config:
    # Environment Keys
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    SARVAM_API_KEY: str = os.getenv("SARVAM_API_KEY", "")
    WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "small")
    SARVAM_MODEL: str = os.getenv("SARVAM_STT_MODEL", "saaras:v2.5")

    # Transcription Config
    SARVAM_STT_TRANSLATE_URL: str = "https://api.sarvam.ai/speech-to-text-translate"
    SARVAM_PIECE_SECONDS: int = 25
    AUDIO_CHUNK_MINUTES: int = 10
    MAX_WORKERS: int = 4
    MAX_RETRIES: int = 3
    REQUEST_TIMEOUT: int = 120

    # Text Splitting & RAG Config
    SUMMARIZE_CHUNK_SIZE: int = 3000
    SUMMARIZE_CHUNK_OVERLAP: int = 200
    VECTOR_CHUNK_SIZE: int = 900
    VECTOR_CHUNK_OVERLAP: int = 150
    RETRIEVER_K: int = 6
    RETRIEVER_FETCH_K: int = 20

    # Storage Paths
    DOWNLOAD_DIR: str = "downloads"
    CHROMA_DIR: str = "vector_db"
    CHROMA_COLLECTION_NAME: str = "meeting_transcript"

    @classmethod
    def validate(cls):
        """Validate startup configuration and required API keys."""
        missing_keys = []
        if not cls.MISTRAL_API_KEY:
            missing_keys.append("MISTRAL_API_KEY")

        if missing_keys:
            error_msg = f"Startup validation failed! Missing required environment variable(s): {', '.join(missing_keys)}"
            logger.critical(error_msg)
            raise RuntimeError(error_msg)

        logger.info("Configuration validated successfully.")

Config.validate()
