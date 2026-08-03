from typing import Optional, Generic, TypeVar
from pydantic import BaseModel

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
