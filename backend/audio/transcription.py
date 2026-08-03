import os
import time
import shutil
import requests
from pydub import AudioSegment
from concurrent.futures import ThreadPoolExecutor

from backend.config.settings import Settings
from backend.config.constants import SARVAM_STT_TRANSLATE_URL, SARVAM_PIECE_SECONDS, MAX_WORKERS, MAX_RETRIES, REQUEST_TIMEOUT
from backend.audio.language import detect_audio_language, get_whisper_model
from backend.shared.file_utils import get_checkpoint_cache_dir
from backend.shared.logger import get_logger

logger = get_logger("voxa.transcription")

def transcribe_chunk_whisper(chunk_path: str) -> str:
    model = get_whisper_model()
    result = model.transcribe(chunk_path, task="transcribe")
    return result["text"]

def _send_to_sarvam(piece_path: str, max_retries: int = MAX_RETRIES) -> str:
    if not Settings.SARVAM_API_KEY:
        raise RuntimeError("SARVAM_API_KEY is not set in environment.")

    headers = {"api-subscription-key": Settings.SARVAM_API_KEY}

    for attempt in range(1, max_retries + 1):
        try:
            with open(piece_path, "rb") as f:
                files = {"file": (os.path.basename(piece_path), f, "audio/wav")}
                data = {"model": Settings.SARVAM_MODEL, "with_diarization": "false"}
                response = requests.post(
                    SARVAM_STT_TRANSLATE_URL,
                    headers=headers,
                    files=files,
                    data=data,
                    timeout=REQUEST_TIMEOUT,
                )

            if response.status_code in (400, 401, 403):
                logger.error("Permanent client error (HTTP %d). Not retrying.", response.status_code)
                response.raise_for_status()

            if response.status_code in (429, 500, 502, 503, 504):
                response.raise_for_status()

            if not response.ok:
                response.raise_for_status()

            return response.json().get("transcript", "")

        except (requests.Timeout, requests.ConnectionError, requests.HTTPError) as e:
            is_retriable = False
            if isinstance(e, (requests.Timeout, requests.ConnectionError)):
                is_retriable = True
            elif isinstance(e, requests.HTTPError) and e.response is not None:
                if e.response.status_code in (429, 500, 502, 503, 504):
                    is_retriable = True

            if is_retriable and attempt < max_retries:
                delay = 2 ** (attempt - 1)
                logger.warning("Temporary error (%s). Retrying attempt %d/%d after %ds delay...", e, attempt, max_retries, delay)
                time.sleep(delay)
            else:
                logger.error("Failed to transcribe piece %s after %d attempt(s): %s", piece_path, attempt, e)
                raise e

def transcribe_chunk_sarvam(chunk_path: str) -> str:
    audio = AudioSegment.from_wav(chunk_path)
    piece_ms = SARVAM_PIECE_SECONDS * 1000

    full_text = ""
    total_pieces = (len(audio) + piece_ms - 1) // piece_ms

    for i, start in enumerate(range(0, len(audio), piece_ms)):
        piece = audio[start: start + piece_ms]
        piece_path = f"{chunk_path}_sv_{i}.wav"
        piece.export(piece_path, format="wav")

        try:
            logger.info("Sarvam piece %d/%d...", i + 1, total_pieces)
            full_text += _send_to_sarvam(piece_path) + " "
        finally:
            if os.path.exists(piece_path):
                os.remove(piece_path)

    return full_text.strip()

def transcribe_chunk(chunk_path: str, language: str = "english") -> str:
    if language.lower() in ("hinglish", "sarvam"):
        return transcribe_chunk_sarvam(chunk_path)
    return transcribe_chunk_whisper(chunk_path)

def _transcribe_single_chunk_worker(chunk_info: tuple) -> str:
    i, total, chunk, language, cache_dir = chunk_info
    cache_file = os.path.join(cache_dir, f"chunk_{i}.txt")

    if os.path.exists(cache_file):
        logger.info("Loading chunk %d/%d from checkpoint...", i + 1, total)
        with open(cache_file, "r", encoding="utf-8") as f:
            return f.read()

    logger.info("Transcribing chunk %d/%d...", i + 1, total)
    try:
        text = transcribe_chunk(chunk, language=language)
        if text:
            with open(cache_file, "w", encoding="utf-8") as f:
                f.write(text)
        return text
    except Exception as e:
        logger.error("Error transcribing chunk %d/%d (%s): %s", i + 1, total, chunk, e)
        return ""

def transcribe_all(chunks: list, language: str = "auto") -> str:
    if not chunks:
        return ""

    if language.lower() == "auto":
        detected_lang, confidence = detect_audio_language(chunks[0])
        if detected_lang == "en" and confidence >= 0.6:
            engine = "Whisper"
            language = "english"
        else:
            engine = "Sarvam AI"
            language = "hinglish"
    else:
        engine = "Sarvam AI" if language.lower() in ("hinglish", "sarvam") else "Whisper"

    logger.info("Using %s for transcription.", engine)
    cache_dir = get_checkpoint_cache_dir(chunks)

    max_workers = min(MAX_WORKERS, len(chunks))
    tasks = [(i, len(chunks), chunk, language, cache_dir) for i, chunk in enumerate(chunks)]

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(_transcribe_single_chunk_worker, tasks))

    successful = all(res.strip() != "" for res in results)
    if successful and os.path.exists(cache_dir):
        shutil.rmtree(cache_dir)

    logger.info("Transcription complete.")
    return " ".join([text for text in results if text]).strip()
