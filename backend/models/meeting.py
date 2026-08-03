from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel, Field

class SectionStatus(str, Enum):
    SUCCESS = "SUCCESS"
    EMPTY = "EMPTY"
    FAILED = "FAILED"

class DeveloperDetails(BaseModel):
    provider: str = "Mistral AI"
    exception: str
    code: Optional[int] = None
    message: str

class SectionResult(BaseModel):
    status: SectionStatus
    content: Optional[str] = None
    reason: Optional[str] = None
    developer_details: Optional[DeveloperDetails] = None

    @classmethod
    def ok(cls, content: str) -> "SectionResult":
        if not content or not content.strip():
            return cls(status=SectionStatus.EMPTY, content=None)
        return cls(status=SectionStatus.SUCCESS, content=content.strip())

    @classmethod
    def empty(cls) -> "SectionResult":
        return cls(status=SectionStatus.EMPTY, content=None)

    @classmethod
    def fail(cls, exception: Exception, provider: str = "Mistral AI") -> "SectionResult":
        code = getattr(exception, "status_code", None) or getattr(exception, "code", None)
        if not code and "429" in str(exception):
            code = 429

        exc_type = type(exception).__name__
        msg = str(exception)

        return cls(
            status=SectionStatus.FAILED,
            content=None,
            reason="Analysis service temporarily unavailable.",
            developer_details=DeveloperDetails(
                provider=provider,
                exception=exc_type,
                code=code,
                message=msg,
            ),
        )

class MeetingMetadata(BaseModel):
    duration_seconds: Optional[float] = None
    detected_language: Optional[str] = None
    transcription_engine: Optional[str] = None
    generation_timestamp: Optional[str] = None
    transcript_chunks_count: Optional[int] = None
    processing_time_seconds: Optional[float] = None

class MeetingAnalysis(BaseModel):
    title: str
    summary: SectionResult
    action_items: SectionResult
    key_decisions: SectionResult
    questions: SectionResult
    metadata: Optional[MeetingMetadata] = None

class MeetingTitle(BaseModel):
    title: str = Field(..., description="Short professional title for the meeting")

class MeetingSummary(BaseModel):
    summary: str = Field(..., description="Concise bulleted summary of the meeting")
