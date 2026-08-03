from typing import Optional
from pydantic import BaseModel, Field

class MeetingMetadata(BaseModel):
    duration_seconds: Optional[float] = None
    detected_language: Optional[str] = None
    transcription_engine: Optional[str] = None
    generation_timestamp: Optional[str] = None
    transcript_chunks_count: Optional[int] = None
    processing_time_seconds: Optional[float] = None

class MeetingAnalysis(BaseModel):
    title: str
    summary: str
    action_items: str
    key_decisions: str
    questions: str
    risks: Optional[str] = None
    next_steps: Optional[str] = None
    metadata: Optional[MeetingMetadata] = None

class MeetingTitle(BaseModel):
    title: str = Field(..., description="Short professional title for the meeting")

class MeetingSummary(BaseModel):
    summary: str = Field(..., description="Concise bulleted summary of the meeting")
