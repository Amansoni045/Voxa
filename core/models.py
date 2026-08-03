from typing import Any, Optional, List, Dict, Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")

class APIErrorDetail(BaseModel):
    message: str
    type: str

class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[APIErrorDetail] = None

    @classmethod
    def ok(cls, data: T) -> "APIResponse[T]":
        return cls(success=True, data=data, error=None)

    @classmethod
    def fail(cls, message: str, error_type: str = "RuntimeError") -> "APIResponse[T]":
        return cls(success=False, data=None, error=APIErrorDetail(message=message, type=error_type))

class MeetingTitleResponse(BaseModel):
    title: str = Field(..., description="Short professional title for the meeting")

class SummaryResponse(BaseModel):
    summary: str = Field(..., description="Concise bulleted summary of the meeting")

class ActionItemsResponse(BaseModel):
    action_items: str = Field(..., description="Extracted action items, tasks, and owners")

class DecisionsResponse(BaseModel):
    decisions: str = Field(..., description="Key decisions made during the meeting")

class OpenQuestionsResponse(BaseModel):
    open_questions: str = Field(..., description="Unresolved questions, blockers, or follow-ups")

class MeetingMetadata(BaseModel):
    duration_seconds: Optional[float] = None
    detected_language: Optional[str] = None
    transcription_engine: Optional[str] = None
    generation_timestamp: Optional[str] = None
    transcript_chunks_count: Optional[int] = None
    processing_time_seconds: Optional[float] = None

class MeetingAnalysisResponse(BaseModel):
    title: str
    summary: str
    action_items: str
    key_decisions: str
    questions: str
    risks: Optional[str] = None
    next_steps: Optional[str] = None
    metadata: Optional[MeetingMetadata] = None
