from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List

import json

from app.core.db import get_db
from app.models.job import RenderJob
from app.schemas.overlay import Overlay
from app.schemas.job import JobCreateResponse, JobStatusResponse, JobDetail
from app.services.jobs import create_job
from app.core.config import get_settings
from fastapi.responses import FileResponse

router = APIRouter()
settings = get_settings()


@router.post("/jobs", response_model=JobCreateResponse)
async def upload_job(
    file: UploadFile = File(...),
    overlays: str = Form(...),
    db: Session = Depends(get_db),
):
    """
    Create a new rendering job.
    - `file`: video file
    - `overlays`: JSON array of overlays
    """
    try:
        overlays_raw = json.loads(overlays)
        overlays_list: List[Overlay] = [Overlay(**o) for o in overlays_raw]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid overlays: {e}")

    if file.content_type is None or not file.content_type.startswith("video/"):
        # not strictly required, but nice validation
        raise HTTPException(status_code=400, detail="Uploaded file must be a video")

    job = create_job(db, file, overlays_list)

    return JobCreateResponse(
        id=job.id,
        status=job.status.value,
        message=job.message,
    )


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    job: RenderJob | None = (
        db.query(RenderJob).filter(RenderJob.id == job_id).first()
    )
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    result_url = None
    if job.status.value == "done" and job.output_path:
        result_url = f"/api/v1/jobs/{job_id}/result"

    return JobStatusResponse(
        id=job.id,
        status=job.status.value,
        message=job.message,
        progress=job.progress or 0.0,
        result_url=result_url,
    )


@router.get("/jobs/{job_id}/detail", response_model=JobDetail)
def get_job_detail(job_id: str, db: Session = Depends(get_db)):
    job: RenderJob | None = (
        db.query(RenderJob).filter(RenderJob.id == job_id).first()
    )
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobDetail(
        id=job.id,
        status=job.status.value,
        message=job.message,
        progress=job.progress or 0.0,
        overlays=job.overlays,
        input_path=job.input_path,
        output_path=job.output_path,
    )


@router.get("/jobs/{job_id}/result")
def download_result(job_id: str, db: Session = Depends(get_db)):
    job: RenderJob | None = (
        db.query(RenderJob).filter(RenderJob.id == job_id).first()
    )
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status.value != "done" or not job.output_path:
        raise HTTPException(status_code=400, detail="Result not ready")

    if not job.output_path or not job.output_path.startswith(settings.OUTPUT_DIR):
        raise HTTPException(status_code=500, detail="Invalid output path")

    if not job.output_path or not job.output_path or not job.output_path:
        raise HTTPException(status_code=404, detail="Output file not found")

    return FileResponse(
        path=job.output_path,
        media_type="video/mp4",
        filename=f"{job.id}_output.mp4",
    )
