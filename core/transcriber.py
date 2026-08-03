import whisper
import os
import time
import requests
from pydub import AudioSegment
from concurrent.futures import ThreadPoolExecutor

# Sarvam's sync STT-translate API rejects audio longer than 30s.
# We slice each chunk into 25s pieces (with a 5s safety margin) before sending.
SARVAM_PIECE_SECONDS = 25


WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")


SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_STT_TRANSLATE_URL = "https://api.sarvam.ai/speech-to-text-translate"
SARVAM_MODEL = os.getenv("SARVAM_STT_MODEL", "saaras:v2.5")

_model = None

def load_model():

    global _model  

    if _model is None: 
        print(f"Loading Whisper model: {WHISPER_MODEL} ...")
        _model = whisper.load_model(WHISPER_MODEL) 
        print("Whisper model loaded.")
    return _model 


def transcribe_chunk_whisper(chunk_path: str) -> str:

    model = load_model()  

    result = model.transcribe(chunk_path, task="transcribe")  
    return result["text"]  


def _send_to_sarvam(piece_path: str, max_retries: int = 3) -> str:
    """
    Send one ≤30s WAV file to Sarvam with retry logic and exponential backoff.
    Retries only temporary network errors and server-side errors (429, 5xx).
    """
    headers = {"api-subscription-key": SARVAM_API_KEY}

    for attempt in range(1, max_retries + 1):
        try:
            with open(piece_path, "rb") as f:
                files = {"file": (os.path.basename(piece_path), f, "audio/wav")}
                data = {"model": SARVAM_MODEL, "with_diarization": "false"}
                response = requests.post(
                    SARVAM_STT_TRANSLATE_URL,
                    headers=headers,
                    files=files,
                    data=data,
                    timeout=120,
                )

            if response.status_code in (400, 401, 403):
                print(f"Permanent client error (HTTP {response.status_code}). Not retrying.")
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
                print(f"Temporary error ({e}). Retrying attempt {attempt}/{max_retries} after {delay}s delay...")
                time.sleep(delay)
            else:
                print(f"Failed to transcribe piece {piece_path} after {attempt} attempt(s): {e}")
                raise e


def transcribe_chunk_sarvam(chunk_path: str) -> str:
    """
    Sarvam sync API only accepts ≤30s audio. We split this chunk into
    25-second pieces, send each separately, and join the transcripts.
    """
    if not SARVAM_API_KEY:
        raise RuntimeError("SARVAM_API_KEY is not set in environment / .env")

    audio = AudioSegment.from_wav(chunk_path)
    piece_ms = SARVAM_PIECE_SECONDS * 1000

    full_text = ""
    total_pieces = (len(audio) + piece_ms - 1) // piece_ms

    for i, start in enumerate(range(0, len(audio), piece_ms)):
        piece = audio[start: start + piece_ms]
        piece_path = f"{chunk_path}_sv_{i}.wav"
        piece.export(piece_path, format="wav")

        try:
            print(f"  → Sarvam piece {i + 1}/{total_pieces} ...")
            full_text += _send_to_sarvam(piece_path) + " "
        finally:
            if os.path.exists(piece_path):
                os.remove(piece_path)

    return full_text.strip()


def transcribe_chunk(chunk_path: str, language: str = "english") -> str:
    """
    Route one chunk to Whisper or Sarvam depending on language choice.
    - english  → Whisper (local model)
    - hinglish → Sarvam (translates to English while transcribing)
    """
    if language.lower() == "hinglish":
        return transcribe_chunk_sarvam(chunk_path)
    return transcribe_chunk_whisper(chunk_path)


def _transcribe_single_chunk_worker(chunk_info: tuple) -> str:
    """
    Helper function to process a single chunk within a thread worker.
    Receives a tuple of (index, total_chunks, chunk_path, language).
    Returns transcribed text or an empty string on error.
    """
    i, total, chunk, language = chunk_info
    print(f"Transcribing chunk {i + 1}/{total}...")
    try:
        return transcribe_chunk(chunk, language=language)
    except Exception as e:
        print(f"Error transcribing chunk {i + 1}/{total} ({chunk}): {e}")
        return ""


def transcribe_all(chunks: list, language: str = "english") -> str:
    if not chunks:
        return ""

    engine = "Sarvam AI" if language.lower() == "hinglish" else "Whisper"
    print(f"Using {engine} for transcription.")

    max_workers = min(4, len(chunks))
    tasks = [(i, len(chunks), chunk, language) for i, chunk in enumerate(chunks)]

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(_transcribe_single_chunk_worker, tasks))

    print("Transcription complete.")

    return " ".join([text for text in results if text]).strip()