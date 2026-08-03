import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    SARVAM_API_KEY: str = os.getenv("SARVAM_API_KEY", "")
    WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "small")
    SARVAM_MODEL: str = os.getenv("SARVAM_STT_MODEL", "saaras:v2.5")

    @classmethod
    def validate(cls):
        missing = []
        if not cls.MISTRAL_API_KEY:
            missing.append("MISTRAL_API_KEY")
        if missing:
            raise RuntimeError(f"Startup validation failed! Missing required environment variable(s): {', '.join(missing)}")

Settings.validate()
