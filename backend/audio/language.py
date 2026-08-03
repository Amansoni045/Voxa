import whisper
from backend.config.settings import Settings
from backend.shared.logger import get_logger

logger = get_logger("voxa.language")
_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        logger.info("Loading Whisper model: %s...", Settings.WHISPER_MODEL)
        _whisper_model = whisper.load_model(Settings.WHISPER_MODEL)
        logger.info("Whisper model loaded.")
    return _whisper_model

def detect_audio_language(sample_chunk_path: str) -> tuple[str, float]:
    model = get_whisper_model()
    audio = whisper.load_audio(sample_chunk_path)
    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio).to(model.device)
    _, probs = model.detect_language(mel)
    detected_lang = max(probs, key=probs.get)
    confidence = probs.get(detected_lang, 0.0)
    logger.info("Detected language: %s (confidence: %.2f)", detected_lang, confidence)
    return detected_lang, confidence
