import os
from pydub import AudioSegment
from backend.audio.youtube import download_youtube_audio
from backend.audio.converter import convert_to_wav
from backend.config.constants import AUDIO_CHUNK_MINUTES
from backend.shared.cleanup import cleanup_files

def chunk_audio(wav_path: str, chunk_minutes: int = AUDIO_CHUNK_MINUTES) -> list:
    audio = AudioSegment.from_wav(wav_path)
    chunk_ms = chunk_minutes * 60 * 1000

    chunks = []
    for i, start in enumerate(range(0, len(audio), chunk_ms)):
        chunk = audio[start: start + chunk_ms]
        chunk_path = f"{wav_path}_chunk_{i}.wav"
        chunk.export(chunk_path, format="wav")
        chunks.append(chunk_path)
    return chunks

def process_audio_input(source: str) -> tuple[list[str], list[str]]:
    """
    Process input source into WAV chunks.
    Returns a tuple of (chunk_file_paths, intermediate_temp_files_to_clean).
    Guarantees all created intermediate files are tracked for cleanup.
    """
    intermediate_files = []

    if source.startswith("http://") or source.startswith("https://"):
        wav_path = download_youtube_audio(source)
        intermediate_files.append(wav_path)
    else:
        wav_path = convert_to_wav(source)
        if wav_path != source:
            intermediate_files.append(wav_path)

    chunks = chunk_audio(wav_path)
    return chunks, intermediate_files
