import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum
from app.core.db import Base
import enum


class OverlayAssetType(str, enum.Enum):
    image = "image"
    video = "video"


class OverlayAsset(Base):
    __tablename__ = "overlay_assets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False, unique=True)  # stored filename
    original_name = Column(String, nullable=False)
    type = Column(Enum(OverlayAssetType), nullable=False)
    path = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
