import os
import uuid
from typing import Literal
from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.core.config import get_settings
from app.models.overlay_asset import OverlayAsset, OverlayAssetType

settings = get_settings()

OverlayKind = Literal["image", "video"]


def detect_overlay_type(upload: UploadFile) -> OverlayAssetType:
    ct = upload.content_type or ""
    if ct.startswith("image/"):
        return OverlayAssetType.image
    if ct.startswith("video/"):
        return OverlayAssetType.video
    # Fallback: simple by extension
    ext = (upload.filename or "").lower()
    if ext.endswith((".png", ".jpg", ".jpeg", ".webp")):
        return OverlayAssetType.image
    if ext.endswith((".mp4", ".mov", ".mkv")):
        return OverlayAssetType.video
    # default to video, but we could raise
    return OverlayAssetType.video


def create_overlay_asset(db: Session, upload: UploadFile) -> OverlayAsset:
    asset_type = detect_overlay_type(upload)

    # Ensure assets directory exists
    os.makedirs(settings.ASSETS_DIR, exist_ok=True)

    ext = os.path.splitext(upload.filename or "")[1] or ""
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(settings.ASSETS_DIR, filename)

    with open(path, "wb") as f:
        f.write(upload.file.read())

    asset = OverlayAsset(
        filename=filename,
        original_name=upload.filename or filename,
        type=asset_type,
        path=path,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


def list_overlay_assets(db: Session) -> list[OverlayAsset]:
    return db.query(OverlayAsset).order_by(OverlayAsset.created_at.desc()).all()
    