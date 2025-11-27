from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.db import get_db
from app.schemas.overlay_asset import OverlayAssetBase
from app.services.overlay_assets import create_overlay_asset, list_overlay_assets

router = APIRouter()


@router.post("/overlays/assets", response_model=OverlayAssetBase)
async def upload_overlay_asset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload an overlay asset (image/video) that can be referenced by overlays.content.
    Returns:
      - id
      - filename  (use this in overlays.content)
      - type      (image | video)
      - path
    """
    if not file.content_type:
        raise HTTPException(status_code=400, detail="File must have a content-type")

    asset = create_overlay_asset(db, file)
    return asset


@router.get("/overlays/assets", response_model=List[OverlayAssetBase])
def list_overlays_assets_route(db: Session = Depends(get_db)):
    """
    List uploaded overlay assets.
    Useful for building a picker in the frontend.
    """
    assets = list_overlay_assets(db)
    return assets
