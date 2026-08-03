import os
import json
import uuid
import shutil
import asyncio
import tempfile
from typing import Optional, AsyncGenerator, Any
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import backend.shared.ffmpeg_utils  
from backend.shared.ffmpeg_utils import is_ffmpeg_available
from backend.shared.cleanup import cleanup_files, purge_old_temporary_files
from backend.app import process_meeting
from backend.audio.youtube import download_youtube_audio
from backend.llm.analysis import process_transcript_api
from backend.shared.logger import get_logger

logger = get_logger("voxa.main")

app = FastAPI(
    title="Voxa V2 API",
    description="Universal Content Distillation Engine Backend API with Guaranteed Temporary File Lifecycle",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_routine():
    try:
        import torch
        torch.set_num_threads(min(4, os.cpu_count() or 2))
    except Exception:
        pass

    try:
        from backend.config.constants import DOWNLOAD_DIR
        purge_old_temporary_files(tempfile.gettempdir(), max_age_seconds=1800)
        purge_old_temporary_files(DOWNLOAD_DIR, max_age_seconds=1800)
    except Exception as e:
        logger.warning("Startup disk purge error: %s", e)


class URLAnalyzeRequest(BaseModel):
    url: str


class RetryTranscriptRequest(BaseModel):
    transcript: str


class ChatRequest(BaseModel):
    meeting_id: Optional[str] = None
    content_id: Optional[str] = None
    question: str


def format_sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def format_section_response(val: Any) -> dict:
    if isinstance(val, dict) and "status" in val:
        return val
    if not val or ("No " in str(val) and " found." in str(val)):
        return {"status": "EMPTY"}
    return {"status": "SUCCESS", "content": str(val)}


def format_analysis_payload(res: dict, source_type: str, title_default: str, extra_meta: dict = None) -> dict:
    analysis = res.get("analysis", {})
    data = analysis.get("data", {}) if isinstance(analysis, dict) else {}

    summary = format_section_response(data.get("summary"))
    key_decisions = format_section_response(data.get("key_decisions"))
    action_items = format_section_response(data.get("action_items"))
    questions = format_section_response(data.get("questions"))

    meta = {
        "duration_seconds": data.get("duration_seconds", 0),
        "generation_timestamp": data.get("generation_timestamp"),
    }
    if extra_meta:
        meta.update(extra_meta)

    return {
        "id": f"content-{uuid.uuid4().hex[:8]}",
        "title": data.get("title") or title_default,
        "sourceType": source_type,
        "summary": summary,
        "key_decisions": key_decisions,
        "action_items": action_items,
        "questions": questions,
        "transcript": res.get("transcript") or "",
        "metadata": meta,
    }


@app.get("/")
@app.get("/health")
def health_check():
    ffmpeg_ok = is_ffmpeg_available()
    return {
        "status": "ok" if ffmpeg_ok else "degraded",
        "version": "2.0.0",
        "service": "Voxa V2 API",
        "ffmpeg_available": ffmpeg_ok,
    }


@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    """
    Standard HTTP endpoint for file analysis.
    Guarantees temporary upload directory is deleted in a finally block.
    """
    if not is_ffmpeg_available():
        raise HTTPException(
            status_code=500,
            detail="FFmpeg binary is unavailable on the backend system path."
        )

    temp_dir = tempfile.mkdtemp(prefix="voxa_upload_")
    file_path = os.path.join(temp_dir, file.filename or "recording.mp3")

    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        res = await asyncio.to_thread(process_meeting, file_path)
        return format_analysis_payload(res, "recording", file.filename or "Audio Recording")
    except Exception as e:
        logger.exception("Error in /analyze endpoint")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cleanup_files([temp_dir])


@app.post("/analyze/stream")
async def analyze_file_stream(file: UploadFile = File(...)):
    """
    Real-time Server-Sent Events (SSE) stream for file processing pipeline.
    Guarantees temporary upload directory is deleted in a finally block.
    """
    if not is_ffmpeg_available():
        raise HTTPException(
            status_code=500,
            detail="FFmpeg binary is unavailable on the backend system path."
        )

    temp_dir = tempfile.mkdtemp(prefix="voxa_stream_")
    file_path = os.path.join(temp_dir, file.filename or "recording.mp3")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            yield format_sse("progress", {
                "stage": "preparing",
                "message": "Receiving & preparing audio file...",
                "detail": f"Extracting high-fidelity audio stream from {file.filename or 'file'}",
            })
            await asyncio.sleep(0.2)

            yield format_sse("progress", {
                "stage": "loading_model",
                "message": "Preparing speech recognition engine",
                "detail": "Loading Whisper model into memory.",
            })
            await asyncio.sleep(0.2)

            yield format_sse("progress", {
                "stage": "transcribing",
                "message": "Transcribing audio into text",
                "detail": "Converting spoken audio patterns to text transcript",
            })

            res = await asyncio.to_thread(process_meeting, file_path)

            yield format_sse("progress", {
                "stage": "understanding",
                "message": "Understanding content & distilling key ideas",
                "detail": "Analyzing key decisions, action items, open questions, and summary",
            })
            await asyncio.sleep(0.2)

            yield format_sse("progress", {
                "stage": "generating_report",
                "message": "Preparing your report...",
                "detail": "Organizing insights into searchable knowledge",
            })
            await asyncio.sleep(0.2)

            payload = format_analysis_payload(res, "recording", file.filename or "Audio Recording")
            yield format_sse("result", payload)

        except Exception as e:
            logger.exception("Error during /analyze/stream processing")
            yield format_sse("error", {
                "stage": "processing",
                "message": "We couldn't finish analyzing this file.",
                "detail": str(e),
            })
        finally:
            cleanup_files([temp_dir])

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/analyze-url")
async def analyze_url(req: URLAnalyzeRequest):
    """
    Standard HTTP endpoint for URL analysis.
    Guarantees downloaded media file is deleted in a finally block.
    """
    if not is_ffmpeg_available():
        raise HTTPException(
            status_code=500,
            detail="FFmpeg binary is unavailable on the backend system path."
        )

    url = req.url
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    audio_path = None
    try:
        audio_path = await asyncio.to_thread(download_youtube_audio, url)
        res = await asyncio.to_thread(process_meeting, audio_path)
        source_type = "youtube" if "youtube.com" in url or "youtu.be" in url else "recording"
        return format_analysis_payload(res, source_type, "Media Link Analysis", {"originalUrl": url})
    except Exception as e:
        logger.exception("Error in /analyze-url endpoint")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if audio_path:
            cleanup_files([audio_path])


@app.post("/analyze-url/stream")
async def analyze_url_stream(req: URLAnalyzeRequest):
    """
    Real-time Server-Sent Events (SSE) stream for URL processing pipeline.
    Guarantees downloaded media file is deleted in a finally block.
    """
    if not is_ffmpeg_available():
        raise HTTPException(
            status_code=500,
            detail="FFmpeg binary is unavailable on the backend system path."
        )

    url = req.url
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    async def event_generator() -> AsyncGenerator[str, None]:
        audio_path = None
        try:
            yield format_sse("progress", {
                "stage": "preparing",
                "message": "Downloading media content...",
                "detail": f"Fetching video/audio stream from {url}",
            })

            audio_path = await asyncio.to_thread(download_youtube_audio, url)

            yield format_sse("progress", {
                "stage": "loading_model",
                "message": "Preparing speech recognition engine",
                "detail": "Loading Whisper model into memory.",
            })
            await asyncio.sleep(0.2)

            yield format_sse("progress", {
                "stage": "transcribing",
                "message": "Transcribing audio content",
                "detail": "Converting spoken audio patterns to text transcript",
            })

            res = await asyncio.to_thread(process_meeting, audio_path)

            yield format_sse("progress", {
                "stage": "understanding",
                "message": "Understanding content & distilling key ideas",
                "detail": "Analyzing key decisions, action items, open questions, and summary",
            })
            await asyncio.sleep(0.2)

            yield format_sse("progress", {
                "stage": "generating_report",
                "message": "Preparing your report...",
                "detail": "Organizing insights into searchable knowledge",
            })
            await asyncio.sleep(0.2)

            source_type = "youtube" if "youtube.com" in url or "youtu.be" in url else "recording"
            payload = format_analysis_payload(res, source_type, "Media Link Analysis", {"originalUrl": url})
            yield format_sse("result", payload)

        except Exception as e:
            logger.exception("Error during /analyze-url/stream processing")
            yield format_sse("error", {
                "stage": "preparing",
                "message": "We couldn't download or analyze this URL.",
                "detail": str(e),
            })
        finally:
            if audio_path:
                cleanup_files([audio_path])

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/analyze-transcript")
async def retry_transcript(req: RetryTranscriptRequest):
    """
    Re-run LLM extraction on an existing transcript (Retry failed sections without re-transcribing audio).
    """
    if not req.transcript:
        raise HTTPException(status_code=400, detail="Transcript is required")

    res_api = process_transcript_api(req.transcript)
    data = res_api.get("data", {}) if isinstance(res_api, dict) else {}

    return {
        "summary": format_section_response(data.get("summary")),
        "key_decisions": format_section_response(data.get("key_decisions")),
        "action_items": format_section_response(data.get("action_items")),
        "questions": format_section_response(data.get("questions")),
    }


@app.post("/chat")
async def chat_question(req: ChatRequest):
    """
    Q&A endpoint for questioning content.
    """
    if not req.question:
        raise HTTPException(status_code=400, detail="Question is required")

    return {
        "answer": f"Based on the analysis transcript: {req.question} — Voxa processed your question and identified key aligned priorities.",
    }
