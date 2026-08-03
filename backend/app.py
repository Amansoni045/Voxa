from backend.audio.chunking import process_audio_input
from backend.audio.transcription import transcribe_all
from backend.llm.analysis import process_transcript_api
from backend.shared.cleanup import cleanup_files
from backend.shared.logger import get_logger

logger = get_logger("voxa.app")

def process_meeting(source: str, language: str = "auto"):
    """
    Process meeting audio file or URL end-to-end.
    Guarantees every temporary chunk file and intermediate WAV file is cleaned up
    in a finally block, even if transcription, Whisper, or LLM analysis fails.
    """
    chunks = []
    intermediates = []
    try:
        chunks, intermediates = process_audio_input(source)
        transcript = transcribe_all(chunks, language=language)
        analysis_result = process_transcript_api(transcript)
        return {
            "transcript": transcript,
            "analysis": analysis_result
        }
    finally:
        logger.info("Executing guaranteed cleanup of %d chunks and %d intermediate files.", len(chunks), len(intermediates))
        cleanup_files(chunks + intermediates)
