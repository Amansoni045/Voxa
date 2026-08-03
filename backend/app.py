from backend.audio.chunking import process_audio_input
from backend.audio.transcription import transcribe_all
from backend.llm.analysis import process_transcript_api
from backend.rag.chat import build_rag_chain, ask_question
from backend.shared.cleanup import cleanup_files

def process_meeting(source: str, language: str = "auto"):
    chunks = process_audio_input(source)
    try:
        transcript = transcribe_all(chunks, language=language)
        analysis_result = process_transcript_api(transcript)
        return {
            "transcript": transcript,
            "analysis": analysis_result
        }
    finally:
        cleanup_files(chunks)
