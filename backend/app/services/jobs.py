from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.orm import Session
from typing import List
import os
import uuid

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.db import SessionLocal
from app.models.job import RenderJob, JobStatusEnum
from app.schemas.overlay import Overlay
from app.services.video_renderer import render_job

settings = get_settings()

# Global executor for parallel processing
executor = ThreadPoolExecutor(max_workers=settings.MAX_WORKERS)


def create_job(
    db: Session,
    video_file: UploadFile,
    overlays: List[Overlay],
) -> RenderJob:
    # Save file to disk
    file_ext = os.path.splitext(video_file.filename or "")[1] or ".mp4"
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(video_file.file.read())

    job = RenderJob(
        input_path=file_path,
        overlays=[o.dict() for o in overlays],
        status=JobStatusEnum.pending,
        message="Queued",
        progress=0.0,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Enqueue job to thread pool
    executor.submit(_run_job_in_thread, job.id)

    return job


def _run_job_in_thread(job_id: str) -> None:
    # Create independent DB session inside the worker thread
    db = SessionLocal()
    try:
        render_job(db, job_id)
    finally:
        db.close()
