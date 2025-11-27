import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Text, Float
from sqlalchemy.dialects.postgresql import JSONB
from app.core.db import Base
import enum


class JobStatusEnum(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    done = "done"
    error = "error"


class RenderJob(Base):
    __tablename__ = "render_jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    input_path = Column(String, nullable=False)
    output_path = Column(String, nullable=True)

    status = Column(Enum(JobStatusEnum), nullable=False, default=JobStatusEnum.pending)
    message = Column(Text, nullable=True)

    overlays = Column(JSONB, nullable=False)  # list of overlays as JSON

    # NEW: progress in percentage (0–100)
    progress = Column(Float, nullable=False, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
