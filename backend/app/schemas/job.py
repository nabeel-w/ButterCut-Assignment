from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from app.schemas.overlay import Overlay
from enum import Enum


class JobStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    done = "done"
    error = "error"


class JobBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: JobStatus
    message: Optional[str] = None
    progress: float = 0.0


class JobCreateResponse(JobBase):
    pass


class JobDetail(JobBase):
    overlays: List[Overlay]
    input_path: str
    output_path: Optional[str] = None


class JobStatusResponse(JobBase):
    result_url: Optional[str] = None
